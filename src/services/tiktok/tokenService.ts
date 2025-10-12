// /src/services/tiktok/tokenService.ts

import { decryptToken, encryptToken } from '@/lib/encryption';
import prisma from '@/lib/prisma';

// ==================================================================
// ===                 TYPES ET INTERFACES                        ===
// ==================================================================

interface TikTokRefreshTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
  open_id: string;
}

interface TikTokRefreshError {
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  error?: string;
  needsReauth?: boolean;
}

// ==================================================================
// ===                 SERVICE DE GESTION DES TOKENS             ===
// ==================================================================

export class TikTokTokenService {
  private static readonly BASE_URL = 'https://open.tiktokapis.com';
  private static readonly API_VERSION = 'v2';

  /**
   * Rafraîchit automatiquement le token d'accès TikTok si nécessaire
   * @param channelId L'ID du canal TikTok
   * @returns Le token d'accès valide ou une erreur
   */
  static async getValidAccessToken(channelId: string): Promise<TokenRefreshResult> {
    try {
      // Récupérer le canal avec ses tokens
      const channel = await prisma.channel.findUnique({
        where: { id: channelId }
      });

      if (!channel || !channel.accessToken) {
        return {
          success: false,
          error: 'Canal TikTok non trouvé ou token manquant',
          needsReauth: true
        };
      }

      // Déchiffrer le token actuel
      let currentAccessToken: string;
      try {
        currentAccessToken = decryptToken(channel.accessToken);
      } catch (error) {
        console.error('Erreur de déchiffrement du token:', error);
        return {
          success: false,
          error: 'Erreur de déchiffrement du token',
          needsReauth: true
        };
      }

      // Vérifier si le token est encore valide
      const isValid = await this.validateAccessToken(currentAccessToken);
      
      if (isValid) {
        return {
          success: true,
          accessToken: currentAccessToken
        };
      }

      // Le token a expiré, essayer de le rafraîchir
      console.log('Token TikTok expiré, tentative de rafraîchissement...');
      
      if (!channel.refreshToken) {
        return {
          success: false,
          error: 'Refresh token manquant, reconnexion requise',
          needsReauth: true
        };
      }

      let refreshToken: string;
      try {
        refreshToken = decryptToken(channel.refreshToken);
      } catch (error) {
        console.error('Erreur de déchiffrement du refresh token:', error);
        return {
          success: false,
          error: 'Erreur de déchiffrement du refresh token',
          needsReauth: true
        };
      }

      // Rafraîchir le token
      const refreshResult = await this.refreshAccessToken(refreshToken);
      
      if (!refreshResult.success) {
        return refreshResult;
      }

      // Sauvegarder le nouveau token
      await this.saveNewTokens(channelId, refreshResult.accessToken!, refreshResult.refreshToken!);

      return {
        success: true,
        accessToken: refreshResult.accessToken
      };

    } catch (error) {
      console.error('Erreur lors de la validation/rafraîchissement du token:', error);
      return {
        success: false,
        error: 'Erreur interne lors de la gestion du token'
      };
    }
  }

  /**
   * Valide un token d'accès en faisant un appel test à l'API TikTok
   */
  private static async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/${this.API_VERSION}/user/info/?fields=open_id`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      // Si le token est valide, TikTok retourne error.code = "ok"
      return response.ok && data.error?.code === 'ok';
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }

  /**
   * Rafraîchit un token d'accès en utilisant le refresh token
   */
  private static async refreshAccessToken(refreshToken: string): Promise<TokenRefreshResult & { refreshToken?: string }> {
    try {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

      if (!clientKey || !clientSecret) {
        return {
          success: false,
          error: 'Configuration TikTok manquante',
          needsReauth: true
        };
      }

      const response = await fetch(`${this.BASE_URL}/${this.API_VERSION}/oauth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      const data: TikTokRefreshTokenResponse | TikTokRefreshError = await response.json();

      if (!response.ok || 'error' in data) {
        console.error('Erreur lors du rafraîchissement du token TikTok:', data);
        
        // Si le refresh token est invalide, une reconnexion est nécessaire
        if ('error' in data && (
          data.error.code === 'refresh_token_invalid' || 
          data.error.code === 'refresh_token_expired'
        )) {
          return {
            success: false,
            error: 'Refresh token expiré, reconnexion requise',
            needsReauth: true
          };
        }

        return {
          success: false,
          error: 'error' in data ? data.error.message : 'Erreur lors du rafraîchissement'
        };
      }

      console.log('Token TikTok rafraîchi avec succès');

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      };

    } catch (error) {
      console.error('Erreur réseau lors du rafraîchissement du token:', error);
      return {
        success: false,
        error: 'Erreur de connexion lors du rafraîchissement'
      };
    }
  }

  /**
   * Sauvegarde les nouveaux tokens dans la base de données
   */
  private static async saveNewTokens(channelId: string, accessToken: string, refreshToken: string): Promise<void> {
    try {
      const encryptedAccessToken = encryptToken(accessToken);
      const encryptedRefreshToken = encryptToken(refreshToken);

      await prisma.channel.update({
        where: { id: channelId },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken
        }
      });

      console.log('Nouveaux tokens TikTok sauvegardés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des nouveaux tokens:', error);
      throw error;
    }
  }

  /**
   * Marque un canal comme nécessitant une reconnexion
   */
  static async markChannelForReauth(channelId: string): Promise<void> {
    try {
      await prisma.channel.update({
        where: { id: channelId },
        data: {
          isActive: false,
          accessToken: null,
          refreshToken: null
        }
      });
      console.log(`Canal TikTok ${channelId} marqué pour reconnexion`);
    } catch (error) {
      console.error('Erreur lors du marquage du canal pour reconnexion:', error);
    }
  }
}