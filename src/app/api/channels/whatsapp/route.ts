// /app/api/channels/whatsapp/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    // Lire TOUS les paramètres en une seule fois (le body ne peut être lu qu'une fois)
    const body = await request.json();
    const { shopId, action, instanceName, message } = body;
    console.log('WhatsApp API - Request data:', { shopId, action, instanceName, userId: user.id });

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

    console.log('WhatsApp API - Ownership verified successfully');

    // ============================================
    // ACTION: create_instance
    // ============================================
    if (action === 'create_instance') {
      const instanceName = `shop_${shopId}`;
      const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/evolution`;

      console.log('Creating Evolution instance:', {
        instanceName,
        webhookUrl,
        evolutionApiUrl: process.env.EVOLUTION_API_URL,
        evolutionApiKeySet: !!process.env.EVOLUTION_API_KEY,
      });

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
          console.log('⚠️  Instance already exists:', existingStatus);
          
          // Si l'instance existe mais n'est pas connectée, la supprimer pour en créer une nouvelle
          if (existingStatus.instance.state !== 'open') {
            console.log('🗑️  Deleting existing disconnected instance...');
            await evolutionApiService.deleteInstance(instanceName);
            console.log('✅ Old instance deleted');
          } else {
            // L'instance est déjà connectée
            console.log('✅ Instance already connected');
            return NextResponse.json({
              success: true,
              instanceName,
              message: 'Instance already connected',
              existing: true,
            });
          }
        } catch (statusError: any) {
          // L'instance n'existe pas, on peut la créer
          console.log('❌ Instance does not exist (404), creating new one...');
        }

        // Configuration avec webhook
        const instanceConfig = {
          instanceName,
          integration: 'WHATSAPP-BAILEYS' as const,
          qrcode: true,
          webhook: webhookUrl,
          webhook_by_events: true,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
            'QRCODE_UPDATED'
          ] as const,
        };
        
        console.log('📤 Creating instance with config:', instanceConfig);

        const instance = await evolutionApiService.createInstance(instanceConfig);

        console.log('✅ Evolution instance created successfully:', instance);

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

    // ============================================
    // ACTION: get_qrcode
    // ============================================
    if (action === 'get_qrcode') {
      if (!instanceName) {
        return NextResponse.json(
          { success: false, error: 'instanceName is required' },
          { status: 400 }
        );
      }
      
      try {
        const qrData = await evolutionApiService.connectInstance(instanceName);
        
        console.log('QR Data from Evolution API:', qrData);
        
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

    // ============================================
    // ACTION: check_status
    // ============================================
    if (action === 'check_status') {
      if (!instanceName) {
        return NextResponse.json(
          { success: false, error: 'instanceName is required' },
          { status: 400 }
        );
      }
      
      try {
        const status = await evolutionApiService.getInstanceStatus(instanceName);
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

    // ============================================
    // ACTION: send_message
    // ============================================
    if (action === 'send_message') {
      if (!instanceName) {
        return NextResponse.json(
          { success: false, error: 'instanceName is required' },
          { status: 400 }
        );
      }

      if (!message || !message.to || !message.text) {
        return NextResponse.json(
          { success: false, error: 'message.to and message.text are required' },
          { status: 400 }
        );
      }

      try {
        const result = await evolutionApiService.sendTextMessage(instanceName, {
          number: message.to,
          text: message.text,
        });

        console.log('✅ Message sent successfully:', result);

        return NextResponse.json({
          success: true,
          messageId: result.key.id,
          status: result.status,
        });
      } catch (error: any) {
        console.error('Error sending message:', error);
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
