import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@/generated/prisma';

// Validation schema for updating an order
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

// GET /api/order/[id] - Get a specific order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                stock: true,
                images: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        conversation: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true,
            priority: true,
            lastMessageAt: true,
            unreadCount: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/order/[id] - Update a specific order
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const validatedData = updateOrderSchema.parse(body);

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order number is unique within the shop (if being updated)
    if (validatedData.orderNumber && validatedData.orderNumber !== existingOrder.orderNumber) {
      const orderWithSameNumber = await prisma.order.findFirst({
        where: {
          shopId: existingOrder.shopId,
          orderNumber: validatedData.orderNumber,
          id: {
            not: id
          }
        }
      });

      if (orderWithSameNumber) {
        return NextResponse.json(
          { error: 'Order number already exists in this shop' },
          { status: 409 }
        );
      }
    }

    // Check if customer exists and belongs to the shop (if being updated)
    if (validatedData.customerId && validatedData.customerId !== existingOrder.customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: validatedData.customerId,
          shopId: existingOrder.shopId
        }
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found or does not belong to this shop' },
          { status: 404 }
        );
      }
    }

    // Validate products if items are being updated
    if (validatedData.items) {
      for (const item of validatedData.items) {
        if (item.productId) {
          const product = await prisma.product.findFirst({
            where: {
              id: item.productId,
              shopId: existingOrder.shopId
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
    }

    // Prepare update data
    const updateData: any = {
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
    };

    // Handle items update if provided
    if (validatedData.items) {
      // Delete existing items and create new ones
      updateData.items = {
        deleteMany: {},
        create: validatedData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productName: item.productName,
          productSku: item.productSku
        }))
      };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        conversation: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/order/[id] - Delete a specific order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        conversation: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order has linked conversation
    if (existingOrder.conversation) {
      return NextResponse.json(
        { 
          error: 'Cannot delete order with linked conversation',
          conversationId: existingOrder.conversation.id
        },
        { status: 409 }
      );
    }

    // Delete order (items will be deleted automatically due to cascade)
    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrder: {
        id: existingOrder.id,
        orderNumber: existingOrder.orderNumber
      }
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}