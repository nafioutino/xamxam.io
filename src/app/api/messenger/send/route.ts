// /app/api/messenger/send/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';
import { decryptToken } from '@/lib/encryption';

const logPrefix = '[Messenger Send]';

// ==================================================================
// ===      MÉTHODE POST : ENVOYER UN MESSAGE                     ===
// ==================================================================
/**
 * Envoie un message via Messenger ou Instagram Direct
 * Body attendu:
 * {
 *   "conversationId": "uuid",
 *   "message": "Texte du message",
 *   "messageType": "TEXT" | "IMAGE" | "FILE" (optionnel, défaut: TEXT),
 *   "mediaUrl": "url" (optionnel, pour les images/fichiers)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, messageType = 'TEXT', mediaUrl } = body;

    // --- VALIDATION DES DONNÉES ---
    if (!conversationId || !message) {
      return NextResponse.json({
        success: false,
        error: 'conversationId et message sont requis'
      }, { status: 400 });
    }

    // --- RÉCUPÉRER LA CONVERSATION ET SES INFORMATIONS ---
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: true,
        shop: {
          include: {
            channels: {
              where: {
                type: { in: [ChannelType.FACEBOOK_PAGE, ChannelType.INSTAGRAM_DM] },
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation non trouvée'
      }, { status: 404 });
    }

    // --- TROUVER LE CANAL APPROPRIÉ ---
    const channel = conversation.shop.channels.find(c => c.type === conversation.platform);
    if (!channel || !channel.accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Canal non configuré ou token d\'accès manquant'
      }, { status: 400 });
    }

    // --- PRÉPARER LE PAYLOAD POUR L'API META ---
    const recipientId = conversation.externalId;
    if (!recipientId) {
      return NextResponse.json({
        success: false,
        error: 'ID du destinataire non trouvé'
      }, { status: 400 });
    }

    let messagePayload: any = {
      recipient: { id: recipientId },
      message: {}
    };

    // Construire le message selon le type
    switch (messageType) {
      case 'TEXT':
        messagePayload.message.text = message;
        break;
      case 'IMAGE':
        if (!mediaUrl) {
          return NextResponse.json({
            success: false,
            error: 'mediaUrl requis pour les images'
          }, { status: 400 });
        }
        messagePayload.message.attachment = {
          type: 'image',
          payload: { url: mediaUrl }
        };
        break;
      case 'FILE':
        if (!mediaUrl) {
          return NextResponse.json({
            success: false,
            error: 'mediaUrl requis pour les fichiers'
          }, { status: 400 });
        }
        messagePayload.message.attachment = {
          type: 'file',
          payload: { url: mediaUrl }
        };
        break;
      default:
        messagePayload.message.text = message;
    }

    // --- ENVOYER LE MESSAGE VIA L'API META ---
    const apiUrl = conversation.platform === ChannelType.FACEBOOK_PAGE 
      ? `https://graph.facebook.com/v18.0/me/messages`
      : `https://graph.facebook.com/v18.0/me/messages`; // Même endpoint pour Instagram

    // Déchiffrer le token d'accès avant utilisation
    const decryptedToken = decryptToken(channel.accessToken);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decryptedToken}`
      },
      body: JSON.stringify(messagePayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`${logPrefix} Erreur API Meta:`, responseData);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi du message',
        details: responseData
      }, { status: 500 });
    }

    // --- SAUVEGARDER LE MESSAGE DANS LA BASE DE DONNÉES ---
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageType === 'TEXT' ? message : `[${messageType}] ${mediaUrl || 'Média envoyé'}`,
        messageType: messageType as any,
        mediaUrl: mediaUrl,
        isFromCustomer: false,
        externalId: responseData.message_id,
        isRead: true // Les messages envoyés sont considérés comme lus
      }
    });

    // --- METTRE À JOUR LA CONVERSATION ---
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`${logPrefix} Message envoyé avec succès. ID: ${responseData.message_id}`);

    return NextResponse.json({
      success: true,
      data: {
        messageId: savedMessage.id,
        externalId: responseData.message_id,
        message: savedMessage
      },
      message: 'Message envoyé avec succès'
    }, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} Erreur lors de l'envoi du message:`, error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// ==================================================================
// ===      MÉTHODE GET : RÉCUPÉRER L'HISTORIQUE DES MESSAGES     ===
// ==================================================================
/**
 * Récupère l'historique des messages d'une conversation
 * Query params: conversationId, limit (optionnel), offset (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId requis'
      }, { status: 400 });
    }

    // --- RÉCUPÉRER LES MESSAGES ---
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true
          }
        }
      }
    });

    // --- COMPTER LE TOTAL ---
    const totalMessages = await prisma.message.count({
      where: { conversationId }
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
        pagination: {
          total: totalMessages,
          limit,
          offset,
          hasMore: offset + limit < totalMessages
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error(`${logPrefix} Erreur lors de la récupération des messages:`, error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}