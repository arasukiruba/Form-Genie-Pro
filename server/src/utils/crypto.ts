import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Encryption utility for securing sensitive environment variables.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * Usage:
 *   1. Set ENCRYPTION_KEY in .env (32-byte hex key)
 *   2. Use `encrypt(plaintext)` to produce an encrypted string
 *   3. Use `decrypt(encrypted)` to recover the original value
 *   4. Use `getSecret(envKey)` to auto-detect if a value is encrypted
 *
 * Encrypted values are prefixed with "enc:" for auto-detection.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY not set in environment variables.');
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plain-text value. Returns a string prefixed with "enc:"
 * Format: enc:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encrypt(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted value (must start with "enc:")
 */
export function decrypt(encrypted: string): string {
    if (!encrypted.startsWith('enc:')) {
        throw new Error('Value is not encrypted (missing "enc:" prefix).');
    }

    const key = getEncryptionKey();
    const parts = encrypted.slice(4).split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format.');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Get a secret from environment variables.
 * Auto-detects if the value is encrypted (starts with "enc:") and decrypts it.
 * Falls back to plain text if not encrypted (for backward compatibility).
 */
export function getSecret(envKey: string): string {
    const value = process.env[envKey];
    if (!value) {
        throw new Error(`Environment variable ${envKey} is not set.`);
    }

    if (value.startsWith('enc:')) {
        return decrypt(value);
    }

    // Plain text — return as-is (backward compatible)
    return value;
}

/**
 * Generate a random 256-bit encryption key (hex string).
 * Run this once to generate your ENCRYPTION_KEY.
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
