'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { TikTokIcon } from '@/components/dashboard/ChannelIcons';

export default function ConnectTikTokPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Appeler l'API pour obtenir l'URL d'authentification TikTok
      const response = await fetch('/api/auth/start/tiktok');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération de l\'URL d\'authentification');
      }

      // Rediriger vers TikTok pour l'authentification
      window.location.href = data.url;
    } catch (err) {
      console.error('Erreur lors de la connexion TikTok:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Connecter TikTok
          </h1>
        </div>

        {/* TikTok Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            {/* TikTok Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-2xl flex items-center justify-center">
              <TikTokIcon className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connecter votre compte TikTok
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Connectez votre compte TikTok pour publier du contenu directement depuis XAMXAM.
              Vous pourrez partager vos vidéos et gérer votre présence sur TikTok.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-red-800 font-medium">Erreur de connexion</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <TikTokIcon className="w-5 h-5" />
                  Se connecter avec TikTok
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Publication de contenu
                </h3>
                <p className="text-gray-600 text-sm">
                  Publiez vos vidéos directement sur TikTok depuis XAMXAM. 
                  Gérez votre contenu et planifiez vos publications.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TikTokIcon className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Gestion de profil
                </h3>
                <p className="text-gray-600 text-sm">
                  Accédez aux informations de votre profil TikTok et gérez 
                  votre présence sur la plateforme.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">
                  Note importante
                </h3>
                <p className="text-amber-800 text-sm">
                  TikTok ne propose pas encore d'API publique pour les messages directs. 
                  Cette intégration se concentre sur la publication de contenu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            🔒 Sécurité et confidentialité
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Vos informations de connexion TikTok sont chiffrées et stockées de manière sécurisée. 
            XAMXAM respecte votre vie privée et ne publiera jamais de contenu sans votre autorisation explicite.
          </p>
        </div>
      </div>
    </div>
  );
}