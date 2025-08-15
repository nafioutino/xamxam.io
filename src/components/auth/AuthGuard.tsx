'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Authentification temporairement désactivée
  // const { isAuthenticated, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/auth/login');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }
  
  // Accès direct au contenu sans vérification d'authentification

  return <>{children}</>;
}