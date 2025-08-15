import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Authentification temporairement désactivée
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // const isAuthenticated = !!token;

  const { pathname } = req.nextUrl;

  // Protection du dashboard temporairement désactivée
  // if (pathname.startsWith('/dashboard') && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/auth/login', req.url));
  // }

  // Redirection des utilisateurs authentifiés temporairement désactivée
  // if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};