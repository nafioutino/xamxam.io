
// ============================================================================
// AuthGuard.tsx - Guard simplifié pour les pages protégées
// ============================================================================
'use client';

import { useAuth } from '@/hooks/useAuth';
import LoadingTransition from './LoadingTransition';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isTransitioning } = useAuth();

  // Afficher le loader de transition pendant la redirection après authentification
  if (isTransitioning) {
    return <LoadingTransition message="Redirection vers le dashboard" />;
  }

  // Afficher le spinner pendant le chargement initial
  if (isLoading) {
    return fallback || (
      <LoadingTransition message="Vérification de l'authentification" showLogo={false} />
    );
  }

  // Si non authentifié, ne rien afficher (le middleware gère la redirection)
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
