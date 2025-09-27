import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ChannelType, ConversationPriority, ConversationStatus } from '@/generated/prisma';

// Validation schemas
const createConversationSchema = z.object({
  title: z.string().optional(),
  platform: z.nativeEnum(ChannelType, { required_error: 'Platform is required' }),
  externalId: z.string().optional(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.string().datetime().optional(),
  unreadCount: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.nativeEnum(ConversationPriority).optional(),
  status: z.nativeEnum(ConversationStatus).optional(),
  shopId: z.string().uuid('Invalid shop ID'),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  orderId: z.string().uuid('Invalid order ID').optional()
});

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

// GET /api/conversation - Get all conversations with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
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

    if (orderId) {
      if (!z.string().uuid().safeParse(orderId).success) {
        return NextResponse.json(
          { error: 'Invalid order ID format' },
          { status: 400 }
        );
      }
      where.orderId = orderId;
    }

    if (platform) {
      if (!Object.values(ChannelType).includes(platform as ChannelType)) {
        return NextResponse.json(
          { error: 'Invalid platform type' },
          { status: 400 }
        );
      }
      where.platform = platform;
    }

    if (status) {
      if (!Object.values(ConversationStatus).includes(status as ConversationStatus)) {
        return NextResponse.json(
          { error: 'Invalid conversation status' },
          { status: 400 }
        );
      }
      where.status = status;
    }

    if (priority) {
      if (!Object.values(ConversationPriority).includes(priority as ConversationPriority)) {
        return NextResponse.json(
          { error: 'Invalid conversation priority' },
          { status: 400 }
        );
      }
      where.priority = priority;
    }

    if (isActive !== null && isActive !== undefined) {
      if (isActive !== 'true' && isActive !== 'false') {
        return NextResponse.json(
          { error: 'Invalid isActive value. Must be true or false' },
          { status: 400 }
        );
      }
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          externalId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagArray
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
    const allowedSortFields = ['createdAt', 'updatedAt', 'lastMessageAt', 'title', 'priority', 'status', 'unreadCount'];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [conversations, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true
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
            take: 1
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where })
    ]);

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversation - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createConversationSchema.parse(body);

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

    // Check if customer exists (if provided)
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
      if (customer.shopId !== validatedData.shopId) {
        return NextResponse.json(
          { error: 'Customer does not belong to this shop' },
          { status: 400 }
        );
      }
    }

    // Check if order exists (if provided)
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
      if (order.shopId !== validatedData.shopId) {
        return NextResponse.json(
          { error: 'Order does not belong to this shop' },
          { status: 400 }
        );
      }

      // Check if order already has a conversation
      const existingConversation = await prisma.conversation.findUnique({
        where: { orderId: validatedData.orderId }
      });

      if (existingConversation) {
        return NextResponse.json(
          { error: 'Order already has an associated conversation' },
          { status: 409 }
        );
      }
    }

    // Check for unique constraint violations (shopId, platform, externalId)
    if (validatedData.externalId) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          shopId: validatedData.shopId,
          platform: validatedData.platform,
          externalId: validatedData.externalId
        }
      });

      if (existingConversation) {
        return NextResponse.json(
          { error: 'Conversation with this platform and external ID already exists for this shop' },
          { status: 409 }
        );
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: validatedData.title,
        platform: validatedData.platform,
        externalId: validatedData.externalId,
        isActive: validatedData.isActive ?? true,
        lastMessageAt: validatedData.lastMessageAt ? new Date(validatedData.lastMessageAt) : null,
        unreadCount: validatedData.unreadCount ?? 0,
        tags: validatedData.tags ?? [],
        priority: validatedData.priority ?? ConversationPriority.NORMAL,
        status: validatedData.status ?? ConversationStatus.OPEN,
        shopId: validatedData.shopId,
        customerId: validatedData.customerId,
        orderId: validatedData.orderId
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true
          }
        }
      }
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversation - Bulk update conversations
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

    const validatedData = updateConversationSchema.parse(data);

    // Check if conversations exist
    const existingConversations = await prisma.conversation.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (existingConversations.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more conversations not found' },
        { status: 404 }
      );
    }

    // Validate customer and order relationships if being updated
    if (validatedData.customerId || validatedData.orderId) {
      for (const conversation of existingConversations) {
        if (validatedData.customerId) {
          const customer = await prisma.customer.findUnique({
            where: { id: validatedData.customerId }
          });

          if (!customer || customer.shopId !== conversation.shopId) {
            return NextResponse.json(
              { error: 'Customer not found or does not belong to the same shop' },
              { status: 400 }
            );
          }
        }

        if (validatedData.orderId) {
          const order = await prisma.order.findUnique({
            where: { id: validatedData.orderId }
          });

          if (!order || order.shopId !== conversation.shopId) {
            return NextResponse.json(
              { error: 'Order not found or does not belong to the same shop' },
              { status: 400 }
            );
          }

          // Check if order already has a conversation (excluding current ones)
          const existingOrderConversation = await prisma.conversation.findFirst({
            where: {
              orderId: validatedData.orderId,
              id: {
                notIn: ids
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
      }
    }

    // Update conversations
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

    const updatedConversations = await prisma.conversation.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: updateData
    });

    return NextResponse.json({
      message: `${updatedConversations.count} conversations updated successfully`,
      count: updatedConversations.count
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversation - Bulk delete conversations
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

    // Check if conversations exist
    const existingConversations = await prisma.conversation.findMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      },
      include: {
        messages: {
          select: {
            id: true
          }
        }
      }
    });

    if (existingConversations.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more conversations not found' },
        { status: 404 }
      );
    }

    // Check if any conversation has messages
    const conversationsWithMessages = existingConversations.filter(
      (conversation: { messages: { id: string }[] }) => conversation.messages.length > 0
    );

    if (conversationsWithMessages.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete conversations with messages',
          conversationsWithMessages: conversationsWithMessages.map((conv: { id: any; title: any; messages: string | any[]; }) => ({
            conversationId: conv.id,
            title: conv.title,
            messageCount: conv.messages.length
          }))
        },
        { status: 409 }
      );
    }

    // Delete conversations
    const deletedConversations = await prisma.conversation.deleteMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      }
    });

    return NextResponse.json({
      message: `${deletedConversations.count} conversations deleted successfully`,
      count: deletedConversations.count
    });
  } catch (error) {
    console.error('Error deleting conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}