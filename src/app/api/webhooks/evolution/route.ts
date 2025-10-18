import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { EvolutionWebhookPayload } from '@/types/evolution-api';

export async function POST(request: Request) {
  try {
    const payload: any = await request.json();
    
    // Log de réception du webhook avec payload complet pour debug
    console.info('🔔 Webhook Evolution reçu:', JSON.stringify({
      event: payload.event,
      instance: payload.instance,
      data: payload.data
    }, null, 2));

    switch (payload.event) {
      case 'qrcode.updated':
        await handleQRCodeUpdate(payload);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(payload);
        break;
      
      case 'messages.upsert':
        await handleMessageUpsert(payload);
        break;
      
      case 'messages.update':
        await handleMessageUpdate(payload);
        break;
      
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Evolution webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function handleQRCodeUpdate(payload: any) {
  // Le QR code sera géré côté client via polling ou websocket
}

async function handleConnectionUpdate(payload: any) {
  const { instance, data } = payload;

  if (data.state === 'open') {
    // Connexion réussie - mettre à jour le canal dans la DB
    const channel = await prisma.channel.findFirst({
      where: {
        type: 'WHATSAPP',
        externalId: instance,
      },
    });

    if (channel) {
      await prisma.channel.update({
        where: { id: channel.id },
        data: { isActive: true },
      });
      console.info(`✅ WhatsApp connecté et canal activé pour instance: ${instance}`);
    } else {
      console.error('❌ Channel not found for instance:', instance);
    }
  } else if (data.state === 'close') {
    // Connexion fermée
    const channel = await prisma.channel.findFirst({
      where: {
        type: 'WHATSAPP',
        externalId: instance,
      },
    });

    if (channel) {
      await prisma.channel.update({
        where: { id: channel.id },
        data: { isActive: false },
      });
      console.info(`❌ WhatsApp déconnecté et canal désactivé pour instance: ${instance}`);
    }
  }
}

async function handleMessageUpsert(payload: any) {
  const { instance, data } = payload;

  // Log du message entrant (console.info pour visibilité sur Vercel)
  console.info('📩 MESSAGE WHATSAPP REÇU:', JSON.stringify({
    de: data.key?.remoteJid,
    type: data.messageType,
    texte: data.message?.conversation || data.message?.extendedTextMessage?.text || `[${data.messageType}]`,
    timestamp: new Date(data.messageTimestamp * 1000).toLocaleString('fr-FR'),
    instance,
  }, null, 2));

  // Trouver le canal WhatsApp
  const channel = await prisma.channel.findFirst({
    where: {
      type: 'WHATSAPP',
      externalId: instance,
    },
    include: {
      shop: true,
    },
  });

  if (!channel) {
    console.error('Channel not found for instance:', instance);
    return;
  }

  // Extraire le numéro de téléphone du remoteJid (format: 5585988888888@s.whatsapp.net)
  const phoneNumber = data.key.remoteJid.split('@')[0];
  
  // Trouver ou créer le client
  let customer = await prisma.customer.findFirst({
    where: {
      shopId: channel.shopId,
      phone: phoneNumber,
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        shopId: channel.shopId,
        name: data.pushName || phoneNumber,
        phone: phoneNumber,
      },
    });
  }

  // Trouver ou créer la conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      shopId: channel.shopId,
      platform: 'WHATSAPP',
      externalId: data.key.remoteJid,
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        shopId: channel.shopId,
        customerId: customer.id,
        platform: 'WHATSAPP',
        externalId: data.key.remoteJid,
        title: customer.name,
        isActive: true,
        lastMessageAt: new Date(data.messageTimestamp * 1000),
      },
    });
  } else {
    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(data.messageTimestamp * 1000),
        unreadCount: data.key.fromMe ? 0 : { increment: 1 },
      },
    });
  }

  // Extraire le contenu du message
  let messageContent = '';
  let messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER' | 'LOCATION' | 'CONTACT' = 'TEXT';
  let mediaUrl: string | null = null;

  if (data.message.conversation) {
    messageContent = data.message.conversation;
    messageType = 'TEXT';
  } else if (data.message.extendedTextMessage) {
    messageContent = data.message.extendedTextMessage.text;
    messageType = 'TEXT';
  } else if (data.message.imageMessage) {
    messageContent = data.message.imageMessage.caption || '[Image]';
    messageType = 'IMAGE';
    mediaUrl = data.message.imageMessage.url;
  } else if (data.message.videoMessage) {
    messageContent = data.message.videoMessage.caption || '[Video]';
    messageType = 'VIDEO';
    mediaUrl = data.message.videoMessage.url;
  } else if (data.message.audioMessage) {
    messageContent = '[Audio]';
    messageType = 'AUDIO';
    mediaUrl = data.message.audioMessage.url;
  } else if (data.message.documentMessage) {
    messageContent = data.message.documentMessage.fileName || '[Document]';
    messageType = 'DOCUMENT';
    mediaUrl = data.message.documentMessage.url;
  } else if (data.message.stickerMessage) {
    messageContent = '[Sticker]';
    messageType = 'STICKER';
    mediaUrl = data.message.stickerMessage.url;
  } else if (data.message.locationMessage) {
    const loc = data.message.locationMessage;
    messageContent = `Location: ${loc.degreesLatitude}, ${loc.degreesLongitude}`;
    messageType = 'LOCATION';
  } else if (data.message.contactMessage) {
    messageContent = `Contact: ${data.message.contactMessage.displayName}`;
    messageType = 'CONTACT';
  }

  // Créer le message dans la DB
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content: messageContent,
      messageType,
      mediaUrl,
      isFromCustomer: !data.key.fromMe,
      isRead: data.key.fromMe,
      externalId: data.key.id,
      metadata: data,
      createdAt: new Date(data.messageTimestamp * 1000),
    },
  });
}

async function handleMessageUpdate(payload: any) {
  const { data } = payload;

  // Dans messages.update, la structure est différente :
  // data.keyId au lieu de data.key.id
  const externalId = data.keyId || data.key?.id;
  
  if (!externalId) {
    console.error('No externalId found in message update:', data);
    return;
  }

  // Mettre à jour le statut du message dans la DB
  const message = await prisma.message.findFirst({
    where: {
      externalId,
    },
  });

  if (message) {
    const isRead = data.status === 'READ' || data.status === 'PLAYED';
    
    await prisma.message.update({
      where: { id: message.id },
      data: {
        isRead,
        metadata: {
          ...(message.metadata as any),
          status: data.status,
          updatedAt: new Date().toISOString(),
        },
      },
    });
    
    console.info(`✅ Statut du message mis à jour: ${externalId} → ${data.status}`);
  } else {
    console.info(`ℹ️ Message non trouvé pour mise à jour: ${externalId}`);
  }
}
