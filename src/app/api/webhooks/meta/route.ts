// /app/api/webhooks/meta/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma'; // Assurez-vous que ce chemin est correct
import { ChannelType } from '@/generated/prisma';

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
 * Pour le débogage, cette version est SYNCHRONE : elle attend la fin du traitement
 * avant de répondre à Meta. C'est plus lent, mais nous donnera des erreurs claires.
 */
export async function POST(request: NextRequest) {
  console.log(`${logPrefix} Received a POST request.`);
  try {
    // --- ÉTAPE 1: SÉCURITÉ - VALIDER LA SIGNATURE DE LA REQUÊTE ---
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    const rawBody = await request.text();
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
      .update(rawBody)
      .digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error(`${logPrefix} Invalid signature.`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.log(`${logPrefix} Signature validated successfully.`);

    // --- ÉTAPE 2: TRAITEMENT SYNCHRONE DES MESSAGES ---
    const body = JSON.parse(rawBody);
    console.log(`${logPrefix} Parsed body:`, JSON.stringify(body, null, 2));

    if (body.object === 'page') {
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const event of entry.messaging) {
            if (event.message) {
              console.log(`${logPrefix} Found message, calling processMessage synchronously...`);
              await processMessage(event);
            }
          }
        }
      }
    }

    // --- ÉTAPE 3: RÉPONDRE À LA FIN DU TRAITEMENT ---
    console.log(`${logPrefix} All processing finished. Sending 200 OK to Meta.`);
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} CRITICAL ERROR in POST handler:`, error);
    // En cas d'erreur, on la loggue et on renvoie une erreur 500 pour que Meta sache que ça a échoué.
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ==================================================================
// ===               FONCTION DE TRAITEMENT DU MESSAGE            ===
// ==================================================================
/**
 * Traite un message individuel, l'identifie et le stocke dans la base de données.
 * @param event L'objet événement de messagerie de Meta.
 */
async function processMessage(event: any) {
  const senderId = event.sender.id;
  const pageId = event.recipient.id;
  const messageText = event.message.text;
  const messageId = event.message.mid;

  console.log(`${logPrefix} [processMessage] Started for message: "${messageText}"`);

  if (!messageText) {
    console.log(`${logPrefix} [processMessage] No message text found, skipping.`);
    return;
  }

  try {
    // 1. Identifier le canal et la boutique correspondants.
    console.log(`${logPrefix} [processMessage] Looking for channel with externalId: ${pageId}`);
    const channel = await prisma.channel.findFirst({
      where: {
        externalId: pageId,
        isActive: true,
        type: { in: [ChannelType.FACEBOOK_PAGE, ChannelType.INSTAGRAM_DM] }
      }
    });

    if (!channel) {
      console.warn(`${logPrefix} [processMessage] No active channel found for pageId: ${pageId}. Ignoring.`);
      return;
    }
    const shopId = channel.shopId;
    console.log(`${logPrefix} [processMessage] Found channel ${channel.id} for shop ${shopId}.`);

    // 2. Trouver ou créer le client.
    let customer = await prisma.customer.findFirst({
      where: { shopId, phone: senderId }
    });
    if (!customer) {
      // Pour le débogage, on utilise un nom générique. On pourra ajouter l'appel à l'API Graph plus tard.
      customer = await prisma.customer.create({
        data: { shopId, phone: senderId, name: `Client ${senderId.slice(-4)}` }
      });
      console.log(`${logPrefix} [processMessage] Created new customer: ${customer.id}`);
    }

    // 3. Trouver ou créer la conversation.
    let conversation = await prisma.conversation.findFirst({
      where: { shopId, customerId: customer.id, platform: channel.type }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { shopId, customerId: customer.id, platform: channel.type, externalId: senderId, status: 'OPEN' }
      });
      console.log(`${logPrefix} [processMessage] Created new conversation: ${conversation.id}`);
    }

    // 4. Stocker le message.
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        isFromCustomer: true,
        messageType: 'TEXT',
        externalId: messageId,
      }
    });

    console.log(`${logPrefix} [processMessage] Message from ${senderId} stored successfully.`);

  } catch (error) {
    console.error(`${logPrefix} [processMessage] CRITICAL ERROR during DB operations:`, error);
    // On "re-throw" l'erreur pour que le handler POST principal puisse la "catcher"
    // et renvoyer une réponse 500. C'est important pour le monitoring.
    throw error;
  }
}