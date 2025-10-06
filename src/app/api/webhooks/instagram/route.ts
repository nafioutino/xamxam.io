// /app/api/webhooks/instagram/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType, ConversationStatus } from '@/generated/prisma';
import { getInstagramUserInfo, isInstagramUserId } from '@/lib/instagram-utils';

// Préfixe pour tous les logs, pour les retrouver facilement.
const logPrefix = '[Instagram Webhook]';

// ==================================================================
// ===      MÉTHODE GET : VÉRIFICATION DU WEBHOOK (UNE SEULE FOIS) ===
// ==================================================================
/**
 * Gère la requête de vérification envoyée par Meta lors de la configuration du webhook Instagram.
 * C'est une poignée de main pour prouver que nous sommes bien le propriétaire de l'URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log(`${logPrefix} Webhook verified successfully!`);
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error(`${logPrefix} Webhook verification failed. Tokens do not match.`);
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// ==================================================================
// ===      MÉTHODE POST : RÉCEPTION DES ÉVÉNEMENTS INSTAGRAM     ===
// ==================================================================
/**
 * Reçoit les événements en temps réel d'Instagram via Meta.
 * Spécialement conçu pour gérer les messages Instagram DM.
 */
export async function POST(request: NextRequest) {
  console.log(`${logPrefix} Received a POST request.`);
  
  let rawBody: string = '';
  let body: any;
  
  try {
    // --- ÉTAPE 1: SÉCURITÉ - VALIDER LA SIGNATURE DE LA REQUÊTE ---
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    rawBody = await request.text();
    
    // Validation de la signature avec le secret Instagram/Facebook
    const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      console.error(`${logPrefix} Instagram/Facebook App Secret not configured.`);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error(`${logPrefix} Invalid signature.`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.log(`${logPrefix} Signature validated successfully.`);

    // --- ÉTAPE 2: PARSING ET VALIDATION DU BODY ---
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`${logPrefix} Failed to parse JSON body:`, parseError);
      return new NextResponse('Bad Request - Invalid JSON', { status: 400 });
    }
    
    console.log(`${logPrefix} Parsed body:`, JSON.stringify(body, null, 2));

    // Validation spécifique Instagram
    if (!body.object || body.object !== 'instagram') {
      console.warn(`${logPrefix} Received webhook for object type: ${body.object}, expected 'instagram'. Ignoring.`);
      return NextResponse.json({ status: 'ignored', reason: 'not_instagram_object' }, { status: 200 });
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      console.warn(`${logPrefix} No entries found in webhook body.`);
      return NextResponse.json({ status: 'no_entries' }, { status: 200 });
    }

    // --- ÉTAPE 3: TRAITEMENT SYNCHRONE DES MESSAGES INSTAGRAM ---
    let processedMessages = 0;
    let errors = 0;

    for (const entry of body.entry) {
      if (!entry.messaging || !Array.isArray(entry.messaging)) {
        console.log(`${logPrefix} Entry ${entry.id} has no messaging events, skipping.`);
        continue;
      }

      for (const event of entry.messaging) {
        if (event.message) {
          try {
            console.log(`${logPrefix} Processing Instagram message event...`);
            await processInstagramMessage(event);
            processedMessages++;
          } catch (messageError) {
            console.error(`${logPrefix} Error processing individual message:`, messageError);
            errors++;
            // Continue processing other messages even if one fails
          }
        } else {
          console.log(`${logPrefix} Received non-message event (delivery, read, reaction, etc.), skipping.`);
        }
      }
    }

    // --- ÉTAPE 4: RÉPONSE AVEC STATISTIQUES ---
    const responseData = {
      status: 'success',
      processed: processedMessages,
      errors: errors,
      timestamp: new Date().toISOString(),
      platform: 'instagram'
    };

    console.log(`${logPrefix} Processing completed:`, responseData);
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} CRITICAL ERROR in POST handler:`, error);
    
    // Log détaillé pour le débogage
    console.error(`${logPrefix} Request details:`, {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method,
      bodyLength: rawBody?.length || 0
    });
    
    // En cas d'erreur critique, on renvoie une erreur 500 pour que Meta sache que ça a échoué
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ==================================================================
// ===               FONCTION DE TRAITEMENT DU MESSAGE INSTAGRAM  ===
// ==================================================================
/**
 * Traite un message Instagram individuel reçu de Meta.
 * Spécialement adapté pour les messages Instagram DM.
 */
async function processInstagramMessage(event: any) {
  const messageId = event.message?.mid;
  const senderId = event.sender?.id; // Instagram-scoped ID (IGSID)
  const recipientId = event.recipient?.id; // Instagram Business Account ID
  const messageText = event.message?.text;
  const timestamp = event.timestamp;
  const attachments = event.message?.attachments;

  console.log(`${logPrefix} Processing Instagram message:`, {
    messageId,
    senderId,
    recipientId,
    messageText: messageText?.substring(0, 100) + (messageText?.length > 100 ? '...' : ''),
    timestamp,
    hasAttachments: !!attachments?.length
  });

  // Validation des données requises
  if (!senderId) {
    console.error(`${logPrefix} Missing sender ID in Instagram message event`);
    throw new Error('Missing sender ID');
  }

  if (!recipientId) {
    console.error(`${logPrefix} Missing recipient ID in Instagram message event`);
    throw new Error('Missing recipient ID');
  }

  if (!messageText && !attachments?.length) {
    console.error(`${logPrefix} Missing message content for sender ${senderId}`);
    throw new Error('Missing message content');
  }

  if (!messageId) {
    console.error(`${logPrefix} Missing message ID for sender ${senderId}`);
    throw new Error('Missing message ID');
  }

  try {
    // --- ÉTAPE 1: IDENTIFIER LE CANAL INSTAGRAM ---
    console.log(`${logPrefix} Looking for Instagram channel with externalId: ${recipientId}`);
    
    const channel = await prisma.channel.findFirst({
      where: {
        externalId: recipientId,
        type: ChannelType.INSTAGRAM_DM,
        isActive: true
      },
      include: {
        shop: true
      }
    });

    if (!channel) {
      console.error(`${logPrefix} No active Instagram channel found for ID: ${recipientId}`);
      throw new Error(`No Instagram channel found for ID: ${recipientId}`);
    }

    console.log(`${logPrefix} Found Instagram channel: ${channel.type} for shop: ${channel.shop.name}`);

    // --- ÉTAPE 2: RÉCUPÉRER LES INFORMATIONS DU CLIENT INSTAGRAM ---
    let customerInfo;
    try {
      customerInfo = await getInstagramUserInfo(senderId, channel?.accessToken || '');
      console.log(`${logPrefix} Retrieved Instagram user info:`, {
        id: senderId,
        name: customerInfo.name
      });
    } catch (userInfoError) {
      console.warn(`${logPrefix} Could not retrieve Instagram user info for ${senderId}:`, userInfoError);
      // Utiliser des informations par défaut
      customerInfo = {
        id: senderId,
        username: `instagram_user_${senderId.slice(-8)}`,
        name: 'Utilisateur Instagram',
        profile_picture_url: null
      };
    }

    // --- ÉTAPE 3: CRÉER OU METTRE À JOUR LE CLIENT ---
    let customer = await prisma.customer.findFirst({
      where: {
        phone: senderId,
        shopId: channel.shopId
      }
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerInfo.name || (customerInfo as any).username || 'Utilisateur Instagram',
          updatedAt: new Date()
        }
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          phone: senderId,
          name: customerInfo.name || (customerInfo as any).username || 'Utilisateur Instagram',
          shopId: channel.shopId
        }
      });
    }

    console.log(`${logPrefix} Customer processed: ${customer.name} (${customer.id})`);

    // --- ÉTAPE 4: CRÉER OU RÉCUPÉRER LA CONVERSATION ---
    let conversation = await prisma.conversation.findFirst({
      where: {
        externalId: senderId,
        shopId: channel.shopId
      }
    });

    if (conversation) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          updatedAt: new Date(),
          lastMessageAt: new Date(timestamp)
        }
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          externalId: senderId,
          customerId: customer.id,
          shopId: channel.shopId,
          platform: ChannelType.INSTAGRAM_DM,
          status: ConversationStatus.OPEN,
          lastMessageAt: new Date(timestamp)
        }
      });
    }

    console.log(`${logPrefix} Conversation processed: ${conversation.id}`);

    // --- ÉTAPE 5: TRAITER LE CONTENU DU MESSAGE ---
    let messageContent = messageText || '';
    let mediaUrl = null;
    let mediaType = null;

    // Gérer les pièces jointes Instagram
    if (attachments && attachments.length > 0) {
      const attachment = attachments[0]; // Prendre la première pièce jointe
      mediaUrl = attachment.payload?.url;
      
      switch (attachment.type) {
        case 'image':
          mediaType = 'IMAGE';
          messageContent = messageContent || '[Image]';
          break;
        case 'video':
          mediaType = 'VIDEO';
          messageContent = messageContent || '[Vidéo]';
          break;
        case 'audio':
          mediaType = 'AUDIO';
          messageContent = messageContent || '[Audio]';
          break;
        case 'ig_reel':
        case 'reel':
          mediaType = 'VIDEO';
          messageContent = messageContent || '[Reel Instagram]';
          break;
        case 'story_mention':
          messageContent = messageContent || '[Mention dans une Story]';
          break;
        case 'share':
          messageContent = messageContent || '[Partage]';
          break;
        default:
          messageContent = messageContent || '[Pièce jointe]';
      }

      console.log(`${logPrefix} Processing attachment:`, {
        type: attachment.type,
        mediaType,
        hasUrl: !!mediaUrl
      });
    }

    // --- ÉTAPE 6: SAUVEGARDER LE MESSAGE ---
    const message = await prisma.message.create({
      data: {
        externalId: messageId,
        conversationId: conversation.id,
        content: messageContent,
        mediaUrl: mediaUrl,
        mediaType: mediaType as any,
        isFromCustomer: true,
        sentAt: new Date(timestamp)
      }
    });

    console.log(`${logPrefix} Message saved successfully:`, {
      id: message.id,
      externalId: message.externalId,
      content: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      mediaType: message.mediaType
    });

    // --- ÉTAPE 7: MARQUER LA CONVERSATION COMME NON LUE ---
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        unreadCount: { increment: 1 },
        lastMessageAt: new Date(timestamp)
      }
    });

    console.log(`${logPrefix} Message processing completed successfully for ${senderId}`);

  } catch (error) {
    console.error(`${logPrefix} Error processing Instagram message for sender ${senderId}:`, error);
    throw error; // Re-throw pour que l'erreur soit comptée dans les statistiques
  }
}