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

    const { shopId, action } = await request.json();
    console.log('WhatsApp API - Request data:', { shopId, action, userId: user.id });

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

    if (action === 'create_instance') {
      // Créer une instance Evolution API
      const instanceName = `shop_${shopId}`;
      const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/evolution`;

      try {
        const instance = await evolutionApiService.createInstance({
          instanceName,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true,
          webhook: webhookUrl,
          webhook_by_events: false,
          events: [
            'QRCODE_UPDATED',
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
            'SEND_MESSAGE',
          ],
          groups_ignore: true,
          always_online: false,
          read_messages: false,
          read_status: false,
        });

        console.log('Evolution instance created:', instance);

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
      const { instanceName } = await request.json();
      
      try {
        const qrData = await evolutionApiService.connectInstance(instanceName);
        return NextResponse.json({
          success: true,
          qrcode: qrData.code,
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
      const { instanceName } = await request.json();
      
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

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Unexpected error in WhatsApp channel API:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}