import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';
import { decryptToken } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId requis' },
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

    // Récupérer le canal
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
        { error: 'Canal Facebook non trouvé' },
        { status: 404 }
      );
    }

    const channel = shop.channels[0];
    const pageAccessToken = decryptToken(channel.accessToken!);

    // Vérifier les permissions du token
    const permissionsUrl = `https://graph.facebook.com/v23.0/me/permissions?access_token=${pageAccessToken}`;
    const response = await fetch(permissionsUrl);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Impossible de vérifier les permissions',
        details: data
      });
    }

    const permissions = data.data || [];
    const grantedPermissions = permissions
      .filter((p: any) => p.status === 'granted')
      .map((p: any) => p.permission);

    const requiredPermissions = [
      'pages_manage_posts',
      'pages_read_engagement', 
      'pages_show_list'
    ];

    const missingPermissions = requiredPermissions.filter(perm => 
      !grantedPermissions.includes(perm)
    );

    return NextResponse.json({
      success: true,
      pageId,
      grantedPermissions,
      requiredPermissions,
      missingPermissions,
      hasAllPermissions: missingPermissions.length === 0
    });

  } catch (error) {
    console.error('Erreur vérification permissions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}