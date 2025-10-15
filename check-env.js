// Script pour vérifier les variables d'environnement
// Exécuter avec: node check-env.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification des variables d\'environnement...\n');

const requiredVars = {
  'EVOLUTION_API_URL': process.env.EVOLUTION_API_URL,
  'EVOLUTION_API_KEY': process.env.EVOLUTION_API_KEY,
  'NEXT_PUBLIC_BASE_URL': process.env.NEXT_PUBLIC_BASE_URL,
};

let allSet = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allSet = false;
  }
}

console.log('');

if (allSet) {
  console.log('🎉 Toutes les variables sont configurées !');
  console.log('');
  console.log('📝 Prochaines étapes:');
  console.log('1. Arrêtez le serveur Next.js (Ctrl+C)');
  console.log('2. Relancez avec: npm run dev');
  console.log('3. Testez la connexion WhatsApp');
} else {
  console.log('⚠️  Certaines variables manquent !');
  console.log('');
  console.log('📝 Actions à faire:');
  console.log('1. Créez un fichier .env.local à la racine du projet');
  console.log('2. Copiez le contenu de .env.local.example');
  console.log('3. Remplissez vos vraies valeurs');
  console.log('4. Relancez ce script pour vérifier');
}
