import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    // Générer un token CSRF sécurisé
    const csrfState = nanoid();
    
    console.log('Cookie meta_csrf_state défini:', csrfState);
    
    // Configuration Meta
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/meta`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Configuration Facebook manquante' },
        { status: 500 }
      );
    }
    
    // Construire l'URL d'authentification Meta
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'pages_show_list,pages_messaging,business_management,pages_read_engagement,pages_manage_posts,public_profile,instagram_basic,instagram_manage_messages,instagram_content_publish,whatsapp_business_management,whatsapp_business_messaging ',
      response_type: 'code',
      state: csrfState
    });
    
    const metaAuthUrl = `https://www.facebook.com/v23.0/dialog/oauth?${authParams.toString()}`;
    
    // Retourner l'URL et le token CSRF pour que le client puisse les gérer
    return NextResponse.json({ 
      url: metaAuthUrl,
      csrfToken: csrfState 
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification Meta:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}