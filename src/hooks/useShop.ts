'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { shopService, Shop } from '@/services/shopService';

interface UseShopReturn {
  shop: Shop | null;
  isLoading: boolean;
  error: string | null;
  hasShop: boolean;
  refetch: () => Promise<void>;
}

export function useShop(): UseShopReturn {
  const { user, isLoading: authLoading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = useCallback(async () => {
    if (!user || authLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userShop = await shopService.getUserShop();
      setShop(userShop);
    } catch (err) {
      console.error('Erreur lors de la récupération de la boutique:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchShop();
    } else if (!user && !authLoading) {
      setShop(null);
      setIsLoading(false);
    }
  }, [user, authLoading, fetchShop]);

  const refetch = async () => {
    await fetchShop();
  };

  return {
    shop,
    isLoading: isLoading || authLoading,
    error,
    hasShop: !!shop,
    refetch,
  };
}

export default useShop;