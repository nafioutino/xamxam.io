// /app/api/instagram/publish/route.ts

// ==================================================================
// ===                        IMPORTS                             ===
// ==================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { decryptToken } from '@/lib/encryption';

// ==================================================================
// ===                 FONCTION PRINCIPALE (POST)                 ===
// ==================================================================

/**
 * Gère la publication d'un post média (image) sur un compte Instagram Business.
 * L'API de Meta requiert un processus en deux étapes :
 * 1. Créer un "conteneur" avec le média et la légende.
 * 2. Publier ce conteneur.
 */
export async function POST(request: NextRequest) {
  const logPrefix = '[Instagram Publish API]';
  
  try {
    // --- ÉTAPE 1: VALIDER LA REQUÊTE ET L'AUTHENTIFICATION ---
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const instagramAccountId = formData.get('pageId') as string;
    const contentType = formData.get('contentType') as string || 'text';
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const videoFile = formData.get('video') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;

    if (!message || !instagramAccountId) {
      return NextResponse.json({ error: 'Message et pageId requis' }, { status: 400 });
    }

    // Vérifier qu'on a le contenu nécessaire selon le type
    if (contentType === 'image' && !imageFile && !imageUrl) {
      return NextResponse.json({ error: 'Image requise pour ce type de contenu' }, { status: 400 });
    }
    if (contentType === 'video' && !videoFile && !videoUrl) {
      return NextResponse.json({ error: 'Vidéo requise pour ce type de contenu' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // --- ÉTAPE 2: RÉCUPÉRER LE TOKEN D'ACCÈS VIA LE CANAL INSTAGRAM ---
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      include: {
        channels: {
          where: {
            type: 'INSTAGRAM_DM',
            externalId: instagramAccountId,
            isActive: true
          }
        }
      }
    });

    if (!shop || shop.channels.length === 0) {
      return NextResponse.json({ error: 'Canal Instagram non trouvé ou inactif' }, { status: 404 });
    }

    const channel = shop.channels[0];
    const accessToken = decryptToken(channel.accessToken!);

    // --- ÉTAPE 3: PUBLIER SELON LE TYPE DE CONTENU ---
    let postId;
    
    if (contentType === 'text') {
      // Instagram ne supporte pas les posts texte seuls
      return NextResponse.json({ error: 'Instagram ne supporte pas les publications texte seules. Veuillez ajouter une image ou vidéo.' }, { status: 400 });
    } else if (contentType === 'image') {
      const mediaUrl = imageUrl || (imageFile ? await uploadToCloudinary(imageFile) : null);
      if (!mediaUrl) {
        throw new Error('Impossible de récupérer l\'URL de l\'image');
      }
      postId = await publishInstagramMedia(instagramAccountId, accessToken, mediaUrl, message, 'IMAGE');
    } else if (contentType === 'video') {
      const mediaUrl = videoUrl || (videoFile ? await uploadToCloudinary(videoFile) : null);
      if (!mediaUrl) {
        throw new Error('Impossible de récupérer l\'URL de la vidéo');
      }
      // Pour les vidéos, on crée le conteneur et on retourne immédiatement
      const containerId = await createInstagramContainer(instagramAccountId, accessToken, mediaUrl, message, 'VIDEO');
      
      // Publier en arrière-plan (sans attendre)
      publishInstagramContainerAsync(instagramAccountId, accessToken, containerId).catch(error => {
        console.error('[Background Publish] Failed:', error);
      });
      
      return NextResponse.json({
        success: true,
        containerId,
        message: 'Vidéo en cours de traitement sur Instagram. La publication sera finalisée automatiquement.'
      });
    }
    
    // --- ÉTAPE 5: RÉPONSE DE SUCCÈS ---
    return NextResponse.json({
      success: true,
      postId: postId,
      message: 'Publication sur Instagram réussie !'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    console.error(`${logPrefix} CRITICAL ERROR:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Fonction pour créer un conteneur Instagram
async function createInstagramContainer(instagramAccountId: string, accessToken: string, mediaUrl: string, caption: string, mediaType: 'IMAGE' | 'VIDEO') {
  const logPrefix = '[Instagram Container]';
  
  const containerUrl = `https://graph.facebook.com/v23.0/${instagramAccountId}/media`;
  const containerParams = new URLSearchParams({
    [mediaType === 'IMAGE' ? 'image_url' : 'video_url']: mediaUrl,
    caption,
    access_token: accessToken,
  });
  
  if (mediaType === 'VIDEO') {
    containerParams.append('media_type', 'REELS');
  }

  console.log(`${logPrefix} Creating ${mediaType} container...`);
  const containerResponse = await fetch(`${containerUrl}?${containerParams.toString()}`, {
    method: 'POST',
  });
  const containerData = await containerResponse.json();

  if (!containerResponse.ok) {
    console.error(`${logPrefix} Error creating container:`, containerData.error);
    throw new Error(containerData.error?.message || 'Failed to create media container');
  }
  
  console.log(`${logPrefix} Container created with ID: ${containerData.id}`);
  return containerData.id;
}

// Fonction helper pour publier sur Instagram (images seulement)
async function publishInstagramMedia(instagramAccountId: string, accessToken: string, mediaUrl: string, caption: string, mediaType: 'IMAGE') {
  const containerId = await createInstagramContainer(instagramAccountId, accessToken, mediaUrl, caption, mediaType);
  return await publishInstagramContainer(instagramAccountId, accessToken, containerId);
}

// Fonction pour publier un conteneur Instagram
async function publishInstagramContainer(instagramAccountId: string, accessToken: string, containerId: string) {
  const logPrefix = '[Instagram Publish]';
  
  const publishUrl = `https://graph.facebook.com/v23.0/${instagramAccountId}/media_publish`;
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });
  
  console.log(`${logPrefix} Publishing container ${containerId}...`);
  const publishResponse = await fetch(`${publishUrl}?${publishParams.toString()}`, {
    method: 'POST',
  });
  const publishData = await publishResponse.json();

  if (!publishResponse.ok) {
    console.error(`${logPrefix} Error publishing container:`, publishData.error);
    throw new Error(publishData.error?.message || 'Failed to publish media container');
  }
  
  console.log(`${logPrefix} Successfully published with ID: ${publishData.id}`);
  return publishData.id;
}

// Fonction pour publier un conteneur en arrière-plan avec retry
async function publishInstagramContainerAsync(instagramAccountId: string, accessToken: string, containerId: string) {
  const logPrefix = '[Background Publish]';
  const maxRetries = 20;
  const retryDelay = 5000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`${logPrefix} Attempt ${i + 1}/${maxRetries} to publish container ${containerId}`);
      
      const statusUrl = `https://graph.facebook.com/v23.0/${containerId}?fields=status_code&access_token=${accessToken}`;
      const statusResponse = await fetch(statusUrl);
      const statusData = await statusResponse.json();
      
      if (statusResponse.ok && statusData.status_code === 'FINISHED') {
        const postId = await publishInstagramContainer(instagramAccountId, accessToken, containerId);
        console.log(`${logPrefix} Successfully published video with ID: ${postId}`);
        return postId;
      } else if (statusResponse.ok && statusData.status_code === 'ERROR') {
        console.error(`${logPrefix} Media processing failed for container ${containerId}`);
        return;
      }
      
      console.log(`${logPrefix} Media not ready (status: ${statusData.status_code || 'unknown'}), waiting...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
    } catch (error) {
      console.error(`${logPrefix} Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
}



// Fonction placeholder pour l'upload vers Cloudinary (à implémenter)
async function uploadToCloudinary(file: File): Promise<string> {
  // TODO: Implémenter l'upload vers Cloudinary ou autre service
  throw new Error('Upload de fichiers non encore implémenté. Veuillez utiliser une URL.');
}