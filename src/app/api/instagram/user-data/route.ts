import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données utilisateur depuis les cookies
    const userDataCookie = request.cookies.get('instagram_user_data')?.value;
    
    if (!userDataCookie) {
      return NextResponse.json(
        { error: 'Aucune donnée utilisateur trouvée' },
        { status: 404 }
      );
    }

    const userData = JSON.parse(userDataCookie);
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error retrieving Instagram user data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}