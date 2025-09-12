import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(`${origin}/auth/error?error=${error}&description=${encodeURIComponent(error_description || '')}`);
  }

  if (code) {
    const supabase = await createClient();
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/auth/error?error=CodeExchangeError&description=${encodeURIComponent(exchangeError.message)}`);
      }

      if (data.session && data.user) {
        // Vérifier si c'est un nouvel utilisateur
        const isNewUser = data.user.created_at === data.user.last_sign_in_at;
        
        // Créer ou mettre à jour le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            provider: data.user.app_metadata?.provider,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Profile upsert error:', profileError);
          // Ne pas bloquer la connexion pour une erreur de profil
        }

        // Rediriger vers la page suivante avec un paramètre de succès
        const redirectUrl = `${origin}${next}${isNewUser ? '?welcome=true' : ''}`;
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Unexpected error during OAuth callback:', error);
      return NextResponse.redirect(`${origin}/auth/error?error=UnexpectedError&description=${encodeURIComponent('Une erreur inattendue s\'est produite')}`);
    }
  }

  // Fallback: rediriger vers la page de connexion
  return NextResponse.redirect(`${origin}/auth/login`);
}