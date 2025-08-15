'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChatBubbleLeftRightIcon, PhoneIcon, VideoCameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'tiktok' | 'email';
  online?: boolean;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'contact';
  read: boolean;
  type: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
}

export default function InboxPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Simulate fetching contacts
  useEffect(() => {
    const timer = setTimeout(() => {
      const demoContacts: Contact[] = [
        {
          id: 'c1',
          name: 'Sophie Martin',
          avatar: 'https://placehold.co/100x100?text=SM',
          lastMessage: 'Bonjour, est-ce que vous avez ce produit en taille M ?',
          lastMessageTime: '10:23',
          unread: 2,
          platform: 'whatsapp',
          online: true,
        },
        {
          id: 'c2',
          name: 'Thomas Dubois',
          avatar: 'https://placehold.co/100x100?text=TD',
          lastMessage: 'Merci pour votre réponse rapide !',
          lastMessageTime: '09:45',
          unread: 0,
          platform: 'facebook',
        },
        {
          id: 'c3',
          name: 'Emma Petit',
          avatar: 'https://placehold.co/100x100?text=EP',
          lastMessage: 'Je voudrais commander le sac à main en cuir noir',
          lastMessageTime: 'Hier',
          unread: 1,
          platform: 'instagram',
        },
        {
          id: 'c4',
          name: 'Lucas Bernard',
          avatar: 'https://placehold.co/100x100?text=LB',
          lastMessage: 'Est-ce que vous livrez à l\'international ?',
          lastMessageTime: 'Hier',
          unread: 0,
          platform: 'telegram',
          online: true,
        },
        {
          id: 'c5',
          name: 'Chloé Moreau',
          avatar: 'https://placehold.co/100x100?text=CM',
          lastMessage: 'J\'ai un problème avec ma commande #12345',
          lastMessageTime: 'Lun',
          unread: 3,
          platform: 'whatsapp',
        },
        {
          id: 'c6',
          name: 'info@client.com',
          avatar: 'https://placehold.co/100x100?text=IC',
          lastMessage: 'Demande de catalogue produits',
          lastMessageTime: 'Dim',
          unread: 0,
          platform: 'email',
        },
        {
          id: 'c7',
          name: '@fashion_lover',
          avatar: 'https://placehold.co/100x100?text=FL',
          lastMessage: 'J\'adore vos nouveaux produits !',
          lastMessageTime: '23 Mai',
          unread: 0,
          platform: 'tiktok',
        },
      ];
      setContacts(demoContacts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Simulate fetching messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      const demoMessages: Message[] = [
        {
          id: 'm1',
          content: `Bonjour, je suis intéressé(e) par vos produits.`,
          timestamp: '10:10',
          sender: 'contact',
          read: true,
          type: 'text',
        },
        {
          id: 'm2',
          content: `Bonjour ! Comment puis-je vous aider aujourd'hui ?`,
          timestamp: '10:12',
          sender: 'user',
          read: true,
          type: 'text',
        },
        {
          id: 'm3',
          content: selectedContact.lastMessage,
          timestamp: selectedContact.lastMessageTime,
          sender: 'contact',
          read: selectedContact.unread === 0,
          type: 'text',
        },
      ];

      // Add some media messages for demo purposes
      if (selectedContact.id === 'c3') {
        demoMessages.push({
          id: 'm4',
          content: '',
          timestamp: '10:20',
          sender: 'contact',
          read: false,
          type: 'image',
          mediaUrl: 'https://placehold.co/400x300?text=Product+Image',
        });
      }

      if (selectedContact.id === 'c5') {
        demoMessages.push({
          id: 'm5',
          content: '',
          timestamp: '10:25',
          sender: 'contact',
          read: false,
          type: 'audio',
          mediaUrl: '#audio-message',
        });
      }

      setMessages(demoMessages);

      // Mark messages as read
      if (selectedContact.unread > 0) {
        const updatedContacts = contacts.map((contact) =>
          contact.id === selectedContact.id ? { ...contact, unread: 0 } : contact
        );
        setContacts(updatedContacts);
      }
    }
  }, [selectedContact]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      read: true,
      type: 'text',
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Simulate response after 1 second
    setTimeout(() => {
      const responseMsg: Message = {
        id: `m${Date.now() + 1}`,
        content: 'Merci pour votre message. Un conseiller va vous répondre prochainement.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'contact',
        read: true,
        type: 'text',
      };
      setMessages((prev) => [...prev, responseMsg]);
      toast.success('Message envoyé avec succès');
    }, 1000);
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
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-2 h-2 text-white" />
          </div>
        );
      case 'facebook':
        return <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">f</div>;
      case 'instagram':
        return <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">i</div>;
      case 'telegram':
        return <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center">t</div>;
      case 'tiktok':
        return <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">tt</div>;
      case 'email':
        return <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">@</div>;
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

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
      {/* Contacts sidebar */}
      <div className="w-full sm:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50">
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <h2 className="font-semibold text-gray-800">Messages</h2>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
            <div className="p-4 text-center text-gray-500">Aucun contact trouvé</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-200 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-12 w-12 rounded-full object-cover"
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
                    <div className="flex items-center">
                      {getPlatformIcon(contact.platform)}
                      {contact.unread > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
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
        {selectedContact ? (
          <>
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                  <div className="flex items-center">
                    {getPlatformIcon(selectedContact.platform)}
                    <span className="ml-1 text-xs text-gray-500">
                      {selectedContact.platform.charAt(0).toUpperCase() + selectedContact.platform.slice(1)}
                    </span>
                    {selectedContact.online && (
                      <span className="ml-2 text-xs text-green-500 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                        En ligne
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <VideoCameraIcon className="h-5 w-5" />
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
                      className={`rounded-lg p-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'}`}
                      >
                        {message.timestamp}
                        {message.sender === 'user' && message.read && (
                          <CheckCircleIcon className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </div>
                  ) : message.type === 'image' ? (
                    <div
                      className={`rounded-lg p-1 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                        <div className="w-32 h-2 bg-gray-300 rounded-full">
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
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white rounded-r-md px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
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
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
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
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <button
                onClick={() => setSelectedContact(null)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                  <div className="flex items-center">
                    {getPlatformIcon(selectedContact.platform)}
                    <span className="ml-1 text-xs text-gray-500">
                      {selectedContact.platform.charAt(0).toUpperCase() + selectedContact.platform.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <PhoneIcon className="h-5 w-5" />
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
                          <CheckCircleIcon className="ml-1 h-3 w-3" />
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
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
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white rounded-r-md px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}