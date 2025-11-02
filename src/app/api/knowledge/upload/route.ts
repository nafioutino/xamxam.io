import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
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

    // Récupérer le fichier depuis FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validation du fichier
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return new NextResponse('File too large. Maximum size is 10MB.', { status: 400 });
    }

    // Types de fichiers supportés
    const supportedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ];

    if (!supportedTypes.includes(file.type)) {
      return new NextResponse('Unsupported file type. Supported types: PDF, TXT, DOC, DOCX, CSV, JSON', { status: 400 });
    }

    console.log('[API KNOWLEDGE UPLOAD] Processing file:', {
      shopId: shop.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Créer un client Supabase avec la clé de service pour l'upload
    const supabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `knowledge/${shop.id}/${timestamp}_${sanitizedFileName}`;

    // Upload du fichier sur Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('knowledge-sources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[API KNOWLEDGE UPLOAD] Supabase upload failed:', uploadError);
      return new NextResponse(`File upload failed: ${uploadError.message}`, { status: 500 });
    }

    // Obtenir l'URL publique du fichier
    const { data: { publicUrl } } = supabaseClient.storage
      .from('knowledge-sources')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      console.error('[API KNOWLEDGE UPLOAD] Failed to get public URL');
      return new NextResponse('Failed to get file public URL', { status: 500 });
    }

    console.log('[API KNOWLEDGE UPLOAD] File uploaded successfully:', {
      shopId: shop.id,
      filePath,
      publicUrl
    });

    // Récupérer l'URL du webhook n8n
    const n8nWebhookUrl = process.env.N8N_RAG_INGEST_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('[API KNOWLEDGE UPLOAD] N8N_RAG_INGEST_WEBHOOK_URL is not configured');
      return new NextResponse('Knowledge processing service is not configured', { status: 500 });
    }

    // Préparer le payload pour n8n
    const n8nPayload = {
      shopId: shop.id,
      sourceType: 'file_url',
      sourceData: publicUrl,
      sourceTitle: file.name,
      timestamp: new Date().toISOString(),
      userId: user.id,
      fileMetadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        storagePath: filePath
      }
    };

    // Envoyer la demande à n8n pour traitement
    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'XAMXAM-Knowledge-Upload/1.0'
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!n8nResponse.ok) {
        console.error('[API KNOWLEDGE UPLOAD] n8n webhook failed:', {
          status: n8nResponse.status,
          statusText: n8nResponse.statusText
        });
        // Note: On ne supprime pas le fichier car il pourrait être utile pour debug
        return new NextResponse('Knowledge processing service error', { status: 502 });
      }

      console.log('[API KNOWLEDGE UPLOAD] Successfully sent to n8n:', {
        shopId: shop.id,
        fileName: file.name,
        publicUrl
      });

    } catch (n8nError) {
      console.error('[API KNOWLEDGE UPLOAD] Failed to reach n8n webhook:', n8nError);
      return new NextResponse('Knowledge processing service unavailable', { status: 503 });
    }

    // Optionnel : Enregistrer une trace de l'upload dans la DB
    try {
      await prisma.knowledgeIngestionLog.create({
        data: {
          shopId: shop.id,
          sourceType: 'file_url',
          sourceTitle: file.name,
          sourceDataHash: publicUrl.substring(0, 100), // URL partielle pour traçabilité
          status: 'SENT_TO_N8N',
          metadata: {
            originalFileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            publicUrl: publicUrl,
            storagePath: filePath
          },
          createdAt: new Date(),
        }
      });
    } catch (logError) {
      // Si l'enregistrement du log échoue, on continue quand même
      console.warn('[API KNOWLEDGE UPLOAD] Failed to log upload request:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded and sent for processing successfully.',
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        publicUrl: publicUrl,
        status: 'processing'
      }
    });
    
  } catch (error) {
    console.error('[API KNOWLEDGE UPLOAD] Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
