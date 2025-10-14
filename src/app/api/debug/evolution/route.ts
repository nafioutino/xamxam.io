import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionApiUrl || !evolutionApiKey) {
    return NextResponse.json({
      success: false,
      error: 'Evolution API not configured',
      details: {
        urlSet: !!evolutionApiUrl,
        keySet: !!evolutionApiKey,
      }
    }, { status: 500 });
  }

  const results: any = {
    config: {
      url: evolutionApiUrl,
      keyLength: evolutionApiKey.length,
      keyPreview: evolutionApiKey.substring(0, 10) + '...',
    },
    tests: []
  };

  // Test 1: Ping de l'API
  try {
    console.log('Testing Evolution API ping...');
    const pingResponse = await axios.get(evolutionApiUrl, {
      headers: {
        'apikey': evolutionApiKey,
      },
      timeout: 10000,
    });
    
    results.tests.push({
      name: 'API Ping',
      success: true,
      status: pingResponse.status,
      data: pingResponse.data,
    });
  } catch (error: any) {
    results.tests.push({
      name: 'API Ping',
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }

  // Test 2: Lister les instances
  try {
    console.log('Testing Evolution API fetchInstances...');
    const instancesResponse = await axios.get(`${evolutionApiUrl}/instance/fetchInstances`, {
      headers: {
        'apikey': evolutionApiKey,
      },
      timeout: 10000,
    });
    
    results.tests.push({
      name: 'Fetch Instances',
      success: true,
      status: instancesResponse.status,
      instanceCount: instancesResponse.data?.length || 0,
      instances: instancesResponse.data?.map((i: any) => i.instance?.instanceName || i.instanceName) || [],
    });
  } catch (error: any) {
    results.tests.push({
      name: 'Fetch Instances',
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }

  // Test 3: Tester l'authentification avec une requête simple
  try {
    console.log('Testing Evolution API authentication...');
    const authTestResponse = await axios.get(`${evolutionApiUrl}/instance/fetchInstances`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });
    
    if (authTestResponse.status === 401) {
      results.tests.push({
        name: 'Authentication Test',
        success: false,
        error: 'Authentication failed - API Key is invalid',
        status: 401,
        recommendation: 'Vérifiez votre EVOLUTION_API_KEY dans les variables d\'environnement',
      });
    } else {
      results.tests.push({
        name: 'Authentication Test',
        success: true,
        status: authTestResponse.status,
        message: 'Authentication successful',
      });
    }
  } catch (error: any) {
    results.tests.push({
      name: 'Authentication Test',
      success: false,
      error: error.message,
      status: error.response?.status,
    });
  }

  // Résumé
  const successCount = results.tests.filter((t: any) => t.success).length;
  const totalTests = results.tests.length;
  
  results.summary = {
    total: totalTests,
    passed: successCount,
    failed: totalTests - successCount,
    allPassed: successCount === totalTests,
  };

  return NextResponse.json(results);
}
