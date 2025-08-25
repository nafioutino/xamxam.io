import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API pour gérer un produit spécifique par son ID
 * Gère les opérations de lecture, mise à jour et suppression d'un produit individuel
 */

// LIRE - Récupérer un produit spécifique par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID du produit est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }
    
    console.log('Récupération du produit:', id);
    
    // Récupérer le produit avec toutes ses relations
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            ownerId: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            shopId: true
          }
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            totalPrice: true,
            orderId: true,
            order: {
              select: {
                id: true,
                status: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limiter aux 10 dernières commandes
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produit introuvable',
        message: 'Aucun produit trouvé avec cet ID'
      }, { status: 404 });
    }
    
    console.log('Produit récupéré:', product.name);
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit récupéré avec succès'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur de récupération',
      message: 'Impossible de récupérer le produit'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour un produit spécifique
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID du produit est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Produit introuvable',
        message: 'Aucun produit trouvé avec cet ID'
      }, { status: 404 });
    }
    
    // Filtrer et nettoyer les données valides
    const validData: any = {};
    
    if ('name' in body && body.name) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le nom du produit ne peut pas être vide'
        }, { status: 400 });
      }
      validData.name = body.name.trim();
    }
    
    if ('description' in body) {
      validData.description = body.description?.trim() || null;
    }
    
    if ('price' in body) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le prix doit être un nombre positif'
        }, { status: 400 });
      }
      validData.price = parseFloat(body.price.toString());
    }
    
    if ('stock' in body) {
      if (typeof body.stock !== 'number' || body.stock < 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le stock doit être un nombre positif ou zéro'
        }, { status: 400 });
      }
      validData.stock = parseInt(body.stock.toString());
    }
    
    if ('images' in body) {
      validData.images = Array.isArray(body.images) ? body.images : [];
    }
    
    if ('sku' in body) {
      const newSku = body.sku?.trim() || null;
      if (newSku && newSku !== existingProduct.sku) {
        // Vérifier l'unicité du nouveau SKU
        const existingSku = await prisma.product.findFirst({
          where: {
            shopId: existingProduct.shopId,
            sku: newSku,
            id: { not: id }
          }
        });

        if (existingSku) {
          return NextResponse.json({
            success: false,
            error: 'SKU existant',
            message: 'Un autre produit avec ce SKU existe déjà dans cette boutique'
          }, { status: 409 });
        }
      }
      validData.sku = newSku;
    }
    
    if ('weight' in body) {
      validData.weight = body.weight ? parseFloat(body.weight.toString()) : null;
    }
    
    if ('dimensions' in body) {
      validData.dimensions = body.dimensions || null;
    }
    
    if ('isActive' in body) {
      validData.isActive = Boolean(body.isActive);
    }
    
    if ('categoryId' in body) {
      // Vérifier si la nouvelle catégorie existe et appartient à la même boutique
      const categoryExists = await prisma.category.findFirst({
        where: { 
          id: body.categoryId,
          shopId: existingProduct.shopId
        }
      });

      if (!categoryExists) {
        return NextResponse.json({
          success: false,
          error: 'Catégorie introuvable',
          message: 'La catégorie spécifiée n\'existe pas ou n\'appartient pas à cette boutique'
        }, { status: 404 });
      }
      
      validData.categoryId = body.categoryId;
    }

    // Vérifier qu'il y a au moins une donnée à modifier
    if (Object.keys(validData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune modification',
        message: 'Aucune donnée valide à modifier'
      }, { status: 400 });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validData,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    console.log('Produit mis à jour:', updatedProduct.id);
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produit mis à jour avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Produit introuvable',
        message: 'Le produit à modifier n\'existe pas'
      }, { status: 404 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Un produit avec ce SKU existe déjà'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de modification',
      message: 'Impossible de modifier le produit'
    }, { status: 500 });
  }
}

// SUPPRIMER - Supprimer un produit spécifique
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'ID invalide',
        message: 'L\'ID du produit est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si le produit existe avant de le supprimer
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Produit introuvable',
        message: 'Aucun produit trouvé avec cet ID'
      }, { status: 404 });
    }

    // Vérifier s'il y a des commandes liées qui empêchent la suppression
    if (existingProduct._count.orderItems > 0) {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer un produit qui fait partie de commandes existantes'
      }, { status: 409 });
    }
    
    const deletedProduct = await prisma.product.delete({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Produit supprimé:', deletedProduct.id);
    return NextResponse.json({
      success: true,
      data: deletedProduct,
      message: 'Produit supprimé avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression du produit:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Produit introuvable',
        message: 'Le produit à supprimer n\'existe pas'
      }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer un produit qui a des données liées'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de suppression',
      message: 'Impossible de supprimer le produit'
    }, { status: 500 });
  }
}