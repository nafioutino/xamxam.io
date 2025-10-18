import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';
import { ChannelType } from '@/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [INSTAGRAM SETUP] Début de la configuration du canal Instagram');
    
    // Récupérer l'utilisateur authentifié depuis Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les données depuis les cookies
    const accessToken = request.cookies.get('instagram_access_token')?.value;
    const userDataCookie = request.cookies.get('instagram_user_data')?.value;
    
    console.log('🍪 [INSTAGRAM SETUP] Récupération des cookies:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      accessTokenPrefix: accessToken?.substring(0, 20) + '...',
      accessTokenSuffix: '...' + accessToken?.substring(accessToken?.length - 10),
      hasUserData: !!userDataCookie
    });
    
    if (!accessToken || !userDataCookie) {
      console.error('❌ [INSTAGRAM SETUP] Données d\'authentification manquantes');
      return NextResponse.json(
        { error: 'Données d\'authentification manquantes' },
        { status: 400 }
      );
    }

    const userData = JSON.parse(userDataCookie);
    console.log('👤 [INSTAGRAM SETUP] Données utilisateur récupérées:', {
      userId: userData.id,
      username: userData.username,
      accountType: userData.account_type
    });

    // Récupérer le profil et le shop de l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        shop: true
      }
    });

    if (!profile || !profile.shop) {
      return NextResponse.json(
        { error: 'Profil ou shop non trouvé pour cet utilisateur' },
        { status: 404 }
      );
    }

    const shopId = profile.shop.id;

    // Chiffrer le token d'accès
    const encryptedToken = encryptToken(accessToken);
    
    // Pour Instagram, les tokens de longue durée ont généralement 150-200 caractères
    // Les tokens de courte durée ont généralement 100-150 caractères
    // Avec l'API Instagram native, nous utilisons des Instagram User Access Tokens
    const isLongLivedToken = accessToken.length >= 150;
    
    console.log('🔐 [INSTAGRAM SETUP] Token chiffré:', {
      originalTokenLength: accessToken.length,
      encryptedTokenLength: encryptedToken.length,
      tokenPrefix: accessToken.substring(0, 20) + '...',
      tokenType: isLongLivedToken ? 'LONG-LIVED' : 'SHORT-LIVED',
      detectionMethod: 'length_based_instagram_native',
      apiType: 'Instagram Native API'
    });

    // Stocker le canal Instagram dans la base de données
    console.log('💾 [INSTAGRAM SETUP] Stockage du canal en base de données...');
    const channel = await prisma.channel.upsert({
      where: { 
        shopId_type_externalId: { 
          shopId, 
          type: ChannelType.INSTAGRAM_DM, 
          externalId: userData.id 
        } 
      },
      update: { 
        accessToken: encryptedToken, 
        isActive: true 
      },
      create: { 
        type: ChannelType.INSTAGRAM_DM, 
        externalId: userData.id, 
        accessToken: encryptedToken, 
        isActive: true, 
        shopId 
      }
    });

    console.log('✅ [INSTAGRAM SETUP] Canal Instagram stocké avec succès:', {
      channelId: channel.id,
      userId: userData.id,
      username: userData.username,
      accountType: userData.account_type,
      mediaCount: userData.media_count,
      shopId,
      tokenStoredLength: encryptedToken.length,
      originalTokenType: isLongLivedToken ? 'LONG-LIVED' : 'SHORT-LIVED'
    });

    // Créer la réponse de succès
    const response = NextResponse.json({
      success: true,
      message: 'Canal Instagram configuré avec succès',
      channel: {
        id: channel.id,
        externalId: userData.id,
        username: userData.username,
        type: 'INSTAGRAM_DM'
      }
    });

    // Nettoyer les cookies temporaires
    response.cookies.delete('instagram_access_token');
    response.cookies.delete('instagram_user_data');

    return response;

  } catch (error) {
    console.error('Instagram setup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la configuration du canal' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}