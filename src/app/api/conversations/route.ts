import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'; 
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    // Get conversations with their latest message
    const conversations = await prisma.conversation.findMany({
      where: {
        shopId: userProfile.shop.id
      },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isFromCustomer: true,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format conversations for the frontend
    const formattedConversations = conversations.map(conversation => {
      const lastMessage = conversation.messages[0];
      const unreadCount = conversation._count.messages;
      const customer = conversation.customer;

      return {
        id: conversation.id,
        customerId: customer?.id || null,
        name: customer?.name || customer?.phone || 'Client inconnu',
        avatar: customer?.avatarUrl || `https://placehold.co/100x100?text=${(customer?.name || 'C').charAt(0).toUpperCase()}`,
        lastMessage: lastMessage?.content || 'Aucun message',
        lastMessageTime: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
        unread: unreadCount,
        platform: conversation.platform.toLowerCase() as 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'tiktok' | 'email',
        online: false, // We don't track online status yet
        updatedAt: conversation.updatedAt
      };
    });

    return NextResponse.json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}