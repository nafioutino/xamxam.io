import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ChannelType, ConversationPriority, ConversationStatus } from '@/generated/prisma';

// Validation schemas
const updateConversationSchema = z.object({
  title: z.string().optional(),
  platform: z.nativeEnum(ChannelType).optional(),
  externalId: z.string().optional(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.string().datetime().optional(),
  unreadCount: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.nativeEnum(ConversationPriority).optional(),
  status: z.nativeEnum(ConversationStatus).optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  orderId: z.string().uuid('Invalid order ID').optional()
});

// GET /api/conversation/[id] - Get a specific conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true
          }
        },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            subtotal: true,
            paymentStatus: true,
            createdAt: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            messageType: true,
            mediaUrl: true,
            mediaType: true,
            isFromCustomer: true,
            isRead: true,
            externalId: true,
            createdAt: true,
            updatedAt: true,
            replyToId: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversation/[id] - Update a specific conversation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    const validatedData = updateConversationSchema.parse(body);

    // Check if conversation exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Validate customer relationship if being updated
    if (validatedData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId }
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      // Verify customer belongs to the same shop
      if (customer.shopId !== existingConversation.shopId) {
        return NextResponse.json(
          { error: 'Customer does not belong to this shop' },
          { status: 400 }
        );
      }
    }

    // Validate order relationship if being updated
    if (validatedData.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: validatedData.orderId }
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Verify order belongs to the same shop
      if (order.shopId !== existingConversation.shopId) {
        return NextResponse.json(
          { error: 'Order does not belong to this shop' },
          { status: 400 }
        );
      }

      // Check if order already has a conversation (excluding current one)
      const existingOrderConversation = await prisma.conversation.findFirst({
        where: {
          orderId: validatedData.orderId,
          id: {
            not: id
          }
        }
      });

      if (existingOrderConversation) {
        return NextResponse.json(
          { error: 'Order already has an associated conversation' },
          { status: 409 }
        );
      }
    }

    // Check for unique constraint violations if platform or externalId is being updated
    if (validatedData.platform || validatedData.externalId) {
      const newPlatform = validatedData.platform || existingConversation.platform;
      const newExternalId = validatedData.externalId || existingConversation.externalId;
      
      if (newExternalId) {
        const conflictingConversation = await prisma.conversation.findFirst({
          where: {
            shopId: existingConversation.shopId,
            platform: newPlatform,
            externalId: newExternalId,
            id: {
              not: id
            }
          }
        });

        if (conflictingConversation) {
          return NextResponse.json(
            { error: `Conversation with platform ${newPlatform} and external ID ${newExternalId} already exists for this shop` },
            { status: 409 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.platform !== undefined) updateData.platform = validatedData.platform;
    if (validatedData.externalId !== undefined) updateData.externalId = validatedData.externalId;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.lastMessageAt !== undefined) updateData.lastMessageAt = validatedData.lastMessageAt ? new Date(validatedData.lastMessageAt) : null;
    if (validatedData.unreadCount !== undefined) updateData.unreadCount = validatedData.unreadCount;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.customerId !== undefined) updateData.customerId = validatedData.customerId;
    if (validatedData.orderId !== undefined) updateData.orderId = validatedData.orderId;

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: updateData,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true
          }
        },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            subtotal: true,
            paymentStatus: true,
            createdAt: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            messageType: true,
            isFromCustomer: true,
            isRead: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversation/[id] - Delete a specific conversation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if conversation has messages
    if (existingConversation.messages.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete conversation with messages',
          messageCount: existingConversation.messages.length
        },
        { status: 409 }
      );
    }

    await prisma.conversation.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Conversation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}