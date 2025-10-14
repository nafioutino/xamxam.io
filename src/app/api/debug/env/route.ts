import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    evolutionApiUrl: process.env.EVOLUTION_API_URL ? 'SET' : 'NOT SET',
    evolutionApiKey: process.env.EVOLUTION_API_KEY ? 'SET' : 'NOT SET',
    webhookUrl: process.env.WEBHOOK_GLOBAL_URL ? 'SET' : 'NOT SET',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
