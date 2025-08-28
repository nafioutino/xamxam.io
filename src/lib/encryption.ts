import crypto from 'crypto';

// Configuration de chiffrement
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Génère une clé de chiffrement à partir d'une phrase secrète
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET_KEY environment variable is required');
  }
  
  // Utiliser PBKDF2 pour dériver une clé sécurisée
  return crypto.pbkdf2Sync(secret, 'zoba-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Chiffre un token de manière sécurisée
 * @param token Le token à chiffrer
 * @returns Le token chiffré au format: iv:encrypted:tag
 */
export function encryptToken(token: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Format: iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Déchiffre un token
 * @param encryptedToken Le token chiffré au format: iv:encrypted
 * @returns Le token déchiffré
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedToken.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Vérifie si un token chiffré est valide
 * @param encryptedToken Le token chiffré à vérifier
 * @returns true si le token est valide, false sinon
 */
export function isValidEncryptedToken(encryptedToken: string): boolean {
  try {
    const parts = encryptedToken.split(':');
    return parts.length === 2 && 
           parts.every(part => /^[0-9a-f]+$/i.test(part));
  } catch {
    return false;
  }
}

/**
 * Génère un token de vérification pour les webhooks
 * @returns Un token aléatoire sécurisé
 */
export function generateWebhookToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Vérifie la signature d'un webhook Facebook
 * @param payload Le payload du webhook
 * @param signature La signature reçue de Facebook
 * @param secret Le secret de l'application Facebook
 * @returns true si la signature est valide
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch {
    return false;
  }
}