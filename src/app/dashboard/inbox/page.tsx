'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Phone, 
  Video, 
  Send, 
  ArrowLeft, 
  Link as LinkIcon, 
  Smile, 
  Image, 
  Mic, 
  Play, 
  CheckCircle, 
  MessagesSquare 
} from 'lucide-react';
import { 
  WhatsAppIcon, 
  MessengerIcon, 
  InstagramIcon, 
  TelegramIcon, 
  TikTokIcon, 
  EmailIcon 
} from '@/components/dashboard/ChannelIcons';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import { createClient } from '@/utils/supabase/client';
import { useConversationsRealtime } from '@/hooks/useConversationsRealtime';
import { useMessagesRealtime } from '@/hooks/useMessagesRealtime';

interface Contact {
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
  createdAt?: string;
}

interface ConversationDetails {
  id: string;
  customer?: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  } | null;
  channel?: {
    id: string;
    type: string;
    name: string;
  } | null;
}

export default function InboxPage() {
  const { user, session } = useAuth();
  const { shop } = useShop();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  // Utiliser les hooks Realtime
  const {
    conversations: contacts,
    updateConversations: setContacts,
    markAsRead: markConversationAsRead,
    isConnected: conversationsConnected
  } = useConversationsRealtime({
    shopId: shop?.id,
    enabled: !!shop?.id
  });

  const {
    messages,
    updateMessages: setMessages,
    addMessage,
    isConnected: messagesConnected
  } = useMessagesRealtime({
    conversationId: selectedContact?.id,
    enabled: !!selectedContact?.id
  });

  // Fetch conversations from API
  const fetchConversations = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      // Utiliser le hook Realtime pour mettre à jour les conversations
      setContacts(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      // Utiliser le hook Realtime pour mettre à jour les messages
      setMessages(data.messages || []);
      setConversationDetails(data.conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  // Send message via API
  const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' | 'video' = 'text') => {
    if (!selectedContact || !session?.access_token) return;

    try {
      setSendingMessage(true);
      const response = await fetch('/api/messenger/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedContact.id,
          message: content,
          messageType: type.toUpperCase(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', data);
        const errorMessage = data.error || data.message || 'Failed to send message';
        throw new Error(errorMessage);
      }
      
      // Add message to local state immediately for better UX
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sender: 'user',
        read: true,
        type,
        conversationId: selectedContact.id,
        createdAt: new Date().toISOString()
      };

      // Utiliser le hook Realtime pour ajouter le message
      addMessage({ ...newMsg, createdAt: newMsg.createdAt ?? new Date().toISOString() });
      setNewMessage('');
      toast.success('Message envoyé avec succès');

      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      toast.error(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    if (user && shop && session) {
      fetchConversations();
    }
  }, [user, shop, session]);

  // Load messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || sendingMessage) return;
    sendMessage(newMessage.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === 'all') return true;
    return contact.platform === filter;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-green-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" />
          </span>
        );
      case 'facebook':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-blue-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <MessengerIcon className="w-3.5 h-3.5 text-blue-600" />
          </span>
        );
      case 'instagram':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-pink-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
          </span>
        );
      case 'telegram':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-blue-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <TelegramIcon className="w-3.5 h-3.5 text-blue-400" />
          </span>
        );
      case 'tiktok':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-gray-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <TikTokIcon className="w-3.5 h-3.5 text-black" />
          </span>
        );
      case 'email':
        return (
          <span className="w-5 h-5 rounded-full bg-white ring-1 ring-gray-200 ring-offset-1 shadow-sm flex items-center justify-center">
            <EmailIcon className="w-3.5 h-3.5 text-gray-600" />
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200 flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-gray-200 flex items-center px-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`mb-4 flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`rounded-lg p-3 ${i % 2 === 0 ? 'bg-gray-200 w-2/3' : 'bg-gray-200 w-1/2'}`}>
                    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !shop) {
    return (
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Vous devez être connecté et avoir une boutique pour accéder à la messagerie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
      {/* Contacts sidebar */}
      <div className="w-full sm:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50">
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <h2 className="font-semibold text-gray-800">Messages</h2>
          <div className="flex items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 max-w-[180px]"
            >
              <option value="all">Toutes les plateformes</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="telegram">Telegram</option>
              <option value="tiktok">TikTok</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {contacts.length === 0 ? 'Aucune conversation' : 'Aucun contact trouvé'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-200 flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 cursor-pointer rounded-md ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(contact.platform)}
                      {contact.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white shadow-sm">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="hidden sm:flex flex-1 flex-col">
        {selectedContact && conversationDetails ? (
          <>
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <img
                  src={conversationDetails.customer?.avatar || `https://placehold.co/100x100?text=C`}
                  alt={conversationDetails.customer?.name || 'Client inconnu'}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{conversationDetails.customer?.name || 'Client inconnu'}</h3>
                  <div className="flex items-center">
                    {getPlatformIcon(selectedContact.platform)}
                    <span className="ml-1 text-xs text-gray-500">
                      {conversationDetails.channel?.name || selectedContact.platform}
                    </span>
                    {selectedContact.online && (
                      <span className="ml-2 text-xs text-green-600 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                        En ligne
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Appel audio">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Appel vidéo">
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'text' ? (
                    <div
                      className={`rounded-lg p-3 max-w-xs lg:max-w-md shadow-sm hover:shadow-md transition-shadow duration-200 ${message.sender === 'user' ? 'bg-blue-600 text-white ring-1 ring-blue-200' : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                        {message.sender === 'user' && message.read && (
                          <CheckCircle className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </div>
                  ) : message.type === 'image' ? (
                    <div
                      className={`rounded-lg p-1 max-w-xs lg:max-w-md shadow-sm hover:shadow-md transition-shadow duration-200 ${message.sender === 'user' ? 'bg-blue-600 ring-1 ring-blue-200' : 'bg-gray-100 ring-1 ring-gray-200'}`}
                    >
                      <img
                        src={message.mediaUrl}
                        alt="Image partagée"
                        className="rounded-md max-w-full h-auto"
                      />
                      <div
                        className={`text-xs mt-1 p-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  ) : message.type === 'audio' ? (
                    <div
                      className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${message.sender === 'user' ? 'bg-blue-600 text-white ring-1 ring-blue-200' : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-full bg-gray-100 text-gray-800">
                          <Play className="h-4 w-4" />
                        </button>
                        <div className="w-24 h-2 bg-gray-300 rounded-full">
                          <div className="w-1/3 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-xs">0:12</span>
                      </div>
                      <div
                        className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                  disabled={sendingMessage}
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-blue-600 text-white rounded-r-md px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Joindre un lien">
                    <LinkIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Insérer un emoji">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Envoyer une image">
                    <Image className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Envoyer un audio">
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => toast.success('Fonctionnalité IA à implémenter')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Répondre avec IA
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessagesSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune conversation sélectionnée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez une conversation pour commencer à discuter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile view - show only contact list or conversation */}
      <div className="flex sm:hidden flex-1 flex-col">
        {selectedContact ? (
          <>
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-gradient-to-r from-indigo-50 to-blue-50">
              <button
                onClick={() => setSelectedContact(null)}
                className="mr-2 text-gray-500 hover:text-gray-700"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={selectedContact?.avatar || `https://placehold.co/100x100?text=${(selectedContact?.name || 'C').charAt(0).toUpperCase()}`}
                  alt={selectedContact?.name || 'Contact'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{selectedContact?.name || 'Contact inconnu'}</h3>
                  <div className="flex items-center">
                    {selectedContact?.platform && getPlatformIcon(selectedContact.platform)}
                    <span className="ml-1 text-xs text-gray-500">
                      {selectedContact?.platform ? selectedContact.platform.charAt(0).toUpperCase() + selectedContact.platform.slice(1) : 'Plateforme inconnue'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'text' ? (
                    <div
                      className={`rounded-lg p-3 max-w-xs ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                        {message.sender === 'user' && message.read && (
                          <CheckCircle className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </div>
                  ) : message.type === 'image' ? (
                    <div
                      className={`rounded-lg p-1 max-w-xs ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <img
                        src={message.mediaUrl}
                        alt="Shared image"
                        className="rounded-md max-w-full h-auto"
                      />
                      <div
                        className={`text-xs mt-1 p-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  ) : message.type === 'audio' ? (
                    <div
                      className={`rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-full bg-gray-100 text-gray-800">
                          <Play className="h-4 w-4" />
                        </button>
                        <div className="w-24 h-2 bg-gray-300 rounded-full">
                          <div className="w-1/3 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-xs">0:12</span>
                      </div>
                      <div
                        className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-blue-600 text-white rounded-r-md px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Envoyer le message"
                >
                  {sendingMessage ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Joindre un lien">
                    <LinkIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Insérer un emoji">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Envoyer une image">
                    <Image className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors" disabled={sendingMessage} aria-label="Envoyer un audio">
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => toast.success('Fonctionnalité IA à implémenter')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Répondre avec IA
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}