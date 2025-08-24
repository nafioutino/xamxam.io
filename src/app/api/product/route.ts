import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API CRUD pour l'entité Product
 * Gère les opérations de création, lecture, mise à jour et suppression des produits
 */

// LIRE - Récupérer tous les produits
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    
    console.log('Récupération des produits...');
    
    // Construire les filtres
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === 'true';
    
    // Récupérer tous les produits avec leurs relations
    const products = await prisma.product.findMany({
      where,
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
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`${products.length} produit(s) récupéré(s)`);
    return NextResponse.json({
      success: true,
      data: products,
      message: `${products.length} produit(s) trouvé(s)`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json({
      success: false,
      error: 'Impossible de récupérer les produits',
      message: 'Une erreur est survenue lors de la récupération des données'
    }, { status: 500 });
  }
}

// AJOUTER - Créer un nouveau produit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      stock, 
      images, 
      sku, 
      weight, 
      dimensions, 
      shopId, 
      categoryId,
      isActive 
    } = body;

    // Validation des données obligatoires
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'Le nom du produit est requis et ne peut pas être vide'
      }, { status: 400 });
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'Le prix est requis et doit être un nombre positif'
      }, { status: 400 });
    }

    if (!shopId || typeof shopId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID de la boutique est requis'
      }, { status: 400 });
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID de la catégorie est requis'
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

    // Vérifier si la catégorie existe et appartient à la boutique
    const categoryExists = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        shopId: shopId
      }
    });

    if (!categoryExists) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie introuvable',
        message: 'La catégorie spécifiée n\'existe pas ou n\'appartient pas à cette boutique'
      }, { status: 404 });
    }

    // Vérifier l'unicité du SKU si fourni
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          shopId,
          sku
        }
      });

      if (existingSku) {
        return NextResponse.json({
          success: false,
          error: 'SKU existant',
          message: 'Un produit avec ce SKU existe déjà dans cette boutique'
        }, { status: 409 });
      }
    }

    // Créer le nouveau produit
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price.toString()),
        stock: parseInt(stock?.toString() || '0'),
        images: Array.isArray(images) ? images : [],
        sku: sku?.trim() || null,
        weight: weight ? parseFloat(weight.toString()) : null,
        dimensions: dimensions || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        shopId,
        categoryId
      },
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
            name: true,
            description: true
          }
        }
      }
    });

    console.log('Nouveau produit créé:', newProduct.id);
    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Produit créé avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du produit:', error);
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Un produit avec ces données existe déjà (SKU en doublon)'
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Référence invalide',
        message: 'La boutique ou la catégorie spécifiée n\'existe pas'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de création',
      message: 'Impossible de créer le produit'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour un produit existant
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
    
    if ('name' in data && data.name) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le nom du produit ne peut pas être vide'
        }, { status: 400 });
      }
      validData.name = data.name.trim();
    }
    
    if ('description' in data) {
      validData.description = data.description?.trim() || null;
    }
    
    if ('price' in data) {
      if (typeof data.price !== 'number' || data.price <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le prix doit être un nombre positif'
        }, { status: 400 });
      }
      validData.price = parseFloat(data.price.toString());
    }
    
    if ('stock' in data) {
      if (typeof data.stock !== 'number' || data.stock < 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le stock doit être un nombre positif ou zéro'
        }, { status: 400 });
      }
      validData.stock = parseInt(data.stock.toString());
    }
    
    if ('images' in data) {
      validData.images = Array.isArray(data.images) ? data.images : [];
    }
    
    if ('sku' in data) {
      const newSku = data.sku?.trim() || null;
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
    
    if ('weight' in data) {
      validData.weight = data.weight ? parseFloat(data.weight.toString()) : null;
    }
    
    if ('dimensions' in data) {
      validData.dimensions = data.dimensions || null;
    }
    
    if ('isActive' in data) {
      validData.isActive = Boolean(data.isActive);
    }
    
    if ('categoryId' in data) {
      // Vérifier si la nouvelle catégorie existe et appartient à la même boutique
      const categoryExists = await prisma.category.findFirst({
        where: { 
          id: data.categoryId,
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
      
      validData.categoryId = data.categoryId;
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
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
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

// SUPPRIMER - Supprimer un produit
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