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

    const { agentSettings } = await request.json();

    // Validation des données requises
    if (!agentSettings) {
      return new NextResponse('Missing agent settings data', { status: 400 });
    }

    // Upsert de la configuration de l'agent
    const agentConfig = await prisma.agentConfiguration.upsert({
      where: { shopId: shop.id },
      update: {
        // Configuration générale de l'agent
        agentName: agentSettings.name || 'Assistant Virtuel',
        agentTone: agentSettings.personality || 'professional',
        agentLanguage: agentSettings.language || 'fr',
        agentResponseStyle: agentSettings.responseTime || 'conversational',
        agentGreeting: agentSettings.welcomeMessage || '',
        
        // Activation WhatsApp
        isWhatsAppEnabled: agentSettings.isWhatsAppEnabled || false,
        
        updatedAt: new Date(),
      },
      create: {
        shopId: shop.id,
        
        // Configuration générale de l'agent
        agentName: agentSettings.name || 'Assistant Virtuel',
        agentTone: agentSettings.personality || 'professional',
        agentLanguage: agentSettings.language || 'fr',
        agentResponseStyle: agentSettings.responseTime || 'conversational',
        agentGreeting: agentSettings.welcomeMessage || '',
        
        // Activation WhatsApp
        isWhatsAppEnabled: agentSettings.isWhatsAppEnabled || false,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('[API AGENT CONFIG] Configuration saved for shop:', shop.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration saved successfully.',
      data: agentConfig
    });
    
  } catch (error) {
    console.error('[API AGENT CONFIG] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const agentConfig = await prisma.agentConfiguration.findUnique({
      where: { shopId: shop.id }
    });

    // Formater les données pour le frontend
    const formattedData = agentConfig ? {
      agentSettings: {
        name: agentConfig.agentName || 'XAMXAM Assistant',
        welcomeMessage: agentConfig.agentGreeting || 'Bonjour ! Je suis l\'assistant virtuel de la boutique. Comment puis-je vous aider aujourd\'hui ?',
        transferMessage: 'Je vais transférer votre demande à un conseiller humain. Veuillez patienter un instant.',
        responseTime: agentConfig.agentResponseStyle || 'fast',
        personality: agentConfig.agentTone || 'professional',
        language: agentConfig.agentLanguage || 'fr',
        autoRespond: true,
        suggestProducts: true,
        collectFeedback: true,
        handoffThreshold: 3,
        isWhatsAppEnabled: agentConfig.isWhatsAppEnabled || false,
      }
    } : {
      agentSettings: {
        name: 'XAMXAM Assistant',
        welcomeMessage: 'Bonjour ! Je suis l\'assistant virtuel de la boutique. Comment puis-je vous aider aujourd\'hui ?',
        transferMessage: 'Je vais transférer votre demande à un conseiller humain. Veuillez patienter un instant.',
        responseTime: 'fast',
        personality: 'professional',
        language: 'fr',
        autoRespond: true,
        suggestProducts: true,
        collectFeedback: true,
        handoffThreshold: 3,
        isWhatsAppEnabled: false,
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: formattedData
    });
    
  } catch (error) {
    console.error('[API AGENT CONFIG] Error fetching config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
