# Universal RSA Crypto

[![NPM Version](https://img.shields.io/npm/v/universal-rsa-crypto.svg)](https://www.npmjs.com/package/universal-rsa-crypto)
![Unit Test](https://github.com/mrdhanz/universal-rsa-crypto/actions/workflows/node.js.yml/badge.svg)
[![codecov](https://codecov.io/gh/mrdhanz/universal-rsa-crypto/graph/badge.svg?token=1VX6757DYG)](https://codecov.io/gh/mrdhanz/universal-rsa-crypto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mrdhanz/universal-rsa-crypto/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmrdhanz%2Funiversal-rsa-crypto.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmrdhanz%2Funiversal-rsa-crypto?ref=badge_shield&issueType=license)

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
  
  // 🔒 Bob encrypts the entire payload using ALICE's PUBLIC key.
  // Now, only Alice can open it.
  const alicePublicEngine = new UniversalRSA({ publicKey: alicePublicKeyB64 });
  const ciphertext = alicePublicEngine.encrypt(message);
  
  console.log('Bob sends the encrypted and signed payload to Alice.');


  // === 3. SCENARIO: Alice receives and verifies the message ===

  // 🔓 Alice decrypts the payload with her OWN PRIVATE key.
  const alicePrivateEngine = new UniversalRSA({ privateKey: aliceKeys.privateKey });
  const receivedPayload = alicePrivateEngine.decrypt(ciphertext);

  console.log('Alice decrypted the payload:', receivedPayload);
  
  // ✅ Alice verifies the signature using BOB's PUBLIC key to confirm it's authentic.
  const bobPublicEngine = new UniversalRSA({ publicKey: bobPublicKeyB64 });
  const isAuthentic = bobPublicEngine.verify(
    receivedPayload,
    signature
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

## 📚 Documentation & Wiki

For more detailed documentation, tutorials, and security best practices, please visit our project Wiki.

*   ➡️ **[Core Concepts: Encryption vs. Signatures](https://github.com/mrdhanz/universal-rsa-crypto/wiki/Core-Concepts:-Encryption-vs.-Signatures)** — Learn when and why to use each cryptographic function.
*   ➡️ **[Workflow Diagrams](https://github.com/mrdhanz/universal-rsa-crypto/wiki/Workflow-Diagrams)** — Visualize the encryption and signing processes.
*   ➡️ **[Practical Use Cases & Recipes](https://github.com/mrdhanz/universal-rsa-crypto/wiki/Use-Cases-and-Recipes)** — See how to implement secure tokens, encrypt database fields, and more.
*   ➡️ **[Security Best Practices](https://github.com/mrdhanz/universal-rsa-crypto/wiki/Security-Best-Practices)** — Important considerations for key management and secure implementation.
*   ➡️ **[Detailed API Reference](https://github.com/mrdhanz/universal-rsa-crypto/wiki/API-Reference)** — An in-depth look at all classes, methods, and types.

---

## License

[MIT](LICENSE)
