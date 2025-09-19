import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';
import { ChannelType } from '@/generated/prisma';
import { createClient } from '@/utils/supabase/server';

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
    
    // Étape 1: Vérifier les permissions du user token
    const permissionsUrl = `https://graph.facebook.com/v23.0/me/permissions?access_token=${userToken}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();
    
    if (!permissionsResponse.ok) {
      console.error('Failed to check permissions:', permissionsData);
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      );
    }
    
    const grantedPermissions = permissionsData.data
      ?.filter((p: any) => p.status === 'granted')
      ?.map((p: any) => p.permission) || [];
    
    const requiredPermissions = ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'];
    const missingPermissions = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
    
    if (missingPermissions.length > 0) {
      console.error('Missing permissions:', missingPermissions);
      return NextResponse.json(
        { 
          error: `Permissions manquantes: ${missingPermissions.join(', ')}. Veuillez reconnecter votre compte Facebook avec toutes les permissions.`,
          missingPermissions
        },
        { status: 403 }
      );
    }
    
    // Étape 2: Obtenir un Page Access Token avec les bonnes permissions
    const pageTokenUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}`);
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
    
    // Étape 3: Vérifier les permissions du page token
    const pagePermissionsUrl = `https://graph.facebook.com/v23.0/me/permissions?access_token=${pageAccessToken}`;
    const pagePermissionsResponse = await fetch(pagePermissionsUrl);
    
    if (pagePermissionsResponse.ok) {
      const pagePermissionsData = await pagePermissionsResponse.json();
      console.log('Page token permissions:', pagePermissionsData.data);
    }
    
    // Étape 4: Souscrire aux webhooks
    const webhookUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}/subscribed_apps`);
    const webhookBody = new URLSearchParams();
    webhookBody.append('access_token', pageAccessToken);
    
    // Définir les champs selon la plateforme
    let subscribedFields: string[];
    switch (platform) {
      case 'messenger':
        subscribedFields = ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'];
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
    // Récupérer l'utilisateur connecté et sa boutique
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erreur d\'authentification:', authError);
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour finaliser la connexion du canal'
      }, { status: 401 });
    }

    // Récupérer la boutique de l'utilisateur
    const userShop = await prisma.shop.findUnique({
      where: { ownerId: user.id }
    });

    if (!userShop) {
      console.error('Aucune boutique trouvée pour l\'utilisateur:', user.id);
      return NextResponse.json({
        success: false,
        error: 'Boutique non trouvée',
        message: 'Aucune boutique associée à votre compte. Veuillez créer une boutique d\'abord.'
      }, { status: 404 });
    }

    const shopId = userShop.id;
    console.log('Boutique trouvée:', { shopId, shopName: userShop.name, userId: user.id });
    
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