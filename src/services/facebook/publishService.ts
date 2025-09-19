import { decryptToken } from '@/lib/encryption';

export interface FacebookPublishOptions {
  message: string;
  pageId: string;
  accessToken: string;
}

export interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export class FacebookPublishService {
  private static readonly API_VERSION = 'v23.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';

  /**
   * Publie un message texte sur une page Facebook
   */
  static async publishTextPost(options: FacebookPublishOptions): Promise<FacebookPublishResult> {
    try {
      const { message, pageId, accessToken } = options;

      if (!message.trim()) {
        return { success: false, error: 'Le message ne peut pas être vide' };
      }

      const url = `${this.BASE_URL}/${this.API_VERSION}/${pageId}/feed`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          access_token: accessToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook API Error:', data);
        return { 
          success: false, 
          error: data.error?.message || 'Erreur lors de la publication' 
        };
      }

      return {
        success: true,
        postId: data.id
      };

    } catch (error) {
      console.error('Publish service error:', error);
      return {
        success: false,
        error: 'Erreur de connexion à Facebook'
      };
    }
  }

  /**
   * Valide les paramètres de publication
   */
  static validatePublishOptions(options: Partial<FacebookPublishOptions>): string | null {
    if (!options.message || !options.message.trim()) {
      return 'Le message est requis';
    }

    if (!options.pageId) {
      return 'L\'ID de la page est requis';
    }

    if (!options.accessToken) {
      return 'Le token d\'accès est requis';
    }

    if (options.message.length > 63206) {
      return 'Le message est trop long (maximum 63 206 caractères)';
    }

    return null;
  }

  /**
   * Prépare le token d'accès déchiffré
   */
  static prepareAccessToken(encryptedToken: string): string {
    return decryptToken(encryptedToken);
  }
}