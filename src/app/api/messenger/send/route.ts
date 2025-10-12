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
    let channel;
    // Normaliser la plateforme pour la comparaison
    const platformLower = conversation.platform.toLowerCase();
    
    if (platformLower === 'facebook' || conversation.platform === ChannelType.FACEBOOK_PAGE) {
      channel = conversation.shop.channels.find((c: { type: any; }) => c.type === ChannelType.FACEBOOK_PAGE);
    } else if (platformLower === 'instagram' || conversation.platform === ChannelType.INSTAGRAM_DM) {
      channel = conversation.shop.channels.find((c: { type: any; }) => c.type === ChannelType.INSTAGRAM_DM);
    }
    
    console.log(`${logPrefix} Recherche de canal pour platform: ${conversation.platform} (normalized: ${platformLower}), canal trouvé:`, !!channel);
    
    if (!channel || !channel.accessToken) {
      return NextResponse.json({
        success: false,
        error: `Canal ${conversation.platform} non configuré ou token d'accès manquant`
      }, { status: 400 });
    }

    console.log(`${logPrefix} Envoi du message pour conversation ${conversationId}:`, {
      platform: conversation.platform,
      messageType,
      hasChannel: !!channel,
      hasToken: !!channel?.accessToken
    });
    
    // --- PRÉPARER LE PAYLOAD ET L'URL SELON LA PLATEFORME ---
    const recipientId = conversation.externalId;
    if (!recipientId) {
      return NextResponse.json({
        success: false,
        error: 'ID du destinataire non trouvé'
      }, { status: 400 });
    }

    const isInstagram = conversation.platform.toLowerCase() === 'instagram' || conversation.platform === ChannelType.INSTAGRAM_DM;

    let apiUrl: string;
    let messagePayload: any;

    if (isInstagram) {
      // Utiliser Instagram Graph API: https://graph.instagram.com/v24.0/<IG_ID>/messages
      apiUrl = `https://graph.instagram.com/v24.0/${channel.externalId}/messages`;

      // Construire le payload selon la doc Instagram
      messagePayload = {
        recipient: { id: recipientId },
        message: {}
      };

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
          // Support basique pour audio/vidéo via Instagram
          const urlLower = mediaUrl.toLowerCase();
          const isVideo = urlLower.endsWith('.mp4') || urlLower.includes('video');
          const isAudio = urlLower.endsWith('.mp3') || urlLower.endsWith('.m4a') || urlLower.includes('audio');
          if (!isVideo && !isAudio) {
            return NextResponse.json({
              success: false,
              error: 'Instagram ne supporte que audio/vidéo pour FILE. Utilisez une image ou fournissez une URL audio/vidéo.'
            }, { status: 400 });
          }
          messagePayload.message.attachment = {
            type: isVideo ? 'video' : 'audio',
            payload: { url: mediaUrl }
          };
          break;
        default:
          messagePayload.message.text = message;
      }
    } else {
      // Facebook Messenger API
      apiUrl = `https://graph.facebook.com/v23.0/me/messages`;
      messagePayload = {
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: {}
      };
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
            payload: { url: mediaUrl, is_reusable: true }
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
            payload: { url: mediaUrl, is_reusable: true }
          };
          break;
        default:
          messagePayload.message.text = message;
      }
    }

    // Déchiffrer le token d'accès avant utilisation
    let decryptedToken;
    try {
      decryptedToken = decryptToken(channel.accessToken);
      console.log(`${logPrefix} Token déchiffré avec succès pour ${conversation.platform}`);
    } catch (error) {
      console.error(`${logPrefix} Erreur lors du déchiffrement du token:`, error);
      return NextResponse.json({
        success: false,
        error: 'Erreur de configuration du token d\'accès'
      }, { status: 500 });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decryptedToken}`
      },
      body: JSON.stringify(messagePayload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`${logPrefix} Erreur API Meta:`, responseData);
      
      // Gestion spécifique des erreurs Instagram
      const platformLowerForError = conversation.platform.toLowerCase();
      if ((platformLowerForError === 'instagram' || conversation.platform === ChannelType.INSTAGRAM_DM) && responseData.error) {
        const errorCode = responseData.error.code;
        const errorMessage = responseData.error.message;
        
        // Erreurs courantes Instagram
        if (errorCode === 10 || errorCode === 551) {
          console.error(`${logPrefix} Erreur Instagram - Utilisateur non autorisé ou conversation fermée:`, errorMessage);
          return NextResponse.json({
            success: false,
            error: 'Impossible d\'envoyer le message Instagram. L\'utilisateur doit d\'abord vous envoyer un message.',
            details: responseData
          }, { status: 400 });
        }
      }
      
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
        externalId: responseData.message_id || responseData.id || undefined,
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

    console.log(`${logPrefix} Message envoyé avec succès. ID: ${responseData.message_id || responseData.id || 'unknown'}`);

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