# Universal RSA Crypto

[![NPM Version](https://img.shields.io/npm/v/universal-rsa-crypto.svg)](https://www.npmjs.com/package/universal-rsa-crypto)
![Unit Test](https://github.com/mrdhanz/universal-rsa-crypto/actions/workflows/node.js.yml/badge.svg)
[![codecov](https://codecov.io/gh/mrdhanz/universal-rsa-crypto/branch/master/graph/badge.svg)](https://codecov.io/gh/mrdhanz/universal-rsa-crypto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mrdhanz/universal-rsa-crypto/blob/master/LICENSE)

A simple, modern, and secure RSA encryption library for Node.js, written in TypeScript. It can encrypt any string or JSON data and provides easy-to-use key management for storage in `.env` files or configuration managers.

## Features

- **Class-Based:** Intuitive, object-oriented design.
- **Type-Safe:** Fully written in TypeScript with included type definitions.
- **Universal Data Support:** Encrypts any string or JSON-serializable object.
- **Easy Key Management:** Generate, export, and import keys as Base64 strings, perfect for `.env` files.
- **Secure:** Built on the standard RSA algorithm using large prime numbers.

## Installation

```bash
npm install universal-rsa-crypto
```

## Usage

Here's a complete example of generating keys, storing them, and performing an encryption/decryption cycle.

```typescript
import { UniversalRSA } from 'universal-rsa-crypto';

async function main() {
  // 1. Generate keys once and store them securely
  const keys = await UniversalRSA.generateKeys();
  const publicKeyB64 = UniversalRSA.exportKey(keys.publicKey);
  const privateKeyB64 = UniversalRSA.exportKey(keys.privateKey);

  // In your app, you would save these strings to a .env file or secrets manager
  // For example: PUBLIC_KEY=publicKeyB64
  //            PRIVATE_KEY=privateKeyB64
  console.log('Public Key (for sharing):', publicKeyB64);
  console.log('Private Key (keep secret!):', privateKeyB64);

  // 2. Encrypt data using the public key
  // Create an engine by passing the public key string directly to the constructor
  const encryptionEngine = new UniversalRSA({ publicKey: publicKeyB64 });

  const myData = {
    message: 'This is a secret!',
    user: 'Alice'
  };

  const ciphertext = encryptionEngine.encrypt(myData);
  console.log('Ciphertext:', ciphertext);

  // 3. Decrypt data using the private key
  // Create an engine by passing the private key string directly to the constructor
  const decryptionEngine = new UniversalRSA({ privateKey: privateKeyB64 });

  const decryptedData = decryptionEngine.decrypt(ciphertext);
  console.log('Decrypted Data:', decryptedData);

  // Verification
  console.assert(JSON.stringify(myData) === JSON.stringify(decryptedData));
}

main();
```

## API

### `new UniversalRSA(keys?)`
Creates a new RSA engine instance. The constructor is "smart" and can accept key objects or their Base64 string representations.

- `keys.publicKey` (optional): `PublicKey` object or `string`
- `keys.privateKey` (optional): `PrivateKey` object or `string`

### Instance Methods

- `encrypt(data: any): string`: Encrypts data using the instance's public key.
- `decrypt(ciphertext: string): any`: Decrypts ciphertext using the instance's private key.

### Static Methods

- `UniversalRSA.generateKeys(bitLength?): Promise<KeyPair>`: Generates a new `PublicKey` and `PrivateKey` pair.
- `UniversalRSA.exportKey(key): string`: Exports a `PublicKey` or `PrivateKey` object to a Base64 string.
- `UniversalRSA.importPublicKey(b64Key): PublicKey`: Imports a `PublicKey` from a Base64 string.
- `UniversalRSA.importPrivateKey(b64Key): PrivateKey`: Imports a `PrivateKey` from a Base64 string.

## License

[MIT](LICENSE)