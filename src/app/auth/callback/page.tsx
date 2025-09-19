'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingTransition from '@/components/auth/LoadingTransition';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      setTimeout(() => {
        router.push(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || '')}`);
      }, 2000);
    }
    
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 10000);
    
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingTransition message="Chargement..." showLogo={true} />}>
      <AuthCallbackContent />
    </Suspense>
  );
}