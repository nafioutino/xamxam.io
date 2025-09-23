// /app/api/webhooks/meta/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';

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
 * Reçoit les événements en temps réel de Meta (nouveaux messages, réactions, etc.).
 * C'est le cœur de notre communication entrante.
 */
export async function POST(request: NextRequest) {
  // --- ÉTAPE 1: SÉCURITÉ - VALIDER LA SIGNATURE DE LA REQUÊTE ---
  // C'est non négociable. On s'assure que la requête vient bien de Meta et pas d'un imposteur.
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    console.error(`${logPrefix} Missing x-hub-signature-256 header.`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // On a besoin du corps de la requête "brut", en texte, pour le hachage.
  const rawBody = await request.text();
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
    .update(rawBody)
    .digest('hex')}`;

  // Utiliser `timingSafeEqual` pour prévenir les attaques temporelles.
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.error(`${logPrefix} Invalid signature.`);
    return new NextResponse('Forbidden', { status: 403 });
  }
  console.log(`${logPrefix} Signature validated successfully.`);

  // --- ÉTAPE 2: RÉPONDRE IMMÉDIATEMENT À META ---
  // On dit à Meta "OK, j'ai bien reçu ton message, merci" pour éviter qu'il ne réessaie.
  // Le traitement réel se fera après l'envoi de cette réponse.
  const response = NextResponse.json({ status: 'success' }, { status: 200 });

  // --- ÉTAPE 3: TRAITEMENT ASYNCHRONE DES MESSAGES ---
  // On utilise `setTimeout` pour s'assurer que la réponse est envoyée avant de commencer le travail lourd.
  setTimeout(async () => {
    try {
      const body = JSON.parse(rawBody);

      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const event of entry.messaging) {
            if (event.message) {
              await processMessage(event);
            }
          }
        }
      }
    } catch (error) {
      console.error(`${logPrefix} Error during async processing:`, error);
    }
  }, 0);

  return response;
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

  if (!messageText) return; // Pour l'instant, on ne gère que les messages texte.

  // 1. Identifier le canal et la boutique correspondants dans notre base de données.
  const channel = await prisma.channel.findFirst({
    where: {
      externalId: pageId,
      isActive: true,
      // On s'assure que c'est bien un canal Facebook ou Instagram
      type: { in: [ChannelType.FACEBOOK_PAGE, ChannelType.INSTAGRAM_DM] }
    }
  });

  if (!channel) {
    console.warn(`${logPrefix} Received message for unknown page/channel ID: ${pageId}. Ignoring.`);
    return;
  }
  const shopId = channel.shopId;

  // 2. Trouver ou créer le client.
  let customer = await prisma.customer.findFirst({
    where: { shopId, phone: senderId }
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { shopId, phone: senderId, name: `Client ${senderId.slice(-4)}` } // On pourrait récupérer le nom via l'API plus tard
    });
  }

  // 3. Trouver ou créer la conversation.
  let conversation = await prisma.conversation.findFirst({
    where: { shopId, customerId: customer.id, platform: channel.type }
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { shopId, customerId: customer.id, platform: channel.type, externalId: senderId, status: 'OPEN' }
    });
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

  console.log(`${logPrefix} Message from ${senderId} for shop ${shopId} stored successfully.`);

  // 5. Déclencher le workflow n8n (logique à ajouter)
  // C'est ici qu'on pourrait appeler un webhook n8n avec l'ID du message ou de la conversation.
}