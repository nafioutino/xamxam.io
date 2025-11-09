import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

// Valide qu'une chaîne est un UUID (v1–v5)
function isValidUUID(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
}

/**
 * Récupère l'historique récent de la conversation pour le contexte
 */
async function getConversationHistory(conversationId: string, limit: number = 10): Promise<string> {
  try {
    if (!conversationId || !isValidUUID(conversationId)) {
      console.warn('[API AI CHAT] conversationId invalide ou manquant, historique ignoré:', conversationId);
      return '';
    }

    console.log('[API AI CHAT] Récupération de l\'historique de la conversation:', conversationId);
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        content: true,
        isFromCustomer: true,
        createdAt: true,
      },
    });

    if (!messages || messages.length === 0) {
      console.log('[API AI CHAT] Aucun historique de conversation trouvé');
      return '';
    }

    // Inverser l'ordre pour avoir les messages du plus ancien au plus récent
    const orderedMessages = messages.reverse();
    
    // Formater l'historique pour le prompt
    const historyText = orderedMessages
      .map((msg) => {
        const role = msg.isFromCustomer ? 'Utilisateur' : 'Assistant';
        const timestamp = new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `[${timestamp}] ${role}: ${msg.content}`;
      })
      .join('\n');

    console.log('[API AI CHAT] Historique récupéré:', orderedMessages.length, 'messages');
    return historyText;
  } catch (error) {
    console.error('[API AI CHAT] Erreur lors de la récupération de l\'historique:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification et Validation
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

    const { message, conversationId } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new NextResponse('Message is required', { status: 400 });
    }

    console.log('[API AI CHAT] Processing question:', {
      shopId: shop.id,
      messageLength: message.length
    });

    // 2. Assurer l'existence de la conversation (playground)
    let conversation: { id: string } | null = null;
    if (conversationId && isValidUUID(conversationId)) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            id: conversationId,
            shopId: shop.id,
            platform: 'WHATSAPP',
            title: 'Playground Chat',
            isActive: true,
            lastMessageAt: new Date(),
          },
          select: { id: true }
        });
        console.log('[API AI CHAT] Conversation créée pour le playground:', conversation.id);
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          shopId: shop.id,
          platform: 'WHATSAPP',
          title: 'Playground Chat',
          isActive: true,
          lastMessageAt: new Date(),
        },
        select: { id: true }
      });
      console.warn('[API AI CHAT] conversationId invalide/manquant. Nouvelle conversation créée:', conversation.id);
    }

    // 3. Initialiser OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API AI CHAT] OPENAI_API_KEY is not configured');
      return new NextResponse('OpenAI service is not configured', { status: 500 });
    }

    // 3. Étape RAG #1 : Créer l'Embedding de la Question
    console.log('[API AI CHAT] Creating embedding for question...');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('[API AI CHAT] Embedding created, dimension:', queryEmbedding.length);

    // 4. Étape RAG #2 : Récupérer le Contexte (Retrieval)
    console.log('[API AI CHAT] Searching for relevant knowledge chunks...');
    const { data: matchingChunks, error: rpcError } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      shop_id_param: shop.id,
      match_threshold: 0.5, // Threshold plus permissif pour trouver plus de chunks
      match_count: 5
    });

    if (rpcError) {
      console.error('[API AI CHAT] RPC function failed:', rpcError);
      return new NextResponse('Knowledge retrieval failed', { status: 500 });
    }

    console.log('[API AI CHAT] Found matching chunks:', matchingChunks?.length || 0);
    
    // Log des scores de similarité pour debug
    if (matchingChunks && matchingChunks.length > 0) {
      console.log('[API AI CHAT] Similarity scores:', 
        matchingChunks.map((chunk: any) => ({
          source: chunk.source,
          similarity: chunk.similarity?.toFixed(3),
          contentPreview: chunk.content?.substring(0, 50) + '...'
        }))
      );
    }

    // 6. Récupérer l'historique de la conversation pour le contexte
    console.log('[API AI CHAT] Récupération de l\'historique de la conversation...');
    const conversationHistory = await getConversationHistory(conversation!.id);

    // 6. Récupérer la configuration de l'agent
    const agentConfig = await prisma.agentConfiguration.findUnique({
      where: { shopId: shop.id }
    });

    // 7. Étape RAG #3 : Construire le Prompt pour la Génération
    const contextText = matchingChunks && matchingChunks.length > 0 
      ? matchingChunks.map((chunk: any) => chunk.content).join('\n\n')
      : '';

    console.log('[API AI CHAT] Context length:', contextText.length);

    // Construire le prompt système dynamique
    const languageMap: Record<string, string> = { fr: 'français', en: 'anglais', wo: 'wolof', ar: 'arabe' };
    const defaultLanguageLabel = agentConfig ? (languageMap[agentConfig.agentLanguage || 'fr'] || agentConfig.agentLanguage || 'français') : 'français';
    const systemPrompt = agentConfig ? `Tu es ${agentConfig.agentName || 'Assistant IA'}, un assistant virtuel ${agentConfig.agentTone || 'professionnel'}.

PERSONNALITÉ DE L'AGENT :
- Nom : ${agentConfig.agentName || 'Assistant IA'}
- Ton : ${agentConfig.agentTone || 'professionnel'}
- Style de réponse : ${agentConfig.agentResponseStyle || 'conversationnel'}
- Langue par défaut : ${defaultLanguageLabel}
- Message d'accueil : ${agentConfig.agentGreeting || 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'}

INSTRUCTIONS :
1. Réponds dans la même langue que le message de l'utilisateur (wolof, arabe, anglais ou français).
2. Si la langue n'est pas claire, réponds en ${defaultLanguageLabel}.
3. N'utilise qu'une seule langue par réponse (ne mélange pas).
4. Utilise un ton ${agentConfig.agentTone || 'professionnel'} et un style ${agentConfig.agentResponseStyle || 'conversationnel'}.
5. Base tes réponses sur les informations fournies dans le contexte ci-dessous.
6. Si tu ne trouves pas d'information pertinente dans le contexte, dis-le clairement.
7. Sois utile, précis et bienveillant.
8. Utilise l'historique de la conversation pour maintenir la cohérence et le contexte.

${conversationHistory ? `HISTORIQUE DE LA CONVERSATION RÉCENTE :
${conversationHistory}

Utilise cet historique pour comprendre le contexte de la conversation en cours et maintenir la cohérence dans tes réponses.` : ''}

${contextText ? `CONTEXTE PERTINENT (base tes réponses sur ces informations) :
${contextText}` : 'AUCUN CONTEXTE SPÉCIFIQUE TROUVÉ - Réponds avec tes connaissances générales tout en restant dans le cadre de ton rôle.'}` 
    : `Tu es un assistant IA professionnel. Réponds de manière utile et précise en français.

${conversationHistory ? `HISTORIQUE DE LA CONVERSATION RÉCENTE :
${conversationHistory}

Utilise cet historique pour comprendre le contexte de la conversation en cours et maintenir la cohérence dans tes réponses.` : ''}

${contextText ? `CONTEXTE PERTINENT :
${contextText}` : 'Aucun contexte spécifique disponible.'}`;

    const userPrompt = `Question de l'utilisateur : ${message}`;

    // 9. Étape RAG #4 : Générer la Réponse
    console.log('[API AI CHAT] Generating AI response...');
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiReply = chatResponse.choices[0].message.content;

    if (!aiReply) {
      console.error('[API AI CHAT] OpenAI returned empty response');
      return new NextResponse('Failed to generate response', { status: 500 });
    }

    console.log('[API AI CHAT] Response generated successfully:', {
      shopId: shop.id,
      responseLength: aiReply.length,
      chunksUsed: matchingChunks?.length || 0
    });

    // 10. Persister le message utilisateur et la réponse IA
    try {
      const savedUserMessage = await prisma.message.create({
        data: {
          conversationId: conversation!.id,
          content: message,
          messageType: 'TEXT',
          isFromCustomer: true,
          isRead: true,
          metadata: { source: 'playground_user', timestamp: new Date().toISOString() },
        },
      });

      const savedAiMessage = await prisma.message.create({
        data: {
          conversationId: conversation!.id,
          content: aiReply,
          messageType: 'TEXT',
          isFromCustomer: false,
          isRead: true,
          metadata: { source: 'ai_agent', timestamp: new Date().toISOString() },
        },
      });

      await prisma.conversation.update({
        where: { id: conversation!.id },
        data: { lastMessageAt: new Date(), updatedAt: new Date() },
      });

      console.log('[API AI CHAT] Messages persistés:', {
        conversationId: conversation!.id,
        userMessageId: savedUserMessage.id,
        aiMessageId: savedAiMessage.id,
      });
    } catch (persistError) {
      console.error('[API AI CHAT] Erreur lors de la persistance des messages:', persistError);
    }

    // 11. Répondre au Frontend
    return NextResponse.json({ 
      reply: aiReply,
      metadata: {
        chunksFound: matchingChunks?.length || 0,
        hasContext: contextText.length > 0,
        agentName: agentConfig?.agentName || 'Assistant IA'
      }
    });
    
  } catch (error) {
    console.error('[API AI CHAT] Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
