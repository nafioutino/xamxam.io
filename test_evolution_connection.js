// Script de test pour vérifier la connexion à Evolution API
// Exécuter avec: node test_evolution_connection.js

const axios = require('axios');

// ⚠️ REMPLACEZ CES VALEURS PAR VOS VRAIES VALEURS
const EVOLUTION_API_URL = 'http://xamxam-evolution-evolution-api.usjniw.easypanel.host';
const EVOLUTION_API_KEY = '429683C4C977415CAAFCCE10F7D57E11'; // ⚠️ À REMPLACER

async function testEvolutionConnection() {
  console.log('🔍 Test de connexion à Evolution API...\n');
  console.log('URL:', EVOLUTION_API_URL);
  console.log('API Key (10 premiers chars):', EVOLUTION_API_KEY.substring(0, 10) + '...\n');

  try {
    // Test 1: Vérifier que l'API est accessible
    console.log('📡 Test 1: Ping de l\'API...');
    const pingResponse = await axios.get(EVOLUTION_API_URL, {
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
      timeout: 10000,
    });
    console.log('✅ API accessible!');
    console.log('Réponse:', pingResponse.data);
    console.log('');

    // Test 2: Lister les instances existantes
    console.log('📋 Test 2: Liste des instances...');
    const instancesResponse = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
      timeout: 10000,
    });
    console.log('✅ Instances récupérées!');
    console.log('Nombre d\'instances:', instancesResponse.data?.length || 0);
    if (instancesResponse.data?.length > 0) {
      console.log('Instances:', instancesResponse.data.map(i => i.instance?.instanceName || i.instanceName));
    }
    console.log('');

    // Test 3: Créer une instance de test
    console.log('🚀 Test 3: Création d\'une instance de test...');
    const testInstanceName = `test_${Date.now()}`;
    const createResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: testInstanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        timeout: 30000,
      }
    );
    console.log('✅ Instance créée avec succès!');
    console.log('Réponse:', createResponse.data);
    console.log('');

    // Test 4: Supprimer l'instance de test
    console.log('🗑️  Test 4: Suppression de l\'instance de test...');
    await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${testInstanceName}`, {
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
      timeout: 10000,
    });
    console.log('✅ Instance supprimée!');
    console.log('');

    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('✅ Votre configuration Evolution API est correcte.');
    console.log('');
    console.log('📝 Vérifiez que ces valeurs sont dans votre .env:');
    console.log(`EVOLUTION_API_URL="${EVOLUTION_API_URL}"`);
    console.log(`EVOLUTION_API_KEY="${EVOLUTION_API_KEY}"`);

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    
    if (error.response) {
      console.error('');
      console.error('📊 Détails de l\'erreur:');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
      console.error('');
      
      if (error.response.status === 401) {
        console.error('🔐 PROBLÈME D\'AUTHENTIFICATION!');
        console.error('');
        console.error('Solutions possibles:');
        console.error('1. Vérifiez que votre EVOLUTION_API_KEY est correcte');
        console.error('2. Vérifiez que l\'API Key n\'a pas expiré');
        console.error('3. Vérifiez que vous utilisez la bonne API Key pour ce serveur');
        console.error('4. Connectez-vous à votre panel Evolution API et régénérez une nouvelle clé');
      } else if (error.response.status === 404) {
        console.error('🔍 ENDPOINT NON TROUVÉ!');
        console.error('Vérifiez que l\'URL de l\'API est correcte');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('🔌 CONNEXION REFUSÉE!');
      console.error('Le serveur Evolution API n\'est pas accessible.');
      console.error('Vérifiez que:');
      console.error('1. L\'URL est correcte');
      console.error('2. Le serveur est en ligne');
      console.error('3. Il n\'y a pas de firewall bloquant la connexion');
    } else if (error.code === 'ENOTFOUND') {
      console.error('');
      console.error('🌐 DOMAINE NON TROUVÉ!');
      console.error('L\'URL du serveur Evolution API est incorrecte ou le serveur n\'existe pas.');
    }
  }
}

// Exécuter le test
testEvolutionConnection();
