import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@/generated/prisma';

// Validation schemas
const createOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  status: z.nativeEnum(OrderStatus).optional(),
  total: z.number().positive('Total must be positive'),
  subtotal: z.number().positive('Subtotal must be positive'),
  shippingCost: z.number().min(0, 'Shipping cost cannot be negative').optional(),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingAddress: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  shopId: z.string().uuid('Invalid shop ID'),
  customerId: z.string().uuid('Invalid customer ID'),
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID').optional(),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    totalPrice: z.number().positive('Total price must be positive'),
    productName: z.string().min(1, 'Product name is required'),
    productSku: z.string().optional()
  })).min(1, 'At least one item is required')
});

const updateOrderSchema = z.object({
  orderNumber: z.string().min(1).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  total: z.number().positive().optional(),
  subtotal: z.number().positive().optional(),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingAddress: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().uuid().optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(), // For updating existing items
    productId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    productName: z.string().min(1),
    productSku: z.string().optional()
  })).optional()
});

// GET /api/order - Get all orders with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const orderNumber = searchParams.get('orderNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (shopId) {
      if (!z.string().uuid().safeParse(shopId).success) {
        return NextResponse.json(
          { error: 'Invalid shop ID format' },
          { status: 400 }
        );
      }
      where.shopId = shopId;
    }

    if (customerId) {
      if (!z.string().uuid().safeParse(customerId).success) {
        return NextResponse.json(
          { error: 'Invalid customer ID format' },
          { status: 400 }
        );
      }
      where.customerId = customerId;
    }

    if (status) {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        return NextResponse.json(
          { error: 'Invalid order status' },
          { status: 400 }
        );
      }
      where.status = status;
    }

    if (paymentStatus) {
      if (!Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status' },
          { status: 400 }
        );
      }
      where.paymentStatus = paymentStatus;
    }

    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber,
        mode: 'insensitive'
      };
    }

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const allowedSortFields = ['createdAt', 'updatedAt', 'total', 'orderNumber', 'status'];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          },
          conversation: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/order - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: validatedData.shopId }
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if customer exists and belongs to the shop
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        shopId: validatedData.shopId
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or does not belong to this shop' },
        { status: 404 }
      );
    }

    // Check if order number is unique within the shop
    const existingOrder = await prisma.order.findFirst({
      where: {
        shopId: validatedData.shopId,
        orderNumber: validatedData.orderNumber
      }
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Order number already exists in this shop' },
        { status: 409 }
      );
    }

    // Validate products if productId is provided
    for (const item of validatedData.items) {
      if (item.productId) {
        const product = await prisma.product.findFirst({
          where: {
            id: item.productId,
            shopId: validatedData.shopId
          }
        });

        if (!product) {
          return NextResponse.json(
            { error: `Product with ID ${item.productId} not found or does not belong to this shop` },
            { status: 404 }
          );
        }
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: validatedData.orderNumber,
        status: validatedData.status || OrderStatus.PENDING,
        total: validatedData.total,
        subtotal: validatedData.subtotal,
        shippingCost: validatedData.shippingCost,
        taxAmount: validatedData.taxAmount,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentStatus || PaymentStatus.PENDING,
        shippingAddress: validatedData.shippingAddress,
        trackingNumber: validatedData.trackingNumber,
        notes: validatedData.notes,
        shopId: validatedData.shopId,
        customerId: validatedData.customerId,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productName: item.productName,
            productSku: item.productSku
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/order - Bulk update orders
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, data } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate IDs
    for (const id of ids) {
      if (!z.string().uuid().safeParse(id).success) {
        return NextResponse.json(
          { error: `Invalid ID format: ${id}` },
          { status: 400 }
        );
      }
    }

    const validatedData = updateOrderSchema.parse(data);

    // Check if orders exist
    const existingOrders = await prisma.order.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (existingOrders.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more orders not found' },
        { status: 404 }
      );
    }

    // Update orders
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        orderNumber: validatedData.orderNumber,
        status: validatedData.status,
        total: validatedData.total,
        subtotal: validatedData.subtotal,
        shippingCost: validatedData.shippingCost,
        taxAmount: validatedData.taxAmount,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentStatus,
        shippingAddress: validatedData.shippingAddress,
        trackingNumber: validatedData.trackingNumber,
        notes: validatedData.notes,
        customerId: validatedData.customerId
      }
    });

    return NextResponse.json({
      message: `${updatedOrders.count} orders updated successfully`,
      count: updatedOrders.count
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/order - Bulk delete orders
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'IDs parameter is required' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',');

    // Validate IDs
    for (const id of ids) {
      if (!z.string().uuid().safeParse(id.trim()).success) {
        return NextResponse.json(
          { error: `Invalid ID format: ${id}` },
          { status: 400 }
        );
      }
    }

    // Check if orders exist
    const existingOrders = await prisma.order.findMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      },
      include: {
        conversation: true
      }
    });

    if (existingOrders.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more orders not found' },
        { status: 404 }
      );
    }

    // Check if any order has linked conversations
    const ordersWithConversations = existingOrders.filter((order: { conversation?: { id: string } | null }) => order.conversation);
    if (ordersWithConversations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete orders with linked conversations',
          linkedOrders: ordersWithConversations.map((order: { id: any; orderNumber: any; conversation: { id: any; } | null; }) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            conversationId: order.conversation?.id
          }))
        },
        { status: 409 }
      );
    }

    // Delete orders (items will be deleted automatically due to cascade)
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      }
    });

    return NextResponse.json({
      message: `${deletedOrders.count} orders deleted successfully`,
      count: deletedOrders.count
    });
  } catch (error) {
    console.error('Error deleting orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}