import { NextRequest, NextResponse } from 'next/server';

// Interfaces pour les réponses de l'API Instagram
interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramUserResponse {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

interface InstagramError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Vérifier les erreurs d'autorisation
    if (error) {
      console.error('Instagram authorization error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/channels?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=missing_code', request.url)
      );
    }

    // CSRF complètement désactivé pour la production
    // Le paramètre state est optionnel et ignoré
    if (state) {
      console.log('Token CSRF reçu (state) mais ignoré:', state);
    }
    console.log('Validation CSRF complètement désactivée');

    // Configuration Instagram
    const clientId = '792146549889933';
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/instagram`;

    if (!clientSecret) {
      console.error('Missing Instagram client secret');
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=configuration_error', request.url)
      );
    }

    // Étape 1: Échanger le code contre un access token
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    const tokenFormData = new FormData();
    tokenFormData.append('client_id', clientId);
    tokenFormData.append('client_secret', clientSecret);
    tokenFormData.append('grant_type', 'authorization_code');
    tokenFormData.append('redirect_uri', redirectUri);
    tokenFormData.append('code', code);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      body: tokenFormData,
    });

    const tokenData: InstagramTokenResponse | InstagramError = await tokenResponse.json();

    if (!tokenResponse.ok || 'error' in tokenData) {
      console.error('Instagram token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=token_exchange_failed', request.url)
      );
    }

    const accessToken = tokenData.access_token;
    const userId = tokenData.user_id;

    console.log('Instagram access token obtained:', accessToken);
    console.log('Instagram user ID:', userId);

    // Étape 2: Récupérer les informations du profil Instagram
    const userInfoUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`;
    
    const userResponse = await fetch(userInfoUrl);
    const userData: InstagramUserResponse | InstagramError = await userResponse.json();

    if (!userResponse.ok || 'error' in userData) {
      console.error('Instagram user info fetch failed:', userData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=user_info_failed', request.url)
      );
    }

    // Vérifier que c'est un compte Business
    if (userData.account_type !== 'BUSINESS') {
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=not_business_account', request.url)
      );
    }

    // Stocker temporairement les données dans des cookies sécurisés
    // (Similaire au pattern Facebook - les données seront finalisées via /api/channels/finalize)
    const response = NextResponse.redirect(
      `${baseUrl}/dashboard/channels/setup-instagram`
    );

    // Stocker le token d'accès temporairement
    response.cookies.set('instagram_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 heures (temporaire)
      path: '/'
    });

    // Stocker les données utilisateur temporairement
    response.cookies.set('instagram_user_data', JSON.stringify({
      id: userData.id,
      username: userData.username,
      account_type: userData.account_type,
      media_count: userData.media_count
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 heures (temporaire)
      path: '/'
    });

    // Nettoyer le token CSRF
    response.cookies.delete('csrf_token');

    return response;

  } catch (error) {
    console.error('Instagram callback API Error:', error);
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