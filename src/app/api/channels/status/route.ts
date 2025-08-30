import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import  prisma  from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur authentifié depuis Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil et le shop de l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        shop: {
          include: {
            channels: {
              where: { isActive: true },
              select: {
                id: true,
                type: true,
                externalId: true,
                isActive: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!profile || !profile.shop) {
      return NextResponse.json(
        { error: 'Profil ou shop non trouvé pour cet utilisateur' },
        { status: 404 }
      );
    }

    const shop = profile.shop;



    // Mapper les canaux connectés par type
    const connectedChannels = shop.channels.reduce((acc: Record<string, any>, channel: any) => {
      // Mapper les types de canaux vers les noms utilisés dans l'UI
      let channelType = channel.type;
      if (channel.type === 'FACEBOOK_PAGE') {
        channelType = 'messenger';
      } else if (channel.type === 'WHATSAPP') {
        channelType = 'whatsapp';
      } else if (channel.type === 'TELEGRAM') {
        channelType = 'telegram';
      } else if (channel.type === 'INSTAGRAM_DM') {
        channelType = 'instagram';
      }
      
      acc[channelType] = {
        id: channel.id,
        externalId: channel.externalId,
        isActive: channel.isActive,
        connectedAt: channel.createdAt.toISOString()
      };
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      connectedChannels,
      totalConnected: shop.channels.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du statut des canaux:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}