import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API CRUD pour l'entité Category
 * Gère les opérations de création, lecture, mise à jour et suppression des catégories
 */

// LIRE - Récupérer toutes les catégories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const isActive = searchParams.get('isActive');
    
    console.log('Récupération des catégories...');
    
    // Construire les filtres
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (isActive !== null) where.isActive = isActive === 'true';
    
    // Récupérer toutes les catégories avec leurs relations
    const categories = await prisma.category.findMany({
      where,
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
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`${categories.length} catégorie(s) récupérée(s)`);
    return NextResponse.json({
      success: true,
      data: categories,
      message: `${categories.length} catégorie(s) trouvée(s)`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json({
      success: false,
      error: 'Impossible de récupérer les catégories',
      message: 'Une erreur est survenue lors de la récupération des données'
    }, { status: 500 });
  }
}

// AJOUTER - Créer une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, shopId, isActive } = body;

    // Validation des données obligatoires
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'Le nom de la catégorie est requis et ne peut pas être vide'
      }, { status: 400 });
    }

    if (!shopId || typeof shopId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID de la boutique est requis'
      }, { status: 400 });
    }

    // Vérifier si la boutique existe
    const shopExists = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shopExists) {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'La boutique spécifiée n\'existe pas'
      }, { status: 404 });
    }

    // Vérifier l'unicité du nom dans la boutique
    const existingCategory = await prisma.category.findFirst({
      where: {
        shopId,
        name: name.trim()
      }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Nom de catégorie existant',
        message: 'Une catégorie avec ce nom existe déjà dans cette boutique'
      }, { status: 409 });
    }

    // Créer la nouvelle catégorie
    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        shopId
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('Nouvelle catégorie créée:', newCategory.id);
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Catégorie créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Une catégorie avec ce nom existe déjà dans cette boutique'
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Référence invalide',
        message: 'La boutique spécifiée n\'existe pas'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de création',
      message: 'Impossible de créer la catégorie'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour une catégorie existante
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID est requis et doit être une chaîne de caractères (UUID)'
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
    
    if ('name' in data && data.name) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
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
          name: data.name.trim(),
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
      
      validData.name = data.name.trim();
    }
    
    if ('description' in data) {
      validData.description = data.description?.trim() || null;
    }
    
    if ('imageUrl' in data) {
      validData.imageUrl = data.imageUrl?.trim() || null;
    }
    
    if ('isActive' in data) {
      validData.isActive = Boolean(data.isActive);
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

// SUPPRIMER - Supprimer une catégorie
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID est requis et doit être une chaîne de caractères (UUID)'
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