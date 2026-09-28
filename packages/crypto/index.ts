import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptField(text: string, hexKey: string): string {
  if (!text) return text;
  const key = Buffer.from(hexKey, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decryptField(encryptedString: string, hexKey: string): string {
  if (!encryptedString || !encryptedString.includes(':')) return encryptedString;
  const key = Buffer.from(hexKey, 'hex');
  const [ivHex, tagHex, ciphertextHex] = encryptedString.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(ciphertextHex, 'hex', 'utf8') + decipher.final('utf8');
}
