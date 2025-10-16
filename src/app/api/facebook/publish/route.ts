import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';
import { FacebookPublishService } from '@/services/facebook/publishService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const pageId = formData.get('pageId') as string;
    const contentType = formData.get('contentType') as string || 'text';
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const videoFile = formData.get('video') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;

    if (!message || !pageId) {
      return NextResponse.json(
        { error: 'Message et pageId requis' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer la boutique et le canal
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id }
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }
    
    // Récupérer le canal Facebook
    const channel = await prisma.channel.findFirst({
      where: {
        shopId: shop.id,
        type: ChannelType.FACEBOOK_PAGE
      }
    });
    
    // Si aucun canal n'est trouvé, retourner une erreur
    if (!channel) {
      return NextResponse.json(
        { error: 'Aucun canal Facebook trouvé pour cette boutique. Veuillez d\'abord configurer un canal Facebook.' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'ID de page correspond
    if (channel.externalId !== pageId) {
      return NextResponse.json(
        { error: `L'ID de page fourni (${pageId}) ne correspond pas à l'ID du canal Facebook configuré (${channel.externalId})` },
        { status: 400 }
      );
    }
    
    // Vérifier si le canal est actif
    if (!channel.isActive) {
      return NextResponse.json(
        { error: 'Le canal Facebook existe mais est inactif. Veuillez l\'activer dans les paramètres.' },
        { status: 400 }
      );
    }

    // Préparer le token d'accès
    const pageAccessToken = FacebookPublishService.prepareAccessToken(channel.accessToken!);

    let result;
    
    if (contentType === 'image') {
      result = await FacebookPublishService.publishImagePost({
        message,
        pageId,
        accessToken: pageAccessToken,
        imageFile: imageFile || undefined,
        imageUrl: imageUrl || undefined
      });
    } else if (contentType === 'video') {
      result = await FacebookPublishService.publishVideoPost({
        message,
        pageId,
        accessToken: pageAccessToken,
        videoFile: videoFile || undefined,
        videoUrl: videoUrl || undefined
      });
    } else {
      result = await FacebookPublishService.publishTextPost({
        message,
        pageId,
        accessToken: pageAccessToken
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      postLink: result.postLink,
      message: 'Publication réussie'
    });

  } catch (error) {
    console.error('Erreur API publication:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}