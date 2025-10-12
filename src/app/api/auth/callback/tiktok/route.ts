import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Prisma } from '@/generated/prisma';
import { encryptToken } from '@/lib/encryption';
import prisma from '@/lib/prisma';

// Interface pour la réponse d'échange de token TikTok
interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
  open_id: string;
}

// Interface pour les informations utilisateur TikTok
interface TikTokUserInfo {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      avatar_url_100: string;
      avatar_url_200: string;
      display_name: string;
    };
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokError {
  error: {
    message: string;
    code: string;
    log_id: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Vérifier s'il y a une erreur de TikTok
    if (error) {
      console.error('TikTok OAuth Error:', error, errorDescription);
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
    console.log('TikTok OAuth - Token CSRF reçu (state):', state);
    console.log('TikTok OAuth - Validation CSRF temporairement désactivée pour le débogage');

    // Configuration TikTok
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/tiktok`;

    if (!clientKey || !clientSecret) {
      console.error('Configuration TikTok manquante');
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=config_missing', request.url)
      );
    }

    console.log('TikTok OAuth - Échange du code contre un token...');

    // Étape 1: Échanger le code contre un access token
    // Documentation: https://developers.tiktok.com/doc/oauth-user-access-token-management
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const tokenData: TikTokTokenResponse | TikTokError = await tokenResponse.json();

    if (!tokenResponse.ok || 'error' in tokenData) {
      console.error('TikTok OAuth - Erreur lors de l\'échange de token:', tokenData);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=token_exchange_failed', request.url)
      );
    }

    console.log('TikTok OAuth - Token obtenu avec succès');

    // Étape 2: Récupérer les informations de l'utilisateur TikTok
    const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userInfo: TikTokUserInfo = await userInfoResponse.json();

    // Dans l'API TikTok v2, une réponse réussie contient toujours error.code = "ok"
    // On vérifie donc le statut HTTP ET que le code d'erreur n'est pas "ok"
    if (!userInfoResponse.ok || (userInfo.error && userInfo.error.code !== 'ok')) {
      console.error('TikTok OAuth - Erreur lors de la récupération des infos utilisateur:', userInfo.error);
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=user_info_failed', request.url)
      );
    }

    console.log('TikTok OAuth - Informations utilisateur récupérées:', userInfo.data.user.display_name);

    // Étape 3: Vérifier l'authentification Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('TikTok OAuth - Utilisateur non authentifié');
      return NextResponse.redirect(
        new URL('/dashboard/channels?error=not_authenticated', request.url)
      );
    }

    // Étape 4: Récupérer ou créer la boutique
    let shop = await prisma?.shop.findUnique({
      where: { ownerId: user.id }
    });

    if (!shop) {
      shop = await prisma?.shop.create({
        data: {
          ownerId: user.id,
          name: `Boutique de ${user.email}`,
          description: 'Ma boutique XAMXAM'
        }
      });
    }

    // Étape 5: Chiffrer et sauvegarder le token d'accès
    const encryptedAccessToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = encryptToken(tokenData.refresh_token);

    // Vérifier si un canal TikTok existe déjà pour cet utilisateur
    const existingChannel = await prisma?.channel.findFirst({
      where: {
        shopId: shop?.id,
        type: 'TIKTOK',
        externalId: userInfo.data.user.open_id
      }
    });

    if (existingChannel) {
      // Mettre à jour le canal existant (inclure le refresh token)
      await prisma?.channel.update({
        where: { id: existingChannel.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          isActive: true
        }
      });
      console.log('TikTok OAuth - Canal existant mis à jour (access + refresh token)');
    } else {
      // Créer un nouveau canal
      await prisma?.channel.create({
        data: {
          shopId: shop?.id,
          type: 'TIKTOK',
          externalId: userInfo.data.user.open_id,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          isActive: true
        }
      });
      console.log('TikTok OAuth - Nouveau canal créé');
    }

    // Étape 6: Rediriger vers la page des canaux avec succès
    const successParams = new URLSearchParams({
      success: 'tiktok_connected',
      account_name: userInfo.data.user.display_name,
      account_type: 'TikTok'
    });
    
    return NextResponse.redirect(
      new URL(`/dashboard/channels?${successParams.toString()}`, request.url)
    );

  } catch (error) {
    console.error('TikTok OAuth - Erreur générale:', error);
    return NextResponse.redirect(
      new URL('/dashboard/channels?error=internal_error', request.url)
    );
  }
}