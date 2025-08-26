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

const SHOP_CACHE_KEY = 'user_shop_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface ShopCache {
  shop: Shop | null;
  timestamp: number;
  userId: string;
}

export function useShop(): UseShopReturn {
  const { user, isLoading: authLoading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheChecked, setCacheChecked] = useState(false);

  const fetchShop = useCallback(async (forceRefresh = false) => {
    if (!user || authLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier le cache d'abord (sauf si forceRefresh)
      if (!forceRefresh && typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(SHOP_CACHE_KEY);
        if (cached) {
          try {
            const cacheData: ShopCache = JSON.parse(cached);
            const now = Date.now();
            
            // Vérifier si le cache est valide (même utilisateur et pas expiré)
            if (
              cacheData.userId === user.id &&
              now - cacheData.timestamp < CACHE_DURATION
            ) {
              setShop(cacheData.shop);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Cache corrompu, on continue avec l'API
            sessionStorage.removeItem(SHOP_CACHE_KEY);
          }
        }
      }
      
      // Appel API
      const userShop = await shopService.getUserShop();
      setShop(userShop);
      
      // Mettre en cache le résultat
      if (typeof window !== 'undefined') {
        const cacheData: ShopCache = {
          shop: userShop,
          timestamp: Date.now(),
          userId: user.id
        };
        sessionStorage.setItem(SHOP_CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de la boutique:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !authLoading && !cacheChecked) {
      fetchShop();
      setCacheChecked(true);
    } else if (!user && !authLoading) {
      setShop(null);
      setIsLoading(false);
      setCacheChecked(false);
      // Nettoyer le cache si l'utilisateur se déconnecte
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SHOP_CACHE_KEY);
      }
    }
  }, [user, authLoading, fetchShop, cacheChecked]);

  const refetch = async () => {
    setCacheChecked(false);
    await fetchShop(true); // Force refresh
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