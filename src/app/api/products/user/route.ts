import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * API pour récupérer les produits de l'utilisateur connecté
 * Récupère tous les produits actifs de la boutique de l'utilisateur
 */
export async function GET() {
  try {
    // Récupérer l'utilisateur connecté
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      }, { status: 401 });
    }

    console.log('Récupération des produits pour l\'utilisateur:', user.id);

    // Récupérer la boutique de l'utilisateur
    const userProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        shop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!userProfile?.shop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique non trouvée',
        message: 'Aucune boutique associée à votre compte'
      }, { status: 404 });
    }

    // Récupérer les produits actifs de la boutique
    const products = await prisma.product.findMany({
      where: {
        shopId: userProfile.shop.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        sku: true,
        stock: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`${products.length} produit(s) actif(s) trouvé(s) pour la boutique ${userProfile.shop.name}`);

    return NextResponse.json({
      success: true,
      data: products,
      shop: userProfile.shop,
      message: `${products.length} produit(s) trouvé(s)`
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération des produits utilisateur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les produits'
    }, { status: 500 });
  }
}