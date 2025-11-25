#!/usr/bin/env node

/**
 * Email Obfuscation Generator
 *
 * Generates multi-layer obfuscated email data for the EmailLink component.
 *
 * Usage:
 *   node scripts/obfuscate-email.mjs <email> <key>
 *
 * Example:
 *   node scripts/obfuscate-email.mjs jakob@westhoffswelt.de SecureKey123
 *
 * Process:
 * 1. XOR encrypt email with the key
 * 2. ROT13 encode the key
 * 3. Base64 encode the encrypted result
 */

const email = process.argv[2];
const key = process.argv[3];

if (!email || !key) {
  console.error('Usage: node scripts/obfuscate-email.mjs <email> <key>');
  console.error('Example: node scripts/obfuscate-email.mjs jakob@example.com MySecretKey');
  process.exit(1);
}

// Step 1: ROT13 encode the key
const rot13 = (str) => {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
};

const encodedKey = rot13(key);

// Step 2: XOR encrypt the email with the original key
let encrypted = '';
for (let i = 0; i < email.length; i++) {
  const emailChar = email.charCodeAt(i);
  const keyChar = key.charCodeAt(i % key.length);
  encrypted += String.fromCharCode(emailChar ^ keyChar);
}

// Step 3: Base64 encode the encrypted data
const encryptedData = Buffer.from(encrypted, 'binary').toString('base64');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Email Obfuscation Results');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Input:');
console.log('  Email:', email);
console.log('  Key:', key);
console.log('');
console.log('Output:');
console.log('  ROT13 Encoded Key:', encodedKey);
console.log('  Base64 Encrypted Data:', encryptedData);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Component Props (copy-paste ready):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`<EmailLink`);
console.log(`  client:load`);
console.log(`  encryptedData="${encryptedData}"`);
console.log(`  encodedKey="${encodedKey}"`);
console.log(`  label="Email"`);
console.log(`/>`);
console.log('');
