import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma  from '@/lib/prisma';
import { MessageType } from '@/generated/prisma';

// Validation schemas
const messageCreateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
  mediaUrl: z.string().url().optional(),
  mediaType: z.string().optional(),
  isFromCustomer: z.boolean(),
  isRead: z.boolean().default(false),
  externalId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  conversationId: z.string().uuid('Invalid conversation ID format'),
  replyToId: z.string().uuid('Invalid reply message ID format').optional(),
});

const messageUpdateSchema = z.object({
  content: z.string().min(1).optional(),
  messageType: z.nativeEnum(MessageType).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.string().optional(),
  isFromCustomer: z.boolean().optional(),
  isRead: z.boolean().optional(),
  externalId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  conversationId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
});

const messageBulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one message ID is required'),
  data: messageUpdateSchema,
});

const querySchema = z.object({
  conversationId: z.string().uuid().optional(),
  isFromCustomer: z.enum(['true', 'false']).optional(),
  isRead: z.enum(['true', 'false']).optional(),
  messageType: z.nativeEnum(MessageType).optional(),
  search: z.string().optional(), // Search in content
  replyToId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'content']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/message - Get all messages with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = querySchema.parse(queryParams);
    
    const {
      conversationId,
      isFromCustomer,
      isRead,
      messageType,
      search,
      replyToId,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = validatedQuery;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where: any = {};
    
    if (conversationId) {
      where.conversationId = conversationId;
    }
    
    if (isFromCustomer !== undefined) {
      where.isFromCustomer = isFromCustomer === 'true';
    }
    
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    
    if (messageType) {
      where.messageType = messageType;
    }
    
    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (replyToId) {
      where.replyToId = replyToId;
    }
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          conversation: {
            select: {
              id: true,
              title: true,
              platform: true,
              shopId: true,
            }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              isFromCustomer: true,
              createdAt: true,
            }
          },
          replies: {
            select: {
              id: true,
              content: true,
              isFromCustomer: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum,
      }),
      prisma.message.count({ where })
    ]);
    
    return NextResponse.json({
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/message - Create new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = messageCreateSchema.parse(body);
    
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: validatedData.conversationId },
      select: { id: true, shopId: true }
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Check if reply message exists and belongs to the same conversation
    if (validatedData.replyToId) {
      const replyMessage = await prisma.message.findUnique({
        where: { id: validatedData.replyToId },
        select: { id: true, conversationId: true }
      });
      
      if (!replyMessage) {
        return NextResponse.json(
          { error: 'Reply message not found' },
          { status: 404 }
        );
      }
      
      if (replyMessage.conversationId !== validatedData.conversationId) {
        return NextResponse.json(
          { error: 'Reply message must belong to the same conversation' },
          { status: 400 }
        );
      }
    }
    
    // Validate media fields consistency
    if (validatedData.mediaUrl && !validatedData.mediaType) {
      return NextResponse.json(
        { error: 'Media type is required when media URL is provided' },
        { status: 400 }
      );
    }
    
    if (validatedData.messageType !== MessageType.TEXT && !validatedData.mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is required for non-text message types' },
        { status: 400 }
      );
    }
    
    const message = await prisma.message.create({
      data: validatedData,
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
            platform: true,
            shopId: true,
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
          }
        },
        replies: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    // Update conversation's lastMessageAt and unreadCount
    await prisma.conversation.update({
      where: { id: validatedData.conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: validatedData.isFromCustomer ? {
          increment: 1
        } : undefined
      }
    });
    
    return NextResponse.json(message, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/message - Bulk update messages
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = messageBulkUpdateSchema.parse(body);
    
    const { ids, data } = validatedData;
    
    // Check if all messages exist
    const existingMessages = await prisma.message.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        conversationId: true
      }
    });
    
    if (existingMessages.length !== ids.length) {
      const foundIds = existingMessages.map(m => m.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: 'Some messages not found', missingIds },
        { status: 404 }
      );
    }
    
    // Validate conversation exists if being updated
    if (data.conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        select: { id: true }
      });
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    }
    
    // Validate reply message if being updated
    if (data.replyToId) {
      const replyMessage = await prisma.message.findUnique({
        where: { id: data.replyToId },
        select: { id: true, conversationId: true }
      });
      
      if (!replyMessage) {
        return NextResponse.json(
          { error: 'Reply message not found' },
          { status: 404 }
        );
      }
      
      // Check if reply message belongs to the same conversation as the messages being updated
      const targetConversationId = data.conversationId || existingMessages[0].conversationId;
      if (replyMessage.conversationId !== targetConversationId) {
        return NextResponse.json(
          { error: 'Reply message must belong to the same conversation' },
          { status: 400 }
        );
      }
    }
    
    // Validate media fields consistency
    if (data.mediaUrl && !data.mediaType) {
      return NextResponse.json(
        { error: 'Media type is required when media URL is provided' },
        { status: 400 }
      );
    }
    
    if (data.messageType && data.messageType !== MessageType.TEXT && !data.mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is required for non-text message types' },
        { status: 400 }
      );
    }
    
    const updatedMessages = await prisma.message.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data
    });
    
    return NextResponse.json({
      message: 'Messages updated successfully',
      updatedCount: updatedMessages.count
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/message - Bulk delete messages
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }
    
    const ids = idsParam.split(',').map(id => id.trim());
    
    // Validate UUIDs
    const uuidSchema = z.array(z.string().uuid());
    const validatedIds = uuidSchema.parse(ids);
    
    // Check if messages exist
    const existingMessages = await prisma.message.findMany({
      where: {
        id: {
          in: validatedIds
        }
      },
      select: {
        id: true,
        replies: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (existingMessages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found' },
        { status: 404 }
      );
    }
    
    // Check if any messages have replies
    const messagesWithReplies = existingMessages.filter(m => m.replies.length > 0);
    if (messagesWithReplies.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete messages that have replies',
          messagesWithReplies: messagesWithReplies.map(m => m.id)
        },
        { status: 400 }
      );
    }
    
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        id: {
          in: validatedIds
        }
      }
    });
    
    return NextResponse.json({
      message: 'Messages deleted successfully',
      deletedCount: deletedMessages.count
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}