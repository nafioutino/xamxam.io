import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Types pour les réponses de l'API Meta
interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
}

interface MetaPagesResponse {
  data: MetaPage[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}

interface MetaError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Vérifier s'il y a une erreur de Facebook
    if (error) {
      console.error('Facebook OAuth Error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/channels?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
      );
    }

    // Vérifier que nous avons un code d'autorisation
    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=missing_code', request.url)
      );
    }

    // Pour l'instant, on va désactiver la validation CSRF pour tester le flux OAuth
    // TODO: Implémenter une validation CSRF alternative
    console.log('Token CSRF reçu (state):', state);
    console.log('Validation CSRF temporairement désactivée pour le débogage');

    // Configuration Meta
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xamxam.io';
    const redirectUri = `${baseUrl}/api/auth/callback/meta`;

    if (!clientId || !clientSecret) {
      console.error('Missing Facebook configuration');
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=configuration_error', request.url)
      );
    }

    // Étape 1: Échanger le code contre un User Access Token courte durée
    const tokenUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', clientId);
    tokenUrl.searchParams.append('client_secret', clientSecret);
    tokenUrl.searchParams.append('redirect_uri', redirectUri);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData: MetaTokenResponse | MetaError = await tokenResponse.json();

    if (!tokenResponse.ok || 'error' in tokenData) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=token_exchange_failed', request.url)
      );
    }

    const shortLivedToken = tokenData.access_token;
    console.log("Voici le shortLivedToken:", shortLivedToken);

    // Étape 2: Échanger le token courte durée contre un token longue durée
    const longLivedTokenUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token');
    longLivedTokenUrl.searchParams.append('grant_type', 'fb_exchange_token');
    longLivedTokenUrl.searchParams.append('client_id', clientId);
    longLivedTokenUrl.searchParams.append('client_secret', clientSecret);
    longLivedTokenUrl.searchParams.append('fb_exchange_token', shortLivedToken);

    const longLivedResponse = await fetch(longLivedTokenUrl.toString());
    const longLivedData: MetaLongLivedTokenResponse | MetaError = await longLivedResponse.json();

    if (!longLivedResponse.ok || 'error' in longLivedData) {
      console.error('Long-lived token exchange failed:', longLivedData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=long_lived_token_failed', request.url)
      );
    }

    const longLivedToken = longLivedData.access_token;
    const longLivedTokenExpiresIn = longLivedData.expires_in;

    console.log("Voici le longLivedToken:", longLivedToken);
    console.log("Voici le longLivedTokenExpiresIn:", longLivedTokenExpiresIn);

    // Étape 3: Récupérer les pages Facebook de l'utilisateur
    const pagesUrl = new URL('https://graph.facebook.com/v23.0/me/accounts');
    pagesUrl.searchParams.append('access_token', longLivedToken);
    pagesUrl.searchParams.append('fields', 'id,name,access_token,category,tasks');

    console.log('🔍 Appel à l\'API Facebook /me/accounts');
    console.log('URL complète:', pagesUrl.toString().replace(longLivedToken, 'TOKEN_MASQUÉ'));

    const pagesResponse = await fetch(pagesUrl.toString());
    console.log('Status de la réponse:', pagesResponse.status, pagesResponse.statusText);
    
    const pagesData: MetaPagesResponse | MetaError = await pagesResponse.json();
    console.log('Réponse complète de /me/accounts:', JSON.stringify(pagesData, null, 2));

    if (!pagesResponse.ok || 'error' in pagesData) {
      console.error('❌ Pages fetch failed:', pagesData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=pages_fetch_failed', request.url)
      );
    }

    // Log des pages récupérées pour débogage
    console.log('Pages récupérées de Facebook:', JSON.stringify(pagesData.data, null, 2));
    console.log('Nombre de pages:', pagesData.data.length);

    // Accepter toutes les pages retournées (l'utilisateur a déjà donné les permissions)
    let eligiblePages = pagesData.data;

    // Si /me/accounts retourne vide, essayer via les permissions granulaires
    if (eligiblePages.length === 0) {
      console.log('⚠️ /me/accounts est vide, tentative via /me/permissions...');
      
      try {
        const permissionsUrl = new URL('https://graph.facebook.com/v23.0/me/permissions');
        permissionsUrl.searchParams.append('access_token', longLivedToken);

        const permissionsResponse = await fetch(permissionsUrl.toString());
        const permissionsData: any = await permissionsResponse.json();

        console.log('Permissions récupérées:', JSON.stringify(permissionsData, null, 2));

        if (permissionsResponse.ok && permissionsData.data) {
          // Extraire les IDs de pages depuis les permissions granulaires
          const pageIds = new Set<string>();
          
          for (const permission of permissionsData.data) {
            // Les permissions granulaires ont un champ "allowed_targets" avec les IDs
            if (permission.allowed_targets && permission.allowed_targets.length > 0) {
              permission.allowed_targets.forEach((target: any) => {
                if (target.target_type === 'page') {
                  pageIds.add(target.id);
                }
              });
            }
          }

          console.log('IDs de pages extraits des permissions:', Array.from(pageIds));

          // Récupérer les infos de chaque page
          for (const pageId of pageIds) {
            try {
              const pageUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}`);
              pageUrl.searchParams.append('access_token', longLivedToken);
              pageUrl.searchParams.append('fields', 'id,name,access_token,category,tasks,instagram_business_account{id,username,profile_picture_url}');

              const pageResponse = await fetch(pageUrl.toString());
              const pageData: any = await pageResponse.json();

              if (pageResponse.ok && !pageData.error) {
                eligiblePages.push(pageData);
                console.log(`✅ Page récupérée: ${pageData.name} (${pageData.id})`);
              } else {
                console.log(`❌ Erreur pour la page ${pageId}:`, pageData);
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération de la page ${pageId}:`, error);
            }
          }

          console.log('Total de pages récupérées via permissions:', eligiblePages.length);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération via permissions:', error);
      }
    }

    if (eligiblePages.length === 0) {
      console.error('Aucune page Facebook trouvée pour cet utilisateur');
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=no_eligible_pages', request.url)
      );
    }

    // Stocker temporairement les données dans des cookies sécurisés
    // (En production, utilisez une session ou une base de données temporaire)
    const response = NextResponse.redirect(
      // new URL('/dashboard/channels/select-page', request.url)
      `${baseUrl}/dashboard/channels/select-page`
    );

    // Stocker les données de manière sécurisée (chiffrement recommandé en production)
    response.cookies.set('meta_user_token', longLivedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 heures
      path: '/'
    });

    response.cookies.set('meta_pages', JSON.stringify(eligiblePages), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 heures
      path: '/'
    });

    // Nettoyer le token CSRF
    response.cookies.delete('csrf_token');

    return response;

  } catch (error) {
    console.error('Callback API Error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/channels?error=internal_server_error', request.url)
    );
  }
}

// Gérer les autres méthodes HTTP
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}