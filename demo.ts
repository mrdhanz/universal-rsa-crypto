import { UniversalRSA } from './src/index';

async function runDemo() {
  console.log("======================================");
  console.log("   Universal-RSA Library Demo");
  console.log("======================================\n");

  // --- Part 1: Key Generation & Export ---
  console.log("1. Generating a 2048-bit RSA key pair...");
  const keys = await UniversalRSA.generateKeys(2048);
  console.log("   ✅ Keys generated.\n");

  console.log("2. Exporting keys to Base64 strings for storage (e.g., in a .env file)...");
  const publicKeyB64 = UniversalRSA.exportKey(keys.publicKey);
  const privateKeyB64 = UniversalRSA.exportKey(keys.privateKey);
  console.log(`   PUBLIC_KEY_B64="${publicKeyB64}..."`);
  console.log(`   PRIVATE_KEY_B64="${privateKeyB64}..."\n`);

  // --- Part 2: Encryption ---
  console.log("3. Creating an encryption engine directly from the public key string...");
  const encryptionEngine = new UniversalRSA({ publicKey: publicKeyB64 });
  
  const mySecretData = {
    id: 12345,
    user: 'SundaPrabu',
    permissions: ['read', 'write'],
    message: 'Ieu téh pesen rusiah! ᮃᮚᮩᮔ ᮞᮓᮚ ᮃᮜ᮪ᮕᮘᮦᮒ ᮊᮒᮙ᮪ᮕᮤ!',
  };
  console.log("   Original Data:", mySecretData);
  
  const ciphertext = encryptionEngine.encrypt(mySecretData);
  console.log(`   ✅ Data encrypted.\n   Ciphertext: ${ciphertext.substring(0, 60)}...\n`);
  
  // --- Part 3: Decryption ---
  console.log("4. Creating a decryption engine directly from the private key string...");
  const decryptionEngine = new UniversalRSA({ privateKey: privateKeyB64 });
  
  const decryptedData = decryptionEngine.decrypt(ciphertext);
  console.log("   ✅ Data decrypted.\n   Decrypted Data:", decryptedData);
  
  // --- Part 4: Verification ---
  console.log("\n5. Verifying the result...");
  if (JSON.stringify(mySecretData) === JSON.stringify(decryptedData)) {
    console.log("   ✅ SUCCESS: The full cycle worked perfectly!");
  } else {
    console.log("   ❌ FAILURE: The decrypted data does not match the original.");
  }
  console.log("======================================\n");
}

runDemo().catch(console.error);