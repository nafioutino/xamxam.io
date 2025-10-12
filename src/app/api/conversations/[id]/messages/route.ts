import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's shop
    const userProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { shop: true }
    });

    if (!userProfile?.shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const { id } = await params;
    const conversationId = id;

    // Verify conversation belongs to user's shop
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        shopId: userProfile.shop.id
      },
      include: {
        customer: true,
        shop: {
          include: {
            channels: {
              where: {
                type: 'WHATSAPP' // You might need to adjust this based on conversation.platform
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages for this conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark customer messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        isFromCustomer: true,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Format messages for the frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sender: message.isFromCustomer ? 'contact' : 'user',
      read: message.isRead,
      type: message.messageType.toLowerCase() as 'text' | 'image' | 'audio' | 'video',
      mediaUrl: message.mediaUrl || undefined,
      messageId: message.externalId // External message ID from platform
    }));

    return NextResponse.json({ 
      messages: formattedMessages,
      conversation: {
        id: conversation.id,
        customer: conversation.customer ? {
          id: conversation.customer.id,
          name: conversation.customer.name || conversation.customer.phone || 'Client inconnu',
          avatar: `https://placehold.co/100x100?text=${(conversation.customer.name || 'C').charAt(0).toUpperCase()}`,
          phone: conversation.customer.phone
        } : null,
        channel: conversation.shop?.channels?.[0] ? {
          id: conversation.shop.channels[0].id,
          type: conversation.shop.channels[0].type,
          name: conversation.platform.charAt(0).toUpperCase() + conversation.platform.slice(1).toLowerCase()
        } : null,
        platform: conversation.platform.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}