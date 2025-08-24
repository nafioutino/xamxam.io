import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * API CRUD pour l'entité Shop
 * Gère les opérations de création, lecture, mise à jour et suppression des boutiques
 */

// LIRE - Récupérer toutes les boutiques
export async function GET(request: Request) {
  try {
    console.log('Récupération des boutiques...');
    
    // Récupérer toutes les boutiques avec leurs relations
    const shops = await prisma.shop.findMany({
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
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`${shops.length} boutique(s) récupérée(s)`);
    return NextResponse.json({
      success: true,
      data: shops,
      message: `${shops.length} boutique(s) trouvée(s)`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques:', error);
    return NextResponse.json({
      success: false,
      error: 'Impossible de récupérer les boutiques',
      message: 'Une erreur est survenue lors de la récupération des données'
    }, { status: 500 });
  }
}

// AJOUTER - Créer une nouvelle boutique
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, address, openingHours, faq, ownerId } = body;

    // Validation des données obligatoires
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'Le nom de la boutique est requis et ne peut pas être vide'
      }, { status: 400 });
    }

    if (!ownerId || typeof ownerId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID du propriétaire est requis et doit être un UUID valide'
      }, { status: 400 });
    }

    // Vérifier si le propriétaire existe
    const ownerExists = await prisma.profile.findUnique({
      where: { id: ownerId }
    });

    if (!ownerExists) {
      return NextResponse.json({
        success: false,
        error: 'Propriétaire introuvable',
        message: 'Le profil propriétaire spécifié n\'existe pas'
      }, { status: 404 });
    }

    // Vérifier si le propriétaire a déjà une boutique (contrainte unique)
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId }
    });

    if (existingShop) {
      return NextResponse.json({
        success: false,
        error: 'Boutique existante',
        message: 'Ce propriétaire possède déjà une boutique'
      }, { status: 409 });
    }

    // Créer la nouvelle boutique
    const newShop = await prisma.shop.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        openingHours: openingHours || null,
        faq: faq || null,
        ownerId
      },
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

    console.log('Nouvelle boutique créée:', newShop.id);
    return NextResponse.json({
      success: true,
      data: newShop,
      message: 'Boutique créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de la boutique:', error);
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Une boutique avec ces données existe déjà'
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Référence invalide',
        message: 'Le propriétaire spécifié n\'existe pas'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de création',
      message: 'Impossible de créer la boutique'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour une boutique existante
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
    
    if ('name' in data && data.name) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Données invalides',
          message: 'Le nom de la boutique ne peut pas être vide'
        }, { status: 400 });
      }
      validData.name = data.name.trim();
    }
    
    if ('description' in data) {
      validData.description = data.description?.trim() || null;
    }
    
    if ('address' in data) {
      validData.address = data.address?.trim() || null;
    }
    
    if ('openingHours' in data) {
      validData.openingHours = data.openingHours || null;
    }
    
    if ('faq' in data) {
      validData.faq = data.faq || null;
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

// SUPPRIMER - Supprimer une boutique
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

    // Vérifier si la boutique existe avant de la supprimer
    const existingShop = await prisma.shop.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true
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
                         existingShop._count.customers > 0;

    if (hasLinkedData) {
      return NextResponse.json({
        success: false,
        error: 'Suppression impossible',
        message: 'Impossible de supprimer une boutique qui contient des produits, commandes ou clients'
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