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
 * Le résultat d'une tentative de publication.
 */
export interface FacebookPublishResult {
  success: boolean;       // Indique si la publication a réussi.
  postId?: string;      // L'ID du post créé si la publication a réussi.
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
      return {
        success: true,
        postId: data.id
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