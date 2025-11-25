import type { ComponentChildren } from "preact";

interface EmailLinkProps {
  // Base64-encoded XOR-encrypted email (key is ROT13 encoded before XOR)
  encryptedData: string;
  // ROT13-encoded XOR key
  encodedKey: string;
  label: string;
  // Icon passed as children from Astro parent
  children: ComponentChildren;
}

/**
 * Obfuscated email link component.
 * Uses multi-layer obfuscation: Base64 → XOR encryption → ROT13 key encoding
 *
 * The icon is passed as children from the Astro parent component.
 * Styling: .icon-glow-hover class defined in src/styles/global.css:8-18
 */
export default function EmailLink({ encryptedData, encodedKey, label, children }: EmailLinkProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    // Step 1: ROT13 decode the key
    const rot13 = (str: string): string => {
      return str.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + 13) % 26) + base);
      });
    };

    const xorKey = rot13(encodedKey);

    // Step 2: Base64 decode the encrypted data
    const encryptedBytes = atob(encryptedData);

    // Step 3: XOR decrypt using the decoded key
    let decrypted = "";
    for (let i = 0; i < encryptedBytes.length; i++) {
      const encryptedChar = encryptedBytes.charCodeAt(i);
      const keyChar = xorKey.charCodeAt(i % xorKey.length);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }

    // Step 4: Open mailto link
    window.location.href = `mailto:${decrypted}`;
  };

  return (
    <button
      onClick={handleClick}
      class="icon-glow-hover inline-block cursor-pointer hover:scale-110"
      aria-label={label}
    >
      {children}
    </button>
  );
}
