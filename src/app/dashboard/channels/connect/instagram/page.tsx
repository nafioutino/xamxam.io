'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Instagram } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function ConnectInstagramPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Générer un token CSRF unique
  useEffect(() => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setCsrfToken(token);
    
    // Stocker le token dans un cookie pour vérification ultérieure
    setCookie('csrf_token', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changé de 'strict' à 'lax' pour permettre les redirections cross-site
      path: '/',
      maxAge: 60 * 15, // 15 minutes
      httpOnly: true // Cookie accessible uniquement côté serveur pour sécurité
    });
  }, []);

  // Configuration Meta pour Instagram
  const instagramConfig = {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
    redirectUri: 'https://www.xamxam.io/api/auth/callback/meta',
    scopes: [
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_manage_metadata',
      'business_management'
    ]
  };

  const handleInstagramConnect = () => {
    if (isConnecting || !csrfToken) return;
    
    setIsConnecting(true);
    
    // Construire l'URL d'authentification Meta pour Instagram
    const metaAuthUrl = 
      `https://www.facebook.com/v23.0/dialog/oauth?` +
      `client_id=${instagramConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(instagramConfig.redirectUri)}&` +
      `scope=${encodeURIComponent(instagramConfig.scopes.join(','))}&` +
      `response_type=code&` +
      `state=${csrfToken}&` +
      `extras={"setup":{"channel":"instagram"}}`;
    
    // Rediriger vers Meta
    window.location.href = metaAuthUrl;
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
            Connecter Instagram
          </h1>
        </div>

        {/* Instagram Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            {/* Instagram Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            
            {/* Title and Description */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Instagram Business
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connectez votre compte Instagram Business pour gérer vos messages directs et interactions avec vos clients depuis XAMXAM.
            </p>
            
            {/* Connect Button */}
            <button
              onClick={handleInstagramConnect}
              disabled={isConnecting || !csrfToken}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Instagram className="w-5 h-5 mr-3" />
                  Connecter Instagram
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
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h4 className="font-medium text-purple-900 mb-3">
            Fonctionnalités Instagram Business
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-purple-800 mb-2">Gestion des messages :</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Messages directs Instagram</li>
                <li>• Réponses depuis l'interface XAMXAM</li>
                <li>• Historique des conversations</li>
                <li>• Notifications en temps réel</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-purple-800 mb-2">Fonctionnalités avancées :</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Gestion des commentaires</li>
                <li>• Réponses automatiques</li>
                <li>• Statistiques d'engagement</li>
                <li>• Support client intégré</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Vous devez avoir un compte Instagram Business pour utiliser cette fonctionnalité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}