import { decryptToken } from '@/lib/encryption';

/**
 * Interface pour les données de profil Instagram Business
 * Utilise uniquement les champs disponibles pour IGBusinessScopedID
 */
export interface InstagramUserProfile {
  id: string;
  username?: string;
  name?: string;
  profile_pic?: string;
}

/**
 * Interface pour la réponse d'erreur de l'API Instagram
 */
export interface InstagramError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Récupère les informations de profil d'un utilisateur Instagram Business
 * @param userId L'ID de l'utilisateur Instagram (IGBusinessScopedID)
 * @param pageAccessToken Le token d'accès de la page (chiffré)
 * @returns Les informations du profil utilisateur ou null en cas d'erreur
 */
export async function fetchInstagramUserProfile(
  userId: string,
  pageAccessToken: string
): Promise<InstagramUserProfile | null> {
  try {
    // Déchiffrer le token d'accès
    const decryptedToken = decryptToken(pageAccessToken);
    
    // Construire l'URL de l'API Graph Instagram
    // Pour Instagram, on utilise uniquement les champs disponibles pour IGBusinessScopedID
    const apiUrl = new URL(`https://graph.facebook.com/v23.0/${userId}`);
    apiUrl.searchParams.append('fields', 'id,username,name,profile_pic');
    apiUrl.searchParams.append('access_token', decryptedToken);

    console.log(`Fetching Instagram profile for user ${userId}`);
    
    // Faire l'appel à l'API
    const response = await fetch(apiUrl.toString());
    const data: InstagramUserProfile | InstagramError = await response.json();

    if (!response.ok || 'error' in data) {
      console.error('Instagram API error:', data);
      return null;
    }

    console.log(`Successfully fetched Instagram profile for user ${userId}:`, data.username || data.name);
    return data;
  } catch (error) {
    console.error('Error fetching Instagram user profile:', error);
    return null;
  }
}

/**
 * Formate le nom d'affichage à partir des données de profil Instagram
 * @param profile Les données de profil Instagram
 * @returns Le nom formaté ou un nom par défaut
 */
export function formatInstagramUserName(profile: InstagramUserProfile): string {
  if (profile.name) {
    return profile.name;
  }
  
  if (profile.username) {
    return `@${profile.username}`;
  }
  
  // Fallback au nom générique si aucune information n'est disponible
  return `Client Instagram ${profile.id.slice(-4)}`;
}

/**
 * Récupère et formate les informations d'un utilisateur Instagram
 * @param userId L'ID de l'utilisateur Instagram (IGBusinessScopedID)
 * @param pageAccessToken Le token d'accès de la page (chiffré)
 * @returns Un objet avec le nom formaté et l'URL de l'avatar
 */
export async function getInstagramUserInfo(
  userId: string,
  pageAccessToken: string
): Promise<{ name: string; avatarUrl?: string }> {
  const profile = await fetchInstagramUserProfile(userId, pageAccessToken);
  
  if (!profile) {
    return {
      name: `Client Instagram ${userId.slice(-4)}`,
      avatarUrl: undefined
    };
  }
  
  return {
    name: formatInstagramUserName(profile),
    avatarUrl: profile.profile_pic
  };
}

/**
 * Détermine si un ID utilisateur est un IGBusinessScopedID (Instagram)
 * Les IGBusinessScopedID sont généralement plus longs et ont un format différent
 * @param userId L'ID de l'utilisateur à vérifier
 * @returns true si c'est probablement un utilisateur Instagram
 */
export function isInstagramUserId(userId: string): boolean {
  // Les IGBusinessScopedID sont généralement plus longs (17+ caractères)
  // et commencent souvent par des chiffres spécifiques
  // Cette heuristique peut être affinée selon les observations
  return userId.length >= 17 && /^\d+$/.test(userId);
}