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

    const { agentPersonality } = await request.json();

    // Validation des données requises
    if (!agentPersonality) {
      return new NextResponse('Missing agent personality data', { status: 400 });
    }

    // Upsert de la configuration de l'agent
    const agentConfig = await prisma.agentConfiguration.upsert({
      where: { shopId: shop.id },
      update: {
        // Agent Personality - seulement les champs utilisés dans le frontend
        agentName: agentPersonality.name || 'Assistant Virtuel',
        agentTone: agentPersonality.tone || 'professional',
        agentLanguage: agentPersonality.language || 'fr',
        agentResponseStyle: agentPersonality.responseStyle || 'conversational',
        agentGreeting: agentPersonality.greeting || '',
        
        updatedAt: new Date(),
      },
      create: {
        shopId: shop.id,
        
        // Agent Personality - seulement les champs utilisés dans le frontend
        agentName: agentPersonality.name || 'Assistant Virtuel',
        agentTone: agentPersonality.tone || 'professional',
        agentLanguage: agentPersonality.language || 'fr',
        agentResponseStyle: agentPersonality.responseStyle || 'conversational',
        agentGreeting: agentPersonality.greeting || '',
        
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
      agentPersonality: {
        name: agentConfig.agentName || 'Assistant Virtuel',
        tone: agentConfig.agentTone || 'professional',
        language: agentConfig.agentLanguage || 'fr',
        responseStyle: agentConfig.agentResponseStyle || 'conversational',
        greeting: agentConfig.agentGreeting || 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'
      }
    } : {
      agentPersonality: {
        name: 'Assistant Virtuel',
        tone: 'professional',
        language: 'fr',
        responseStyle: 'conversational',
        greeting: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'
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
