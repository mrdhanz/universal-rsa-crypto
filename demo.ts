import { UniversalRSA } from './src/index';

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