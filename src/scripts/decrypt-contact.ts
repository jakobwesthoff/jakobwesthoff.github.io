/**
 * Client-side contact-detail decryption for the imprint page.
 *
 * Phone and email are never present as plaintext in the statically generated
 * HTML. Each placeholder `.contact-enc` span carries the encrypted payload, the
 * (ROT13-encoded) key and the target URI scheme as data attributes. This script
 * runs in the browser, decrypts them and swaps each span for a clickable link.
 *
 * Obfuscation scheme matches EmailLink.tsx: Base64 → XOR → ROT13 key encoding.
 * The build minifies this module, so none of these comments reach the page.
 */

// ROT13-decode the stored key back into the actual XOR key.
function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

function decrypt(encrypted: string, key: string): string {
  const bytes = atob(encrypted);
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Reveal the contact lines that are hidden by default so that, without
// JavaScript, the `<noscript>` notice shows instead of empty placeholders.
document.querySelectorAll<HTMLElement>(".contact-detail").forEach((el) => {
  el.hidden = false;
});

document.querySelectorAll<HTMLElement>(".contact-enc").forEach((el) => {
  const { enc, key, scheme } = el.dataset;
  if (!enc || !key || !scheme) return;

  const value = decrypt(enc, rot13(key));

  const link = document.createElement("a");
  link.href = scheme + value;
  link.textContent = value;
  link.className =
    "text-gray-900 underline decoration-gray-900/30 underline-offset-4 transition-colors hover:decoration-gray-900";

  el.replaceWith(link);
});
