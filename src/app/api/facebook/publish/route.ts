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
      where: { ownerId: user.id },
      include: {
        channels: {
          where: {
            type: ChannelType.FACEBOOK_PAGE,
            externalId: pageId,
            isActive: true
          }
        }
      }
    });

    if (!shop || shop.channels.length === 0) {
      return NextResponse.json(
        { error: 'Canal Facebook non trouvé ou inactif' },
        { status: 404 }
      );
    }

    const channel = shop.channels[0];
    
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