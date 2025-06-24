# Universal RSA Crypto

[![NPM Version](https://img.shields.io/npm/v/universal-rsa-crypto.svg)](https://www.npmjs.com/package/universal-rsa-crypto)
![Unit Test](https://github.com/mrdhanz/universal-rsa-crypto/actions/workflows/node.js.yml/badge.svg)
[![codecov](https://codecov.io/gh/mrdhanz/universal-rsa-crypto/graph/badge.svg?token=1VX6757DYG)](https://codecov.io/gh/mrdhanz/universal-rsa-crypto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mrdhanz/universal-rsa-crypto/blob/master/LICENSE)

A simple, modern, and secure RSA library for Node.js that provides both **encryption** (for confidentiality) and **digital signatures** (for authenticity and integrity).

Built with TypeScript, it can handle any string or JSON data and provides easy-to-use key management for storage in `.env` files or configuration managers.

## Features

- **Class-Based:** Intuitive, object-oriented design.
- **Type-Safe:** Fully written in TypeScript with included type definitions.
- **Dual-Function:** Provides both encryption (RSA) and digital signatures (RSA-SHA256).
- **Universal Data Support:** Works with any string or JSON-serializable object.
- **Easy Key Management:** Generate, export, and import keys as Base64 strings, perfect for `.env` files.

## Installation

```bash
npm install universal-rsa-crypto
```

## Quick Start

This example demonstrates a complete, secure communication cycle between two parties, Alice and Bob.

```typescript
import { UniversalRSA } from 'universal-rsa-crypto';

async function main() {
  // === 1. SETUP: Key Generation ===
  // Alice and Bob both generate their own key pairs. They will share their public keys.
  const aliceKeys = await UniversalRSA.generateKeys();
  const bobKeys = await UniversalRSA.generateKeys();

  // For sharing/storage, they export their public keys to strings.
  const alicePublicKeyB64 = UniversalRSA.exportKey(aliceKeys.publicKey);
  const bobPublicKeyB64 = UniversalRSA.exportKey(bobKeys.publicKey);


  // === 2. SCENARIO: Bob sends a private, signed message to Alice ===

  const message = {
    from: 'Bob',
    to: 'Alice',
    content: 'The eagle has landed.',
    timestamp: new Date().toISOString(),
  };

  // ✍️ Bob signs the message with his OWN PRIVATE key to prove his identity.
  const bobEngine = new UniversalRSA({ privateKey: bobKeys.privateKey });
  const signature = bobEngine.sign(message);
  
  // 📦 Bob prepares a secure payload containing the data and his signature.
  const payload = { data: message, signature };
  
  // 🔒 Bob encrypts the entire payload using ALICE's PUBLIC key.
  // Now, only Alice can open it.
  const alicePublicEngine = new UniversalRSA({ publicKey: alicePublicKeyB64 });
  const ciphertext = alicePublicEngine.encrypt(payload);
  
  console.log('Bob sends the encrypted and signed payload to Alice.');


  // === 3. SCENARIO: Alice receives and verifies the message ===

  // 🔓 Alice decrypts the payload with her OWN PRIVATE key.
  const alicePrivateEngine = new UniversalRSA({ privateKey: aliceKeys.privateKey });
  const receivedPayload = alicePrivateEngine.decrypt(ciphertext);

  console.log('Alice decrypted the payload:', receivedPayload);
  
  // ✅ Alice verifies the signature using BOB's PUBLIC key to confirm it's authentic.
  const bobPublicEngine = new UniversalRSA({ publicKey: bobPublicKeyB64 });
  const isAuthentic = bobPublicEngine.verify(
    receivedPayload.data,
    receivedPayload.signature
  );
  
  console.log('Is the message authentic and untampered?', isAuthentic);
  
  if (isAuthentic) {
    console.log('✅ Success! The message is both confidential and authentic.');
  } else {
    console.log('❌ DANGER! The message could not be verified.');
  }
}

main();
```

---

## API Reference

### `new UniversalRSA(keys?)`

Creates a new RSA engine instance. The constructor is "smart" and can accept key objects or their Base64 string representations.

- `keys` (optional): `object`
  - `keys.publicKey` (optional): A `PublicKey` object or its Base64 `string` representation.
  - `keys.privateKey` (optional): A `PrivateKey` object or its Base64 `string` representation.

**Example:**
```typescript
// Initialize with a public key string from a .env file
const encryptionEngine = new UniversalRSA({ publicKey: process.env.PUBLIC_KEY });

// Initialize with a full key pair object
const fullEngine = new UniversalRSA(keys);
```

### Instance Methods

These methods require an engine to be instantiated with the appropriate key(s).

#### `encrypt(data: any): string`
Encrypts data using the instance's **public key**.
- **Throws**: If a public key is not loaded.

#### `decrypt(ciphertext: string): any`
Decrypts ciphertext using the instance's **private key**.
- **Throws**: If a private key is not loaded.

#### `sign(data: any): string`
Creates a digital signature (RSA-SHA256) using the instance's **private key**. This proves the data's origin and that it has not been tampered with.
- **Throws**: If a private key is not loaded.

#### `verify(data: any, signature: string): boolean`
Verifies a digital signature using the instance's **public key**.
- **Returns**: `true` if the signature is valid, `false` otherwise.
- **Throws**: If a public key is not loaded.

---

### Static Methods

These utility methods can be called directly on the `UniversalRSA` class without creating an instance.

#### `UniversalRSA.generateKeys(bitLength?): Promise<KeyPair>`
Generates a new RSA `PublicKey` and `PrivateKey` pair.
- **`bitLength`** (optional): The desired key security level in bits. Default is `2048`.

#### `UniversalRSA.exportKey(key): string`
Exports a `PublicKey` or `PrivateKey` object to a transport-safe Base64 string.

#### `UniversalRSA.importPublicKey(b64Key): PublicKey`
Imports a `PublicKey` from its Base64 string representation.

#### `UniversalRSA.importPrivateKey(b64Key): PrivateKey`
Imports a `PrivateKey` from its Base64 string representation.

---

## License

[MIT](LICENSE)