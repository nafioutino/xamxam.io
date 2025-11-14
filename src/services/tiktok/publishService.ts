// /src/services/tiktok/publishService.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { decryptToken } from '@/lib/encryption';
import prisma from '@/lib/prisma';
import { TikTokTokenService } from './tokenService';

// ==================================================================
// ===                 TYPES ET INTERFACES                        ===
// ==================================================================

export interface TikTokPublishOptions {
  channelId: string;
  videoFile: File;
  description: string;
  privacy: 'SELF_ONLY' | 'MUTUAL_FOLLOW_FRIENDS' | 'PUBLIC_TO_EVERYONE';
  isDraft?: boolean;
  interactions?: {
    allowComment?: boolean;
    allowDuet?: boolean;
    allowStitch?: boolean;
  };
}

/**
 * Options requises pour publier une vidéo sur TikTok (legacy).
 */
export interface TikTokPublishOptionsLegacy {
  title: string;        // Le titre/description de la vidéo
  accessToken: string;  // Le token d'accès TikTok de l'utilisateur
  videoUrl?: string;    // URL de la vidéo à publier
  videoFile?: File;     // Fichier vidéo à publier
  privacy?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'; // Niveau de confidentialité
  publishMode?: 'direct' | 'draft'; // Mode de publication
  interactions?: {
    allowComment?: boolean;
    allowDuet?: boolean;
    allowStitch?: boolean;
  };
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

interface TikTokVideoUploadResponse {
  data: {
    video: {
      upload_url: string;
    };
    publish_id: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokVideoPublishResponse {
  data: {
    publish_id: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

/**
 * Réponse de l'API TikTok pour l'initialisation de l'upload (legacy)
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
 * Réponse de l'API TikTok pour la publication (legacy)
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
// ===                 SERVICE DE PUBLICATION TIKTOK             ===
// ===                     (MODE LIVE - PRODUCTION)              ===
// ==================================================================

export class TikTokPublishService {
  private static readonly BASE_URL = 'https://open.tiktokapis.com';
  private static readonly API_VERSION = 'v2';

  /**
   * Publie une vidéo sur TikTok
   */
  static async publishVideo(options: TikTokPublishOptions): Promise<{
    shareId: any;
    tikTokError: any; success: boolean; error?: string; publishId?: string 
}> {
    try {
      // Valider les nouvelles options
      const validationError = this.validateNewPublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError, shareId: null, tikTokError: null };
      }

      // Obtenir un token d'accès valide (avec rafraîchissement automatique si nécessaire)
      const tokenResult = await TikTokTokenService.getValidAccessToken(options.channelId);
      
      if (!tokenResult.success) {
        if (tokenResult.needsReauth) {
          // Marquer le canal pour reconnexion
          await TikTokTokenService.markChannelForReauth(options.channelId);
        }
        return { 
          success: false, 
          error: tokenResult.error || 'Token TikTok invalide, reconnexion requise',
          shareId: null,
          tikTokError: null
        };
      }

      const accessToken = tokenResult.accessToken!;

      // Utiliser l'ancienne méthode avec les nouvelles options
      const legacyOptions: TikTokPublishOptionsLegacy = {
        title: options.description,
        accessToken: accessToken,
        videoFile: options.videoFile,
        privacy: options.privacy,
        publishMode: options.isDraft ? 'draft' : 'direct',
        interactions: options.interactions
      };

      if (options.isDraft) {
        const result = await this.uploadVideoDraft(legacyOptions);
        return {
          success: result.success,
          error: result.error,
          publishId: result.publishId,
          shareId: null,
          tikTokError: null
        };
      } else {
        const result = await this.publishVideoLegacy(legacyOptions);
        return {
          success: result.success,
          error: result.error,
          publishId: result.publishId,
          shareId: result.shareId,
          tikTokError: result.tikTokError
        };
      }
    } catch (error) {
      console.error('TikTok publish service error:', error);
      return {
        success: false,
        error: 'Erreur lors de la publication sur TikTok',
        shareId: null,
        tikTokError: null
      };
    }
  }

  /**
   * Publie une vidéo directement sur TikTok (video.publish scope) - Version legacy
   * @param options Les options de publication
   * @returns Un objet TikTokPublishResult
   */
  static async publishVideoLegacy(options: TikTokPublishOptionsLegacy): Promise<TikTokPublishResult> {
    try {
      const { title, accessToken, videoUrl, videoFile, privacy = 'PUBLIC_TO_EVERYONE' } = options;

      // Validation
      const validationError = this.validatePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Obtenir la taille de la vidéo si possible
      let videoSize: number | undefined;
      if (videoFile) {
        videoSize = videoFile.size;
        console.log(`[TikTok Service] Video file size: ${videoSize} bytes (${(videoSize / 1024 / 1024).toFixed(2)} MB)`);
      }

      console.log(`[TikTok Service] Publishing with title: "${title}", privacy: ${privacy}, videoSize: ${videoSize}`);

      // Étape 1: Initialiser l'upload (Mode LIVE - toutes les permissions disponibles)
      const initResult = await this.initializeVideoUpload(
        accessToken,
        title,
        privacy,
        false, // publication directe
        videoSize,
        options.interactions
      );
      
      if (!initResult.success) {
        return initResult;
      }

      // Étape 2: Uploader la vidéo
      const uploadResult = await this.uploadVideoFile(
        initResult.uploadUrl!,
        videoFile || videoUrl!
      );
      if (!uploadResult) {
        return { success: false, error: 'Échec de l\'upload de la vidéo' };
      }

      // Étape 3: Publier la vidéo
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
   * Upload une vidéo en tant que brouillon sur TikTok (video.upload scope) - Version legacy
   * @param options Les options d'upload
   * @returns Un objet TikTokPublishResult
   */
  static async uploadVideoDraft(options: TikTokPublishOptionsLegacy): Promise<TikTokPublishResult> {
    try {
      const { title, accessToken, videoUrl, videoFile, privacy = 'PUBLIC_TO_EVERYONE' } = options;

      // Validation
      const validationError = this.validatePublishOptions(options);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Obtenir la taille de la vidéo si possible
      let videoSize: number | undefined;
      if (videoFile) {
        videoSize = videoFile.size;
      }

      // Étape 1: Initialiser l'upload en mode brouillon
      const initResult = await this.initializeVideoUpload(
        accessToken,
        title,
        privacy,
        true, // draft mode
        videoSize,
        options.interactions
      );
      if (!initResult.success) {
        return initResult;
      }

      // Étape 2: Uploader la vidéo
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
    videoSize?: number,
    interactions?: { allowComment?: boolean; allowDuet?: boolean; allowStitch?: boolean }
  ): Promise<TikTokUploadResult & { uploadUrl?: string }> {
    // Utiliser l'endpoint correct selon le mode
    const url = isDraft 
      ? `${this.BASE_URL}/${this.API_VERSION}/post/publish/inbox/video/init/`
      : `${this.BASE_URL}/${this.API_VERSION}/post/publish/video/init/`;
    
    const actualVideoSize = videoSize || 50000000;
    
    // Calcul des chunks selon les règles TikTok
    const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_CHUNK_SIZE = 64 * 1024 * 1024; // 64MB
    
    let chunkSize: number;
    let totalChunkCount: number;
    
    if (actualVideoSize < MIN_CHUNK_SIZE) {
      // Vidéos < 5MB : upload en un seul chunk
      chunkSize = actualVideoSize;
      totalChunkCount = 1;
    } else {
      // Vidéos >= 5MB : utiliser des chunks de 64MB max
      chunkSize = Math.min(MAX_CHUNK_SIZE, actualVideoSize);
      totalChunkCount = Math.ceil(actualVideoSize / chunkSize);
      
      // Vérifier la limite de 1000 chunks
      if (totalChunkCount > 1000) {
        chunkSize = Math.ceil(actualVideoSize / 1000);
        totalChunkCount = Math.ceil(actualVideoSize / chunkSize);
      }
    }
    
    let body: any;

    if (isDraft) {
      // Pour le mode brouillon, structure simplifiée selon la documentation
      body = {
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: actualVideoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount
        }
      };
    } else {
      // Pour la publication directe, structure complète
      const disable_duet = interactions?.allowDuet === false;
      const disable_comment = interactions?.allowComment === false;
      const disable_stitch = interactions?.allowStitch === false;
      body = {
        post_info: {
          title: title.trim(),
          privacy_level: privacy,
          disable_duet,
          disable_comment,
          disable_stitch,
          video_cover_timestamp_ms: 1000
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: actualVideoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount
        }
      };
    }

    try {
      console.log('[TikTok Service] Init upload with body:', JSON.stringify(body, null, 2));
      console.log('[TikTok Service] URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(body)
      });

      const data: TikTokUploadInitResponse = await response.json();
      console.log('[TikTok Service] Init upload response:', JSON.stringify(data, null, 2));

      // Vérifier si la réponse contient une erreur réelle (pas "ok")
      if (!response.ok || (data.error && data.error.code !== 'ok')) {
        console.error('TikTok upload init error:', data.error);
        
        // Gestion d'erreurs spécifiques pour le mode LIVE
        if (data.error?.code === 'unaudited_client_can_only_post_to_private_accounts') {
          return {
            success: false,
            error: 'Votre application TikTok doit passer l\'audit Content Posting pour publier en public. Pour l\'instant, seules les publications privées (SELF_ONLY) sont autorisées. Changez la visibilité à "Moi uniquement".',
            tikTokError: data.error
          };
        }
        
        // Autres erreurs courantes en mode LIVE
        if (data.error?.code === 'access_token_invalid') {
          return {
            success: false,
            error: 'Token d\'accès TikTok invalide. Reconnexion requise.',
            tikTokError: data.error
          };
        }
        
        if (data.error?.code === 'rate_limit_exceeded') {
          return {
            success: false,
            error: 'Limite de taux TikTok dépassée. Veuillez réessayer plus tard.',
            tikTokError: data.error
          };
        }
        
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
      let mimeType: string | undefined;

      if (typeof videoSource === 'string') {
        // Si c'est une URL, télécharger le fichier
        const response = await fetch(videoSource);
        if (!response.ok) {
          throw new Error('Impossible de télécharger la vidéo depuis l\'URL');
        }
        videoData = await response.blob();
        mimeType = videoData.type || 'video/mp4';
      } else {
        // Si c'est un fichier
        videoData = videoSource;
        mimeType = videoSource.type || 'video/mp4';
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType || 'video/mp4',
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
   * Validation des options de publication (legacy)
   */
  private static validatePublishOptions(options: Partial<TikTokPublishOptionsLegacy>): string | null {
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

      // Inclure les MIME types standard pour MOV
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
      if (!allowedTypes.includes(options.videoFile.type)) {
        return 'Format de vidéo non supporté (MP4, WebM, MOV uniquement)';
      }
    }

    return null;
  }

  /**
   * Validation des nouvelles options de publication
   */
  private static validateNewPublishOptions(options: Partial<TikTokPublishOptions>): string | null {
    if (!options.description?.trim()) {
      return 'La description est requise';
    }

    if (options.description.length > 2200) {
      return 'La description ne peut pas dépasser 2200 caractères';
    }

    if (!options.channelId) {
      return 'ID du canal requis';
    }

    if (!options.videoFile) {
      return 'Un fichier vidéo est requis';
    }

    if (options.videoFile) {
      const maxSize = 4 * 1024 * 1024 * 1024; // 4GB (limite TikTok)
      if (options.videoFile.size > maxSize) {
        return 'La vidéo est trop volumineuse (maximum 4GB)';
      }

      // Inclure les MIME types standard pour MOV
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
      if (!allowedTypes.includes(options.videoFile.type)) {
        return 'Format de vidéo non supporté (MP4, WebM, MOV uniquement)';
      }
    }

    return null;
  }
}