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
    
    console.log(`${logPrefix} Requête reçue:`, { pageId, pageName, platform });
    
    if (!pageId || !pageName || !platform) {
      console.error(`${logPrefix} Champs manquants:`, { pageId, pageName, platform });
      return NextResponse.json({ error: 'Missing required fields: pageId, pageName, platform' }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const pagesDataString = cookieStore.get('meta_pages')?.value;
    
    console.log(`${logPrefix} Cookie meta_pages présent:`, !!pagesDataString);
    
    if (!pagesDataString) {
      console.error(`${logPrefix} Aucune donnée de pages dans les cookies`);
      return NextResponse.json({ error: 'Session expired or invalid. Please try connecting again.' }, { status: 401 });
    }
    
    const pages: FacebookPage[] = JSON.parse(pagesDataString);
    console.log(`${logPrefix} Pages trouvées dans les cookies:`, pages.length);
    console.log(`${logPrefix} Détails des pages:`, pages.map(p => ({ id: p.id, name: p.name })));

    // --- ÉTAPE 2: EXTRAIRE LE PAGE ACCESS TOKEN DE LA SESSION ---
    // C'est l'étape la plus critique. Le bon token est celui qui a été fourni par l'appel `/me/accounts`
    // lors du callback, car il a été généré en tenant compte des permissions que l'utilisateur vient d'accorder.
    const selectedPage = pages.find(page => page.id === pageId);

    console.log(`${logPrefix} Page sélectionnée trouvée:`, !!selectedPage);
    console.log(`${logPrefix} Token de la page présent:`, !!selectedPage?.access_token);

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
    const webhookUrl = `https://graph.facebook.com/v23.0/${pageId}/subscribed_apps`;
    const subscribedFields = ['messages', 'messaging_postbacks']; // Champs pour la messagerie Facebook
    
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
      logger.error(`${logPrefix} Webhook subscription failed for ${platform} via page ${pageId}:`, webhookError);
      
      // Si c'est une erreur de permissions, on continue mais on log l'erreur
      if (webhookError.error?.code === 3) {
        logger.error(`${logPrefix} Permission error: Your app needs 'pages_manage_metadata' permission.`);
      }
    } else {
      logger.info(`${logPrefix} Successfully subscribed ${platform} via page ${pageId} to webhooks.`);
    }

    // --- ÉTAPE 5: RÉCUPÉRER LA BOUTIQUE ET CHIFFRER LE TOKEN ---
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`${logPrefix} Utilisateur authentifié:`, !!user);
    
    if (!user) throw new Error('User not authenticated.');
    
    const userShop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
    console.log(`${logPrefix} Boutique trouvée:`, !!userShop);
    console.log(`${logPrefix} ID de la boutique:`, userShop?.id);
    
    if (!userShop) throw new Error('Shop not found for the current user.');
    
    const shopId = userShop.id;
    const encryptedToken = encryptToken(pageAccessToken);
    console.log(`${logPrefix} Token chiffré avec succès`);
    
    // Déterminer le type de canal et l'ID externe
    // On ne gère que Facebook Pages ici, Instagram et WhatsApp sont gérés ailleurs
    const channelType: ChannelType = ChannelType.FACEBOOK_PAGE;
    const externalId: string = pageId;
    
    console.log(`${logPrefix} Préparation de l'upsert:`, { shopId, channelType, externalId });

    // --- ÉTAPE 6: STOCKER LE CANAL DANS LA BASE DE DONNÉES ---
    // On utilise `upsert` pour créer le canal s'il n'existe pas, ou le mettre à jour s'il existe déjà.
    // C'est plus robuste qu'une logique `findFirst` + `if/else`.
    const channelResult = await prisma.channel.upsert({
      where: { shopId_type_externalId: { shopId, type: channelType, externalId } },
      update: { accessToken: encryptedToken, isActive: true },
      create: { type: channelType, externalId, accessToken: encryptedToken, isActive: true, shopId }
    });
    
    console.log(`${logPrefix} Canal créé/mis à jour avec succès:`, { id: channelResult.id, type: channelResult.type, externalId: channelResult.externalId });
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