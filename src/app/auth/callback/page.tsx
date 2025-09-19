'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingTransition from '@/components/auth/LoadingTransition';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Cette page s'affiche pendant que l'API route /api/auth/callback traite l'authentification
    // Elle sera automatiquement redirigée par l'API route
    
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      // En cas d'erreur, rediriger vers la page d'erreur après un délai
      setTimeout(() => {
        router.push(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || '')}`);
      }, 2000);
    }
    
    // Timeout de sécurité au cas où la redirection ne fonctionne pas
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 10000); // 10 secondes
    
    return () => clearTimeout(timeout);
  }, [router, searchParams]);

  const error = searchParams.get('error');
  
  return (
    <LoadingTransition 
      message={error ? "Erreur de connexion détectée" : "Finalisation de la connexion"}
      showLogo={true}
    />
  );
}