// Script de test rapide pour Evolution API
// Exécutez avec: node test-evolution.js

const axios = require('axios');

const EVOLUTION_API_URL = 'http://xamxam-evolution-evolution-api.usjniw.easypanel.host';
const EVOLUTION_API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function testEvolutionAPI() {
  console.log('🔍 Test de connexion à Evolution API...\n');

  // Test 1: Vérifier que l'API répond
  try {
    console.log('1️⃣ Test de connexion basique...');
    const response = await axios.get(`${EVOLUTION_API_URL}/`, {
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
      timeout: 10000,
    });
    console.log('✅ API accessible, statut:', response.status);
    console.log('📦 Réponse:', response.data);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return;
  }

  // Test 2: Créer une instance test
  try {
    console.log('\n2️⃣ Création d\'une instance test...');
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: 'test_instance_' + Date.now(),
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        timeout: 60000,
      }
    );
    console.log('✅ Instance créée avec succès!');
    console.log('📦 Réponse:', JSON.stringify(createResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    }
  }
}

testEvolutionAPI();
