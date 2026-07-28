import CryptoJS from 'crypto-js';

/**
 * Module de Chiffrement des Données Médicales
 * Conformité RGPD / HDS pour la confidentialité des Transmissions Soignants
 * Algorithme: AES-256 (CryptoJS)
 */

// Clé de chiffrement lue depuis la variable d'environnement Vite/Vercel
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || 'caretone-default-secure-hds-key-32chars!!';

/**
 * Chiffre une chaîne de texte brut en AES-256
 * @param plainText Texte médical confidentiel (Données, Actions, Résultats)
 * @returns Chaîne chiffrée en Base64 ou chaîne vide si paramètre invalide
 */
export function encryptData(plainText: string | null | undefined): string {
  if (!plainText || typeof plainText !== 'string' || plainText.trim() === '') {
    return '';
  }

  try {
    const ciphertext = CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('[CareTone Security] Erreur lors du chiffrement des données de santé:', error);
    return '';
  }
}

/**
 * Déchiffre une chaîne chiffrée AES-256
 * @param cipherText Chaîne chiffrée stockée en base de données
 * @returns Texte médical déchiffré brut ou chaîne vide en cas d'erreur
 */
export function decryptData(cipherText: string | null | undefined): string {
  if (!cipherText || typeof cipherText !== 'string' || cipherText.trim() === '') {
    return '';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // Si le résultat est vide après déchiffrement (ex: clé invalide ou texte corrompu)
    if (!originalText) {
      // Retourner le texte d'origine au cas où il était déjà non chiffré en transition
      return cipherText;
    }

    return originalText;
  } catch (error) {
    console.warn('[CareTone Security] Échec du déchiffrement (données probablement non chiffrées):', error);
    return cipherText;
  }
}
