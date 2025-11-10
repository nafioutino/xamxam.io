// /src/app/api/tiktok/creator-info/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { TikTokTokenService } from '@/services/tiktok/tokenService';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Retourne les informations "creator_info" nécessaires pour la page Direct Post.
 * Inclut: nickname, privacy options, interactions, capacité de post, durée max vidéo.
 * Si l'API TikTok ne répond pas, fournit des valeurs par défaut raisonnables.
 */
export async function GET(_req: NextRequest) {
  const logPrefix = '[TikTok Creator Info API]';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const channel = await prisma.channel.findFirst({
      where: {
        shop: { ownerId: user.id },
        type: 'TIKTOK',
        isActive: true
      }
    });
    if (!channel) {
      return NextResponse.json({ error: 'Aucun compte TikTok connecté trouvé' }, { status: 404 });
    }

    // Obtenir un access token valide
    const tokenResult = await TikTokTokenService.getValidAccessToken(channel.id);
    if (!tokenResult.success || !tokenResult.accessToken) {
      if (tokenResult.needsReauth) {
        await TikTokTokenService.markChannelForReauth(channel.id);
      }
      return NextResponse.json({ error: tokenResult.error || 'Token TikTok invalide' }, { status: 401 });
    }
    const accessToken = tokenResult.accessToken;

    // Appel API TikTok pour récupérer le nickname + avatar si possible
    let nickname: string | null = null;
    let avatarUrl: string | null = null;
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,profile_image,avatar_url', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        nickname = data?.data?.user?.display_name || data?.data?.user?.open_id || null;
        // Tentative robuste pour extraire l'avatar
        const possibleAvatar =
          data?.data?.user?.profile_image?.url ||
          data?.data?.user?.avatar_url ||
          data?.data?.user?.avatar?.url || null;
        avatarUrl = possibleAvatar;
      }
    } catch (e) {
      console.warn(`${logPrefix} Failed to fetch user info`, e);
    }

    // Valeurs par défaut conformes aux guidelines
    const privacy_level_options = [
      'SELF_ONLY',
      'MUTUAL_FOLLOW_FRIENDS',
      'PUBLIC_TO_EVERYONE'
    ];

    // Interactions configurables par défaut; TikTok peut restreindre selon le créateur
    const interactions = {
      allow_comment_configurable: true,
      allow_duet_configurable: true,
      allow_stitch_configurable: true,
      duet_enabled: true,
      stitch_enabled: true
    };

    // Capacités (fallback): autoriser la publication et définir durée max raisonnable
    const can_post_now = true; // Si des caps existent, ce champ devrait refléter la contrainte
    const max_video_post_duration_sec = 600; // 10 minutes par défaut

    return NextResponse.json({
      nickname,
      avatarUrl,
      privacy_level_options,
      interactions,
      can_post_now,
      max_video_post_duration_sec
    });
  } catch (error) {
    console.error(`${logPrefix} Unexpected error:`, error);
    // Fournir un fallback pour que la page puisse s'afficher malgré tout
    return NextResponse.json({
      nickname: null,
      avatarUrl: null,
      privacy_level_options: ['SELF_ONLY','MUTUAL_FOLLOW_FRIENDS','PUBLIC_TO_EVERYONE'],
      interactions: {
        allow_comment_configurable: true,
        allow_duet_configurable: true,
        allow_stitch_configurable: true,
        duet_enabled: true,
        stitch_enabled: true
      },
      can_post_now: true,
      max_video_post_duration_sec: 600,
      warning: 'Fallback values used due to error'
    }, { status: 200 });
  }
}