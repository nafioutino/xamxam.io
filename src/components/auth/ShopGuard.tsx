'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/hooks/useShop';
import { Loader2 } from 'lucide-react';

interface ShopGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ShopGuard({ children, redirectTo = '/dashboard/onboarding' }: ShopGuardProps) {
  const { shop, isLoading, hasShop } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasShop) {
      router.push(redirectTo);
    }
  }, [isLoading, hasShop, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Chargement...</h2>
          <p className="text-sm text-gray-500">Vérification de votre boutique</p>
        </div>
      </div>
    );
  }

  if (!hasShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Redirection...</h2>
          <p className="text-sm text-gray-500">Configuration de votre boutique</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
