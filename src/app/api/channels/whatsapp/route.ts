// /app/api/channels/whatsapp/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { shopId, externalId } = await request.json();
    console.log('WhatsApp API - Request data:', { shopId, externalId, userId: user.id });

    // Vérifier que l'utilisateur est bien le propriétaire du shopId
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true }
    });

    console.log('WhatsApp API - Shop query result:', { shop, shopId });

    if (!shop) {
      console.error('WhatsApp API - Shop not found:', { shopId });
      return new NextResponse('Shop not found', { status: 404 });
    }

    if (shop.ownerId !== user.id) {
      console.error('WhatsApp API - Ownership check failed:', { 
        shopOwnerId: shop.ownerId, 
        userId: user.id,
        match: shop.ownerId === user.id
      });
      return new NextResponse('Forbidden: You are not the owner of this shop', { status: 403 });
    }

    console.log('WhatsApp API - Ownership verified successfully');

    // Vérifier si un canal WhatsApp existe déjà pour ce shop
    const existingChannel = await prisma.channel.findFirst({
      where: {
        shopId: shopId,
        type: 'WHATSAPP',
        externalId: externalId
      }
    });

    console.log('WhatsApp API - Existing channel check:', { existingChannel });

    if (existingChannel) {
      // Réactiver le canal s'il était désactivé
      const updatedChannel = await prisma.channel.update({
        where: { id: existingChannel.id },
        data: { isActive: true }
      });

      console.log('WhatsApp API - Channel reactivated:', { updatedChannel });
      return NextResponse.json({ success: true, channel: updatedChannel });
    }

    // Créer un nouveau canal
    const newChannel = await prisma.channel.create({
      data: {
        shopId,
        type: 'WHATSAPP',
        externalId,
        isActive: true
      }
    });

    console.log('WhatsApp API - New channel created:', { newChannel });
    return NextResponse.json({ success: true, channel: newChannel });
  } catch (error) {
    console.error('Unexpected error in WhatsApp channel API:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}