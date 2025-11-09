import OpenAI from 'openai';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

interface WhatsAppMessage {
  shopId: string;
  customerId: string;
  conversationId: string;
  messageContent: string;
  customerPhone: string;
  instanceName: string;
}

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

class WhatsAppAiService {
  private openai: OpenAI;
  private supabase: any;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Vérifier les variables d'environnement
    console.log('🔧 Initialisation WhatsAppAiService...');
    console.log('🔧 SUPABASE_URL présent:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔧 SERVICE_ROLE_KEY présent:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Initialiser Supabase avec la service key pour les webhooks
    this.supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service key pour bypasser RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );
    
    console.log('✅ Client Supabase initialisé avec service key');
  }

  /**
   * Traite un message WhatsApp entrant et génère une réponse IA si l'agent est activé
   */
  async processIncomingMessage(messageData: WhatsAppMessage): Promise<AIResponse> {
    try {
      console.log('🤖 Traitement du message par l\'agent IA:', {
        shopId: messageData.shopId,
        customerId: messageData.customerId,
        messageLength: messageData.messageContent.length
      });

      // 1. Vérifier si l'agent IA est activé pour cette boutique et pour WhatsApp
      console.log('🔍 Vérification de la configuration de l\'agent IA...');
      const agentConfig = await prisma.agentConfiguration.findUnique({
        where: { shopId: messageData.shopId },
        include: { shop: true }
      });

      if (!agentConfig) {
        console.log('❌ Aucune configuration d\'agent IA trouvée pour la boutique:', messageData.shopId);
        return { success: false, error: 'Agent IA non configuré' };
      }

      console.log('✅ Configuration trouvée. isWhatsAppEnabled:', agentConfig.isWhatsAppEnabled);

      if (!agentConfig.isWhatsAppEnabled) {
        console.log('❌ Agent IA désactivé pour WhatsApp sur la boutique:', messageData.shopId);
        return { success: false, error: 'Agent IA désactivé pour WhatsApp' };
      }

      // 2. Créer l'embedding du message utilisateur
      console.log('🔍 Création de l\'embedding du message...');
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: messageData.messageContent,
      });

      const embedding = embeddingResponse.data[0].embedding;
      console.log('✅ Embedding créé avec succès');

      // 3. Récupérer les chunks de connaissance pertinents via Supabase RPC
      console.log('🔍 Recherche de connaissances pertinentes...');
      console.log('🔍 Paramètres RPC:', {
        shop_id_param: messageData.shopId,
        match_threshold: 0.5,
        match_count: 5,
        embedding_length: embedding.length
      });
      
      const { data: knowledgeChunks, error: rpcError } = await this.supabase.rpc(
        'match_knowledge_chunks',
        {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5,
          shop_id_param: messageData.shopId,
        }
      );

      if (rpcError) {
        console.error('❌ Erreur RPC Supabase:', rpcError);
      } else {
        console.log('✅ Connaissances trouvées:', knowledgeChunks?.length || 0, 'chunks');
      }

      // 4. Construire le contexte à partir des chunks de connaissance
      let context = '';
      if (knowledgeChunks && knowledgeChunks.length > 0) {
        context = knowledgeChunks
          .map((chunk: any) => chunk.content)
          .join('\n\n');
      }

      // 5. Récupérer l'historique de la conversation pour le contexte
      console.log('🔍 Récupération de l\'historique de la conversation...');
      const conversationHistory = await this.getConversationHistory(messageData.conversationId);

      // 6. Construire le prompt système dynamique avec l'historique
      console.log('🔍 Construction du prompt système...');
      const systemPrompt = this.buildSystemPrompt(agentConfig, context, conversationHistory);

      // 7. Générer la réponse avec OpenAI
      console.log('🔍 Génération de la réponse IA...');
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageData.messageContent }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        console.log('❌ Aucune réponse générée par l\'IA');
        return { success: false, error: 'Aucune réponse générée par l\'IA' };
      }

      console.log('✅ Réponse IA générée:', aiResponse.substring(0, 100) + '...');

      // 8. Envoyer la réponse via WhatsApp
      console.log('📤 Envoi de la réponse WhatsApp...');
      console.log('📤 Paramètres d\'envoi:', {
        instanceName: messageData.instanceName,
        customerPhone: messageData.customerPhone,
        responseLength: aiResponse.length
      });
      
      const sendResult = await this.sendWhatsAppResponse(
        messageData.instanceName,
        messageData.customerPhone,
        aiResponse
      );

      console.log('✅ Réponse WhatsApp envoyée avec succès');

      // 9. Sauvegarder la réponse IA dans la base de données
      console.log('💾 Sauvegarde de la réponse en base...');
      await this.saveAiResponse(
        messageData.conversationId,
        aiResponse,
        sendResult?.key?.id,
        sendResult || null
      );

      console.log('✅ Réponse IA sauvegardée avec succès');
      console.log('✅ Traitement complet terminé avec succès');
      return { success: true, response: aiResponse };

    } catch (error: any) {
      console.error('❌ Erreur lors du traitement du message par l\'agent IA:', error);
      console.error('❌ Stack trace:', error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère l'historique récent de la conversation pour le contexte
   */
  private async getConversationHistory(conversationId: string, limit: number = 10): Promise<string> {
    try {
      console.log('🔍 Récupération des messages de la conversation:', conversationId);
      
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
        console.log('ℹ️ Aucun historique de conversation trouvé');
        return '';
      }

      // Inverser l'ordre pour avoir les messages du plus ancien au plus récent
      const orderedMessages = messages.reverse();
      
      // Formater l'historique pour le prompt
      const historyText = orderedMessages
        .map((msg) => {
          const role = msg.isFromCustomer ? 'Client' : 'Assistant';
          const timestamp = new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          return `[${timestamp}] ${role}: ${msg.content}`;
        })
        .join('\n');

      console.log('✅ Historique récupéré:', orderedMessages.length, 'messages');
      return historyText;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return '';
    }
  }

  /**
   * Construit le prompt système dynamique basé sur la configuration de l'agent
   */
  private buildSystemPrompt(agentConfig: any, context: string, conversationHistory: string = ''): string {
    const shopInfo = agentConfig.shop;
    const languageMap: Record<string, string> = { fr: 'français', en: 'anglais', wo: 'wolof', ar: 'arabe' };
    const defaultLanguage = languageMap[agentConfig.agentLanguage] || agentConfig.agentLanguage;
    
    let prompt = `Tu es ${agentConfig.agentName}, l'assistant virtuel de ${shopInfo.name}.

INFORMATIONS SUR LA BOUTIQUE:
- Nom: ${shopInfo.name}
- Description: ${shopInfo.description || 'Non spécifiée'}
- Adresse: ${shopInfo.address || 'Non spécifiée'}
- Horaires: ${shopInfo.openingHours || 'Non spécifiés'}

CONFIGURATION DE PERSONNALITÉ:
- Ton: ${agentConfig.agentTone}
 - Langue par défaut: ${defaultLanguage}
- Style de réponse: ${agentConfig.agentResponseStyle}
${agentConfig.agentGreeting ? `- Message d'accueil: ${agentConfig.agentGreeting}` : ''}

INSTRUCTIONS:
1. Réponds dans la même langue que le message du client (wolof, arabe, anglais ou français).
2. Si la langue du client n'est pas claire, réponds en ${defaultLanguage}.
3. N'utilise qu'une seule langue par réponse (ne mélange pas).
4. Adopte un ton ${agentConfig.agentTone} et un style ${agentConfig.agentResponseStyle}.
5. Sois utile et informatif concernant les produits et services de la boutique.
6. Si tu ne connais pas une information, dis-le honnêtement.
7. Reste dans le contexte de la boutique et de ses services.
8. Sois concis mais complet (maximum 500 caractères).
9. Utilise l'historique de la conversation pour maintenir la cohérence et le contexte.

${conversationHistory ? `HISTORIQUE DE LA CONVERSATION RÉCENTE:
${conversationHistory}

Utilise cet historique pour comprendre le contexte de la conversation en cours et maintenir la cohérence dans tes réponses.` : ''}

${context ? `CONTEXTE PERTINENT DE LA BASE DE CONNAISSANCES:
${context}

Utilise ces informations pour répondre de manière précise et pertinente.` : ''}

Réponds maintenant au message du client de manière naturelle et utile.`;

    return prompt;
  }

  /**
   * Envoie la réponse IA via WhatsApp
   */
  private async sendWhatsAppResponse(
    instanceName: string,
    customerPhone: string,
    response: string
  ): Promise<import('@/types/evolution-api').SendMessageResponse> {
    try {
      console.log('📤 Tentative d\'envoi WhatsApp:', {
        instanceName,
        customerPhone,
        responseLength: response.length
      });

      const result = await evolutionApiService.sendTextMessage(instanceName, {
        number: customerPhone,
        text: response,
      });

      console.log('✅ Réponse Evolution API:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la réponse WhatsApp:', error);
      console.error('❌ Détails de l\'erreur:', {
        instanceName,
        customerPhone,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Sauvegarde la réponse IA dans la base de données
   */
  private async saveAiResponse(
    conversationId: string,
    response: string,
    externalId?: string,
    evolutionMetadata?: any
  ): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          conversationId,
          content: response,
          messageType: 'TEXT',
          isFromCustomer: false,
          isRead: true,
          externalId: externalId || undefined,
          metadata: {
            source: 'ai_agent',
            timestamp: new Date().toISOString(),
            evolution: evolutionMetadata || undefined,
          },
        },
      });

      // Mettre à jour la conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la réponse IA:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'agent IA est activé pour WhatsApp sur une boutique donnée
   */
  async isAiAgentEnabled(shopId: string): Promise<boolean> {
    try {
      const agentConfig = await prisma.agentConfiguration.findUnique({
        where: { shopId },
      });

      return !!(agentConfig && agentConfig.isWhatsAppEnabled);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'activation de l\'agent IA:', error);
      return false;
    }
  }
}

export const whatsappAiService = new WhatsAppAiService();