import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const evolutionApiUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const webhookUrl = process.env.WEBHOOK_GLOBAL_URL;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const config = {
      evolutionApiUrl: evolutionApiUrl || 'NOT SET',
      evolutionApiUrlSet: !!evolutionApiUrl,
      evolutionApiKeySet: !!evolutionApiKey,
      evolutionApiKeyLength: evolutionApiKey?.length || 0,
      webhookUrl: webhookUrl || 'NOT SET',
      baseUrl: baseUrl || 'NOT SET',
    };

    console.log('Evolution API Configuration Check:', config);

    // Test de connexion à Evolution API
    if (evolutionApiUrl && evolutionApiKey) {
      try {
        const testResponse = await axios.get(`${evolutionApiUrl}/`, {
          headers: {
            'apikey': evolutionApiKey,
          },
          timeout: 10000,
        });

        return NextResponse.json({
          status: 'success',
          message: 'Evolution API is reachable',
          config: {
            ...config,
            evolutionApiKey: 'SET (hidden for security)',
          },
          testConnection: {
            success: true,
            status: testResponse.status,
            data: testResponse.data,
          },
        });
      } catch (error: any) {
        return NextResponse.json({
          status: 'error',
          message: 'Evolution API is NOT reachable',
          config: {
            ...config,
            evolutionApiKey: 'SET (hidden for security)',
          },
          testConnection: {
            success: false,
            error: error.message,
            code: error.code,
            response: error.response?.data,
          },
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: 'error',
      message: 'Evolution API not configured',
      config,
    }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
