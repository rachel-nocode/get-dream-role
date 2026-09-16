/**
 * AES-256-GCM helpers for bring-your-own-key secrets.
 *
 * Uses WebCrypto (`crypto.subtle`), which exists in both the Convex runtime and
 * the Node runtime, so this module stays importable from queries, mutations and
 * actions. The master key lives in the Convex environment variable
 * `BYOK_MASTER_KEY` (base64 of 32 random bytes: `openssl rand -base64 32`).
 */

export const KEY_VERSION = 1;

const IV_BYTES = 12;

export type EncryptedSecret = {
  ciphertext: string;
  iv: string;
  keyVersion: number;
};

/** Additional authenticated data binds a stored key to one user and provider. */
export function keyAad(userId: string, provider: string): string {
  return `${userId}:${provider}`;
}

export async function encryptSecret(
  plaintext: string,
  aad: string,
): Promise<EncryptedSecret> {
  const key = await importMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv), additionalData: encodeUtf8(aad) },
    key,
    encodeUtf8(plaintext),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    keyVersion: KEY_VERSION,
  };
}

export async function decryptSecret(
  secret: { ciphertext: string; iv: string },
  aad: string,
): Promise<string> {
  const key = await importMasterKey();
  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(base64ToBytes(secret.iv)),
        additionalData: encodeUtf8(aad),
      },
      key,
      toArrayBuffer(base64ToBytes(secret.ciphertext)),
    );
  } catch {
    throw new Error(
      "Could not decrypt the stored API key. Re-add it in Settings -> AI.",
    );
  }

  return new TextDecoder().decode(decrypted);
}

/** Last four characters of a key, shown in the UI instead of the key itself. */
export function maskKey(plaintext: string): string {
  return plaintext.trim().slice(-4);
}

async function importMasterKey(): Promise<CryptoKey> {
  const raw = process.env.BYOK_MASTER_KEY;
  if (!raw || raw.trim().length === 0) {
    throw new Error(
      "BYOK_MASTER_KEY is not set. Generate one with `openssl rand -base64 32` and set it with `npx convex env set BYOK_MASTER_KEY ...`.",
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(raw.trim());
  } catch {
    throw new Error("BYOK_MASTER_KEY must be base64 encoded (32 random bytes).");
  }

  if (bytes.length !== 32) {
    throw new Error(
      `BYOK_MASTER_KEY must decode to 32 bytes, got ${bytes.length}. Generate one with \`openssl rand -base64 32\`.`,
    );
  }

  return await crypto.subtle.importKey("raw", toArrayBuffer(bytes), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

function encodeUtf8(value: string): ArrayBuffer {
  return toArrayBuffer(new TextEncoder().encode(value));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
