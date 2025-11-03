import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
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

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
      const agentConfig = await prisma.agentConfiguration.findUnique({
        where: { shopId: messageData.shopId },
        include: { shop: true }
      });

      if (!agentConfig) {
        console.log('❌ Aucune configuration d\'agent IA trouvée pour la boutique:', messageData.shopId);
        return { success: false, error: 'Agent IA non configuré' };
      }

      if (!agentConfig.isWhatsAppEnabled) {
        console.log('❌ Agent IA désactivé pour WhatsApp sur la boutique:', messageData.shopId);
        return { success: false, error: 'Agent IA désactivé pour WhatsApp' };
      }

      // 2. Créer l'embedding du message utilisateur
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: messageData.messageContent,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // 3. Récupérer les chunks de connaissance pertinents via Supabase RPC
      const supabase = createClient();
      const { data: knowledgeChunks, error: rpcError } = await (await supabase).rpc(
        'match_knowledge_chunks',
        {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5,
          shop_id_param: messageData.shopId,
        }
      );

      if (rpcError) {
        console.error('Erreur RPC Supabase:', rpcError);
      }

      // 4. Construire le contexte à partir des chunks de connaissance
      let context = '';
      if (knowledgeChunks && knowledgeChunks.length > 0) {
        context = knowledgeChunks
          .map((chunk: any) => chunk.content)
          .join('\n\n');
      }

      // 5. Construire le prompt système dynamique
      const systemPrompt = this.buildSystemPrompt(agentConfig, context);

      // 6. Générer la réponse avec OpenAI
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
        return { success: false, error: 'Aucune réponse générée par l\'IA' };
      }

      // 7. Envoyer la réponse via WhatsApp
      await this.sendWhatsAppResponse(
        messageData.instanceName,
        messageData.customerPhone,
        aiResponse
      );

      // 8. Sauvegarder la réponse IA dans la base de données
      await this.saveAiResponse(messageData.conversationId, aiResponse);

      console.log('✅ Réponse IA envoyée avec succès');
      return { success: true, response: aiResponse };

    } catch (error: any) {
      console.error('❌ Erreur lors du traitement du message par l\'agent IA:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Construit le prompt système dynamique basé sur la configuration de l'agent
   */
  private buildSystemPrompt(agentConfig: any, context: string): string {
    const shopInfo = agentConfig.shop;
    
    let prompt = `Tu es ${agentConfig.agentName}, l'assistant virtuel de ${shopInfo.name}.

INFORMATIONS SUR LA BOUTIQUE:
- Nom: ${shopInfo.name}
- Description: ${shopInfo.description || 'Non spécifiée'}
- Adresse: ${shopInfo.address || 'Non spécifiée'}
- Horaires: ${shopInfo.openingHours || 'Non spécifiés'}

CONFIGURATION DE PERSONNALITÉ:
- Ton: ${agentConfig.agentTone}
- Langue: ${agentConfig.agentLanguage}
- Style de réponse: ${agentConfig.agentResponseStyle}
${agentConfig.agentGreeting ? `- Message d'accueil: ${agentConfig.agentGreeting}` : ''}

INSTRUCTIONS:
1. Réponds UNIQUEMENT en ${agentConfig.agentLanguage}
2. Adopte un ton ${agentConfig.agentTone}
3. Utilise un style ${agentConfig.agentResponseStyle}
4. Sois utile et informatif concernant les produits et services de la boutique
5. Si tu ne connais pas une information, dis-le honnêtement
6. Reste dans le contexte de la boutique et de ses services
7. Sois concis mais complet dans tes réponses (maximum 500 caractères)

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
  ): Promise<void> {
    try {
      await evolutionApiService.sendTextMessage(instanceName, {
        number: customerPhone,
        text: response,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la réponse IA dans la base de données
   */
  private async saveAiResponse(conversationId: string, response: string): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          conversationId,
          content: response,
          messageType: 'TEXT',
          isFromCustomer: false,
          isRead: true,
          metadata: {
            source: 'ai_agent',
            timestamp: new Date().toISOString(),
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