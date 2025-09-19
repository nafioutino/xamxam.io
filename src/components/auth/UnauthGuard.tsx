// ============================================================================
// UnauthGuard.tsx - Guard simplifié pour les pages non-authentifiées
// ============================================================================
'use client';

import { useAuth } from '@/hooks/useAuth';
import LoadingTransition from './LoadingTransition';

interface UnauthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UnauthGuard({ children, fallback }: UnauthGuardProps) {
  const { isAuthenticated, isLoading, isTransitioning } = useAuth();

  // Afficher le loader de transition si l'utilisateur vient de se connecter
  if (isTransitioning) {
    return <LoadingTransition message="Connexion réussie" />;
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
