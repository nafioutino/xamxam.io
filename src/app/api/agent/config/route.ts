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

    const { organizationInfo, agentPersonality } = await request.json();

    // Validation des données requises
    if (!organizationInfo || !agentPersonality) {
      return new NextResponse('Missing required data', { status: 400 });
    }

    // Upsert de la configuration de l'agent
    const agentConfig = await prisma.agentConfiguration.upsert({
      where: { shopId: shop.id },
      update: {
        // Organisation Info
        orgName: organizationInfo.name || '',
        orgDescription: organizationInfo.description || '',
        orgIndustry: organizationInfo.industry || '',
        orgWebsite: organizationInfo.website || '',
        orgPhone: organizationInfo.phone || '',
        orgEmail: organizationInfo.email || '',
        orgAddress: organizationInfo.address || '',
        orgTargetAudience: organizationInfo.targetAudience || '',
        orgValues: organizationInfo.values || [],
        orgMission: organizationInfo.mission || '',
        
        // Agent Personality
        agentName: agentPersonality.name || '',
        agentRole: agentPersonality.role || '',
        agentTone: agentPersonality.tone || '',
        agentStyle: agentPersonality.style || '',
        agentLanguageLevel: agentPersonality.languageLevel || '',
        agentSpecialties: agentPersonality.specialties || '',
        agentLimitations: agentPersonality.limitations || '',
        agentGreeting: agentPersonality.greeting || '',
        agentFarewell: agentPersonality.farewell || '',
        
        updatedAt: new Date(),
      },
      create: {
        shopId: shop.id,
        
        // Organisation Info
        orgName: organizationInfo.name || '',
        orgDescription: organizationInfo.description || '',
        orgIndustry: organizationInfo.industry || '',
        orgWebsite: organizationInfo.website || '',
        orgPhone: organizationInfo.phone || '',
        orgEmail: organizationInfo.email || '',
        orgAddress: organizationInfo.address || '',
        orgTargetAudience: organizationInfo.targetAudience || '',
        orgValues: organizationInfo.values || [],
        orgMission: organizationInfo.mission || '',
        
        // Agent Personality
        agentName: agentPersonality.name || '',
        agentRole: agentPersonality.role || '',
        agentTone: agentPersonality.tone || '',
        agentStyle: agentPersonality.style || '',
        agentLanguageLevel: agentPersonality.languageLevel || '',
        agentSpecialties: agentPersonality.specialties || '',
        agentLimitations: agentPersonality.limitations || '',
        agentGreeting: agentPersonality.greeting || '',
        agentFarewell: agentPersonality.farewell || '',
        
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

    return NextResponse.json({ 
      success: true, 
      data: agentConfig 
    });
    
  } catch (error) {
    console.error('[API AGENT CONFIG] Error fetching config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
