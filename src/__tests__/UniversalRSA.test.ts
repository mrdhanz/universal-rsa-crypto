// src/__tests__/UniversalRSA.test.ts
import { UniversalRSA, KeyPair } from '../index';

describe('UniversalRSA', () => {
  let keys: KeyPair;

  // Generate a key pair before any tests run.
  beforeAll(async () => {
    keys = await UniversalRSA.generateKeys(2048);
  });

  describe('Key Management', () => {
    it('should generate a valid key pair', () => {
      expect(keys).toBeDefined();
      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      
      // Check public key properties
      expect(typeof keys.publicKey.e).toBe('bigint');
      expect(typeof keys.publicKey.n).toBe('bigint');
      
      // Check private key properties
      expect(typeof keys.privateKey.d).toBe('bigint');
      expect(typeof keys.privateKey.n).toBe('bigint');
      
      // The modulus 'n' must match in both keys
      expect(keys.publicKey.n).toEqual(keys.privateKey.n);
    });

    it('should export and import a public key correctly', () => {
      const exportedKey = UniversalRSA.exportKey(keys.publicKey);
      expect(typeof exportedKey).toBe('string');
      expect(exportedKey.length).toBeGreaterThan(0);

      const importedKey = UniversalRSA.importPublicKey(exportedKey);
      expect(importedKey).toEqual(keys.publicKey);
    });

    it('should export and import a private key correctly', () => {
      const exportedKey = UniversalRSA.exportKey(keys.privateKey);
      expect(typeof exportedKey).toBe('string');
      expect(exportedKey.length).toBeGreaterThan(0);

      const importedKey = UniversalRSA.importPrivateKey(exportedKey);
      expect(importedKey).toEqual(keys.privateKey);
    });
  });

  describe('Constructor', () => {
    it('should initialize with key objects', () => {
      const rsa = new UniversalRSA({
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
      });
      // @ts-ignore - Accessing private properties for testing
      expect(rsa.publicKey).toEqual(keys.publicKey);
      // @ts-ignore
      expect(rsa.privateKey).toEqual(keys.privateKey);
    });

    it('should initialize with key strings', () => {
      const publicKeyB64 = UniversalRSA.exportKey(keys.publicKey);
      const privateKeyB64 = UniversalRSA.exportKey(keys.privateKey);

      const rsa = new UniversalRSA({
        publicKey: publicKeyB64,
        privateKey: privateKeyB64,
      });
      // @ts-ignore
      expect(rsa.publicKey).toEqual(keys.publicKey);
      // @ts-ignore
      expect(rsa.privateKey).toEqual(keys.privateKey);
    });
    
    it('should initialize with only a public key', () => {
        const rsa = new UniversalRSA({ publicKey: keys.publicKey });
        // @ts-ignore
        expect(rsa.publicKey).toBeDefined();
        // @ts-ignore
        expect(rsa.privateKey).toBeNull();
    });
  });

  describe('Encryption & Decryption Cycle', () => {
    const testCases = [
      {
        name: 'a simple string',
        data: 'Hello, World! This is a secret message.',
      },
      {
        name: 'a string with international characters and emojis',
        data: 'Ieu pesen rusiah: ᮃᮚᮩᮔ ᮞᮓᮚ! 👍🚀',
      },
      {
        name: 'a complex JSON object',
        data: {
          id: 12345,
          user: 'SundaPrabu',
          active: true,
          roles: ['admin', 'editor'],
          metadata: {
            createdAt: new Date().toISOString(),
            tags: null,
          },
        },
      },
      {
        name: 'an empty string',
        data: '',
      },
      {
        name: 'an empty JSON object',
        data: {},
      },
    ];

    for (const testCase of testCases) {
      it(`should correctly encrypt and decrypt ${testCase.name}`, () => {
        const engine = new UniversalRSA({ publicKey: keys.publicKey, privateKey: keys.privateKey });

        const ciphertext = engine.encrypt(testCase.data);
        expect(typeof ciphertext).toBe('string');
        expect(ciphertext.length).toBeGreaterThan(0);

        const decryptedData = engine.decrypt(ciphertext);

        // Use toEqual for deep object comparison
        expect(decryptedData).toEqual(testCase.data);
      });
    }
  });
  
  describe('Error Handling', () => {
      it('should throw an error when trying to encrypt without a public key', () => {
          const rsa = new UniversalRSA({ privateKey: keys.privateKey });
          expect(() => rsa.encrypt('test')).toThrow('A public key is not loaded in this UniversalRSA instance.');
      });

      it('should throw an error when trying to decrypt without a private key', () => {
          const rsa = new UniversalRSA({ publicKey: keys.publicKey });
          const ciphertext = rsa.encrypt('test');
          
          const decryptionEngineWithoutKey = new UniversalRSA();
          expect(() => decryptionEngineWithoutKey.decrypt(ciphertext)).toThrow('A private key is not loaded in this UniversalRSA instance.');
      });
  });

  describe('Digital Signatures', () => {
    const dataToSign = { message: "This data must not be tampered with." };
    let signature: string;
    let signingEngine: UniversalRSA;

    beforeAll(() => {
        signingEngine = new UniversalRSA({ privateKey: keys.privateKey });
        signature = signingEngine.sign(dataToSign);
    });
    
    it('should create a valid signature', () => {
        expect(typeof signature).toBe('string');
        expect(signature.length).toBeGreaterThan(0);
    });

    it('should successfully verify a valid signature with the correct data', () => {
        const verificationEngine = new UniversalRSA({ publicKey: keys.publicKey });
        const isValid = verificationEngine.verify(dataToSign, signature);
        expect(isValid).toBe(true);
    });

    it('should fail to verify with tampered data', () => {
        const verificationEngine = new UniversalRSA({ publicKey: keys.publicKey });
        const tamperedData = { message: "This data has been tampered with!" };
        const isValid = verificationEngine.verify(tamperedData, signature);
        expect(isValid).toBe(false);
    });

    it('should fail to verify with a tampered signature', () => {
        const verificationEngine = new UniversalRSA({ publicKey: keys.publicKey });
        const firstChar = signature.charAt(0);
        const replacementChar = firstChar === 'A' ? 'B' : 'A';
        const tamperedSignature = replacementChar + signature.slice(1);

        const isValid = verificationEngine.verify(dataToSign, tamperedSignature);
        expect(isValid).toBe(false);
    });

    it('should fail to verify a malformed signature string', () => {
        const verificationEngine = new UniversalRSA({ publicKey: keys.publicKey });
        const isValid = verificationEngine.verify(dataToSign, 'this is not a valid base64 string');
        expect(isValid).toBe(false);
    });
    
    it('should throw an error when signing without a private key', () => {
        const rsa = new UniversalRSA({ publicKey: keys.publicKey });
        expect(() => rsa.sign('test')).toThrow('A private key is not loaded. Signing requires a private key.');
    });

    it('should throw an error when verifying without a public key', () => {
        const rsa = new UniversalRSA({ privateKey: keys.privateKey });
        expect(() => rsa.verify('test', 'sig')).toThrow('A public key is not loaded. Verification requires a public key.');
    });
  });
});