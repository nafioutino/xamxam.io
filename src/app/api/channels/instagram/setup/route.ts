import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données depuis les cookies
    const accessToken = request.cookies.get('instagram_access_token')?.value;
    const userDataCookie = request.cookies.get('instagram_user_data')?.value;
    
    if (!accessToken || !userDataCookie) {
      return NextResponse.json(
        { error: 'Données d\'authentification manquantes' },
        { status: 400 }
      );
    }

    const userData = JSON.parse(userDataCookie);
    
    // TODO: Ici vous devrez intégrer avec votre base de données
    // pour sauvegarder le canal Instagram
    // Exemple de structure:
    /*
    const channel = await prisma.channel.create({
      data: {
        type: 'INSTAGRAM',
        name: `Instagram - @${userData.username}`,
        externalId: userData.id,
        accessToken: accessToken,
        metadata: {
          username: userData.username,
          accountType: userData.account_type,
          mediaCount: userData.media_count
        },
        userId: // ID de l'utilisateur connecté
      }
    });
    */

    console.log('Instagram channel setup data:', {
      userId: userData.id,
      username: userData.username,
      accountType: userData.account_type,
      mediaCount: userData.media_count,
      hasAccessToken: !!accessToken
    });

    // Créer la réponse de succès
    const response = NextResponse.json({
      success: true,
      message: 'Canal Instagram configuré avec succès',
      channel: {
        id: userData.id,
        username: userData.username,
        type: 'INSTAGRAM'
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