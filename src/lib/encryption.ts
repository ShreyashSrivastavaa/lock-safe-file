// AES-256-GCM encryption utilities using Web Crypto API

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts file data with AES-256-GCM
 */
export async function encryptFile(
  fileData: ArrayBuffer,
  password: string
): Promise<{
  encryptedData: string;
  salt: string;
  iv: string;
}> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    fileData
  );

  // Convert to base64 for storage
  const encryptedData = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  );
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    encryptedData,
    salt: saltBase64,
    iv: ivBase64,
  };
}

/**
 * Decrypts file data with AES-256-GCM
 */
export async function decryptFile(
  encryptedData: string,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  // Convert from base64
  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

  // Derive decryption key from password
  const key = await deriveKey(password, salt);

  try {
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    return decryptedBuffer;
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
}

/**
 * Reads a file as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads decrypted file
 */
export function downloadDecryptedFile(
  data: ArrayBuffer,
  fileName: string,
  fileType: string
) {
  const blob = new Blob([data], { type: fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
