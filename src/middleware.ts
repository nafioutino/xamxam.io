
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Récupérer la réponse de base avec la session mise à jour
  const response = await updateSession(request);
  
  // Récupérer les informations de l'URL
  const { pathname } = request.nextUrl;
  
  // Créer un client Supabase pour vérifier l'authentification
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )
  
  try {
    // Vérifier si l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;
    
    // Protection des routes dashboard
    if (pathname.startsWith('/dashboard')) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      return response;
    }

    // Redirection des utilisateurs authentifiés depuis les pages auth
    if (pathname.startsWith('/auth/') && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}