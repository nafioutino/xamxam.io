'use client';

import { useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectMessengerPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);



  const handleMessengerConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);

    try {
      // Appeler l'API pour obtenir l'URL d'authentification et le token CSRF
      const response = await fetch('/api/auth/start/meta');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'URL d\'authentification');
      }
      
      const data = await response.json();
      
      if (!data.url || !data.csrfToken) {
        throw new Error('URL d\'authentification ou token CSRF non reçu');
      }
      
      // Stocker le token CSRF dans sessionStorage
      sessionStorage.setItem('meta_csrf_state', data.csrfToken);
      
      // Rediriger vers l'URL d'authentification Meta
      window.location.href = data.url;
    } catch (error) {
      console.error('Erreur lors de la connexion Messenger:', error);
      setIsConnecting(false);
      // Ici vous pourriez afficher un toast d'erreur à l'utilisateur
      alert('Erreur lors de la connexion. Veuillez réessayer.');
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
            Connecter Facebook Messenger
          </h1>
        </div>

        {/* Messenger Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            {/* Messenger Icon */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z" />
              </svg>
            </div>

            {/* Title and Description */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Facebook Messenger
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connectez votre page Facebook pour recevoir et répondre aux messages Messenger de vos clients directement depuis Zoba.
            </p>

            {/* Connect Button */}
            <button
              onClick={handleMessengerConnect}
              disabled={isConnecting}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Connecter Facebook Messenger
                </>
              )}
            </button>

            {/* Security Note */}
            <p className="text-sm text-gray-500 mt-6">
              🔒 Vos données sont sécurisées. Nous ne stockons que les informations nécessaires au fonctionnement du service.
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">
            Fonctionnalités Facebook Messenger
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Gestion des messages :</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Réception automatique des messages</li>
                <li>• Réponses depuis l'interface Zoba</li>
                <li>• Historique des conversations</li>
                <li>• Notifications en temps réel</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Fonctionnalités avancées :</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Réponses automatiques</li>
                <li>• Gestion des commandes</li>
                <li>• Statistiques détaillées</li>
                <li>• Support client intégré</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}