import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';
import { ChannelType } from '@/generated/prisma';

// Types
interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
}

interface PageTokenResponse {
  access_token: string;
  id: string;
}

interface MetaError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

interface WebhookSubscriptionResponse {
  success: boolean;
}

// Fonction pour mapper les plateformes vers les types de canaux
function mapPlatformToChannelType(platform: string): ChannelType {
  switch (platform.toLowerCase()) {
    case 'messenger':
      return ChannelType.FACEBOOK_PAGE;
    case 'instagram':
      return ChannelType.INSTAGRAM_DM;
    case 'whatsapp':
      return ChannelType.WHATSAPP;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, pageName, platform } = body;
    
    if (!pageId || !pageName || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, pageName, platform' },
        { status: 400 }
      );
    }
    
    const cookieStore = await cookies();
    
    // Récupérer les données stockées
    const pagesData = cookieStore.get('meta_pages')?.value;
    const userToken = cookieStore.get('meta_user_token')?.value;
    
    if (!pagesData || !userToken) {
      return NextResponse.json(
        { error: 'Session expired. Please authenticate again.' },
        { status: 401 }
      );
    }
    
    let pages: FacebookPage[];
    try {
      pages = JSON.parse(pagesData);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      );
    }
    
    // Trouver la page sélectionnée
    const selectedPage = pages.find(page => page.id === pageId);
    if (!selectedPage) {
      return NextResponse.json(
        { error: 'Selected page not found' },
        { status: 404 }
      );
    }
    
    // Étape 1: Obtenir un Page Access Token longue durée
    const pageTokenUrl = new URL(`https://graph.facebook.com/v18.0/${pageId}`);
    pageTokenUrl.searchParams.append('fields', 'access_token');
    pageTokenUrl.searchParams.append('access_token', userToken);
    
    const pageTokenResponse = await fetch(pageTokenUrl.toString());
    const pageTokenData: PageTokenResponse | MetaError = await pageTokenResponse.json();
    
    if (!pageTokenResponse.ok || 'error' in pageTokenData) {
      console.error('Page token fetch failed:', pageTokenData);
      return NextResponse.json(
        { error: 'Failed to obtain page access token' },
        { status: 500 }
      );
    }
    
    const pageAccessToken = pageTokenData.access_token;
    
    // Étape 2: Souscrire aux webhooks
    const webhookUrl = new URL(`https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`);
    const webhookBody = new URLSearchParams();
    webhookBody.append('access_token', pageAccessToken);
    
    // Définir les champs selon la plateforme
    let subscribedFields: string[];
    switch (platform) {
      case 'messenger':
        subscribedFields = ['messages', 'messaging_postbacks', 'messaging_deliveries', 'messaging_reads'];
        break;
      case 'instagram':
        subscribedFields = ['messages', 'messaging_postbacks'];
        break;
      case 'whatsapp':
        subscribedFields = ['messages', 'message_deliveries'];
        break;
      default:
        subscribedFields = ['messages'];
    }
    
    webhookBody.append('subscribed_fields', subscribedFields.join(','));
    
    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: webhookBody
    });
    
    const webhookData: WebhookSubscriptionResponse | MetaError = await webhookResponse.json();
    
    if (!webhookResponse.ok || 'error' in webhookData) {
      console.error('Webhook subscription failed:', webhookData);
      // Ne pas échouer complètement, on peut configurer les webhooks manuellement
      console.warn('Continuing without webhook subscription...');
    }
    
    // Étape 3: Récupérer le shopId depuis la session utilisateur
    // TODO: Implémenter la récupération du shopId depuis la session
    // Pour l'instant, on utilise une valeur par défaut
    const shopId = 'default-shop-id'; // À remplacer par la vraie logique de session
    
    // Étape 4: Chiffrer et stocker les données de manière sécurisée
    const encryptedToken = encryptToken(pageAccessToken);
    const channelType = mapPlatformToChannelType(platform);
    
    // Vérifier si un canal existe déjà pour cette page
    const existingChannel = await prisma.channel.findFirst({
      where: {
        shopId,
        type: channelType,
        externalId: pageId
      }
    });
    
    let channel;
    if (existingChannel) {
      // Mettre à jour le canal existant
      channel = await prisma.channel.update({
        where: { id: existingChannel.id },
        data: {
          accessToken: encryptedToken,
          isActive: true
        }
      });
    } else {
      // Créer un nouveau canal
      channel = await prisma.channel.create({
        data: {
          type: channelType,
          externalId: pageId,
          accessToken: encryptedToken,
          isActive: true,
          shopId
        }
      });
    }
    
    console.log('Channel stored successfully:', {
      id: channel.id,
      type: channel.type,
      externalId: channel.externalId,
      isActive: channel.isActive,
      webhookSubscribed: !('error' in webhookData)
    });
    
    // Étape 5: Nettoyer les cookies temporaires
    const response = NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        type: channel.type,
        externalId: channel.externalId,
        pageName,
        platform,
        status: 'connected',
        webhookSubscribed: !('error' in webhookData)
      }
    });
    
    // Supprimer les cookies temporaires
    response.cookies.delete('meta_pages');
    response.cookies.delete('meta_user_token');
    
    return response;
    
  } catch (error) {
    console.error('Finalize API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Gérer les autres méthodes HTTP
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}