'use client';

import { useState, useEffect } from 'react';
import { Send, FileText, Image, Video, Calendar, BarChart3, Facebook } from 'lucide-react';

interface ConnectedChannel {
  id: string;
  externalId: string;
  type: string;
  isActive: boolean;
  pageName?: string;
}

interface ChannelType {
  key: string;
  label: string;
  icon: any;
}

export default function ContentPage() {
  const [message, setMessage] = useState('');
  const [selectedChannelType, setSelectedChannelType] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [availableChannelTypes, setAvailableChannelTypes] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Récupérer les canaux connectés
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels/status');
        if (response.ok) {
          const data = await response.json();
          
          // Mapper tous les canaux
          const allChannels: ConnectedChannel[] = [];
          const channelTypes: ChannelType[] = [];
          
          Object.entries(data.connectedChannels).forEach(([type, channel]: [string, any]) => {
            if (type === 'messenger') {
              allChannels.push({
                id: channel.id,
                externalId: channel.externalId,
                type,
                isActive: channel.isActive,
                pageName: channel.pageName || `Page ${channel.externalId}`
              });
              channelTypes.push({ key: 'facebook-page', label: 'Facebook Page', icon: Facebook });
            }
            // Ajouter d'autres types de canaux ici
          });
          
          setChannels(allChannels);
          setAvailableChannelTypes(channelTypes);
          
          if (channelTypes.length > 0) {
            setSelectedChannelType(channelTypes[0].key);
            if (channelTypes[0].key === 'facebook-page' && allChannels.length > 0) {
              setSelectedPage(allChannels[0].externalId);
            }
          }
        }
      } catch (err) {
        console.error('Erreur récupération canaux:', err);
      }
    };

    fetchChannels();
  }, []);

  const handlePublish = async () => {
    if (!message.trim() || !selectedChannelType) return;
    if (selectedChannelType === 'facebook-page' && !selectedPage) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          pageId: selectedPage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Publication réussie !');
        setMessage('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors de la publication');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">Création de Contenu</h1>
        <p className="text-gray-600 mt-2">
          Créez et publiez du contenu sur vos réseaux sociaux connectés
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Posts aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Programmés</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canaux actifs</p>
              <p className="text-2xl font-bold text-gray-900">{availableChannelTypes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de publication */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle Publication</h2>
        
        {/* Messages de statut */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {availableChannelTypes.length === 0 ? (
          <div className="text-center py-8">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun canal connecté
            </h3>
            <p className="text-gray-600 mb-4">
              Connectez d'abord une page Facebook pour publier du contenu
            </p>
            <a
              href="/dashboard/channels"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connecter un canal
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélection du type de canal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de canal
              </label>
              <select
                value={selectedChannelType}
                onChange={(e) => {
                  setSelectedChannelType(e.target.value);
                  if (e.target.value === 'facebook-page' && channels.length > 0) {
                    setSelectedPage(channels[0].externalId);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableChannelTypes.map((channelType) => (
                  <option key={channelType.key} value={channelType.key}>
                    {channelType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de la page Facebook (conditionnel) */}
            {selectedChannelType === 'facebook-page' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Facebook
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {channels.filter(c => c.type === 'messenger').map((channel) => (
                    <option key={channel.externalId} value={channel.externalId}>
                      {channel.pageName || `Page ${channel.externalId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Zone de texte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {message.length} caractères
                </p>
              </div>
              
              {/* Aperçu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[152px]">
                  {message.trim() ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">P</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Votre Page</p>
                          <p className="text-xs text-gray-500">À l'instant</p>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-sm">L'aperçu apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Types de contenu (pour plus tard) */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Type de contenu</p>
              <div className="flex space-x-4">
                <button className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <FileText className="h-4 w-4 mr-2" />
                  Texte
                </button>
                <button className="flex items-center px-3 py-2 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 cursor-not-allowed">
                  <Image className="h-4 w-4 mr-2" />
                  Image (bientôt)
                </button>
                <button className="flex items-center px-3 py-2 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 cursor-not-allowed">
                  <Video className="h-4 w-4 mr-2" />
                  Vidéo (bientôt)
                </button>
              </div>
            </div>

            {/* Bouton de publication */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                {message.trim() && (
                  <span>✓ Prêt à publier sur Facebook</span>
                )}
              </div>
              <button
                onClick={handlePublish}
                disabled={!message.trim() || loading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Publication...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publier maintenant
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prochaines fonctionnalités */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          🚀 Prochaines fonctionnalités
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Contenu multimédia</h4>
            <ul className="space-y-1">
              <li>• Publication d'images</li>
              <li>• Publication de vidéos</li>
              <li>• Carrousels d'images</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Planification</h4>
            <ul className="space-y-1">
              <li>• Programmation de posts</li>
              <li>• Calendrier éditorial</li>
              <li>• Publication automatique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}