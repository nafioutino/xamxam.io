import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API pour récupérer une boutique spécifique par son ID
 * Gère les opérations de lecture, mise à jour et suppression d'une boutique individuelle
 */

// LIRE - Récupérer une boutique par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Paramètre invalide',
        message: 'L\'ID de la boutique est requis'
      }, { status: 400 });
    }

    console.log('Récupération de la boutique:', id);
    
    // Récupérer la boutique avec toutes ses relations
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            // email: true,
            // phoneNumber: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: {
                products: true
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        channels: {
          select: {
            id: true,
            type: true,
            isActive: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
            conversations: true
          }
        }
      }
    });
    
    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'Aucune boutique trouvée avec cet ID'
      }, { status: 404 });
    }
    
    console.log('Boutique récupérée:', shop.name);
    return NextResponse.json({
      success: true,
      data: shop,
      message: 'Boutique récupérée avec succès'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur de récupération',
      message: 'Impossible de récupérer la boutique'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour une boutique spécifique
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
        error: 'Paramètre invalide',
        message: 'L\'ID de la boutique est requis'
      }, { status: 400 });
    }

    // Vérifier si la boutique existe
    const existingShop = await prisma.shop.findUnique({
      where: { id }
    });

    if (!existingShop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'Aucune boutique trouvée avec cet ID'
      }, { status: 404 });
    }
    
    // Filtrer et nettoyer les données valides
    const validData: {
      name?: string;
      description?: string | null;
      address?: string | null;
      openingHours?: any;
      faq?: any;
    } = {};
    
    if ('name' in body && body.name) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le nom de la boutique ne peut pas être vide'
        }, { status: 400 });
      }
      validData.name = body.name.trim();
    }
    
    if ('description' in body) {
      validData.description = body.description?.trim() || null;
    }
    
    if ('address' in body) {
      validData.address = body.address?.trim() || null;
    }
    
    if ('openingHours' in body) {
      validData.openingHours = body.openingHours || null;
    }
    
    if ('faq' in body) {
      validData.faq = body.faq || null;
    }

    // Vérifier qu'il y a au moins une donnée à modifier
    if (Object.keys(validData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune modification',
        message: 'Aucune donnée valide à modifier'
      }, { status: 400 });
    }
    
    const updatedShop = await prisma.shop.update({
      where: { id },
      data: validData,
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
            customers: true
          }
        }
      }
    });

    console.log('Boutique mise à jour:', updatedShop.id);
    return NextResponse.json({
      success: true,
      data: updatedShop,
      message: 'Boutique mise à jour avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la boutique:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'La boutique à modifier n\'existe pas'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de modification',
      message: 'Impossible de modifier la boutique'
    }, { status: 500 });
  }
}

// SUPPRIMER - Supprimer une boutique spécifique
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Paramètre invalide',
        message: 'L\'ID de la boutique est requis'
      }, { status: 400 });
    }

    // Vérifier si la boutique existe avant de la supprimer
    const existingShop = await prisma.shop.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
            categories: true,
            channels: true,
            conversations: true
          }
        }
      }
    });

    if (!existingShop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'Aucune boutique trouvée avec cet ID'
      }, { status: 404 });
    }

    // Vérifier s'il y a des données liées qui empêchent la suppression
    const hasLinkedData = existingShop._count.products > 0 || 
                         existingShop._count.orders > 0 || 
                         existingShop._count.customers > 0 ||
                         existingShop._count.categories > 0 ||
                         existingShop._count.channels > 0 ||
                         existingShop._count.conversations > 0;

    if (hasLinkedData) {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer une boutique qui contient des données liées (produits, commandes, clients, etc.)'
      }, { status: 409 });
    }
    
    const deletedShop = await prisma.shop.delete({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    console.log('Boutique supprimée:', deletedShop.id);
    return NextResponse.json({
      success: true,
      data: deletedShop,
      message: 'Boutique supprimée avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la boutique:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Boutique introuvable',
        message: 'La boutique à supprimer n\'existe pas'
      }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer une boutique qui a des données liées'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de suppression',
      message: 'Impossible de supprimer la boutique'
    }, { status: 500 });
  }
}