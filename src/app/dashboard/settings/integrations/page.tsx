'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  status: 'active' | 'inactive' | 'pending';
  lastSync?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connectez votre compte WhatsApp Business pour recevoir et répondre aux messages.',
      icon: '/icons/whatsapp.svg',
      connected: true,
      status: 'active',
      lastSync: '2023-06-15T14:30:00Z',
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      description: 'Intégrez Facebook Messenger pour gérer les conversations avec vos clients.',
      icon: '/icons/facebook.svg',
      connected: true,
      status: 'active',
      lastSync: '2023-06-14T10:15:00Z',
    },
    {
      id: 'instagram',
      name: 'Instagram Direct',
      description: 'Connectez Instagram pour gérer les messages directs et les commentaires.',
      icon: '/icons/instagram.svg',
      connected: true,
      status: 'active',
      lastSync: '2023-06-14T10:15:00Z',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Intégrez Telegram pour communiquer avec vos clients via cette plateforme.',
      icon: '/icons/telegram.svg',
      connected: false,
      status: 'inactive',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Connectez votre compte TikTok pour gérer les messages et commentaires.',
      icon: '/icons/tiktok.svg',
      connected: false,
      status: 'inactive',
    },
    {
      id: 'email',
      name: 'Email (IMAP/SMTP)',
      description: 'Configurez votre compte email pour envoyer et recevoir des emails.',
      icon: '/icons/email.svg',
      connected: true,
      status: 'active',
      lastSync: '2023-06-15T09:45:00Z',
    },
  ]);

  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Fonction pour connecter ou déconnecter une intégration
  const toggleConnection = (id: string) => {
    setIsConnecting(true);
    
    // Simuler une requête API
    setTimeout(() => {
      setIntegrations(integrations.map(integration => {
        if (integration.id === id) {
          const connected = !integration.connected;
          return {
            ...integration,
            connected,
            status: connected ? 'active' : 'inactive',
            lastSync: connected ? new Date().toISOString() : undefined
          };
        }
        return integration;
      }));
      
      setIsConnecting(false);
      
      const integration = integrations.find(i => i.id === id);
      if (integration) {
        if (!integration.connected) {
          toast.success(`${integration.name} connecté avec succès`);
        } else {
          toast.success(`${integration.name} déconnecté`);
        }
      }
    }, 1500);
  };

  // Fonction pour ouvrir la modal de configuration
  const openConfigModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  // Fonction pour synchroniser une intégration
  const syncIntegration = (id: string) => {
    setIsConnecting(true);
    
    // Simuler une requête API
    setTimeout(() => {
      setIntegrations(integrations.map(integration => {
        if (integration.id === id) {
          return {
            ...integration,
            lastSync: new Date().toISOString()
          };
        }
        return integration;
      }));
      
      setIsConnecting(false);
      
      const integration = integrations.find(i => i.id === id);
      if (integration) {
        toast.success(`${integration.name} synchronisé avec succès`);
      }
    }, 1500);
  };

  // Formater la date de dernière synchronisation
  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Intégrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connectez vos plateformes de messagerie et réseaux sociaux pour centraliser toutes vos conversations.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                {/* Placeholder pour l'icône - dans une vraie application, utilisez l'image réelle */}
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                  <div className="flex items-center space-x-2">
                    {integration.connected ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-green-400" />
                        Connecté
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" />
                        Non connecté
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-500">{integration.description}</p>
                
                {integration.connected && (
                  <p className="mt-1 text-xs text-gray-500">
                    Dernière synchronisation: {formatLastSync(integration.lastSync)}
                  </p>
                )}
                
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleConnection(integration.id)}
                    disabled={isConnecting}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${integration.connected ? 'text-white bg-red-600 hover:bg-red-700' : 'text-white bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                  >
                    {isConnecting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Traitement...
                      </>
                    ) : integration.connected ? (
                      'Déconnecter'
                    ) : (
                      'Connecter'
                    )}
                  </button>
                  
                  {integration.connected && (
                    <>
                      <button
                        type="button"
                        onClick={() => syncIntegration(integration.id)}
                        disabled={isConnecting}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Synchroniser
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => openConfigModal(integration)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Configurer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de configuration - simplifiée pour le MVP */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Configuration de {selectedIntegration.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Configurez les paramètres spécifiques pour cette intégration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 space-y-4">
                {selectedIntegration.id === 'whatsapp' && (
                  <>
                    <div>
                      <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-gray-700">
                        Numéro de téléphone WhatsApp Business
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          name="whatsapp-phone"
                          id="whatsapp-phone"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="+33612345678"
                          defaultValue="+33612345678"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="whatsapp-token" className="block text-sm font-medium text-gray-700">
                        Token d'accès
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="whatsapp-token"
                          id="whatsapp-token"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="••••••••••••••••••••••••••"
                          defaultValue="whatsapp_token_example"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedIntegration.id === 'facebook' && (
                  <>
                    <div>
                      <label htmlFor="facebook-page" className="block text-sm font-medium text-gray-700">
                        Page Facebook
                      </label>
                      <div className="mt-1">
                        <select
                          id="facebook-page"
                          name="facebook-page"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue="page1"
                        >
                          <option value="page1">Ma Boutique</option>
                          <option value="page2">Ma Boutique - Promotions</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="facebook-token" className="block text-sm font-medium text-gray-700">
                        Token d'accès
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="facebook-token"
                          id="facebook-token"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="••••••••••••••••••••••••••"
                          defaultValue="facebook_token_example"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedIntegration.id === 'email' && (
                  <>
                    <div>
                      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                        Adresse email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email-address"
                          id="email-address"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="contact@maboutique.com"
                          defaultValue="contact@maboutique.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email-password" className="block text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="email-password"
                          id="email-password"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="••••••••••••••••••••••••••"
                          defaultValue="email_password_example"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="imap-server" className="block text-sm font-medium text-gray-700">
                          Serveur IMAP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="imap-server"
                            id="imap-server"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="imap.example.com"
                            defaultValue="imap.gmail.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="imap-port" className="block text-sm font-medium text-gray-700">
                          Port IMAP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="imap-port"
                            id="imap-port"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="993"
                            defaultValue="993"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="smtp-server" className="block text-sm font-medium text-gray-700">
                          Serveur SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="smtp-server"
                            id="smtp-server"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="smtp.example.com"
                            defaultValue="smtp.gmail.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700">
                          Port SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="smtp-port"
                            id="smtp-port"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="587"
                            defaultValue="587"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowConfigModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowConfigModal(false);
                      toast.success(`Configuration de ${selectedIntegration.name} enregistrée`);
                    }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}