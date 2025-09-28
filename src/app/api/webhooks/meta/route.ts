// /app/api/webhooks/meta/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma'; // Assurez-vous que ce chemin est correct
import { ChannelType } from '@/generated/prisma';
import { getFacebookUserInfo } from '@/lib/facebook-utils';

// Préfixe pour tous les logs, pour les retrouver facilement.
const logPrefix = '[Meta Webhook]';

// ==================================================================
// ===      MÉTHODE GET : VÉRIFICATION DU WEBHOOK (UNE SEULE FOIS) ===
// ==================================================================
/**
 * Gère la requête de vérification envoyée par Meta lors de la configuration du webhook.
 * C'est une poignée de main pour prouver que nous sommes bien le propriétaire de l'URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log(`${logPrefix} Webhook verified successfully!`);
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error(`${logPrefix} Webhook verification failed. Tokens do not match.`);
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// ==================================================================
// ===      MÉTHODE POST : RÉCEPTION DES ÉVÉNEMENTS (MESSAGES)    ===
// ==================================================================
/**
 * Reçoit les événements en temps réel de Meta.
 * Version améliorée avec gestion robuste des erreurs et récupération des informations client.
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
    
    // Validation de la signature
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
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

    // Validation de la structure du body
    if (!body.object || (body.object !== 'page' && body.object !== 'instagram')) {
      console.warn(`${logPrefix} Received webhook for object type: ${body.object}, ignoring.`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      console.warn(`${logPrefix} No entries found in webhook body.`);
      return NextResponse.json({ status: 'no_entries' }, { status: 200 });
    }

    // --- ÉTAPE 3: TRAITEMENT SYNCHRONE DES MESSAGES ---
    let processedMessages = 0;
    let errors = 0;

    for (const entry of body.entry) {
      if (!entry.messaging || !Array.isArray(entry.messaging)) {
        console.log(`${logPrefix} Entry ${entry.id} has no messaging events, skipping.`);
        continue;
      }

      for (const event of entry.messaging) {
        if (event.message && event.message.text) {
          try {
            console.log(`${logPrefix} Processing message event...`);
            await processMessage(event);
            processedMessages++;
          } catch (messageError) {
            console.error(`${logPrefix} Error processing individual message:`, messageError);
            errors++;
            // Continue processing other messages even if one fails
          }
        } else if (event.message) {
          console.log(`${logPrefix} Received non-text message (attachments, etc.), skipping for now.`);
        } else {
          console.log(`${logPrefix} Received non-message event (delivery, read, etc.), skipping.`);
        }
      }
    }

    // --- ÉTAPE 4: RÉPONSE AVEC STATISTIQUES ---
    const responseData = {
      status: 'success',
      processed: processedMessages,
      errors: errors,
      timestamp: new Date().toISOString()
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
// ===               FONCTION DE TRAITEMENT DU MESSAGE            ===
// ==================================================================
/**
 * Traite un message individuel reçu de Meta.
 * Version améliorée avec récupération des informations client Facebook.
 */
async function processMessage(event: any) {
  const messageId = event.message?.mid;
  const senderId = event.sender?.id;
  const pageId = event.recipient?.id;
  const messageText = event.message?.text;
  const timestamp = event.timestamp;

  console.log(`${logPrefix} Processing message:`, {
    messageId,
    senderId,
    pageId,
    messageText: messageText?.substring(0, 100) + (messageText?.length > 100 ? '...' : ''),
    timestamp
  });

  // Validation des données requises
  if (!senderId) {
    console.error(`${logPrefix} Missing sender ID in message event`);
    throw new Error('Missing sender ID');
  }

  if (!pageId) {
    console.error(`${logPrefix} Missing page ID in message event`);
    throw new Error('Missing page ID');
  }

  if (!messageText) {
    console.error(`${logPrefix} Missing message text for sender ${senderId}`);
    throw new Error('Missing message text');
  }

  if (!messageId) {
    console.error(`${logPrefix} Missing message ID for sender ${senderId}`);
    throw new Error('Missing message ID');
  }

  try {
    // --- ÉTAPE 1: IDENTIFIER LE CANAL ET LA BOUTIQUE ---
    console.log(`${logPrefix} Looking for channel with externalId: ${pageId}`);
    const channel = await prisma.channel.findFirst({
      where: {
        externalId: pageId,
        isActive: true,
        type: { in: [ChannelType.FACEBOOK_PAGE, ChannelType.INSTAGRAM_DM] }
      }
    });

    if (!channel) {
      console.error(`${logPrefix} No active channel found for pageId: ${pageId}`);
      throw new Error(`No active channel found for pageId: ${pageId}`);
    }

    if (!channel.accessToken) {
      console.error(`${logPrefix} Channel ${channel.id} has no access token`);
      throw new Error('Channel missing access token');
    }

    const shopId = channel.shopId;
    console.log(`${logPrefix} Found channel ${channel.id} for shop ${shopId}`);

    // --- ÉTAPE 2: RÉCUPÉRER LES INFORMATIONS DU CLIENT FACEBOOK ---
    let userInfo: { name: string; avatarUrl?: string } = { name: `Client ${senderId.slice(-4)}`, avatarUrl: undefined };
    
    try {
      console.log(`${logPrefix} Fetching Facebook user info for senderId: ${senderId}`);
      const facebookUserInfo = await getFacebookUserInfo(senderId, channel.accessToken);
      
      if (facebookUserInfo) {
        userInfo = facebookUserInfo;
        console.log(`${logPrefix} Successfully fetched user info:`, { name: userInfo.name, hasAvatar: !!userInfo.avatarUrl });
      } else {
        console.warn(`${logPrefix} Could not retrieve user info for ${senderId}, using fallback name`);
      }
    } catch (userInfoError) {
      console.warn(`${logPrefix} Error fetching user info for ${senderId}:`, userInfoError);
      console.log(`${logPrefix} Continuing with fallback client name: ${userInfo.name}`);
    }

    // --- ÉTAPE 3: TROUVER OU CRÉER LE CLIENT ---
    console.log(`${logPrefix} Looking for customer with phone: ${senderId}`);
    let customer = await prisma.customer.findFirst({
      where: { shopId, phone: senderId }
    });
    
    if (customer) {
      console.log(`${logPrefix} Found existing customer: ${customer.id}`);
      
      // Mettre à jour les informations du client si elles ont changé
      const needsUpdate = customer.name !== userInfo.name || customer.avatarUrl !== userInfo.avatarUrl;
      if (needsUpdate) {
        console.log(`${logPrefix} Updating customer info:`, {
          oldName: customer.name,
          newName: userInfo.name,
          oldAvatar: customer.avatarUrl,
          newAvatar: userInfo.avatarUrl
        });
        
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { 
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl
          }
        });
        console.log(`${logPrefix} Customer updated successfully`);
      }
    } else {
      console.log(`${logPrefix} Creating new customer with name: ${userInfo.name}`);
      customer = await prisma.customer.create({
        data: { 
          shopId, 
          phone: senderId, 
          name: userInfo.name,
          avatarUrl: userInfo.avatarUrl
        }
      });
      console.log(`${logPrefix} Created new customer: ${customer.id}`);
    }

    // --- ÉTAPE 4: TROUVER OU CRÉER LA CONVERSATION ---
    console.log(`${logPrefix} Looking for conversation for customer: ${customer.id}`);
    let conversation = await prisma.conversation.findFirst({
      where: { shopId, customerId: customer.id, platform: channel.type }
    });
    
    if (conversation) {
      console.log(`${logPrefix} Found existing conversation: ${conversation.id}`);
    } else {
      console.log(`${logPrefix} Creating new conversation for customer: ${customer.id}`);
      conversation = await prisma.conversation.create({
        data: { shopId, customerId: customer.id, platform: channel.type, externalId: senderId, status: 'OPEN' }
      });
      console.log(`${logPrefix} Created new conversation: ${conversation.id}`);
    }

    // --- ÉTAPE 5: SAUVEGARDER LE MESSAGE ---
    console.log(`${logPrefix} Saving message to conversation: ${conversation.id}`);
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        isFromCustomer: true,
        messageType: 'TEXT',
        externalId: messageId,
      }
    });

    console.log(`${logPrefix} Message saved successfully:`, {
      messageId: message.id,
      conversationId: conversation.id,
      customerId: customer.id,
      customerName: customer.name
    });

    console.log(`${logPrefix} Message processing completed successfully`);

  } catch (error) {
    console.error(`${logPrefix} Error in processMessage:`, error);
    
    // Log détaillé pour le débogage
    console.error(`${logPrefix} Message processing context:`, {
      senderId,
      pageId,
      messageId,
      messageLength: messageText?.length,
      timestamp,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error; // Re-throw pour que l'appelant puisse gérer l'erreur
  }
}