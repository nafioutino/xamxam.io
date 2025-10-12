import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseRealtimeProps {
  onConversationChange?: (payload: any) => void;
  onMessageChange?: (payload: any) => void;
  shopId?: string;
  enabled?: boolean;
}

export function useSupabaseRealtime({
  onConversationChange,
  onMessageChange,
  shopId,
  enabled = true
}: UseSupabaseRealtimeProps) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !shopId) {
      return;
    }

    // Créer un canal Realtime unique pour ce shop
    const channel = supabase
      .channel(`shop-${shopId}-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `shopId=eq.${shopId}`
        },
        (payload) => {
          console.log('Conversation change:', payload);
          if (onConversationChange) {
            onConversationChange(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message change:', payload);
          if (onMessageChange) {
            onMessageChange(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from Realtime channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, shopId, onConversationChange, onMessageChange]);

  // Fonction pour forcer la déconnexion
  const disconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return {
    disconnect,
    isConnected: channelRef.current !== null
  };
}