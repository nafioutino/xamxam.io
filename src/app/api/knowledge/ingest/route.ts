import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const shop = await prisma.shop.findUnique({ 
      where: { ownerId: user.id } 
    });
    
    if (!shop) {
      return new NextResponse('Shop not found', { status: 404 });
    }

    const { sourceType, sourceData, sourceTitle } = await request.json();

    // Validation des données requises
    if (!sourceType || !sourceData || !sourceTitle) {
      return new NextResponse('Missing required fields: sourceType, sourceData, sourceTitle', { status: 400 });
    }

    // Validation des types de source supportés
    const validSourceTypes = ['text', 'url'];
    if (!validSourceTypes.includes(sourceType)) {
      return new NextResponse(`Invalid sourceType. Must be one of: ${validSourceTypes.join(', ')}`, { status: 400 });
    }

    // Récupérer l'URL du webhook n8n depuis les variables d'environnement
    const n8nWebhookUrl = process.env.N8N_RAG_INGEST_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('[API KNOWLEDGE INGEST] N8N_RAG_INGEST_WEBHOOK_URL is not configured');
      return new NextResponse('Knowledge ingestion service is not configured', { status: 500 });
    }

    console.log('[API KNOWLEDGE INGEST] Processing request:', {
      shopId: shop.id,
      sourceType,
      sourceTitle,
      sourceDataLength: sourceData.length
    });

    // Préparer le payload pour n8n
    const n8nPayload = {
      shopId: shop.id,
      sourceType,
      sourceData,
      sourceTitle,
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    // Envoyer la demande à n8n (fire and forget)
    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'XAMXAM-Knowledge-Ingestion/1.0'
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!n8nResponse.ok) {
        console.error('[API KNOWLEDGE INGEST] n8n webhook failed:', {
          status: n8nResponse.status,
          statusText: n8nResponse.statusText
        });
        return new NextResponse('Knowledge ingestion service error', { status: 502 });
      }

      console.log('[API KNOWLEDGE INGEST] Successfully sent to n8n:', {
        shopId: shop.id,
        sourceType,
        sourceTitle
      });

    } catch (n8nError) {
      console.error('[API KNOWLEDGE INGEST] Failed to reach n8n webhook:', n8nError);
      return new NextResponse('Knowledge ingestion service unavailable', { status: 503 });
    }

    // Optionnel : Enregistrer une trace de la demande d'ingestion dans la DB
    try {
      await prisma.knowledgeIngestionLog.create({
        data: {
          shopId: shop.id,
          sourceType,
          sourceTitle,
          sourceDataHash: Buffer.from(sourceData).toString('base64').substring(0, 100), // Hash partiel pour traçabilité
          status: 'SENT_TO_N8N',
          createdAt: new Date(),
        }
      });
    } catch (logError) {
      // Si l'enregistrement du log échoue, on continue quand même
      console.warn('[API KNOWLEDGE INGEST] Failed to log ingestion request:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Knowledge ingestion process started successfully.',
      data: {
        sourceType,
        sourceTitle,
        status: 'processing'
      }
    });
    
  } catch (error) {
    console.error('[API KNOWLEDGE INGEST] Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
