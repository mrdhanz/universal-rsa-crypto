import bcu from 'bigint-crypto-utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PublicKey {
  e: bigint;
  n: bigint;
}

export interface PrivateKey {
  d: bigint;
  n: bigint;
}

export interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

type StringifiedKey<T> = {
  [K in keyof T]: string;
};

// ============================================================================
// THE UNIVERSAL RSA CLASS
// ============================================================================

export class UniversalRSA {
  private readonly publicKey: PublicKey | null = null;
  private readonly privateKey: PrivateKey | null = null;

  /**
   * Creates an instance of the UniversalRSA engine.
   * The constructor can be initialized with key objects or their Base64 string representations.
   * @param keys - Optional. A KeyPair or a single key to initialize the engine with.
   */
  constructor(keys?: {
    publicKey?: PublicKey | string;
    privateKey?: PrivateKey | string;
  }) {
    if (keys?.publicKey) {
      this.publicKey = typeof keys.publicKey === 'string'
        ? UniversalRSA.importPublicKey(keys.publicKey)
        : keys.publicKey;
    }
    
    if (keys?.privateKey) {
      this.privateKey = typeof keys.privateKey === 'string'
        ? UniversalRSA.importPrivateKey(keys.privateKey)
        : keys.privateKey;
    }
  }

  // --- INSTANCE METHODS ---

  public encrypt(data: any): string {
    if (!this.publicKey) {
      throw new Error("A public key is not loaded in this UniversalRSA instance.");
    }
    const messageBigInt = dataToBigInt(data);
    if (messageBigInt >= this.publicKey.n) {
      throw new Error("Data is too large for the given key size.");
    }
    const encryptedBigInt = bcu.modPow(messageBigInt, this.publicKey.e, this.publicKey.n);
    return bigIntToBase64(encryptedBigInt);
  }

  public decrypt(ciphertextBase64: string): any {
    if (!this.privateKey) {
      throw new Error("A private key is not loaded in this UniversalRSA instance.");
    }
    const encryptedBigInt = base64ToBigInt(ciphertextBase64);
    const decryptedBigInt = bcu.modPow(encryptedBigInt, this.privateKey.d, this.privateKey.n);
    return bigIntToData(decryptedBigInt);
  }

  // --- STATIC METHODS ---

  public static async generateKeys(bitLength: number = 2048): Promise<KeyPair> {
    const e = 65537n;
    let p: bigint, q: bigint, n: bigint, phi: bigint;
    do {
      p = await bcu.prime(bitLength / 2);
      q = await bcu.prime(bitLength / 2);
      n = p * q;
      phi = (p - 1n) * (q - 1n);
    } while (p === q || bcu.gcd(e, phi) !== 1n);
    const d = bcu.modInv(e, phi);
    return { publicKey: { e, n }, privateKey: { d, n } };
  }

  public static exportKey(key: PublicKey | PrivateKey): string {
    const stringifiedKey: any = {};
    for (const [k, v] of Object.entries(key)) {
        stringifiedKey[k] = v.toString();
    }
    const jsonString = JSON.stringify(stringifiedKey);
    return Buffer.from(jsonString).toString('base64');
  }

  public static importPublicKey(b64Key: string): PublicKey {
    const jsonString = Buffer.from(b64Key, 'base64').toString('utf8');
    const stringifiedKey: StringifiedKey<PublicKey> = JSON.parse(jsonString);
    return { e: BigInt(stringifiedKey.e), n: BigInt(stringifiedKey.n) };
  }

  public static importPrivateKey(b64Key: string): PrivateKey {
    const jsonString = Buffer.from(b64Key, 'base64').toString('utf8');
    const stringifiedKey: StringifiedKey<PrivateKey> = JSON.parse(jsonString);
    return { d: BigInt(stringifiedKey.d), n: BigInt(stringifiedKey.n) };
  }
}

// --- INTERNAL HELPER FUNCTIONS ---

function dataToBigInt(data: any): bigint {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  const buffer = Buffer.from(dataString, 'utf8');
  const hex = buffer.toString('hex');
  return hex.length > 0 ? BigInt('0x' + hex) : 0n;
}

function bigIntToData(bigIntValue: bigint): any {
  // Add a guard clause to handle the empty string edge case correctly.
  if (bigIntValue === 0n) {
    return '';
  }

  const hex = bigIntValue.toString(16);
  // Pad with a leading zero if the hex string has an odd length
  const paddedHex = hex.length % 2 !== 0 ? '0' + hex : hex;
  const buffer = Buffer.from(paddedHex, 'hex');
  const dataString = buffer.toString('utf8');
  try {
    return JSON.parse(dataString);
  } catch (e) {
    return dataString;
  }
}

function bigIntToBase64(bigintValue: bigint): string {
    const hex = bigintValue.toString(16);
    const paddedHex = hex.length % 2 !== 0 ? '0' + hex : hex;
    return Buffer.from(paddedHex, 'hex').toString('base64');
}

function base64ToBigInt(base64String: string): bigint {
    const buffer = Buffer.from(base64String, 'base64');
    const hex = buffer.toString('hex');
    return hex.length > 0 ? BigInt('0x' + hex) : 0n;
}