import { decryptToken } from '@/lib/encryption';

/**
 * Interface pour les données de profil Facebook
 */
export interface FacebookUserProfile {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  locale?: string;
  timezone?: number;
  gender?: string;
}

/**
 * Interface pour la réponse d'erreur de l'API Facebook
 */
export interface FacebookError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Récupère les informations de profil d'un utilisateur Facebook
 * @param userId L'ID de l'utilisateur Facebook (PSID)
 * @param pageAccessToken Le token d'accès de la page (chiffré)
 * @returns Les informations du profil utilisateur ou null en cas d'erreur
 */
export async function fetchFacebookUserProfile(
  userId: string,
  pageAccessToken: string
): Promise<FacebookUserProfile | null> {
  try {
    // Déchiffrer le token d'accès
    const decryptedToken = decryptToken(pageAccessToken);
    
    // Construire l'URL de l'API Graph Facebook
    const apiUrl = new URL(`https://graph.facebook.com/v23.0/${userId}`);
    apiUrl.searchParams.append('fields', 'name,first_name,last_name,profile_pic,locale,timezone,gender');
    apiUrl.searchParams.append('access_token', decryptedToken);

    console.log(`Fetching Facebook profile for user ${userId}`);
    
    // Faire l'appel à l'API
    const response = await fetch(apiUrl.toString());
    const data: FacebookUserProfile | FacebookError = await response.json();

    if (!response.ok || 'error' in data) {
      console.error('Facebook API error:', data);
      return null;
    }

    console.log(`Successfully fetched Facebook profile for user ${userId}:`, data.name);
    return data;
  } catch (error) {
    console.error('Error fetching Facebook user profile:', error);
    return null;
  }
}

/**
 * Formate le nom complet à partir des données de profil Facebook
 * @param profile Les données de profil Facebook
 * @returns Le nom formaté ou un nom par défaut
 */
export function formatFacebookUserName(profile: FacebookUserProfile): string {
  if (profile.name) {
    return profile.name;
  }
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  if (profile.first_name) {
    return profile.first_name;
  }
  
  // Fallback au nom générique si aucune information n'est disponible
  return `Client Facebook ${profile.id.slice(-4)}`;
}

/**
 * Récupère et formate les informations d'un utilisateur Facebook
 * @param userId L'ID de l'utilisateur Facebook (PSID)
 * @param pageAccessToken Le token d'accès de la page (chiffré)
 * @returns Un objet avec le nom formaté et l'URL de l'avatar
 */
export async function getFacebookUserInfo(
  userId: string,
  pageAccessToken: string
): Promise<{ name: string; avatarUrl?: string }> {
  const profile = await fetchFacebookUserProfile(userId, pageAccessToken);
  
  if (!profile) {
    return {
      name: `Client Facebook ${userId.slice(-4)}`,
      avatarUrl: undefined
    };
  }
  
  return {
    name: formatFacebookUserName(profile),
    avatarUrl: profile.profile_pic
  };
}