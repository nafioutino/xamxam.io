// /src/services/tiktok/publishService.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { decryptToken } from '@/lib/encryption';

// ==================================================================
// ===                 TYPES ET INTERFACES                        ===
// ==================================================================

/**
 * Options requises pour publier une vidéo sur TikTok.
 */
export interface TikTokPublishOptions {
  title: string;        // Le titre/description de la vidéo
  accessToken: string;  // Le token d'accès TikTok de l'utilisateur
  videoUrl?: string;    // URL de la vidéo à publier
  videoFile?: File;     // Fichier vidéo à publier
  privacy?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'; // Niveau de confidentialité
  publishMode?: 'direct' | 'draft'; // Mode de publication
}

/**
 * Résultat d'un upload de vidéo TikTok.
 */
export interface TikTokUploadResult {
  success: boolean;
  publishId?: string;
  shareId?: string;
  error?: string;
  tikTokError?: any;
}

/**
 * Le résultat d'une tentative de publication TikTok.
 */
export interface TikTokPublishResult {
  success: boolean;
  publishId?: string;
  shareId?: string;
  error?: string;
  tikTokError?: any;
}

/**
 * Réponse de l'API TikTok pour l'initialisation de l'upload
 */
interface TikTokUploadInitResponse {
  data: {
    publish_id: string;
    upload_url: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Réponse de l'API TikTok pour la publication
 */
interface TikTokPublishResponse {
  data: {
    publish_id: string;
    share_id?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ==================================================================
// ===                 CLASSE DU SERVICE DE PUBLICATION           ===
// ==================================================================
export class TikTokPublishService {
  private static readonly BASE_URL = 'https://open.tiktokapis.com';
  private static readonly API_VERSION = 'v2';

  /**
   * Publie une vidéo directement sur TikTok (video.publish scope)
   * @param options Les options de publication
   * @returns Un objet TikTokPublishResult
   */
  static async publishVideo(options: TikTokPublishOptions): Promise<TikTokPublishResult> {
    try {
      const { title, accessToken, videoUrl, videoFile, privacy = 'SELF_ONLY' } = options;

      // Validation
      const validationError = this.validatePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Étape 1: Calculer la taille de la vidéo
      const videoSize = await this.getVideoSize(videoFile || videoUrl!);
      if (videoSize === 0) {
        return { success: false, error: 'Impossible de déterminer la taille de la vidéo' };
      }

      // Étape 2: Initialiser l'upload
      const initResult = await this.initializeVideoUpload(accessToken, title, privacy, false, videoSize);
      if (!initResult.success) {
        return initResult;
      }

      // Étape 3: Uploader la vidéo
      const uploadResult = await this.uploadVideoFile(
        initResult.uploadUrl!,
        videoFile || videoUrl!
      );
      if (!uploadResult) {
        return { success: false, error: 'Échec de l\'upload de la vidéo' };
      }

      // Étape 4: Publier la vidéo
      const publishResult = await this.publishVideoContent(
        accessToken,
        initResult.publishId!
      );

      return publishResult;

    } catch (error) {
      console.error('TikTok publish service error:', error);
      return {
        success: false,
        error: 'Erreur lors de la publication sur TikTok'
      };
    }
  }

  /**
   * Upload une vidéo en brouillon sur TikTok (video.upload scope)
   * @param options Les options d'upload
   * @returns Un objet TikTokUploadResult
   */
  static async uploadVideoDraft(options: TikTokPublishOptions): Promise<TikTokUploadResult> {
    try {
      const { title, accessToken, videoUrl, videoFile, privacy = 'SELF_ONLY' } = options;

      // Validation
      const validationError = this.validatePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Étape 1: Calculer la taille de la vidéo
      const videoSize = await this.getVideoSize(videoFile || videoUrl!);
      if (videoSize === 0) {
        return { success: false, error: 'Impossible de déterminer la taille de la vidéo' };
      }

      // Étape 2: Initialiser l'upload en mode brouillon
      const initResult = await this.initializeVideoUpload(
        accessToken, 
        title, 
        privacy, 
        true, // draft mode
        videoSize
      );
      if (!initResult.success) {
        return initResult;
      }

      // Étape 3: Uploader la vidéo
      const uploadResult = await this.uploadVideoFile(
        initResult.uploadUrl!,
        videoFile || videoUrl!
      );
      if (!uploadResult) {
        return { success: false, error: 'Échec de l\'upload de la vidéo' };
      }

      return {
        success: true,
        publishId: initResult.publishId,
        error: undefined
      };

    } catch (error) {
      console.error('TikTok upload draft service error:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'upload en brouillon sur TikTok'
      };
    }
  }

  /**
   * Initialise l'upload d'une vidéo sur TikTok
   */
  private static async initializeVideoUpload(
    accessToken: string,
    title: string,
    privacy: string,
    isDraft: boolean = false,
    videoSize: number = 0
  ): Promise<TikTokUploadResult & { uploadUrl?: string }> {
    const url = `${this.BASE_URL}/${this.API_VERSION}/post/publish/video/init/`;
    
    const body = {
      post_info: {
        title: title.trim(),
        privacy_level: privacy,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoSize, // Utiliser la taille réelle de la vidéo
        chunk_size: 10485760, // 10MB chunks
        total_chunk_count: Math.ceil(videoSize / 10485760) || 1
      }
    };

    // Si c'est un brouillon, on ajoute le paramètre auto_publish à false
    if (isDraft) {
      (body as any).post_info.auto_publish = false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(body)
      });

      const data: TikTokUploadInitResponse = await response.json();

      if (!response.ok || data.error) {
        console.error('TikTok upload init error:', data.error);
        return {
          success: false,
          error: data.error?.message || 'Erreur lors de l\'initialisation de l\'upload',
          tikTokError: data.error
        };
      }

      return {
        success: true,
        publishId: data.data.publish_id,
        uploadUrl: data.data.upload_url
      };

    } catch (error) {
      console.error('TikTok upload init network error:', error);
      return {
        success: false,
        error: 'Erreur de connexion lors de l\'initialisation'
      };
    }
  }

  /**
   * Upload le fichier vidéo vers TikTok
   */
  private static async uploadVideoFile(
    uploadUrl: string,
    videoSource: File | string
  ): Promise<boolean> {
    try {
      let videoData: Blob;

      if (typeof videoSource === 'string') {
        // Si c'est une URL, télécharger le fichier
        const response = await fetch(videoSource);
        if (!response.ok) {
          throw new Error('Impossible de télécharger la vidéo depuis l\'URL');
        }
        videoData = await response.blob();
      } else {
        // Si c'est un fichier
        videoData = videoSource;
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes 0-${videoData.size - 1}/${videoData.size}`
        },
        body: videoData
      });

      return response.ok;

    } catch (error) {
      console.error('TikTok video upload error:', error);
      return false;
    }
  }

  /**
   * Publie la vidéo après l'upload
   */
  private static async publishVideoContent(
    accessToken: string,
    publishId: string
  ): Promise<TikTokPublishResult> {
    const url = `${this.BASE_URL}/${this.API_VERSION}/post/publish/video/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          publish_id: publishId
        })
      });

      const data: TikTokPublishResponse = await response.json();

      if (!response.ok || data.error) {
        console.error('TikTok publish error:', data.error);
        return {
          success: false,
          error: data.error?.message || 'Erreur lors de la publication',
          tikTokError: data.error
        };
      }

      return {
        success: true,
        publishId: data.data.publish_id,
        shareId: data.data.share_id
      };

    } catch (error) {
      console.error('TikTok publish network error:', error);
      return {
        success: false,
        error: 'Erreur de connexion lors de la publication'
      };
    }
  }

  /**
   * Calcule la taille d'une vidéo (fichier ou URL)
   */
  private static async getVideoSize(videoSource: File | string): Promise<number> {
    try {
      if (typeof videoSource === 'string') {
        // Si c'est une URL, faire une requête HEAD pour obtenir la taille
        const response = await fetch(videoSource, { method: 'HEAD' });
        if (!response.ok) {
          console.error('Impossible d\'obtenir les informations de la vidéo depuis l\'URL');
          return 0;
        }
        const contentLength = response.headers.get('content-length');
        return contentLength ? parseInt(contentLength, 10) : 0;
      } else {
        // Si c'est un fichier, retourner sa taille
        return videoSource.size;
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la taille de la vidéo:', error);
      return 0;
    }
  }

  /**
   * Validation des options de publication
   */
  private static validatePublishOptions(options: Partial<TikTokPublishOptions>): string | null {
    if (!options.title?.trim()) {
      return 'Le titre est requis';
    }

    if (options.title.length > 150) {
      return 'Le titre ne peut pas dépasser 150 caractères';
    }

    if (!options.accessToken) {
      return 'Token d\'accès requis';
    }

    if (!options.videoUrl && !options.videoFile) {
      return 'Une vidéo (URL ou fichier) est requise';
    }

    if (options.videoFile) {
      const maxSize = 4 * 1024 * 1024 * 1024; // 4GB (limite TikTok)
      if (options.videoFile.size > maxSize) {
        return 'La vidéo est trop volumineuse (maximum 4GB)';
      }

      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov'];
      if (!allowedTypes.includes(options.videoFile.type)) {
        return 'Format de vidéo non supporté (MP4, WebM, MOV uniquement)';
      }
    }

    return null;
  }
}