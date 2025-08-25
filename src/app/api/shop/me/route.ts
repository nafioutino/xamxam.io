import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * API pour récupérer la boutique de l'utilisateur connecté
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      }, { status: 401 });
    }

    // Récupérer la boutique de l'utilisateur connecté
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
            categories: true,
            channels: true
          }
        }
      }
    });

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique non trouvée',
        message: 'Aucune boutique associée à votre compte'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: shop,
      message: 'Boutique récupérée avec succès'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique utilisateur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la boutique'
    }, { status: 500 });
  }
}