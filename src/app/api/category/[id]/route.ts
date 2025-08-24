import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API pour gérer une catégorie spécifique par son ID
 * Gère les opérations de lecture, mise à jour et suppression d'une catégorie individuelle
 */

// LIRE - Récupérer une catégorie spécifique par ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID de la catégorie est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }
    
    console.log('Récupération de la catégorie:', id);
    
    // Récupérer la catégorie avec toutes ses relations
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            images: true,
            isActive: true,
            sku: true,
            weight: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'Aucune catégorie trouvée avec cet ID'
      }, { status: 404 });
    }
    
    console.log('Catégorie récupérée:', category.name);
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie récupérée avec succès'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur de récupération',
      message: 'Impossible de récupérer la catégorie'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour une catégorie spécifique
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID de la catégorie est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'Aucune catégorie trouvée avec cet ID'
      }, { status: 404 });
    }
    
    // Filtrer et nettoyer les données valides
    const validData: any = {};
    
    if ('name' in body && body.name) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le nom de la catégorie ne peut pas être vide'
        }, { status: 400 });
      }
      
      // Vérifier l'unicité du nouveau nom dans la boutique
      const nameExists = await prisma.category.findFirst({
        where: {
          shopId: existingCategory.shopId,
          name: body.name.trim(),
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json({
          success: false,
          error: 'Nom de catégorie existant',
          message: 'Une autre catégorie avec ce nom existe déjà dans cette boutique'
        }, { status: 409 });
      }
      
      validData.name = body.name.trim();
    }
    
    if ('description' in body) {
      validData.description = body.description?.trim() || null;
    }
    
    if ('imageUrl' in body) {
      validData.imageUrl = body.imageUrl?.trim() || null;
    }
    
    if ('isActive' in body) {
      validData.isActive = Boolean(body.isActive);
    }

    // Vérifier qu'il y a au moins une donnée à modifier
    if (Object.keys(validData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune modification',
        message: 'Aucune donnée valide à modifier'
      }, { status: 400 });
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validData,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true
          },
          where: {
            isActive: true
          },
          take: 5 // Limiter à 5 produits pour la réponse
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('Catégorie mise à jour:', updatedCategory.id);
    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Catégorie mise à jour avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'La catégorie à modifier n\'existe pas'
      }, { status: 404 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Une catégorie avec ce nom existe déjà dans cette boutique'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de modification',
      message: 'Impossible de modifier la catégorie'
    }, { status: 500 });
  }
}

// SUPPRIMER - Supprimer une catégorie spécifique
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID de la catégorie est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si la catégorie existe avant de la supprimer
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'Aucune catégorie trouvée avec cet ID'
      }, { status: 404 });
    }

    // Vérifier s'il y a des produits liés qui empêchent la suppression
    if (existingCategory._count.products > 0) {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer une catégorie qui contient des produits'
      }, { status: 409 });
    }
    
    const deletedCategory = await prisma.category.delete({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Catégorie supprimée:', deletedCategory.id);
    return NextResponse.json({
      success: true,
      data: deletedCategory,
      message: 'Catégorie supprimée avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'La catégorie à supprimer n\'existe pas'
      }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer une catégorie qui a des produits liés'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de suppression',
      message: 'Impossible de supprimer la catégorie'
    }, { status: 500 });
  }
}