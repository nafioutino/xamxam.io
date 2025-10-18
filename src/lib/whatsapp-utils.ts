import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

export interface WhatsAppUserProfile {
  phoneNumber: string;
  profilePictureUrl?: string;
}

/**
 * Formate le nom d'un utilisateur WhatsApp basé sur son numéro de téléphone
 * @param phoneNumber Numéro de téléphone
 * @returns Nom formaté
 */
export function formatWhatsAppUserName(phoneNumber: string): string {
  // Nettoyer le numéro de téléphone (enlever les caractères non numériques)
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Si le numéro commence par un code pays, on peut essayer de le formater
  if (cleanNumber.length > 10) {
    // Format international avec code pays
    return `+${cleanNumber}`;
  }
  
  return phoneNumber;
}

/**
 * Récupère les informations d'un utilisateur WhatsApp
 * @param instanceName Nom de l'instance WhatsApp
 * @param phoneNumber Numéro de téléphone
 * @returns Informations de l'utilisateur avec nom formaté et avatarUrl
 */
export async function getWhatsAppUserInfo(
  instanceName: string,
  phoneNumber: string
): Promise<{
  name: string;
  avatarUrl: string | null;
}> {
  try {
    // Récupérer l'URL de la photo de profil
    const profilePictureUrl = await evolutionApiService.fetchProfilePictureUrl(
      instanceName,
      phoneNumber
    );

    return {
      name: formatWhatsAppUserName(phoneNumber),
      avatarUrl: profilePictureUrl,
    };
  } catch (error) {
    console.error('Error getting WhatsApp user info:', error);
    
    return {
      name: formatWhatsAppUserName(phoneNumber),
      avatarUrl: null,
    };
  }
}