// ============================================================================
// UnauthGuard.tsx - Guard simplifié pour les pages non-authentifiées
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingTransition from './LoadingTransition';

interface UnauthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UnauthGuard({ children, fallback }: UnauthGuardProps) {
  const { isAuthenticated, isLoading, isTransitioning, clearTransition } = useAuth();
  const [pageReady, setPageReady] = useState(false);

  // Désactiver la transition une fois que la page est prête
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isTransitioning) {
      // Attendre que la page soit complètement rendue
      const timer = setTimeout(() => {
        setPageReady(true);
        if (clearTransition) {
          clearTransition();
        }
      }, 600); // Délai pour s'assurer que la page de login est rendue
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, isTransitioning, clearTransition]);

  // Afficher le loader de transition
  if (isTransitioning) {
    return <LoadingTransition message={isAuthenticated ? "Connexion réussie" : "Déconnexion en cours"} />;
  }

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return fallback || (
      <LoadingTransition message="Chargement" showLogo={false} />
    );
  }

  // Si authentifié, ne rien afficher (le middleware gère la redirection)
  if (isAuthenticated) {
    return null;
  }
  
  return <>{children}</>
}
