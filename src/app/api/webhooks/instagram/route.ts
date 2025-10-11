// /app/api/webhooks/instagram/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma'; // Importer depuis le client Prisma généré
import { getInstagramUserInfo } from '@/lib/instagram-utils';

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

  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;

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
 * Version dédiée spécifiquement pour Instagram avec son propre App Secret.
 */
export async function POST(request: NextRequest) {
  console.log(`${logPrefix} Received a POST request.`);

  let rawBody: string = '';

  try {
    // --- ÉTAPE 1: SÉCURITÉ - VALIDER LA SIGNATURE DE LA REQUÊTE ---
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    rawBody = await request.text();
    
    // DEBUG: Logs détaillés pour diagnostiquer le problème de signature
    console.log(`${logPrefix} DEBUG - Signature reçue:`, signature);
    console.log(`${logPrefix} DEBUG - Raw body length:`, rawBody.length);
    console.log(`${logPrefix} DEBUG - Raw body (first 200 chars):`, rawBody.substring(0, 200));
    
    // Utiliser FACEBOOK_APP_SECRET pour Instagram (même App Secret)
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    console.log(`${logPrefix} DEBUG - Using FACEBOOK_APP_SECRET for Instagram`);
    console.log(`${logPrefix} DEBUG - App Secret exists:`, !!appSecret);
    console.log(`${logPrefix} DEBUG - App Secret length:`, appSecret?.length);
    
    // Validation de la signature
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret!)
      .update(rawBody)
      .digest('hex')}`;

    console.log(`${logPrefix} DEBUG - Signature attendue:`, expectedSignature);
    console.log(`${logPrefix} DEBUG - Signatures match:`, signature === expectedSignature);

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error(`${logPrefix} Invalid signature.`);
      console.error(`${logPrefix} Received: ${signature}`);
      console.error(`${logPrefix} Expected: ${expectedSignature}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.log(`${logPrefix} Signature validated successfully.`);

    // --- ÉTAPE 2: TRAITEMENT DES MESSAGES ---
    const body = JSON.parse(rawBody);

    console.log(`${logPrefix} Parsed body:`, JSON.stringify(body, null, 2));

    // Validation spécifique Instagram
    if (body.object !== 'instagram') {
      console.warn(`${logPrefix} Received webhook for object type: ${body.object}, expected 'instagram'.`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      console.warn(`${logPrefix} No entries found in webhook body.`);
      return NextResponse.json({ status: 'no_entries' }, { status: 200 });
    }

    // Traitement des entrées Instagram
    for (const entry of body.entry) {
      if (entry.messaging && Array.isArray(entry.messaging)) {
        for (const event of entry.messaging) {
          await processInstagramMessage(event);
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} Error processing webhook:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ==================================================================
// ===                    TRAITEMENT DES MESSAGES                 ===
// ==================================================================
async function processInstagramMessage(event: any) {
  try {
    console.log(`${logPrefix} Processing Instagram message event:`, JSON.stringify(event, null, 2));

    // Vérifier si c'est un message (pas un delivery receipt ou autre)
    if (!event.message) {
      console.log(`${logPrefix} Event is not a message, skipping.`);
      return;
    }

    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const messageText = event.message?.text || '';
    const timestamp = event.timestamp;

    if (!senderId || !recipientId) {
      console.error(`${logPrefix} Missing sender or recipient ID.`);
      return;
    }

    console.log(`${logPrefix} Processing message from ${senderId} to ${recipientId}: "${messageText}"`);

    // --- ÉTAPE 1: RÉCUPÉRER LE CANAL INSTAGRAM ---
    let channel = await prisma.channel.findFirst({
      where: {
        externalId: recipientId,
        type: ChannelType.INSTAGRAM_DM
      }
    });

    if (!channel) {
      console.error(`${logPrefix} No Instagram channel found for recipient ID: ${recipientId}`);
      return;
    }

    console.log(`${logPrefix} Channel retrieved:`, channel.type);

    // --- ÉTAPE 2: RÉCUPÉRER LES INFORMATIONS DU PROFIL INSTAGRAM ---
    let instagramProfile;
    try {
      // Récupérer le token d'accès depuis le canal
      if (!channel.accessToken) {
        throw new Error('No access token found for Instagram channel');
      }
      
      instagramProfile = await getInstagramUserInfo(senderId, channel.accessToken);
      console.log(`${logPrefix} Instagram profile retrieved:`, instagramProfile);
    } catch (profileError) {
      console.error(`${logPrefix} Failed to retrieve Instagram profile for ${senderId}:`, profileError);
      // Continuer avec des informations par défaut
      instagramProfile = {
        name: 'Utilisateur Instagram',
        avatarUrl: null
      };
    }

    // --- ÉTAPE 3: TROUVER OU CRÉER LE CLIENT ---
    let customer = await prisma.customer.upsert({
      where: { shopId_phone: { shopId: channel.shopId, phone: senderId } },
      update: { name: instagramProfile.name, avatarUrl: instagramProfile.avatarUrl },
      create: { shopId: channel.shopId, phone: senderId, name: instagramProfile.name, avatarUrl: instagramProfile.avatarUrl }
    });

    // --- ÉTAPE 4: TROUVER OU CRÉER LA CONVERSATION ---
    let conversation = await prisma.conversation.findFirst({
      where: { shopId: channel.shopId, customerId: customer.id, platform: channel.type }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { shopId: channel.shopId, customerId: customer.id, platform: channel.type, externalId: senderId, status: 'OPEN' }
      });
    }

    // --- ÉTAPE 5: CRÉER LE MESSAGE ---
    const message = await prisma.message.create({
      data: {
        content: messageText,
        isFromCustomer: true,
        conversationId: conversation.id,
        externalId: `instagram_${timestamp}_${senderId}`
      }
    });

    console.log(`${logPrefix} Message stored successfully:`, message.id);

  } catch (error) {
    console.error(`${logPrefix} Error processing Instagram message:`, error);
  }
}