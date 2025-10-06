'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Instagram, CheckCircle, AlertCircle } from 'lucide-react';

interface InstagramUserData {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export default function SetupInstagramPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<InstagramUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les données utilisateur depuis les cookies via une API
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/instagram/user-data');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Impossible de récupérer les données utilisateur');
        }
      } catch (err) {
        setError('Erreur lors de la récupération des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCompleteSetup = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/channels/instagram/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/dashboard/channels?success=instagram_connected');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la configuration');
      }
    } catch (err) {
      setError('Erreur lors de la configuration du canal');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/dashboard/channels')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Configuration Instagram</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/dashboard/channels')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour aux canaux
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/channels')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Instagram</h1>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connexion Instagram réussie !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre compte Instagram Business a été connecté avec succès.
            </p>
          </div>
        </div>

        {/* Account Info */}
        {userData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">@{userData.username}</p>
                  <p className="text-sm text-gray-500">Compte {userData.account_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{userData.media_count} publications</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités activées</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Gestion des messages directs</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Gestion des commentaires</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Publication de contenu</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Insights et statistiques</span>
            </div>
          </div>
        </div>

        {/* Complete Setup Button */}
        <div className="text-center">
          <button
            onClick={handleCompleteSetup}
            disabled={isConnecting}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Configuration en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-3" />
                Terminer la configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}