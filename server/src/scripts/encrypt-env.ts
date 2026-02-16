/**
 * CLI tool to encrypt sensitive environment variable values.
 *
 * Usage:
 *   npx tsx src/scripts/encrypt-env.ts <value>
 *   npx tsx src/scripts/encrypt-env.ts --generate-key
 *
 * Examples:
 *   npx tsx src/scripts/encrypt-env.ts --generate-key
 *   npx tsx src/scripts/encrypt-env.ts "my-secret-api-key"
 */

import dotenv from 'dotenv';
dotenv.config();

import { encrypt, generateEncryptionKey } from '../utils/crypto.js';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx src/scripts/encrypt-env.ts --generate-key    Generate a new encryption key');
    console.log('  npx tsx src/scripts/encrypt-env.ts "<value>"          Encrypt a value');
    process.exit(0);
}

if (args[0] === '--generate-key') {
    const key = generateEncryptionKey();
    console.log('\n🔑 Generated ENCRYPTION_KEY (add to .env):\n');
    console.log(`ENCRYPTION_KEY=${key}\n`);
    process.exit(0);
}

try {
    const value = args[0];
    const encrypted = encrypt(value);
    console.log('\n🔒 Encrypted value:\n');
    console.log(encrypted);
    console.log('\nReplace the plain-text value in .env with the encrypted string above.\n');
} catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
}
