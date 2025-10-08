const crypto = require('crypto');

// Données des logs
const receivedSignature = 'sha256=c4e75380fe9b9f61203a9c1d4497215286e9c2e6ee1ad283786da90f232c8640';
const bodyLength = 396;

// Simuler différents payloads possibles
const testPayloads = [
  '{"object":"instagram","entry":[{"id":"123456789","time":1728426483,"messaging":[{"sender":{"id":"user123"},"recipient":{"id":"page123"},"timestamp":1728426483,"message":{"mid":"message123","text":"Hello"}}]}]}',
  // Payload avec caractères spéciaux
  '{"object":"instagram","entry":[{"id":"123456789","time":1728426483,"messaging":[{"sender":{"id":"user123"},"recipient":{"id":"page123"},"timestamp":1728426483,"message":{"mid":"message123","text":"Héllo wörld 🌍"}}]}]}',
  // Payload avec échappement JSON
  '{"object":"instagram","entry":[{"id":"123456789","time":1728426483,"messaging":[{"sender":{"id":"user123"},"recipient":{"id":"page123"},"timestamp":1728426483,"message":{"mid":"message123","text":"Hello\\nWorld"}}]}]}'
];

// Secrets à tester (remplacez par vos vrais secrets)
const testSecrets = [
  '8c6f3ba5...', // Le secret actuel (tronqué dans les logs)
  'votre_facebook_app_secret_complet',
  'votre_instagram_app_secret_si_different'
];

console.log('🔍 Test de signature Instagram Webhook\n');
console.log(`Signature reçue: ${receivedSignature}`);
console.log(`Longueur du body: ${bodyLength}\n`);

function testSignature(payload, secret, secretName) {
  const calculatedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')}`;
  
  const match = calculatedSignature === receivedSignature;
  
  console.log(`📝 Test avec ${secretName}:`);
  console.log(`   Payload length: ${payload.length}`);
  console.log(`   Calculée: ${calculatedSignature}`);
  console.log(`   Match: ${match ? '✅ OUI' : '❌ NON'}\n`);
  
  return match;
}

// Tester avec différents payloads et secrets
testPayloads.forEach((payload, i) => {
  console.log(`\n🧪 Test Payload ${i + 1}:`);
  testSecrets.forEach((secret, j) => {
    if (secret.includes('...')) {
      console.log(`⚠️  Secret ${j + 1} tronqué - remplacez par le vrai secret`);
      return;
    }
    testSignature(payload, secret, `Secret ${j + 1}`);
  });
});

console.log('\n💡 Instructions:');
console.log('1. Remplacez les secrets de test par vos vrais App Secrets');
console.log('2. Ajustez les payloads de test si nécessaire');
console.log('3. Lancez: node test_signature_manual.js');
console.log('4. Cherchez le ✅ OUI pour identifier le bon secret/payload');