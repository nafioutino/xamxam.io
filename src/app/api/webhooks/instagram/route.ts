// /app/api/webhooks/instagram/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';
import { getInstagramUserInfo } from '@/lib/instagram-utils';

const logPrefix = '[Instagram Webhook]';

// ==================================================================
// ===      CONFIGURATION NEXT.JS (IMPORTANT!)                    ===
// ==================================================================
// Désactiver le parsing automatique du body pour préserver le raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// ==================================================================
// ===      MÉTHODE GET : VÉRIFICATION DU WEBHOOK                 ===
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
  }
  
  console.error(`${logPrefix} Webhook verification failed. Tokens do not match.`);
  return new NextResponse('Forbidden', { status: 403 });
}

// ==================================================================
// ===      MÉTHODE POST : RÉCEPTION DES ÉVÉNEMENTS               ===
// ==================================================================
export async function POST(request: NextRequest) {
  console.log(`${logPrefix} Received POST request.`);

  try {
    // --- ÉTAPE 1: RÉCUPÉRER LE RAW BODY ---
    const rawBody = await request.text();
    
    // --- ÉTAPE 2: VALIDER LA SIGNATURE ---
    const signature = request.headers.get('x-hub-signature-256');
    
    if (!signature) {
      console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Utiliser INSTAGRAM_APP_SECRET
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    
    if (!appSecret) {
      console.error(`${logPrefix} INSTAGRAM_APP_SECRET not configured.`);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Calculer la signature attendue
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody, 'utf8')
      .digest('hex')}`;

    // Comparaison sécurisée
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error(`${logPrefix} Invalid signature.`);
      console.error(`${logPrefix} Received: ${signature}`);
      console.error(`${logPrefix} Expected: ${expectedSignature}`);
      console.error(`${logPrefix} Body length: ${rawBody.length}`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    console.log(`${logPrefix} Signature validated successfully.`);

    // --- ÉTAPE 3: PARSER ET TRAITER LE BODY ---
    const body = JSON.parse(rawBody);

    // Validation du type d'objet
    if (body.object !== 'instagram') {
      console.warn(`${logPrefix} Received object type: ${body.object}, expected 'instagram'.`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Vérifier les entrées
    if (!body.entry?.length) {
      console.warn(`${logPrefix} No entries found in webhook body.`);
      return NextResponse.json({ status: 'no_entries' }, { status: 200 });
    }

    // Traiter chaque entrée
    for (const entry of body.entry) {
      if (entry.messaging?.length) {
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
    console.log(`${logPrefix} Processing message event.`);

    // Vérifier que c'est bien un message
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

    console.log(`${logPrefix} Message from ${senderId}: "${messageText}"`);

    // --- RÉCUPÉRER LE CANAL ---
    const channel = await prisma.channel.findFirst({
      where: {
        externalId: recipientId,
        type: ChannelType.INSTAGRAM_DM
      }
    });

    if (!channel) {
      console.error(`${logPrefix} No channel found for recipient: ${recipientId}`);
      return;
    }

    // --- RÉCUPÉRER LE PROFIL INSTAGRAM ---
    let instagramProfile = {
      name: 'Utilisateur Instagram',
      avatarUrl: null as string | null
    };

    if (channel.accessToken) {
      try {
       let instagramProfile = await getInstagramUserInfo(senderId, channel.accessToken);
        console.log(`${logPrefix} Profile retrieved: ${instagramProfile.name}`);
      } catch (error) {
        console.error(`${logPrefix} Failed to retrieve profile:`, error);
      }
    }

    // --- CRÉER/METTRE À JOUR LE CLIENT ---
    const customer = await prisma.customer.upsert({
      where: { 
        shopId_phone: { 
          shopId: channel.shopId, 
          phone: senderId 
        } 
      },
      update: { 
        name: instagramProfile.name, 
        avatarUrl: instagramProfile.avatarUrl 
      },
      create: { 
        shopId: channel.shopId, 
        phone: senderId, 
        name: instagramProfile.name, 
        avatarUrl: instagramProfile.avatarUrl 
      }
    });

    // --- CRÉER/RÉCUPÉRER LA CONVERSATION ---
    let conversation = await prisma.conversation.findFirst({
      where: { 
        shopId: channel.shopId, 
        customerId: customer.id, 
        platform: channel.type 
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { 
          shopId: channel.shopId, 
          customerId: customer.id, 
          platform: channel.type, 
          externalId: senderId, 
          status: 'OPEN' 
        }
      });
    }

    // --- CRÉER LE MESSAGE ---
    const message = await prisma.message.create({
      data: {
        content: messageText,
        isFromCustomer: true,
        conversationId: conversation.id,
        externalId: `instagram_${timestamp}_${senderId}`
      }
    });

    console.log(`${logPrefix} Message stored successfully: ${message.id}`);

  } catch (error) {
    console.error(`${logPrefix} Error processing message:`, error);
    throw error;
  }
}