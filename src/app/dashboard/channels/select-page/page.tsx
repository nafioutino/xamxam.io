'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
  instagram_business_account?: {
    id: string;
    username: string;
    profile_picture_url: string;
  };
}

export default function SelectPagePage() {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les pages depuis les cookies (stockées par l'API callback)
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/auth/get-pages', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }

        const data = await response.json();
        setPages(data.pages || []);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Impossible de récupérer vos pages Facebook. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleConnectPage = async (page: FacebookPage, platform: 'messenger' | 'instagram') => {
    if (connecting) return;

    setConnecting(`${page.id}-${platform}`);
    setError(null);

    try {
      const response = await fetch('/api/channels/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          platform
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection failed');
      }

      // Redirection vers la page des canaux avec succès
      router.push('/dashboard/channels?success=page_connected');
    } catch (err) {
      console.error('Error connecting page:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
      setConnecting(null);
    }
  };

  const getPlatformIcon = (category: string) => {
    // Déterminer l'icône basée sur la catégorie ou les tâches
    if (category.toLowerCase().includes('business')) {
      return <MessageSquare className="w-6 h-6" />;
    }
    return <Facebook className="w-6 h-6" />;
  };

  const getPlatformColor = (category: string) => {
    if (category.toLowerCase().includes('business')) {
      return 'bg-blue-600';
    }
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Récupération de vos pages Facebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/channels')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ring-1 ring-inset ring-transparent hover:ring-gray-200"
            aria-label="Retour aux canaux"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sélectionner vos canaux
            </h1>
            <p className="text-gray-600 mt-1">
              Choisissez les canaux Facebook et Instagram que vous souhaitez connecter à XAMXAM
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pages List */}
        {pages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Facebook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune page éligible trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Vous devez être administrateur d'une page Facebook avec les permissions de messagerie pour la connecter à XAMXAM.
            </p>
            <button
              onClick={() => router.push('/dashboard/channels')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
              aria-label="Retourner à la page des canaux"
            >
              <ArrowLeft className="w-4 h-4" /> Retour aux canaux
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Page Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white ring-1 ring-inset ring-blue-200">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {page.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {page.category} • ID: {page.id}
                    </p>
                  </div>
                </div>

                {/* Available Channels */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Facebook Messenger */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white ring-1 ring-inset ring-blue-200">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Facebook Messenger</h4>
                        <p className="text-sm text-gray-600">Messages de votre page Facebook</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnectPage(page, 'messenger')}
                      disabled={connecting === `${page.id}-messenger`}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
                      aria-label="Connecter Facebook Messenger"
                    >
                      {connecting === `${page.id}-messenger` ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>Connecter Messenger</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instagram Direct */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white ring-1 ring-inset ring-purple-200">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Instagram Direct</h4>
                        {page.instagram_business_account ? (
                          <p className="text-sm text-gray-600">@{page.instagram_business_account.username}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Aucun compte Instagram Business lié</p>
                        )}
                      </div>
                    </div>
                    {page.instagram_business_account ? (
                      <button
                        onClick={() => handleConnectPage(page, 'instagram')}
                        disabled={connecting === `${page.id}-instagram`}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
                        aria-label="Connecter Instagram"
                      >
                        {connecting === `${page.id}-instagram` ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connexion...</span>
                          </>
                        ) : (
                          <>
                            <Instagram className="w-4 h-4" />
                            <span>Connecter Instagram</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center">
                        Non disponible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">
            📋 Prochaines étapes
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. <strong>Sélectionnez vos canaux</strong> - Choisissez les canaux Facebook et Instagram que vous souhaitez connecter</p>
            <p>2. <strong>Configuration automatique</strong> - Nous configurerons automatiquement les webhooks et permissions</p>
            <p>3. <strong>Test de connexion</strong> - Vous pourrez tester l'envoi et la réception de messages</p>
            <p>4. <strong>Gestion centralisée</strong> - Tous vos messages apparaîtront dans l'interface XAMXAM</p>
          </div>
        </div>
      </div>
    </div>
  );
}