import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { conversationId, content, messageType = 'TEXT', mediaUrl } = body;

    // Validation
    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'conversationId and content are required' },
        { status: 400 }
      );
    }

    // Récupérer la conversation avec le shop et le canal
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        shop: {
          include: {
            channels: {
              where: {
                type: 'WHATSAPP',
                isActive: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du shop
    if (conversation.shop.ownerId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Vérifier qu'il y a un canal WhatsApp actif
    const whatsappChannel = conversation.shop.channels[0];
    if (!whatsappChannel) {
      return NextResponse.json(
        { success: false, error: 'No active WhatsApp channel found' },
        { status: 400 }
      );
    }

    // Extraire le numéro de téléphone (format: 5585988888888@s.whatsapp.net → 5585988888888)
    const phoneNumber = conversation.customer.phone;

    console.info('📤 Envoi de message WhatsApp:', {
      conversationId,
      phoneNumber,
      messageType,
      instance: whatsappChannel.externalId,
    });

    // Envoyer le message via Evolution API
    let evolutionResponse;
    
    if (messageType === 'TEXT') {
      evolutionResponse = await evolutionApiService.sendTextMessage(
        whatsappChannel.externalId,
        {
          number: phoneNumber,
          text: content,
        }
      );
    } else if (['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(messageType)) {
      evolutionResponse = await evolutionApiService.sendMediaMessage(
        whatsappChannel.externalId,
        {
          number: phoneNumber,
          mediaType: messageType.toLowerCase() as 'image' | 'video' | 'audio' | 'document',
          media: mediaUrl || content,
          caption: content,
        }
      );
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported message type: ${messageType}` },
        { status: 400 }
      );
    }

    // Sauvegarder le message dans la DB
    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        messageType,
        mediaUrl,
        isFromCustomer: false,
        isRead: true,
        externalId: evolutionResponse.key.id,
        metadata: evolutionResponse,
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    console.info('✅ Message envoyé avec succès:', {
      messageId: message.id,
      externalId: evolutionResponse.key.id,
    });

    return NextResponse.json({
      success: true,
      message,
      evolutionResponse,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
