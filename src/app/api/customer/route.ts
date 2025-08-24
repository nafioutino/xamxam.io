import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour la création d'un client
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').trim(),
  phone: z.string().min(1, 'Le téléphone est requis').trim(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  shopId: z.string().uuid('ID de boutique invalide'),
});

// Schéma de validation pour la mise à jour d'un client
const updateCustomerSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(1, 'Le nom est requis').trim().optional(),
  phone: z.string().min(1, 'Le téléphone est requis').trim().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

// Schéma de validation pour la suppression d'un client
const deleteCustomerSchema = z.object({
  id: z.string().uuid('ID invalide'),
});

// GET - Récupérer tous les clients avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: any = {};
    
    if (shopId) {
      if (!z.string().uuid().safeParse(shopId).success) {
        return NextResponse.json(
          { error: 'ID de boutique invalide' },
          { status: 400 }
        );
      }
      where.shopId = shopId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    // Récupération des clients avec pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
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
            take: 5, // Dernières 5 commandes
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
            take: 5, // Dernières 5 conversations
          },
          _count: {
            select: {
              orders: true,
              conversations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    console.log(`[API] Récupération de ${customers.length} clients (page ${page}/${Math.ceil(total / limit)})`);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Création d\'un client:', body);

    // Validation des données
    const validationResult = createCustomerSchema.safeParse(body);
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

    const { name, phone, email, address, city, country, notes, shopId } = validationResult.data;

    // Vérifier que la boutique existe
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du téléphone dans la boutique
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        shopId,
        phone,
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Un client avec ce numéro de téléphone existe déjà dans cette boutique' },
        { status: 409 }
      );
    }

    // Créer le client
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        address,
        city,
        country,
        notes,
        shopId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
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

    console.log('[API] Client créé avec succès:', customer.id);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('[API] Erreur lors de la création du client:', error);
    
    // Gestion des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Un client avec ce téléphone existe déjà dans cette boutique' },
          { status: 409 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Boutique non trouvée' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un client
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Mise à jour d\'un client:', body);

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

    const { id, ...updateData } = validationResult.data;

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

    // Mettre à jour le client
    const customer = await prisma.customer.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
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

// DELETE - Supprimer un client
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Suppression d\'un client:', body);

    // Validation des données
    const validationResult = deleteCustomerSchema.safeParse(body);
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

    const { id } = validationResult.data;

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