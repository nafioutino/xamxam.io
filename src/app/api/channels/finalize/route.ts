// /app/api/channels/finalize/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';
import { ChannelType } from '@/generated/prisma';
import { createClient } from '@/utils/supabase/server';

// ==================================================================
// ===                 TYPES ET INTERFACES                        ===
// ==================================================================
interface FacebookPage {
  id: string;
  name: string;
  access_token: string; // Le Page Access Token fourni par /me/accounts
  category: string;
  tasks: string[];
  instagram_business_account?: {
    id: string;
    username: string;
    profile_picture_url: string;
  };
}

// ==================================================================
// ===                 FONCTION PRINCIPALE (POST)                 ===
// ==================================================================
export async function POST(request: NextRequest) {
  const logPrefix = '[Finalize API]';
  
  try {
    // --- ÉTAPE 1: VALIDER LA REQUÊTE ET LA SESSION ---
    const body = await request.json();
    const { pageId, pageName, platform } = body;
    
    if (!pageId || !pageName || !platform) {
      return NextResponse.json({ error: 'Missing required fields: pageId, pageName, platform' }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const pagesDataString = cookieStore.get('meta_pages')?.value;
    
    if (!pagesDataString) {
      return NextResponse.json({ error: 'Session expired or invalid. Please try connecting again.' }, { status: 401 });
    }
    
    const pages: FacebookPage[] = JSON.parse(pagesDataString);

    // --- ÉTAPE 2: EXTRAIRE LE PAGE ACCESS TOKEN DE LA SESSION ---
    // C'est l'étape la plus critique. Le bon token est celui qui a été fourni par l'appel `/me/accounts`
    // lors du callback, car il a été généré en tenant compte des permissions que l'utilisateur vient d'accorder.
    const selectedPage = pages.find(page => page.id === pageId);

    if (!selectedPage || !selectedPage.access_token) {
      console.error(`${logPrefix} Page or Page Access Token not found in session for pageId: ${pageId}`);
      return NextResponse.json({ error: 'Selected page token was not found in your session. Please reconnect.' }, { status: 404 });
    }
    
    const pageAccessToken = selectedPage.access_token;
    logger.info(`${logPrefix} Found Page Access Token for page ${pageId} directly from session cookie.`);

    // --- ÉTAPE 3 (Débogage) : VÉRIFIER LES PERMISSIONS DU TOKEN ---
    // Cet appel à l'API `debug_token` est un excellent moyen de confirmer que le token a bien les permissions requises.
    const appToken = `${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
    const permissionsUrl = `https://graph.facebook.com/v23.0/debug_token?input_token=${pageAccessToken}&access_token=${appToken}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();
    logger.info(`${logPrefix} Permissions for the stored Page Access Token:`, permissionsData.data?.scopes);

    // --- ÉTAPE 4: SOUSCRIRE LA PAGE AUX WEBHOOKS ---
    // Cette étape est cruciale pour que Meta nous envoie les messages en temps réel.
    // Pour Instagram, nous devons souscrire le compte Instagram Business, pas la page Facebook
    let webhookTargetId = pageId;
    if (platform === 'instagram' && selectedPage.instagram_business_account) {
      webhookTargetId = selectedPage.instagram_business_account.id;
    }
    
    const webhookUrl = `https://graph.facebook.com/v23.0/${webhookTargetId}/subscribed_apps`;
    const subscribedFields = ['messages', 'messaging_postbacks']; // Scopes de base pour la messagerie
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        subscribed_fields: subscribedFields.join(','),
        access_token: pageAccessToken,
      })
    });
    
    if (!webhookResponse.ok) {
      const webhookError = await webhookResponse.json();
      logger.error(`${logPrefix} Webhook subscription failed for ${platform} (${webhookTargetId}):`, webhookError);
      // On continue même si cela échoue, mais on le loggue comme une erreur critique.
    } else {
      logger.info(`${logPrefix} Successfully subscribed ${platform} (${webhookTargetId}) to webhooks.`);
    }

    // --- ÉTAPE 5: RÉCUPÉRER LA BOUTIQUE ET CHIFFRER LE TOKEN ---
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated.');
    
    const userShop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
    if (!userShop) throw new Error('Shop not found for the current user.');
    
    const shopId = userShop.id;
    const encryptedToken = encryptToken(pageAccessToken);
    
    // Déterminer le type de canal et l'ID externe basé sur la plateforme
    let channelType: ChannelType;
    let externalId: string;
    
    if (platform === 'instagram') {
      channelType = ChannelType.INSTAGRAM_DM;
      if (!selectedPage.instagram_business_account) {
        throw new Error('No Instagram Business account linked to this page.');
      }
      externalId = selectedPage.instagram_business_account.id;
    } else {
      channelType = ChannelType.FACEBOOK_PAGE;
      externalId = pageId;
    }

    // --- ÉTAPE 6: STOCKER LE CANAL DANS LA BASE DE DONNÉES ---
    // On utilise `upsert` pour créer le canal s'il n'existe pas, ou le mettre à jour s'il existe déjà.
    // C'est plus robuste qu'une logique `findFirst` + `if/else`.
    await prisma.channel.upsert({
      where: { shopId_type_externalId: { shopId, type: channelType, externalId } },
      update: { accessToken: encryptedToken, isActive: true },
      create: { type: channelType, externalId, accessToken: encryptedToken, isActive: true, shopId }
    });
    logger.info(`${logPrefix} Channel data for ${platform} (${externalId}) stored successfully in DB.`);

    // --- ÉTAPE 7: NETTOYER LA SESSION ET RÉPONDRE ---
    const response = NextResponse.json({ success: true });
    
    // On supprime les cookies temporaires car ils ne sont plus nécessaires et pour la sécurité.
    response.cookies.delete('meta_pages');
    response.cookies.delete('meta_user_token');
    
    return response;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    logger.error(`${logPrefix} CRITICAL ERROR:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Logger simple
const logger = {
  info: (prefix: string, ...args: any[]) => console.log(prefix, ...args),
  error: (prefix: string, ...args: any[]) => console.error(prefix, ...args)
};



// Gérer les autres méthodes HTTP pour retourner une erreur claire.
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}