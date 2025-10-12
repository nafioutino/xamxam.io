import { useState, useCallback } from 'react';
import { useSupabaseRealtime } from './useSupabaseRealtime';

interface Conversation {
  id: string;
  customerId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'tiktok' | 'email';
  online?: boolean;
  channelId: string;
  updatedAt: string;
}

interface UseConversationsRealtimeProps {
  shopId?: string;
  initialConversations?: Conversation[];
  enabled?: boolean;
}

export function useConversationsRealtime({
  shopId,
  initialConversations = [],
  enabled = true
}: UseConversationsRealtimeProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

  const handleConversationChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setConversations(prev => {
      switch (eventType) {
        case 'INSERT':
          // Ajouter une nouvelle conversation
          return [newRecord, ...prev];

        case 'UPDATE':
          // Mettre à jour une conversation existante
          return prev.map(conv => 
            conv.id === newRecord.id ? { ...conv, ...newRecord } : conv
          );

        case 'DELETE':
          // Supprimer une conversation
          return prev.filter(conv => conv.id !== oldRecord.id);

        default:
          return prev;
      }
    });
  }, []);

  const handleMessageChange = useCallback((payload: any) => {
    const { eventType, new: newMessage } = payload;

    if (eventType === 'INSERT' && newMessage) {
      // Mettre à jour la conversation avec le nouveau message
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === newMessage.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage.content || 'Nouveau message',
              lastMessageTime: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              unread: newMessage.sender === 'contact' ? conv.unread + 1 : conv.unread,
              updatedAt: newMessage.createdAt
            };
          }
          return conv;
        })
      );
    }
  }, []);

  const { disconnect, isConnected } = useSupabaseRealtime({
    onConversationChange: handleConversationChange,
    onMessageChange: handleMessageChange,
    shopId,
    enabled
  });

  const updateConversations = useCallback((newConversations: Conversation[]) => {
    setConversations(newConversations);
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );
  }, []);

  return {
    conversations,
    updateConversations,
    markAsRead,
    disconnect,
    isConnected
  };
}