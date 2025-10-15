// /app/api/channels/whatsapp/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';
import type { CreateInstanceRequest } from '@/types/evolution-api';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    // Lire TOUS les paramètres en une seule fois (le body ne peut être lu qu'une fois)
    const body = await request.json();
    const { shopId, action, instanceName } = body;

    // Vérifier que l'utilisateur est bien le propriétaire du shopId
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true }
    });

    if (!shop) {
      console.error('WhatsApp API - Shop not found:', { shopId });
      return new NextResponse('Shop not found', { status: 404 });
    }

    if (shop.ownerId !== user.id) {
      console.error('WhatsApp API - Ownership check failed:', { 
        shopOwnerId: shop.ownerId, 
        userId: user.id,
      });
      return new NextResponse('Forbidden: You are not the owner of this shop', { status: 403 });
    }

    if (action === 'create_instance') {
      // Créer une instance Evolution API
      const instanceName = `shop_${shopId}`;
      const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/evolution`;

      // Vérifier les variables d'environnement
      if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
        console.error('Evolution API not configured:', {
          urlSet: !!process.env.EVOLUTION_API_URL,
          keySet: !!process.env.EVOLUTION_API_KEY,
        });
        return NextResponse.json(
          { success: false, error: 'Evolution API not configured. Check environment variables.' },
          { status: 500 }
        );
      }

      try {
        // Vérifier si l'instance existe déjà
        try {
          const existingStatus = await evolutionApiService.getInstanceStatus(instanceName);
          
          // Si l'instance existe mais n'est pas connectée, la supprimer pour en créer une nouvelle
          if (existingStatus.instance.state !== 'open') {
            await evolutionApiService.deleteInstance(instanceName);
          } else {
            // L'instance est déjà connectée
            return NextResponse.json({
              success: true,
              instanceName,
              message: 'Instance already connected',
              existing: true,
            });
          }
        } catch (statusError: any) {
          // L'instance n'existe pas, on peut la créer
        }

        // Configuration avec webhook pour recevoir les événements
        const instanceConfig: CreateInstanceRequest = {
          instanceName,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true,
          webhook: {
            url: webhookUrl,
            byEvents: true,
            base64: true,
            events: [
              'MESSAGES_UPSERT',
              'MESSAGES_UPDATE',
              'CONNECTION_UPDATE',
              'QRCODE_UPDATED'
            ],
          },
        };
        
        const instance = await evolutionApiService.createInstance(instanceConfig);

        // Créer ou mettre à jour le canal dans la DB
        const existingChannel = await prisma.channel.findFirst({
          where: {
            shopId,
            type: 'WHATSAPP',
          }
        });

        if (existingChannel) {
          await prisma.channel.update({
            where: { id: existingChannel.id },
            data: {
              externalId: instanceName,
              isActive: false, // Sera activé lors de la connexion
            }
          });
        } else {
          await prisma.channel.create({
            data: {
              shopId,
              type: 'WHATSAPP',
              externalId: instanceName,
              isActive: false,
            }
          });
        }

        return NextResponse.json({
          success: true,
          instanceName,
          message: 'Instance created successfully',
        });
      } catch (error: any) {
        console.error('Error creating Evolution instance:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    if (action === 'get_qrcode') {
      if (!instanceName) {
        return NextResponse.json(
          { success: false, error: 'instanceName is required' },
          { status: 400 }
        );
      }
      
      try {
        const qrData = await evolutionApiService.connectInstance(instanceName);
        
        // Evolution API retourne { code, pairingCode, base64 }
        // On utilise base64 si disponible, sinon code
        const qrCodeValue = qrData.base64 || qrData.code;
        
        if (!qrCodeValue) {
          throw new Error('No QR code available from Evolution API');
        }
        
        return NextResponse.json({
          success: true,
          qrcode: qrCodeValue,
          pairingCode: qrData.pairingCode,
        });
      } catch (error: any) {
        console.error('Error getting QR code:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    if (action === 'check_status') {
      if (!instanceName) {
        return NextResponse.json(
          { success: false, error: 'instanceName is required' },
          { status: 400 }
        );
      }
      
      try {
        const status = await evolutionApiService.getInstanceStatus(instanceName);
        
        // Si la connexion est ouverte, activer le canal automatiquement
        if (status.instance.state === 'open') {
          const channel = await prisma.channel.findFirst({
            where: {
              shopId,
              type: 'WHATSAPP',
              externalId: instanceName,
            },
          });

          if (channel && !channel.isActive) {
            await prisma.channel.update({
              where: { id: channel.id },
              data: { isActive: true },
            });
          }
        }
        
        return NextResponse.json({
          success: true,
          status: status.instance.state,
          profileName: status.instance.profileName,
        });
      } catch (error: any) {
        console.error('Error checking status:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Unexpected error in WhatsApp channel API:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}