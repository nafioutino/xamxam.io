import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Création du client Supabase basé sur les cookies de la requête
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Vérification de la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  const { pathname } = req.nextUrl;

  // Protection du dashboard
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Redirection des utilisateurs authentifiés
  if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};