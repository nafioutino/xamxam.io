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

  const handleConnectPage = async (page: FacebookPage) => {
    if (connecting) return;

    setConnecting(page.id);
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
          platform: 'messenger' // Par défaut, on commence par Messenger
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sélectionner une page Facebook
            </h1>
            <p className="text-gray-600 mt-1">
              Choisissez la page Facebook que vous souhaitez connecter à Zoba
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
              Vous devez être administrateur d'une page Facebook avec les permissions de messagerie pour la connecter à Zoba.
            </p>
            <button
              onClick={() => router.push('/dashboard/channels')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux canaux
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Page Icon */}
                    <div className={`w-12 h-12 ${getPlatformColor(page.category)} rounded-full flex items-center justify-center text-white`}>
                      {getPlatformIcon(page.category)}
                    </div>
                    
                    {/* Page Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {page.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {page.category} • ID: {page.id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          Permissions de messagerie disponibles
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connect Button */}
                  <button
                    onClick={() => handleConnectPage(page)}
                    disabled={connecting === page.id}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connecting === page.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connexion...
                      </>
                    ) : (
                      'Connecter cette page'
                    )}
                  </button>
                </div>
                
                {/* Available Features */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Fonctionnalités disponibles :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {page.tasks?.includes('MESSAGING') && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Messages Facebook
                      </span>
                    )}
                    {page.tasks?.includes('MANAGE') && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Gestion de page
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Réponses automatiques
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Statistiques
                    </span>
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
            <p>1. <strong>Sélectionnez une page</strong> - Choisissez la page Facebook que vous souhaitez connecter</p>
            <p>2. <strong>Configuration automatique</strong> - Nous configurerons automatiquement les webhooks et permissions</p>
            <p>3. <strong>Test de connexion</strong> - Vous pourrez tester l'envoi et la réception de messages</p>
            <p>4. <strong>Gestion centralisée</strong> - Tous vos messages apparaîtront dans l'interface Zoba</p>
          </div>
        </div>
      </div>
    </div>
  );
}