import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('ENCRYPTION_KEY is not configured in the environment.');
  }
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypts a plaintext string into a single `iv:authTag:ciphertext` hex-encoded token.
 */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a token produced by encryptSecret(). Returns null if malformed or
 * decryption fails (e.g. key rotated), rather than throwing.
 */
export function decryptSecret(token: string): string | null {
  try {
    const [ivHex, authTagHex, dataHex] = token.split(':');
    if (!ivHex || !authTagHex || !dataHex) return null;
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}
