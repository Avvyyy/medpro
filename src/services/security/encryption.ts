// Data encryption service for sensitive healthcare data

export class EncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;
  private readonly ivLength = 12;
  private readonly tagLength = 16;

  // Generate a new encryption key
  public async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt sensitive data
  public async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return this.arrayBufferToBase64(combined);
  }

  // Decrypt sensitive data
  public async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedData);
    
    const iv = combined.slice(0, this.ivLength);
    const encrypted = combined.slice(this.ivLength);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  // Hash sensitive data (one-way)
  public async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToHex(hashBuffer);
  }

  // Generate secure random token
  public generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToHex(array);
  }

  // Encrypt PII data for storage
  public async encryptPII(data: {
    ssn?: string;
    medicalRecordNumber?: string;
    insuranceNumber?: string;
    [key: string]: any;
  }): Promise<{ encrypted: any; keyId: string }> {
    const key = await this.generateKey();
    const keyId = this.generateSecureToken(16);
    
    const encrypted: any = { ...data };
    
    // Encrypt sensitive fields
    const sensitiveFields = ['ssn', 'medicalRecordNumber', 'insuranceNumber'];
    
    for (const field of sensitiveFields) {
      if (data[field]) {
        encrypted[field] = await this.encrypt(data[field], key);
      }
    }

    // Store key securely (in production, use a key management service)
    await this.storeKey(keyId, key);

    return { encrypted, keyId };
  }

  // Decrypt PII data
  public async decryptPII(encryptedData: any, keyId: string): Promise<any> {
    const key = await this.retrieveKey(keyId);
    if (!key) {
      throw new Error('Encryption key not found');
    }

    const decrypted = { ...encryptedData };
    const sensitiveFields = ['ssn', 'medicalRecordNumber', 'insuranceNumber'];
    
    for (const field of sensitiveFields) {
      if (encryptedData[field]) {
        try {
          decrypted[field] = await this.decrypt(encryptedData[field], key);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          decrypted[field] = '[ENCRYPTED]';
        }
      }
    }

    return decrypted;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private async storeKey(keyId: string, key: CryptoKey): Promise<void> {
    // In production, use a secure key management service (AWS KMS, Azure Key Vault, etc.)
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(`key_${keyId}`, JSON.stringify(exportedKey));
  }

  private async retrieveKey(keyId: string): Promise<CryptoKey | null> {
    try {
      const exportedKey = localStorage.getItem(`key_${keyId}`);
      if (!exportedKey) return null;

      return await crypto.subtle.importKey(
        'jwk',
        JSON.parse(exportedKey),
        { name: this.algorithm },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }
}

export const encryptionService = new EncryptionService();