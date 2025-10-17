import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    // Générer un token CSRF sécurisé
    const csrfState = nanoid();
    
    console.log('TikTok OAuth - Token CSRF généré:', csrfState);
    
    // Configuration TikTok
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xamxam.io';
    const redirectUri = `${baseUrl}/api/auth/callback/tiktok`;
    
    if (!clientKey) {
      return NextResponse.json(
        { error: 'Configuration TikTok manquante' },
        { status: 500 }
      );
    }
    
    // Construire l'URL d'authentification TikTok v2
    // Documentation: https://developers.tiktok.com/doc/login-kit-web/
    const authParams = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: redirectUri,
      scope: 'user.info.basic,user.info.profile,video.upload,video.publish', // Scopes approuvés pour TikTok en mode LIVE
      response_type: 'code',
      state: csrfState
    });
    
    const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?${authParams.toString()}`;
    
    console.log('TikTok OAuth - URL générée:', tiktokAuthUrl);
    
    // Retourner l'URL et le token CSRF pour que le client puisse les gérer
    return NextResponse.json({ 
      url: tiktokAuthUrl,
      csrfToken: csrfState 
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}