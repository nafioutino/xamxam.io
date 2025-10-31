import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Récupérer les pages stockées dans les cookies
    const pagesData = cookieStore.get('meta_pages')?.value;
    const userToken = cookieStore.get('meta_user_token')?.value;
    
    console.log("GET /api/auth/get-pages - Cookies trouvés:");
    console.log("- meta_pages présent:", !!pagesData);
    console.log("- meta_user_token présent:", !!userToken);
    
    if (!pagesData || !userToken) {
      console.log("Données manquantes dans les cookies - redirection nécessaire");
      return NextResponse.json(
        { error: 'No pages data found. Please authenticate again.' },
        { status: 404 }
      );
    }
    
    try {
      const pages: FacebookPage[] = JSON.parse(pagesData);
      console.log("Pages récupérées depuis les cookies:", pages.length);
      console.log("Détails des pages:", pages.map(p => ({ id: p.id, name: p.name })));
      
      return NextResponse.json({
        pages,
        success: true
      });
    } catch (parseError) {
      console.error('Error parsing pages data:', parseError);
      return NextResponse.json(
        { error: 'Invalid pages data format' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Get pages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Gérer les autres méthodes HTTP
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}