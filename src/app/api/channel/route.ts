import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ChannelType } from '@/generated/prisma';

// Validation schemas
const createChannelSchema = z.object({
  type: z.nativeEnum(ChannelType, { required_error: 'Channel type is required' }),
  externalId: z.string().min(1, 'External ID is required'),
  accessToken: z.string().optional(),
  isActive: z.boolean().optional(),
  shopId: z.string().uuid('Invalid shop ID')
});

const updateChannelSchema = z.object({
  type: z.nativeEnum(ChannelType).optional(),
  externalId: z.string().min(1).optional(),
  accessToken: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/channel - Get all channels with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const externalId = searchParams.get('externalId');
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

    if (type) {
      if (!Object.values(ChannelType).includes(type as ChannelType)) {
        return NextResponse.json(
          { error: 'Invalid channel type' },
          { status: 400 }
        );
      }
      where.type = type;
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

    if (externalId) {
      where.externalId = {
        contains: externalId,
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
    const allowedSortFields = ['createdAt', 'type', 'externalId', 'isActive'];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [channels, totalCount] = await Promise.all([
      prisma.channel.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.channel.count({ where })
    ]);

    return NextResponse.json({
      channels,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/channel - Create a new channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createChannelSchema.parse(body);

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

    // Check if channel with same shopId, type, and externalId already exists
    const existingChannel = await prisma.channel.findFirst({
      where: {
        shopId: validatedData.shopId,
        type: validatedData.type,
        externalId: validatedData.externalId
      }
    });

    if (existingChannel) {
      return NextResponse.json(
        { error: 'Channel with this type and external ID already exists for this shop' },
        { status: 409 }
      );
    }

    const channel = await prisma.channel.create({
      data: {
        type: validatedData.type,
        externalId: validatedData.externalId,
        accessToken: validatedData.accessToken,
        isActive: validatedData.isActive ?? true,
        shopId: validatedData.shopId
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/channel - Bulk update channels
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

    const validatedData = updateChannelSchema.parse(data);

    // Check if channels exist
    const existingChannels = await prisma.channel.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (existingChannels.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more channels not found' },
        { status: 404 }
      );
    }

    // Check for unique constraint violations if type or externalId is being updated
    if (validatedData.type || validatedData.externalId) {
      for (const channel of existingChannels) {
        const newType = validatedData.type || channel.type;
        const newExternalId = validatedData.externalId || channel.externalId;
        
        const conflictingChannel = await prisma.channel.findFirst({
          where: {
            shopId: channel.shopId,
            type: newType,
            externalId: newExternalId,
            id: {
              not: channel.id
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
    }

    // Update channels
    const updatedChannels = await prisma.channel.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        type: validatedData.type,
        externalId: validatedData.externalId,
        accessToken: validatedData.accessToken,
        isActive: validatedData.isActive
      }
    });

    return NextResponse.json({
      message: `${updatedChannels.count} channels updated successfully`,
      count: updatedChannels.count
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/channel - Bulk delete channels
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

    // Check if channels exist
    const existingChannels = await prisma.channel.findMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      }
    });

    if (existingChannels.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more channels not found' },
        { status: 404 }
      );
    }

    // Check if any channel has linked conversations
    const channelsWithConversations = await prisma.conversation.findMany({
      where: {
        platform: {
          in: existingChannels.map(channel => channel.type)
        },
        shopId: {
          in: existingChannels.map(channel => channel.shopId)
        }
      },
      select: {
        id: true,
        platform: true,
        shopId: true
      }
    });

    if (channelsWithConversations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete channels with linked conversations',
          linkedConversations: channelsWithConversations.map(conv => ({
            conversationId: conv.id,
            platform: conv.platform,
            shopId: conv.shopId
          }))
        },
        { status: 409 }
      );
    }

    // Delete channels
    const deletedChannels = await prisma.channel.deleteMany({
      where: {
        id: {
          in: ids.map(id => id.trim())
        }
      }
    });

    return NextResponse.json({
      message: `${deletedChannels.count} channels deleted successfully`,
      count: deletedChannels.count
    });
  } catch (error) {
    console.error('Error deleting channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}