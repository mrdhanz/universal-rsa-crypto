import { UniversalRSA } from './src/index';

async function runDemo() { console.log("======================================");
  console.log("   Universal-RSA Library Demo");
  console.log("   (Encryption & Digital Signatures)");
  console.log("======================================\n");

  // --- Setup: Generate keys for Alice and Bob ---
  const aliceKeys = await UniversalRSA.generateKeys(2048);
  const bobKeys = await UniversalRSA.generateKeys(2048);

  // --- Scenario 1: Confidentiality (Encryption) ---
  console.log("--- SCENARIO 1: Bob sends a confidential message to Alice ---\n");
  const confidentialMessage = { secret: "Meet at the usual place." };
  
  // Bob needs Alice's PUBLIC key to encrypt for her.
  const bobEncryptionEngine = new UniversalRSA({ publicKey: aliceKeys.publicKey });
  const ciphertext = bobEncryptionEngine.encrypt(confidentialMessage);
  console.log("Bob encrypts a message for Alice.");
  
  // Alice uses her PRIVATE key to decrypt.
  const aliceDecryptionEngine = new UniversalRSA({ privateKey: aliceKeys.privateKey });
  const decryptedMessage = aliceDecryptionEngine.decrypt(ciphertext);
  console.log("Alice decrypts the message:", decryptedMessage);
  console.assert(JSON.stringify(confidentialMessage) === JSON.stringify(decryptedMessage));
  console.log("✅ Confidentiality test passed.\n");


  // --- Scenario 2: Authenticity (Digital Signature) ---
  console.log("--- SCENARIO 2: Alice sends an official, signed announcement ---\n");
  const announcement = {
    from: "Alice",
    documentId: "doc-001",
    content: "All meetings are cancelled until further notice.",
    timestamp: new Date().toISOString()
  };

  // Alice uses her OWN PRIVATE key to sign the announcement.
  const aliceSigningEngine = new UniversalRSA({ privateKey: aliceKeys.privateKey });
  const signature = aliceSigningEngine.sign(announcement);
  console.log("Alice signs the announcement with her private key.");

  // The announcement and the signature are sent to Bob (they don't need to be encrypted).
  console.log("The public announcement is sent along with its signature.\n");

  // Bob uses Alice's PUBLIC key to verify the signature.
  const bobVerificationEngine = new UniversalRSA({ publicKey: aliceKeys.publicKey });
  
  // Test 1: Verification with correct data
  const isAuthentic = bobVerificationEngine.verify(announcement, signature);
  console.log("Bob verifies the original announcement...");
  console.log("Is the signature authentic?", isAuthentic);
  console.assert(isAuthentic);
  console.log("✅ Authenticity test passed.\n");
  
  // Test 2: A malicious actor (Eve) tries to change the message
  const tamperedAnnouncement = { ...announcement, content: "All meetings are now mandatory." };
  const isTamperedAuthentic = bobVerificationEngine.verify(tamperedAnnouncement, signature);
  console.log("Eve tampers with the message and Bob re-verifies...");
  console.log("Is the tampered signature authentic?", isTamperedAuthentic);
  console.assert(!isTamperedAuthentic);
  console.log("✅ Tampering detection test passed.\n");
  
  console.log("======================================");
}

runDemo().catch(console.error);