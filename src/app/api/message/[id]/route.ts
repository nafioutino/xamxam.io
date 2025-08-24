import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma  from '@/lib/prisma';
import { MessageType } from '@/generated/prisma';

// Validation schemas
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

const paramsSchema = z.object({
  id: z.string().uuid('Invalid message ID format'),
});

// GET /api/message/[id] - Get specific message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedParams = paramsSchema.parse(params);
    
    const message = await prisma.message.findUnique({
      where: {
        id: validatedParams.id
      },
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
            platform: true,
            shopId: true,
            shop: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
            messageType: true
          }
        },
        replies: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
            messageType: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(message);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/message/[id] - Update specific message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedParams = paramsSchema.parse(params);
    const body = await request.json();
    const validatedData = messageUpdateSchema.parse(body);
    
    // Check if message exists
    const existingMessage = await prisma.message.findUnique({
      where: { id: validatedParams.id },
      select: {
        id: true,
        conversationId: true,
        conversation: {
          select: {
            id: true,
            shopId: true
          }
        }
      }
    });
    
    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Validate conversation exists if being updated
    if (validatedData.conversationId) {
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
    }
    
    // Validate reply message if being updated
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
      
      // Check if reply message belongs to the same conversation
      const targetConversationId = validatedData.conversationId || existingMessage.conversationId;
      if (replyMessage.conversationId !== targetConversationId) {
        return NextResponse.json(
          { error: 'Reply message must belong to the same conversation' },
          { status: 400 }
        );
      }
      
      // Prevent self-reply
      if (validatedData.replyToId === validatedParams.id) {
        return NextResponse.json(
          { error: 'Message cannot reply to itself' },
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
    
    if (validatedData.messageType && validatedData.messageType !== MessageType.TEXT && !validatedData.mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is required for non-text message types' },
        { status: 400 }
      );
    }
    
    const updatedMessage = await prisma.message.update({
      where: {
        id: validatedParams.id
      },
      data: validatedData,
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
            platform: true,
            shopId: true,
            shop: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
            messageType: true
          }
        },
        replies: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
            messageType: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    return NextResponse.json(updatedMessage);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/message/[id] - Delete specific message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedParams = paramsSchema.parse(params);
    
    // Check if message exists and has replies
    const existingMessage = await prisma.message.findUnique({
      where: { id: validatedParams.id },
      select: {
        id: true,
        conversationId: true,
        replies: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Check if message has replies
    if (existingMessage.replies.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete message that has replies',
          repliesCount: existingMessage.replies.length
        },
        { status: 400 }
      );
    }
    
    await prisma.message.delete({
      where: {
        id: validatedParams.id
      }
    });
    
    return NextResponse.json({
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}