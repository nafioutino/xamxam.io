'use client';

import { useState } from 'react';
import { Plus, Zap, Settings, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { 
  WhatsAppIcon, 
  TelegramIcon, 
  MessengerIcon, 
  EmailIcon, 
  SMSIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon
} from '@/components/dashboard/ChannelIcons';

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
    id: 'telegram',
    name: 'Telegram',
    type: 'telegram',
    status: 'disconnected',
    description: 'Intégrez Telegram pour communiquer avec vos clients',
    icon: TelegramIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
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
    type: 'messenger',
    status: 'disconnected',
    description: 'Connectez Instagram pour gérer les messages directs',
    icon: InstagramIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:bg-pink-100',
  },
  {
    id: 'email',
    name: 'Email',
    type: 'email',
    status: 'disconnected',
    description: 'Configurez votre email professionnel pour les communications',
    icon: EmailIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
  },
  {
    id: 'sms',
    name: 'SMS',
    type: 'sms',
    status: 'disconnected',
    description: 'Envoyez des SMS à vos clients directement depuis ZOBA',
    icon: SMSIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
  },
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

  const handleConnectChannel = (channelId: string) => {
    // Redirection vers la page de connexion spécifique pour chaque canal
    window.location.href = `/dashboard/channels/connect/${channelId}`;
  };

  const handleDisconnectChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, status: 'disconnected' as const, lastActivity: undefined, messageCount: undefined }
        : channel
    ));
  };

  const connectedChannels = channels.filter(channel => channel.status === 'connected');
  const disconnectedChannels = channels.filter(channel => channel.status !== 'connected');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow-sm rounded-lg p-6">
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
                  <div key={channel.id} className={`${channel.bgColor} rounded-lg border ${channel.borderColor} p-4 ${channel.hoverColor} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
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
                      <button
                        onClick={() => setSelectedChannel(channel)}
                        className="p-1 text-gray-400 hover:text-gray-600"
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
                        onClick={() => handleDisconnectChannel(channel.id)}
                        className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors shadow-sm"
                      >
                        Déconnecter
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
                  <div key={channel.id} className={`${channel.bgColor} rounded-lg border ${channel.borderColor} p-4 ${channel.hoverColor} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
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
                        className={`w-full text-xs px-3 py-2 rounded-md transition-colors shadow-sm ${
                          channel.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {channel.status === 'pending' ? 'Connexion en cours...' : 'Connecter'}
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
            <h3 className="text-sm font-medium text-blue-900">À propos de ZOBA</h3>
            <p className="text-sm text-blue-700 mt-1">
              ZOBA centralise toutes vos conversations clients en un seul endroit. Connectez vos canaux de communication 
              préférés et laissez notre IA vous aider à gérer efficacement toutes vos interactions commerciales.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Conseil :</strong> Commencez par connecter WhatsApp Business, c'est le canal le plus populaire auprès des clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}