// /app/api/ai/generate-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Mode test pour développement
    const isTestMode = process.env.NODE_ENV === 'development';
    if (!user && !isTestMode) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const userId = user?.id || 'test-user-id';
    
    // 1. Récupérer le plan de l'utilisateur pour vérifier ses droits
    // const subscription = await prisma.subscription.findUnique({ where: { profileId: user.id }});
    // TODO: Mettre ici la logique pour vérifier si le plan de l'utilisateur
    // lui donne le droit de générer du contenu.
    // if (subscription.planType === 'FREE') { return ... }

    // 2. Transférer la requête à n8n en ajoutant des infos de contexte
    const body = await request.json(); // Ex: { productId: '...', tone: '...' }

    const n8nWebhookUrl = process.env.N8N_GENERATE_CONTENT_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      throw new Error('Webhook URL for n8n is not configured.');
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        userId, // On ajoute le contexte sécurisé
      }),
    });

    if (!response.ok) {
      throw new Error('The AI agent failed to process the request.');
    }
    
    // 3. Renvoyer la réponse de n8n directement au client
    const n8nResponse = await response.json();
    return NextResponse.json(n8nResponse);

  } catch (error) {
    console.error('Erreur génération contenu IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de contenu' },
      { status: 500 }
    );
  }
}