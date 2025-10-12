import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'contact';
  read: boolean;
  type: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  messageId?: string;
  conversationId: string;
  createdAt: string;
}

interface UseMessagesRealtimeProps {
  conversationId?: string;
  initialMessages?: Message[];
  enabled?: boolean;
}

export function useMessagesRealtime({
  conversationId,
  initialMessages = [],
  enabled = true
}: UseMessagesRealtimeProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleMessageChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Filtrer seulement les messages de la conversation actuelle
    if (conversationId && newRecord?.conversationId !== conversationId) {
      return;
    }

    setMessages(prev => {
      switch (eventType) {
        case 'INSERT':
          // Ajouter un nouveau message
          const messageExists = prev.some(msg => msg.id === newRecord.id);
          if (!messageExists) {
            return [...prev, {
              ...newRecord,
              timestamp: new Date(newRecord.createdAt).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }];
          }
          return prev;

        case 'UPDATE':
          // Mettre à jour un message existant
          return prev.map(msg => 
            msg.id === newRecord.id ? { 
              ...msg, 
              ...newRecord,
              timestamp: new Date(newRecord.createdAt).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            } : msg
          );

        case 'DELETE':
          // Supprimer un message
          return prev.filter(msg => msg.id !== oldRecord.id);

        default:
          return prev;
      }
    });
  }, [conversationId]);

  useEffect(() => {
    if (!enabled || !conversationId) {
      // Nettoyer le canal existant si pas de conversationId
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Nettoyer le canal précédent
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Créer un nouveau canal pour cette conversation
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${conversationId}`
        },
        handleMessageChange
      )
      .subscribe((status) => {
        console.log(`Messages Realtime subscription status for conversation ${conversationId}:`, status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, conversationId, handleMessageChange]);

  const updateMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const messageExists = prev.some(msg => msg.id === message.id);
      if (!messageExists) {
        return [...prev, message];
      }
      return prev;
    });
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  }, []);

  const disconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return {
    messages,
    updateMessages,
    addMessage,
    markAsRead,
    disconnect,
    isConnected: channelRef.current !== null
  };
}