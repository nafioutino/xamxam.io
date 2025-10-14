import { NextResponse } from 'next/server';

export async function GET() {
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  
  return NextResponse.json({
    evolutionApiUrl: evolutionApiUrl ? evolutionApiUrl : 'NOT SET',
    evolutionApiUrlLength: evolutionApiUrl?.length || 0,
    evolutionApiKey: evolutionApiKey ? 'SET' : 'NOT SET',
    evolutionApiKeyLength: evolutionApiKey?.length || 0,
    evolutionApiKeyPreview: evolutionApiKey ? evolutionApiKey.substring(0, 10) + '...' : 'NOT SET',
    webhookUrl: process.env.WEBHOOK_GLOBAL_URL ? 'SET' : 'NOT SET',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
