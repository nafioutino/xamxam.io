'use client';

import { useState, useEffect, Fragment } from 'react';
import { useShop } from '@/hooks/useShop';
import { Plus, Zap, Settings, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { 
  WhatsAppIcon, 
  TikTokIcon, 
  MessengerIcon, 
  // EmailIcon,  // Temporairement commenté
  // SMSIcon,    // Temporairement commenté
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon
} from '@/components/dashboard/ChannelIcons';
import SuccessNotification from '@/components/dashboard/SuccessNotification';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

interface Channel {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  lastActivity?: string;
  messageCount?: number;
  pageName?: string; // Nom de la page/profil connecté
}

const availableChannels: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'disconnected',
    description: 'Connectez votre compte WhatsApp Business pour recevoir et envoyer des messages',
    icon: WhatsAppIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'tiktok',
    status: 'disconnected',
    description: 'Intégrez TikTok pour communiquer avec vos clients',
    icon: TikTokIcon,
    color: 'text-black',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    type: 'messenger',
    status: 'disconnected',
    description: 'Connectez Facebook Messenger pour gérer les conversations',
    icon: MessengerIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'instagram',
    status: 'disconnected',
    description: 'Connectez Instagram pour gérer les messages directs',
    icon: InstagramIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:bg-pink-100',
  },
  // TEMPORAIREMENT DÉSACTIVÉS - Email et SMS
  // {
  //   id: 'email',
  //   name: 'Email',
  //   type: 'email',
  //   status: 'disconnected',
  //   description: 'Configurez votre email professionnel pour les communications',
  //   icon: EmailIcon,
  //   color: 'text-gray-600',
  //   bgColor: 'bg-gray-50',
  //   borderColor: 'border-gray-200',
  //   hoverColor: 'hover:bg-gray-100',
  // },
  // {
  //   id: 'sms',
  //   name: 'SMS',
  //   type: 'sms',
  //   status: 'disconnected',
  //   description: 'Envoyez des SMS à vos clients directement depuis XAMXAM',
  //   icon: SMSIcon,
  //   color: 'text-purple-500',
  //   bgColor: 'bg-purple-50',
  //   borderColor: 'border-purple-200',
  //   hoverColor: 'hover:bg-purple-100',
  // },
];

const getStatusIcon = (status: Channel['status']) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'pending':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <XCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusText = (status: Channel['status']) => {
  switch (status) {
    case 'connected':
      return 'Connecté';
    case 'error':
      return 'Erreur';
    case 'pending':
      return 'En cours';
    default:
      return 'Déconnecté';
  }
};

const getStatusColor = (status: Channel['status']) => {
  switch (status) {
    case 'connected':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'error':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'pending':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(availableChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [pendingDisconnectChannelId, setPendingDisconnectChannelId] = useState<string | null>(null);
  const { shop, isLoading: shopLoading } = useShop();

  // Vérifier les paramètres URL pour les messages de succès
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'page_connected') {
      setShowSuccessMessage(true);
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/dashboard/channels');
      // Masquer le message après 5 secondes
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  // Récupérer l'état des canaux depuis l'API
  useEffect(() => {
    const fetchChannelStatus = async () => {
      try {
        const response = await fetch('/api/channels/status');
        if (response.ok) {
          const data = await response.json();
          
          // Mettre à jour l'état des canaux avec les données de la base
           setChannels(prev => prev.map(channel => {
             const connectedChannel = data.connectedChannels[channel.type];
             if (connectedChannel) {
               return {
                 ...channel,
                 status: 'connected' as const,
                 lastActivity: new Date(connectedChannel.connectedAt).toLocaleDateString('fr-FR'),
                 messageCount: Math.floor(Math.random() * 50), // Simulation pour l'instant
                 pageName: connectedChannel.pageName // Nom du profil/page connecté
               };
             }
             return channel;
           }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du statut des canaux:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelStatus();
  }, []);

  const handleConnectChannel = (channelId: string) => {
    // Redirection vers la page de connexion spécifique pour chaque canal
    window.location.href = `/dashboard/channels/connect/${channelId}`;
  };

  const handleDisconnectChannel = async (channelId: string): Promise<boolean> => {
    try {
      // Trouver le canal à déconnecter
      const channelToDisconnect = channels.find(c => c.id === channelId);
      if (!channelToDisconnect) return false;

      // Mettre à jour l'état local immédiatement
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, status: 'disconnected' as const, lastActivity: undefined, messageCount: undefined }
          : channel
      ));

      // Appeler l'API pour déconnecter WhatsApp via Evolution API
      if (channelToDisconnect.type === 'whatsapp') {
        if (!shop || shopLoading) {
          throw new Error('Boutique non prête. Réessayez dans un instant.');
        }
        const response = await fetch('/api/channels/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId: shop.id, action: 'disconnect_instance' })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success === false) {
          const errorMsg = data?.error || `Échec de la déconnexion (${response.status})`;
          throw new Error(errorMsg);
        }
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion du canal:', error);
      // Restaurer l'état en cas d'erreur
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, status: 'connected' as const }
          : channel
      ));
      return false;
    }
  };

  const requestDisconnectChannel = (channelId: string) => {
    setPendingDisconnectChannelId(channelId);
    setDisconnectConfirmOpen(true);
  };

  const confirmDisconnect = async () => {
    if (!pendingDisconnectChannelId) return;
    setDisconnectConfirmOpen(false);
    const ok = await handleDisconnectChannel(pendingDisconnectChannelId);
    if (ok) {
      toast.success('Canal déconnecté');
    }
    setPendingDisconnectChannelId(null);
  };

  const cancelDisconnect = () => {
    setDisconnectConfirmOpen(false);
    setPendingDisconnectChannelId(null);
  };

  const connectedChannels = channels.filter(channel => channel.status === 'connected');
  const disconnectedChannels = channels.filter(channel => channel.status !== 'connected');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification de succès pour TikTok */}
      <SuccessNotification />
      
      {/* Message de succès pour autres canaux */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Canal connecté avec succès !
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Votre canal de communication est maintenant actif et prêt à recevoir des messages.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-auto text-green-600 hover:text-green-800 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="bg-gradient-to-r from-white to-blue-50 shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Canaux</h1>
            <p className="text-gray-600 mt-2">
              Connectez et gérez vos canaux de communication pour centraliser toutes vos conversations clients
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-gray-500">
              {connectedChannels.length} canal{connectedChannels.length !== 1 ? 'x' : ''} connecté{connectedChannels.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canaux connectés</p>
              <p className="text-2xl font-bold text-gray-900">{connectedChannels.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">
                {connectedChannels.reduce((total, channel) => total + (channel.messageCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canaux disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Canaux connectés */}
      {connectedChannels.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Canaux Connectés</h2>
            <p className="text-sm text-gray-600">Gérez vos canaux de communication actifs</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedChannels.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <div key={channel.id} className={`${channel.bgColor} rounded-lg border ${channel.borderColor} p-4 ${channel.hoverColor} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-inset ring-gray-100">
                          <IconComponent className={`h-6 w-6 ${channel.color}`} />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{channel.name}</h3>
                          {channel.pageName && (
                            <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" /> {channel.pageName}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            {getStatusIcon(channel.status)}
                            <span className={`ml-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(channel.status)}`}>
                              {getStatusText(channel.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedChannel(channel)}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer rounded-md hover:bg-gray-100"
                        aria-label="Configurer le canal"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                    {channel.lastActivity && (
                      <div className="mt-3 text-xs text-gray-500">
                        Dernière activité: {channel.lastActivity}
                      </div>
                    )}
                    {channel.messageCount !== undefined && (
                      <div className="mt-2 text-xs text-gray-600">
                        {channel.messageCount} message{channel.messageCount !== 1 ? 's' : ''} aujourd'hui
                      </div>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => requestDisconnectChannel(channel.id)}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" /> Déconnecter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Canaux disponibles */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Canaux Disponibles</h2>
          <p className="text-sm text-gray-600">Connectez de nouveaux canaux pour étendre votre portée</p>
        </div>
        <div className="p-6">
          {disconnectedChannels.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tous les canaux sont connectés !</h3>
              <p className="text-gray-600">Félicitations ! Vous avez connecté tous les canaux disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disconnectedChannels.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <div key={channel.id} className={`${channel.bgColor} rounded-lg border ${channel.borderColor} p-4 ${channel.hoverColor} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-inset ring-gray-100">
                          <IconComponent className={`h-6 w-6 ${channel.color}`} />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{channel.name}</h3>
                          <div className="flex items-center mt-1">
                            {getStatusIcon(channel.status)}
                            <span className={`ml-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(channel.status)}`}>
                              {getStatusText(channel.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">{channel.description}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleConnectChannel(channel.id)}
                        disabled={channel.status === 'pending'}
                        className={`w-full text-xs px-3 py-2 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 ${
                          channel.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        }`}
                      >
                        {channel.status === 'pending' ? (
                          'Connexion en cours...'
                        ) : (
                          <>
                            <Plus className="h-4 w-4" /> Connecter
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message d'information pour ZOBA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Zap className="h-6 w-6 text-blue-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">À propos de XAMXAM</h3>
            <p className="text-sm text-blue-700 mt-1">
              XAMXAM centralise toutes vos conversations clients en un seul endroit. Connectez vos canaux de communication 
              préférés et laissez notre IA vous aider à gérer efficacement toutes vos interactions commerciales.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Conseil :</strong> Commencez par connecter WhatsApp Business, c'est le canal le plus populaire auprès des clients.
            </p>
          </div>
        </div>
      </div>

      {/* Modale de confirmation de déconnexion */}
      <Transition.Root show={disconnectConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelDisconnect}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Déconnecter le canal
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Voulez-vous vraiment déconnecter ce canal ?</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={confirmDisconnect}
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto cursor-pointer"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={cancelDisconnect}
                      className="mt-3 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}