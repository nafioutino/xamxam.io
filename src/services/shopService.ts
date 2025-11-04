import { createClient } from '@/utils/supabase/client';

export interface OpeningHours {
  [day: string]: {
    open?: string;
    close?: string;
    closed?: boolean;
  };
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Shop {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  openingHours?: OpeningHours;
  faq?: FAQ[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  // Inclus quand on appelle /api/shop/me (relation sélectionnée côté API)
  owner?: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
  // Comptages renvoyés par /api/shop/me
  _count?: {
    products: number;
    orders: number;
    customers: number;
    categories: number;
    channels: number;
  };
}

export interface CreateShopData {
  name: string;
  description?: string;
  address?: string;
  openingHours?: OpeningHours;
  faq?: FAQ[];
}

export type UpdateShopData = Partial<CreateShopData>;

export interface ShopResponse {
  shop: Shop;
  message?: string;
}

class ShopService {
  private supabase = createClient();

  async getUserShop(): Promise<Shop | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const response = await fetch('/api/shop/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Aucune boutique trouvée
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de la boutique');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur getUserShop:', error);
      throw error;
    }
  }

  async createShop(shopData: CreateShopData): Promise<Shop> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Ajouter l'ownerId à partir de l'utilisateur connecté
      const shopDataWithOwner = {
        ...shopData,
        ownerId: user.id
      };

      const response = await fetch('/api/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopDataWithOwner),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la boutique');
      }

      const data = await response.json();
      return data.data; // L'API retourne les données dans data.data
    } catch (error) {
      console.error('Erreur createShop:', error);
      throw error;
    }
  }

  async updateShop(shopId: string, shopData: UpdateShopData): Promise<Shop> {
    try {
      const response = await fetch(`/api/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la boutique');
      }

      const data = await response.json();
      return data.shop;
    } catch (error) {
      console.error('Erreur updateShop:', error);
      throw error;
    }
  }

  async deleteShop(shopId: string): Promise<void> {
    try {
      const response = await fetch(`/api/shop/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la boutique');
      }
    } catch (error) {
      console.error('Erreur deleteShop:', error);
      throw error;
    }
  }

  async getShopById(shopId: string): Promise<Shop> {
    try {
      const response = await fetch(`/api/shop/${shopId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de la boutique');
      }

      const data = await response.json();
      return data.shop;
    } catch (error) {
      console.error('Erreur getShopById:', error);
      throw error;
    }
  }
}

export const shopService = new ShopService();
export default shopService;