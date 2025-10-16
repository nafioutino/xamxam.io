import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import  prisma  from '@/lib/prisma';
import { decryptToken } from '@/lib/encryption';

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
                createdAt: true,
                accessToken: true
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



    // Récupérer les canaux avec leurs informations complètes
    const channelsWithDetails = await Promise.all(
      shop.channels.map(async (channel: any) => {
        let channelType = channel.type;
        let pageName = null;
        
        // Mapper les types de canaux vers les noms utilisés dans l'UI
        if (channel.type === 'FACEBOOK_PAGE') {
          channelType = 'messenger';
          // Récupérer le nom de la page Facebook
          try {
            if (channel.accessToken) {
              const decryptedToken = decryptToken(channel.accessToken);
              const response = await fetch(`https://graph.facebook.com/v23.0/${channel.externalId}?fields=name&access_token=${decryptedToken}`);
              if (response.ok) {
                const pageData = await response.json();
                pageName = pageData.name;
              }
            }
          } catch (error) {
            console.error('Erreur récupération nom page:', error);
          }
        } else if (channel.type === 'INSTAGRAM_DM') {
          channelType = 'instagram';
          // Récupérer le nom d'utilisateur Instagram via l'API Instagram native
          try {
            if (channel.accessToken) {
              const decryptedToken = decryptToken(channel.accessToken);
              // Utiliser l'API Instagram native pour récupérer le username
              const response = await fetch(`https://graph.instagram.com/v21.0/${channel.externalId}?fields=username,name&access_token=${decryptedToken}`);
              if (response.ok) {
                const instagramData = await response.json();
                // Utiliser le username si disponible, sinon le name
                pageName = instagramData.username ? `@${instagramData.username}` : (instagramData.name || `Instagram ${channel.externalId}`);
              }
            }
          } catch (error) {
            console.error('Erreur récupération nom Instagram:', error);
            pageName = `Instagram ${channel.externalId}`;
          }
        } else if (channel.type === 'WHATSAPP') {
          channelType = 'whatsapp';
        } else if (channel.type === 'TELEGRAM') {
          channelType = 'telegram';
        } else if (channel.type === 'TIKTOK') {
          channelType = 'tiktok';
          // Récupérer le nom d'utilisateur TikTok
          try {
            if (channel.accessToken) {
              const decryptedToken = decryptToken(channel.accessToken);
              const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${decryptedToken}`,
                  'Content-Type': 'application/json'
                }
              });
              if (response.ok) {
                const tikTokData = await response.json();
                if (tikTokData.data && tikTokData.data.user) {
                  pageName = tikTokData.data.user.display_name;
                }
              }
            }
          } catch (error) {
            console.error('Erreur récupération nom TikTok:', error);
          }
        }
        
        return {
          channelType,
          data: {
            id: channel.id,
            externalId: channel.externalId,
            isActive: channel.isActive,
            connectedAt: channel.createdAt.toISOString(),
            pageName
          }
        };
      })
    );

    // Mapper les canaux connectés par type
    const connectedChannels = channelsWithDetails.reduce((acc: Record<string, any>, { channelType, data }) => {
      acc[channelType] = data;
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