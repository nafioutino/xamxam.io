// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';
import { getInstagramUserInfo } from '@/lib/instagram-utils';

const logPrefix = '[Instagram Webhook]';

// ==================================================================
// ===      MÉTHODE GET : VÉRIFICATION DU WEBHOOK (UNE SEULE FOIS) ===
// ==================================================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

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
export async function POST(request: NextRequest) {
  console.log(`${logPrefix} Received a POST request.`);

  try {
    // --- ÉTAPE 1: RÉCUPÉRER ET VÉRIFIER LA SIGNATURE ---
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      console.error(`${logPrefix} App secret not found in environment variables.`);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Lire le corps brut du webhook (sans parsing)
    const arrayBuffer = await request.arrayBuffer();
    const rawBody = Buffer.from(arrayBuffer);

    // Calcul de la signature attendue
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    // Logs détaillés
    console.log(`${logPrefix} DEBUG - Signature reçue:`, signature);
    console.log(`${logPrefix} DEBUG - Signature attendue:`, expectedSignature);
    console.log(`${logPrefix} DEBUG - Signatures match:`, signature === expectedSignature);

    // Comparaison sécurisée
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error(`${logPrefix} Invalid signature.`);
      console.error(`${logPrefix} Received: ${signature}`);
      console.error(`${logPrefix} Expected: ${expectedSignature}`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    console.log(`${logPrefix} Signature validated successfully.`);

    // --- ÉTAPE 2: PARSER LE CORPS APRÈS VALIDATION ---
    const body = JSON.parse(rawBody.toString('utf8'));
    console.log(`${logPrefix} Parsed body:`, JSON.stringify(body, null, 2));

    // Validation spécifique à Instagram
    if (body.object !== 'instagram') {
      console.warn(`${logPrefix} Received webhook for object type: ${body.object}, expected 'instagram'.`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      console.warn(`${logPrefix} No entries found in webhook body.`);
      return NextResponse.json({ status: 'no_entries' }, { status: 200 });
    }

    // --- ÉTAPE 3: TRAITEMENT DES ENTRÉES ---
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

    // Vérifier si c'est bien un message
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

    // --- ÉTAPE 2: RÉCUPÉRER LE PROFIL DE L’UTILISATEUR ---
    let instagramProfile;
    try {
      if (!channel.accessToken) throw new Error('No access token found for Instagram channel');
      instagramProfile = await getInstagramUserInfo(senderId, channel.accessToken);
      console.log(`${logPrefix} Instagram profile retrieved:`, instagramProfile);
    } catch (profileError) {
      console.error(`${logPrefix} Failed to retrieve Instagram profile for ${senderId}:`, profileError);
      instagramProfile = { name: 'Utilisateur Instagram', avatarUrl: null };
    }

    // --- ÉTAPE 3: TROUVER OU CRÉER LE CLIENT ---
    const customer = await prisma.customer.upsert({
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
