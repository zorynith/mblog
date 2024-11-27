/*
基于cloudflare 得crypto 库，实现AES 加密/解密功能
base on cloudflare crypto library, implement AES encryption/decryption function
*/

// 1. 基础的编码/解码工具
// 1.basic encode/decode tools
export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

// 2. 随机字符串生成（可以复用于多处）
// random string generator (can be reused in multiple places)
export async function generateRandomString(length = 16): Promise<string> {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 3. AES 加密/解密功能
// AES encryption/decryption function
export async function generateAESKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAES(text: string, key: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await generateAESKey(key, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoder.encode(text)
  );

  // 组合 salt + iv + 加密数据
  // combine salt + iv + encrypted data
  const combined = new Uint8Array([
    ...salt,
    ...iv,
    ...new Uint8Array(encrypted)
  ]);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptAES(encryptedText: string, key: string): Promise<string> {
  const combined = new Uint8Array(
    atob(encryptedText).split('').map(c => c.charCodeAt(0))
  );
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  
  const aesKey = await generateAESKey(key, salt);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    data
  );

  return decoder.decode(decrypted);
} 