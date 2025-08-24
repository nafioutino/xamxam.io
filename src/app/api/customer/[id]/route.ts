import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'un client
const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').trim().optional(),
  phone: z.string().min(1, 'Le téléphone est requis').trim().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Récupérer un client spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[API] Récupération du client:', id);

    // Validation de l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de client invalide' },
        { status: 400 }
      );
    }

    // Récupération du client avec toutes ses relations
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            subtotal: true,
            shippingCost: true,
            taxAmount: true,
            paymentMethod: true,
            paymentStatus: true,
            shippingAddress: true,
            trackingNumber: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                productName: true,
                productSku: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        conversations: {
          select: {
            id: true,
            title: true,
            platform: true,
            externalId: true,
            isActive: true,
            lastMessageAt: true,
            unreadCount: true,
            tags: true,
            priority: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            messages: {
              select: {
                id: true,
                content: true,
                messageType: true,
                mediaUrl: true,
                isFromCustomer: true,
                isRead: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 10, // Derniers 10 messages par conversation
            },
          },
          orderBy: {
            lastMessageAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
            conversations: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    console.log('[API] Client récupéré avec succès:', customer.id);
    return NextResponse.json(customer);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération du client:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un client spécifique
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('[API] Mise à jour du client:', id, body);

    // Validation de l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de client invalide' },
        { status: 400 }
      );
    }

    // Validation des données
    const validationResult = updateCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('[API] Erreur de validation:', validationResult.error.errors);
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Vérifier que le client existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Si le téléphone est modifié, vérifier l'unicité
    if (updateData.phone && updateData.phone !== existingCustomer.phone) {
      const phoneExists = await prisma.customer.findFirst({
        where: {
          shopId: existingCustomer.shopId,
          phone: updateData.phone,
          id: { not: id },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Un client avec ce numéro de téléphone existe déjà dans cette boutique' },
          { status: 409 }
        );
      }
    }

    // Nettoyer les données de mise à jour
    const cleanUpdateData: any = {};
    Object.keys(updateData).forEach(key => {
      const value = updateData[key as keyof typeof updateData];
      if (value !== undefined) {
        if (key === 'email' && value === '') {
          cleanUpdateData[key] = null;
        } else {
          cleanUpdateData[key] = value;
        }
      }
    });

    // Vérifier qu'il y a des données à mettre à jour
    if (Object.keys(cleanUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Mettre à jour le client
    const customer = await prisma.customer.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        conversations: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true,
            unreadCount: true,
            lastMessageAt: true,
          },
          orderBy: {
            lastMessageAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
            conversations: true,
          },
        },
      },
    });

    console.log('[API] Client mis à jour avec succès:', customer.id);
    return NextResponse.json(customer);
  } catch (error) {
    console.error('[API] Erreur lors de la mise à jour du client:', error);
    
    // Gestion des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Un client avec ce téléphone existe déjà dans cette boutique' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un client spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[API] Suppression du client:', id);

    // Validation de l'ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID de client invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le client existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            conversations: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des commandes liées
    if (existingCustomer._count.orders > 0) {
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer ce client car il a des commandes associées',
          details: `${existingCustomer._count.orders} commande(s) trouvée(s)`
        },
        { status: 409 }
      );
    }

    // Vérifier s'il y a des conversations liées
    if (existingCustomer._count.conversations > 0) {
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer ce client car il a des conversations associées',
          details: `${existingCustomer._count.conversations} conversation(s) trouvée(s)`
        },
        { status: 409 }
      );
    }

    // Supprimer le client
    await prisma.customer.delete({
      where: { id },
    });

    console.log('[API] Client supprimé avec succès:', id);
    return NextResponse.json(
      { message: 'Client supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Erreur lors de la suppression du client:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}