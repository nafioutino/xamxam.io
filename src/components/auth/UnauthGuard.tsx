// ============================================================================
// UnauthGuard.tsx - Guard simplifié pour les pages non-authentifiées
// ============================================================================
'use client';

import { useAuth } from '@/hooks/useAuth';

interface UnauthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UnauthGuard({ children, fallback }: UnauthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si authentifié, ne rien afficher (le middleware gère la redirection)
  if (isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
