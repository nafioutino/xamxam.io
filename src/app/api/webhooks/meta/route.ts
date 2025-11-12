// /app/api/webhooks/meta/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma'; // Importer depuis le client Prisma généré
import { getFacebookUserInfo } from '@/lib/facebook-utils';
import { getInstagramUserInfo } from '@/lib/instagram-utils';

const logPrefix = '[Meta Webhook]';

// ==================================================================
// ===      MÉTHODE GET : VÉRIFICATION DU WEBHOOK (UNE SEULE FOIS) ===
// ==================================================================
/**
 * Gère la requête de vérification envoyée par Meta lors de la configuration du webhook.
 * Doit utiliser un token de vérification unique pour toute l'application.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // On utilise une seule et unique variable d'environnement pour le token de vérification.
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
// ===      MÉTHODE POST : RÉCEPTION DES ÉVÉNEMENTS (MESSAGES)    ===
// ==================================================================
/**
 * Reçoit tous les événements en temps réel de Meta (Facebook, Instagram).
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
    console.log(`${logPrefix} DEBUG - FACEBOOK_APP_SECRET exists:`, !!process.env.FACEBOOK_APP_SECRET);
    console.log(`${logPrefix} DEBUG - FACEBOOK_APP_SECRET length:`, process.env.FACEBOOK_APP_SECRET?.length);
    
    // Validation de la signature (utilise la même logique que l'ancien code qui fonctionnait)
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
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
    // (Nous gardons la logique synchrone pour un débogage clair pour l'instant)
    const body = JSON.parse(rawBody);

    if (body.object === 'page' || body.object === 'instagram') {
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const event of entry.messaging) {
            if (event.message && event.message.text && !event.message.is_echo) {
              await processMessage(event);
            }
          }
        }
      }
    }

    // --- ÉTAPE 3: RÉPONDRE AVEC SUCCÈS ---
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} CRITICAL ERROR in POST handler:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ==================================================================
// ===               FONCTION DE TRAITEMENT DU MESSAGE            ===
// ==================================================================
/**
 * Traite un message individuel, l'identifie et le stocke dans la base de données.
 */
async function processMessage(event: any) {
  const messageId = event.message?.mid;
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id; // L'ID de notre Page FB ou Compte IG
  const messageText = event.message?.text;

  if (!senderId || !recipientId || !messageText || !messageId) {
    console.warn(`${logPrefix} Incomplete message event received, skipping.`);
    return;
  }

  try {
    // --- ÉTAPE 1: IDENTIFIER LE CANAL ET LA BOUTIQUE ---
    const channel = await prisma.channel.findFirst({
      where: { externalId: recipientId, isActive: true }
    });

    if (!channel) {
      throw new Error(`No active channel found for recipientId: ${recipientId}`);
    }

    const shopId = channel.shopId;
    console.log(`${logPrefix} Found channel ${channel.id} (${channel.type}) for shop ${shopId}`);

    // --- ÉTAPE 2: RÉCUPÉRER LES INFORMATIONS DU CLIENT ---
    let userInfo: { name: string; avatarUrl?: string } = { name: `Client ${senderId.slice(-4)}`, avatarUrl: undefined };
    
    try {
      if (channel.type === ChannelType.INSTAGRAM_DM) {
        const instagramUserInfo = await getInstagramUserInfo(senderId, channel.accessToken!);
        if (instagramUserInfo) userInfo = instagramUserInfo;
      } else {
        const facebookUserInfo = await getFacebookUserInfo(senderId, channel.accessToken!);
        if (facebookUserInfo) userInfo = facebookUserInfo;
      }
    } catch (userInfoError) {
      console.warn(`${logPrefix} Error fetching user info for ${senderId}:`, userInfoError);
    }

    // --- ÉTAPE 3: TROUVER OU CRÉER LE CLIENT ---
    const customer = await prisma.customer.upsert({
      where: { shopId_phone: { shopId, phone: senderId } },
      update: { name: userInfo.name, avatarUrl: userInfo.avatarUrl },
      create: { shopId, phone: senderId, name: userInfo.name, avatarUrl: userInfo.avatarUrl }
    });

    // --- ÉTAPE 4: TROUVER OU CRÉER LA CONVERSATION ---
    let conversation = await prisma.conversation.findFirst({
      where: { shopId, customerId: customer.id, platform: channel.type }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { shopId, customerId: customer.id, platform: channel.type, externalId: senderId, status: 'OPEN' }
      });
    }

    // --- ÉTAPE 5: SAUVEGARDER LE MESSAGE ---
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        isFromCustomer: true,
        messageType: 'TEXT',
        externalId: messageId,
      }
    });

    console.log(`${logPrefix} Message from ${senderId} for shop ${shopId} stored successfully.`);

  } catch (error) {
    console.error(`${logPrefix} Error in processMessage:`, error);
    throw error; // Re-lancer l'erreur pour que le handler POST principal puisse la logguer.
  }
}