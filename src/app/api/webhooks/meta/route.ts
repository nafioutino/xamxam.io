import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/encryption';
import prisma from '@/lib/prisma';
import { ChannelType, MessageType } from '@/generated/prisma';

// Interfaces pour les événements webhook Meta
interface WebhookEntry {
  id: string;
  time: number;
  messaging?: MessagingEvent[];
  changes?: ChangeEvent[];
}

interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url?: string;
        sticker_id?: string;
      };
    }>;
  };
  postback?: {
    title: string;
    payload: string;
    mid: string;
  };
  delivery?: {
    mids: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
}

interface ChangeEvent {
  field: string;
  value: {
    from: { id: string; name: string };
    item: string;
    comment_id?: string;
    message?: string;
    created_time: number;
    verb?: string;
  };
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

// Fonction pour déterminer le type de canal basé sur l'événement
function getChannelTypeFromEvent(entry: WebhookEntry): ChannelType {
  if (entry.messaging) {
    return ChannelType.FACEBOOK_PAGE;
  }
  // Pour Instagram et WhatsApp, on peut identifier par d'autres champs
  // Pour l'instant, on assume Facebook par défaut
  return ChannelType.FACEBOOK_PAGE;
}

// Fonction pour déterminer le type de message
function getMessageType(message: MessagingEvent['message']): MessageType {
  if (!message) return MessageType.SYSTEM;
  
  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    switch (attachment.type) {
      case 'image':
        return MessageType.IMAGE;
      case 'audio':
        return MessageType.AUDIO;
      case 'video':
        return MessageType.VIDEO;
      case 'file':
        return MessageType.DOCUMENT;
      default:
        return MessageType.TEXT;
    }
  }
  
  return MessageType.TEXT;
}

// Fonction pour traiter les événements de message
async function processMessagingEvent(
  event: MessagingEvent,
  pageId: string,
  shopId: string
) {
  const { sender, recipient, message, postback, delivery, read } = event;
  
  // Ignorer les messages envoyés par la page (recipient.id === pageId)
  if (sender.id === pageId) {
    return;
  }

  // Traiter les messages entrants
  if (message) {
    await handleIncomingMessage({
      senderId: sender.id,
      pageId,
      shopId,
      message,
      timestamp: event.timestamp
    });
  }
  
  // Traiter les postbacks (boutons cliqués)
  if (postback) {
    await handlePostback({
      senderId: sender.id,
      pageId,
      shopId,
      postback,
      timestamp: event.timestamp
    });
  }
  
  // Traiter les confirmations de livraison
  if (delivery) {
    await handleDeliveryConfirmation({
      pageId,
      shopId,
      delivery
    });
  }
  
  // Traiter les confirmations de lecture
  if (read) {
    await handleReadConfirmation({
      pageId,
      shopId,
      read
    });
  }
}

// Fonction pour gérer les messages entrants
async function handleIncomingMessage({
  senderId,
  pageId,
  shopId,
  message,
  timestamp
}: {
  senderId: string;
  pageId: string;
  shopId: string;
  message: MessagingEvent['message'];
  timestamp: number;
}) {
  if (!message) return;
  
  try {
    // Trouver ou créer le client
    let customer = await prisma.customer.findFirst({
      where: {
        shopId,
        phone: senderId // Utiliser l'ID Facebook comme identifiant unique
      }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          shopId,
          name: `Client Facebook ${senderId.slice(-4)}`,
          phone: senderId,
          email: null
        }
      });
    }
    
    // Trouver ou créer la conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        shopId,
        platform: ChannelType.FACEBOOK_PAGE,
        externalId: senderId
      }
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          shopId,
          customerId: customer.id,
          platform: ChannelType.FACEBOOK_PAGE,
          externalId: senderId,
          title: `Conversation Facebook - ${customer.name}`,
          lastMessageAt: new Date(timestamp)
        }
      });
    }
    
    // Déterminer le contenu du message
    let content = message.text || '';
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    
    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      mediaUrl = attachment.payload.url || null;
      mediaType = attachment.type;
      
      if (!content) {
        content = `[${attachment.type.toUpperCase()}]`;
      }
    }
    
    // Créer le message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        messageType: getMessageType(message),
        mediaUrl,
        mediaType,
        isFromCustomer: true,
        externalId: message.mid,
        metadata: {
          facebookSenderId: senderId,
          facebookPageId: pageId,
          originalTimestamp: timestamp
        }
      }
    });
    
    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(timestamp),
        unreadCount: {
          increment: 1
        }
      }
    });
    
    console.log(`Message traité: ${message.mid} de ${senderId}`);
    
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    throw error;
  }
}

// Fonction pour gérer les postbacks
async function handlePostback({
  senderId,
  pageId,
  shopId,
  postback,
  timestamp
}: {
  senderId: string;
  pageId: string;
  shopId: string;
  postback: MessagingEvent['postback'];
  timestamp: number;
}) {
  if (!postback) return;
  
  // Traiter le postback comme un message système
  await handleIncomingMessage({
    senderId,
    pageId,
    shopId,
    message: {
      mid: postback.mid,
      text: `Bouton cliqué: ${postback.title} (${postback.payload})`
    },
    timestamp
  });
}

// Fonction pour gérer les confirmations de livraison
async function handleDeliveryConfirmation({
  pageId,
  shopId,
  delivery
}: {
  pageId: string;
  shopId: string;
  delivery: MessagingEvent['delivery'];
}) {
  if (!delivery) return;
  
  try {
    // Marquer les messages comme livrés
    await prisma.message.updateMany({
      where: {
        externalId: {
          in: delivery.mids
        },
        conversation: {
          shopId,
          platform: ChannelType.FACEBOOK_PAGE
        }
      },
      data: {
        metadata: {
          delivered: true,
          deliveredAt: new Date(delivery.watermark)
        }
      }
    });
    
    console.log(`Livraison confirmée pour ${delivery.mids.length} messages`);
  } catch (error) {
    console.error('Erreur lors de la confirmation de livraison:', error);
  }
}

// Fonction pour gérer les confirmations de lecture
async function handleReadConfirmation({
  pageId,
  shopId,
  read
}: {
  pageId: string;
  shopId: string;
  read: MessagingEvent['read'];
}) {
  if (!read) return;
  
  try {
    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        createdAt: {
          lte: new Date(read.watermark)
        },
        conversation: {
          shopId,
          platform: ChannelType.FACEBOOK_PAGE
        },
        isFromCustomer: false // Seulement nos messages envoyés
      },
      data: {
        isRead: true
      }
    });
    
    console.log(`Messages marqués comme lus jusqu'à ${new Date(read.watermark)}`);
  } catch (error) {
    console.error('Erreur lors de la confirmation de lecture:', error);
  }
}

// Endpoint GET pour la vérification du webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Vérifier le token de vérification
  const expectedToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === expectedToken) {
    console.log('Webhook vérifié avec succès');
    return new NextResponse(challenge);
  }
  
  console.error('Échec de la vérification du webhook - Token invalide');
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

// Endpoint POST pour recevoir les événements webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Vérifier la signature du webhook
    const webhookSecret = process.env.FACEBOOK_APP_SECRET;
    if (!webhookSecret) {
      console.error('FACEBOOK_APP_SECRET non configuré');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (!signature || !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Signature webhook invalide');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: WebhookPayload = JSON.parse(body);
    
    // Vérifier que c'est un webhook de page Facebook
    if (payload.object !== 'page') {
      console.log(`Webhook ignoré: object=${payload.object}`);
      return NextResponse.json({ status: 'ignored' });
    }
    
    // Traiter chaque entrée
    for (const entry of payload.entry) {
      const pageId = entry.id;
      
      // Trouver le canal correspondant dans la base de données
      const channel = await prisma.channel.findFirst({
        where: {
          externalId: pageId,
          type: ChannelType.FACEBOOK_PAGE,
          isActive: true
        },
        include: {
          shop: true
        }
      });
      
      if (!channel) {
        console.warn(`Canal non trouvé pour la page ${pageId}`);
        continue;
      }
      
      // Traiter les événements de messagerie
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          await processMessagingEvent(
            messagingEvent,
            pageId,
            channel.shopId
          );
        }
      }
      
      // Traiter les autres types d'événements (commentaires, etc.)
      if (entry.changes) {
        for (const change of entry.changes) {
          console.log(`Changement reçu: ${change.field}`, change.value);
          // Ici on peut ajouter la logique pour traiter les commentaires, mentions, etc.
        }
      }
    }
    
    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}