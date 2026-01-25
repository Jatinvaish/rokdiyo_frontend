// lib/api/encryption.ts
// Fixed all TypeScript BufferSource type issues

export class EncryptionUtil {
  private static getKey(): ArrayBuffer {
    const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
      throw new Error("Invalid encryption key - must be 64 hex characters");
    }
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(key.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
  }

  static async encrypt(data: string): Promise<{ __payload: string; __checksum: string; __ts: number }> {
    const key = this.getKey();
    const ivArray = crypto.getRandomValues(new Uint8Array(16));
    const iv: BufferSource = ivArray.buffer; // Convert to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv, tagLength: 128 },
      cryptoKey,
      dataBytes
    );

    const encryptedArray = new Uint8Array(encrypted);
    const ciphertext = encryptedArray.slice(0, -16);
    const authTag = encryptedArray.slice(-16);

    const ivHex = Array.from(ivArray).map(b => b.toString(16).padStart(2, '0')).join('');
    const authTagHex = Array.from(authTag).map(b => b.toString(16).padStart(2, '0')).join('');
    const ciphertextHex = Array.from(ciphertext).map(b => b.toString(16).padStart(2, '0')).join('');

    const payload = `${ivHex}:${authTagHex}:${ciphertextHex}`;
    
    const checksumData = payload + process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(checksumData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      __payload: payload,
      __checksum: checksum,
      __ts: Date.now(),
    };
  }

  static async decrypt(encryptedData: { __payload: string; __checksum: string }): Promise<any> {
    const key = this.getKey();
    const encoder = new TextEncoder();
    
    // Verify checksum
    const checksumData = encryptedData.__payload + process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(checksumData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (calculatedChecksum !== encryptedData.__checksum) {
      throw new Error("Checksum verification failed");
    }

    const [ivHex, authTagHex, ciphertextHex] = encryptedData.__payload.split(":");
    
    const hexToBytes = (hex: string): Uint8Array => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    };

    const ivArray = hexToBytes(ivHex);
    const iv: any = ivArray.buffer; // Convert to ArrayBuffer
    const authTag = hexToBytes(authTagHex);
    const ciphertext = hexToBytes(ciphertextHex);

    // Combine ciphertext and authTag for Web Crypto API
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv, tagLength: 128 },
      cryptoKey,
      combined.buffer // Pass ArrayBuffer instead of Uint8Array
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    return JSON.parse(decryptedText);
  }
}