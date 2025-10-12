import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';

// Validation schemas
const updateChannelSchema = z.object({
  type: z.nativeEnum(ChannelType).optional(),
  externalId: z.string().min(1).optional(),
  accessToken: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/channel/[id] - Get a specific channel
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid channel ID format' },
        { status: 400 }
      );
    }

    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true
          }
        }
      }
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/channel/[id] - Update a specific channel
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
        { error: 'Invalid channel ID format' },
        { status: 400 }
      );
    }

    const validatedData = updateChannelSchema.parse(body);

    // Check if channel exists
    const existingChannel = await prisma.channel.findUnique({
      where: { id }
    });

    if (!existingChannel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check for unique constraint violations if type or externalId is being updated
    if (validatedData.type || validatedData.externalId) {
      const newType = validatedData.type || existingChannel.type;
      const newExternalId = validatedData.externalId || existingChannel.externalId;
      
      const conflictingChannel = await prisma.channel.findFirst({
        where: {
          shopId: existingChannel.shopId,
          type: newType,
          externalId: newExternalId,
          id: {
            not: id
          }
        }
      });

      if (conflictingChannel) {
        return NextResponse.json(
          { error: `Channel with type ${newType} and external ID ${newExternalId} already exists for this shop` },
          { status: 409 }
        );
      }
    }

    const updatedChannel = await prisma.channel.update({
      where: { id },
      data: {
        type: validatedData.type,
        externalId: validatedData.externalId,
        accessToken: validatedData.accessToken,
        isActive: validatedData.isActive
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true
          }
        }
      }
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/channel/[id] - Delete a specific channel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid channel ID format' },
        { status: 400 }
      );
    }

    // Check if channel exists
    const existingChannel = await prisma.channel.findUnique({
      where: { id }
    });

    if (!existingChannel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check if channel has linked conversations
    const linkedConversations = await prisma.conversation.findMany({
      where: {
        platform: existingChannel.type,
        shopId: existingChannel.shopId
      },
      select: {
        id: true,
        platform: true
      }
    });

    if (linkedConversations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete channel with linked conversations',
          linkedConversations: linkedConversations.map((conv: { id: string; platform: string }) => ({
            conversationId: conv.id,
            platform: conv.platform
          }))
        },
        { status: 409 }
      );
    }

    await prisma.channel.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Channel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}