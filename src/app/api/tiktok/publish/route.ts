// /src/app/api/tiktok/publish/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TikTokPublishService } from '@/services/tiktok/publishService';
import { decryptToken } from '@/lib/encryption';
import prisma from '@/lib/prisma';

/**
 * Gère la publication de vidéos sur TikTok.
 * Supporte deux modes :
 * - Publication directe (video.publish scope)
 * - Upload en brouillon (video.upload scope)
 */
export async function POST(request: NextRequest) {
  const logPrefix = '[TikTok Publish API]';
  
  try {
    // --- ÉTAPE 1: VALIDER LA REQUÊTE ET L'AUTHENTIFICATION ---
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const publishMode = formData.get('publishMode') as string || 'draft'; // 'direct' ou 'draft'
    const privacy = formData.get('privacy') as string || 'SELF_ONLY';
    const videoFile = formData.get('video') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    }

    if (!videoFile && !videoUrl) {
      return NextResponse.json({ error: 'Vidéo requise (fichier ou URL)' }, { status: 400 });
    }

    console.log(`${logPrefix} Publishing video with title: "${title}" in ${publishMode} mode`);

    // --- ÉTAPE 2: VÉRIFIER L'AUTHENTIFICATION UTILISATEUR ---
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(`${logPrefix} Authentication error:`, authError);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // --- ÉTAPE 3: RÉCUPÉRER LE CANAL TIKTOK DE L'UTILISATEUR ---
    const channel = await prisma.channel.findFirst({
      where: {
        shop: {
          ownerId: user.id
        },
        type: 'TIKTOK',
        isActive: true
      }
    });

    if (!channel) {
      console.error(`${logPrefix} No active TikTok channel found for user ${user.id}`);
      return NextResponse.json({ 
        error: 'Aucun compte TikTok connecté trouvé' 
      }, { status: 404 });
    }

    // --- ÉTAPE 4: DÉCHIFFRER LE TOKEN D'ACCÈS ---
    if (!channel.accessToken) {
      console.error(`${logPrefix} No access token found for channel`);
      return NextResponse.json({ 
        error: 'Token d\'accès manquant' 
      }, { status: 500 });
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(channel.accessToken);
    } catch (decryptError) {
      console.error(`${logPrefix} Token decryption failed:`, decryptError);
      return NextResponse.json({ 
        error: 'Erreur de déchiffrement du token' 
      }, { status: 500 });
    }

    // --- ÉTAPE 5: PUBLIER SUR TIKTOK ---
    const publishOptions = {
      title,
      accessToken,
      videoFile: videoFile || undefined,
      videoUrl: videoUrl || undefined,
      privacy: privacy as 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY',
      publishMode: publishMode as 'direct' | 'draft'
    };

    let result;
    
    if (publishMode === 'direct') {
      // Publication directe (nécessite video.publish scope)
      console.log(`${logPrefix} Publishing directly to TikTok...`);
      result = await TikTokPublishService.publishVideo(publishOptions);
    } else {
      // Upload en brouillon (nécessite video.upload scope)
      console.log(`${logPrefix} Uploading as draft to TikTok...`);
      result = await TikTokPublishService.uploadVideoDraft(publishOptions);
    }

    if (!result.success) {
      console.error(`${logPrefix} Publication failed:`, result.error);
      return NextResponse.json(
        { 
          error: result.error,
          tikTokError: result.tikTokError 
        },
        { status: 500 }
      );
    }

    console.log(`${logPrefix} Success! Publish ID: ${result.publishId}`);

    // --- ÉTAPE 6: RETOURNER LE RÉSULTAT ---
    const responseData = {
      success: true,
      publishId: result.publishId,
      shareId: result.shareId,
      message: publishMode === 'direct' 
        ? 'Vidéo publiée avec succès sur TikTok !' 
        : 'Vidéo uploadée en brouillon sur TikTok !',
      mode: publishMode
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`${logPrefix} Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}