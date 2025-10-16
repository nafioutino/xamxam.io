// /src/services/facebook/publishService.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { decryptToken } from '@/lib/encryption';

// ==================================================================
// ===                 TYPES ET INTERFACES                        ===
// ==================================================================

/**
 * Options requises pour publier un post sur Facebook.
 */
export interface FacebookPublishOptions {
  message: string;      // Le contenu texte du post.
  pageId: string;       // L'ID de la page Facebook sur laquelle publier.
  accessToken: string;  // Le User Access Token de l'utilisateur qui a les permissions.
}

/**
 * Options pour publier un post avec image sur Facebook.
 */
export interface FacebookImagePublishOptions extends FacebookPublishOptions {
  imageUrl?: string;
  imageFile?: File;
}

/**
 * Options pour publier un post avec vidéo sur Facebook.
 */
export interface FacebookVideoPublishOptions extends FacebookPublishOptions {
  videoUrl?: string;
  videoFile?: File;
}

/**
 * Résultat d'un upload de photo.
 */
export interface FacebookPhotoUploadResult {
  success: boolean;
  photoId?: string;
  error?: string;
  metaError?: any;
}

/**
 * Résultat d'un upload de vidéo.
 */
export interface FacebookVideoUploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
  metaError?: any;
}

/**
 * Le résultat d'une tentative de publication.
 */
export interface FacebookPublishResult {
  success: boolean;       // Indique si la publication a réussi.
  postId?: string;      // L'ID du post créé si la publication a réussi.
  postLink?: string;    // Le lien vers la publication sur Facebook.
  error?: string;       // Un message d'erreur clair et lisible pour le frontend.
  metaError?: any;      // L'objet d'erreur complet de l'API Meta pour le débogage.
}

// ==================================================================
// ===                 CLASSE DU SERVICE DE PUBLICATION           ===
// ==================================================================
export class FacebookPublishService {
  // Constantes pour éviter les "chaînes magiques" et faciliter les mises à jour.
  private static readonly API_VERSION = 'v18.0'; // Utiliser une version LTS de l'API Graph
  private static readonly BASE_URL = 'https://graph.facebook.com';

  /**
   * Publie un message texte sur une page Facebook.
   * Cette fonction tente de publier directement et gère les erreurs de permission
   * renvoyées par Meta, ce qui est plus efficace que de vérifier les permissions au préalable.
   * @param options Les options de publication contenant le message, le pageId et le token.
   * @returns Un objet `FacebookPublishResult` indiquant le succès ou l'échec.
   */
  static async publishTextPost(options: FacebookPublishOptions): Promise<FacebookPublishResult> {
    try {
      const { message, pageId, accessToken } = options;

      // Étape 1 : Valider les entrées pour éviter des appels API inutiles.
      const validationError = this.validatePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Étape 2 : Construire l'URL de l'endpoint de l'API Graph pour la publication.
      const url = `${this.BASE_URL}/${this.API_VERSION}/${pageId}/feed`;
      
      // Étape 3 : Tenter de publier le post en appelant l'API de Meta.
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          // On utilise le token fourni (qui doit être le User Access Token) pour s'authentifier.
          // Meta vérifiera que l'utilisateur de ce token a bien le droit de publier sur la page 'pageId'.
          access_token: accessToken,
        })
      });

      const data = await response.json();

      // Étape 4 : Gérer la réponse de Meta.
      // Si la réponse n'est pas "ok" (statut HTTP 2xx), c'est que Meta a renvoyé une erreur.
      if (!response.ok) {
        console.error('Facebook API Error:', JSON.stringify(data, null, 2));
        // On renvoie un objet d'erreur structuré et clair.
        return { 
          success: false, 
          // On expose le message d'erreur de Meta directement, c'est la source de vérité.
          error: data.error?.message || 'Erreur inconnue lors de la publication',
          // On inclut aussi l'objet d'erreur complet pour un débogage avancé.
          metaError: data.error
        };
      }

      // Si tout s'est bien passé, on renvoie le succès et l'ID du post créé.
      // Générer le lien vers la publication
      const postLink = data.id ? `https://www.facebook.com/${pageId}/posts/${data.id.split('_')[1] || data.id}` : undefined;
      
      return {
        success: true,
        postId: data.id,
        postLink: postLink
      };

    } catch (error) {
      console.error('Publish service network error:', error);
      // Gérer les erreurs qui ne viennent pas de l'API Meta (ex: pas de connexion internet, timeout).
      return {
        success: false,
        error: 'Erreur de connexion à Facebook. Veuillez vérifier votre connexion et réessayer.'
      };
    }
  }

  /**
   * Valide les options de publication fournies avant de faire l'appel API.
   * @param options Les options à valider.
   * @returns Un message d'erreur (string) ou `null` si tout est valide.
   */
  static validatePublishOptions(options: Partial<FacebookPublishOptions>): string | null {
    if (!options.message || !options.message.trim()) {
      return 'Le message est requis et ne peut pas être vide.';
    }

    if (!options.pageId) {
      return "L'ID de la page cible est requis.";
    }

    if (!options.accessToken) {
      return "Le token d'accès est requis pour l'authentification.";
    }

    // Limite de caractères officielle de Facebook pour les posts.
    if (options.message.length > 63206) {
      return 'Le message est trop long (maximum 63 206 caractères).';
    }

    return null; // Tout est valide.
  }

  /**
   * Upload une image sur Facebook et retourne l'ID de la photo
   */
  static async uploadPhoto(options: {
    pageId: string;
    accessToken: string;
    imageUrl?: string;
    imageFile?: File;
    message?: string;
  }): Promise<FacebookPhotoUploadResult> {
    try {
      const { pageId, accessToken, imageUrl, imageFile, message } = options;

      if (!imageUrl && !imageFile) {
        return { success: false, error: 'Image URL ou fichier requis' };
      }

      const url = `${this.BASE_URL}/${this.API_VERSION}/${pageId}/photos`;
      
      const formData = new FormData();
      formData.append('access_token', accessToken);
      
      if (message) {
        formData.append('message', message.trim());
      }

      if (imageFile) {
        formData.append('source', imageFile);
      } else if (imageUrl) {
        formData.append('url', imageUrl);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook Photo Upload Error:', JSON.stringify(data, null, 2));
        return {
          success: false,
          error: data.error?.message || 'Erreur lors de l\'upload de l\'image',
          metaError: data.error
        };
      }

      return {
        success: true,
        photoId: data.id
      };

    } catch (error) {
      console.error('Photo upload service error:', error);
      return {
        success: false,
        error: 'Erreur de connexion lors de l\'upload de l\'image'
      };
    }
  }

  /**
   * Publie un post avec image sur Facebook
   */
  static async publishImagePost(options: FacebookImagePublishOptions): Promise<FacebookPublishResult> {
    try {
      const { message, pageId, accessToken, imageUrl, imageFile } = options;

      // Validation
      const validationError = this.validateImagePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Upload de l'image
      const uploadResult = await this.uploadPhoto({
        pageId,
        accessToken,
        imageUrl,
        imageFile,
        message: message.trim()
      });

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error,
          metaError: uploadResult.metaError
        };
      }

      // Générer le lien vers la publication photo
      const postLink = uploadResult.photoId ? `https://www.facebook.com/${pageId}/photos/${uploadResult.photoId}` : undefined;
      
      return {
        success: true,
        postId: uploadResult.photoId,
        postLink: postLink
      };

    } catch (error) {
      console.error('Image post service error:', error);
      return {
        success: false,
        error: 'Erreur lors de la publication de l\'image'
      };
    }
  }

  /**
   * Upload une vidéo sur Facebook et retourne l'ID de la vidéo
   */
  static async uploadVideo(options: {
    pageId: string;
    accessToken: string;
    videoUrl?: string;
    videoFile?: File;
    message?: string;
  }): Promise<FacebookVideoUploadResult> {
    try {
      const { pageId, accessToken, videoUrl, videoFile, message } = options;

      if (!videoUrl && !videoFile) {
        return { success: false, error: 'Vidéo URL ou fichier requis' };
      }

      const url = `${this.BASE_URL}/${this.API_VERSION}/${pageId}/videos`;
      
      const formData = new FormData();
      formData.append('access_token', accessToken);
      
      if (message) {
        formData.append('description', message.trim());
      }

      if (videoFile) {
        formData.append('source', videoFile);
      } else if (videoUrl) {
        formData.append('file_url', videoUrl);
      }

      // Timeout plus long pour les vidéos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook Video Upload Error:', JSON.stringify(data, null, 2));
        return {
          success: false,
          error: data.error?.message || 'Erreur lors de l\'upload de la vidéo',
          metaError: data.error
        };
      }

      return {
        success: true,
        videoId: data.id
      };

    } catch (error) {
      console.error('Video upload service error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Timeout: La vidéo est trop volumineuse ou la connexion trop lente'
        };
      }
      return {
        success: false,
        error: 'Erreur de connexion lors de l\'upload de la vidéo'
      };
    }
  }

  /**
   * Publie un post avec vidéo sur Facebook
   */
  static async publishVideoPost(options: FacebookVideoPublishOptions): Promise<FacebookPublishResult> {
    try {
      const { message, pageId, accessToken, videoUrl, videoFile } = options;

      // Validation
      const validationError = this.validateVideoPublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Upload de la vidéo
      const uploadResult = await this.uploadVideo({
        pageId,
        accessToken,
        videoUrl,
        videoFile,
        message: message.trim()
      });

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error,
          metaError: uploadResult.metaError
        };
      }

      // Générer le lien vers la publication vidéo
      const postLink = uploadResult.videoId ? `https://www.facebook.com/${pageId}/videos/${uploadResult.videoId}` : undefined;
      
      return {
        success: true,
        postId: uploadResult.videoId,
        postLink: postLink
      };

    } catch (error) {
      console.error('Video post service error:', error);
      return {
        success: false,
        error: 'Erreur lors de la publication de la vidéo'
      };
    }
  }

  /**
   * Validation pour les posts avec images
   */
  static validateImagePublishOptions(options: Partial<FacebookImagePublishOptions>): string | null {
    // Validation de base
    const baseValidation = this.validatePublishOptions(options);
    if (baseValidation) return baseValidation;

    // Validation spécifique aux images
    if (!options.imageUrl && !options.imageFile) {
      return 'Une image (URL ou fichier) est requise';
    }

    if (options.imageFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (options.imageFile.size > maxSize) {
        return 'L\'image est trop volumineuse (maximum 10MB)';
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(options.imageFile.type)) {
        return 'Format d\'image non supporté (JPEG, PNG, GIF, WebP uniquement)';
      }
    }

    return null;
  }

  /**
   * Validation pour les posts avec vidéos
   */
  static validateVideoPublishOptions(options: Partial<FacebookVideoPublishOptions>): string | null {
    // Validation de base
    const baseValidation = this.validatePublishOptions(options);
    if (baseValidation) return baseValidation;

    // Validation spécifique aux vidéos
    if (!options.videoUrl && !options.videoFile) {
      return 'Une vidéo (URL ou fichier) est requise';
    }

    if (options.videoFile) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (options.videoFile.size > maxSize) {
        return 'La vidéo est trop volumineuse (maximum 100MB)';
      }

      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
      if (!allowedTypes.includes(options.videoFile.type)) {
        return 'Format de vidéo non supporté (MP4, AVI, MOV, WMV, FLV uniquement)';
      }
    }

    return null;
  }

  /**
   * Prépare le token d'accès en le déchiffrant.
   * Sépare la responsabilité du déchiffrement du reste de la logique.
   * @param encryptedToken Le token chiffré stocké dans la base de données.
   * @returns Le token déchiffré, prêt à être utilisé.
   */
  static prepareAccessToken(encryptedToken: string): string {
    // Fait appel à votre module de chiffrement.
    return decryptToken(encryptedToken);
  }
}