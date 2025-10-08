'use client';

import { useState } from 'react';
import { ArrowLeft, Instagram, Shield, MessageSquare, BarChart3, Camera, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectInstagramPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  // Configuration Instagram API avec Instagram Login (nouvelle méthode 2024)
  const instagramConfig = {
    clientId: '792146549889933',
    redirectUri: `${window.location.origin}/api/auth/callback/instagram`,
    scopes: [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'instagram_business_content_publish',
      'instagram_business_manage_insights'
    ]
  };

  const handleInstagramConnect = () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    // Utiliser la nouvelle Instagram API avec connexion Instagram directe
    // CSRF complètement désactivé - pas de paramètre state
    const instagramAuthUrl = 
      `https://www.instagram.com/oauth/authorize?` +
      `force_reauth=true&` +
      `client_id=${instagramConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(instagramConfig.redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(instagramConfig.scopes.join(','))}`;
    
    // Rediriger vers Instagram directement
    window.location.href = instagramAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => router.back()}
            className="group p-2 hover:bg-white/60 rounded-lg transition-all duration-200 backdrop-blur-sm cursor-pointer hover:shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:text-purple-600 transition-colors" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            Connecter Instagram
          </h1>
        </div>

        {/* Instagram Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 animate-slide-up hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            {/* Instagram Icon avec animation */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-soft shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl animate-spin-slow opacity-20"></div>
              {/* Icône Instagram lucide-react */}
              <Instagram className="w-12 h-12 text-white relative z-10" />
              <Sparkles className="w-5 h-5 text-white/80 absolute -top-1 -right-1 animate-bounce" />
            </div>
            
            {/* Title and Description */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Instagram Business
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Connectez votre compte Instagram Business pour gérer vos messages directs et interactions avec vos clients depuis XAMXAM.
            </p>
            
            {/* Connect Button */}
            <button
              onClick={handleInstagramConnect}
              disabled={isConnecting}
              className="group cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="animate-pulse">Connexion en cours...</span>
                </>
              ) : (
                <>
                  <Instagram className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span>Connecter Instagram</span>
                </>
              )}
            </button>
            
            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Vos données sont sécurisées et chiffrées</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-200/50 rounded-xl p-6 animate-slide-up-delay">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-purple-900">
              Fonctionnalités Instagram Business
            </h4>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h5 className="font-medium text-purple-800 mb-1">Gestion des messages</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Messages directs Instagram</li>
                    <li>• Réponses depuis XAMXAM</li>
                    <li>• Historique des conversations</li>
                    <li>• Notifications temps réel</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-100 rounded-lg mt-0.5">
                  <BarChart3 className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h5 className="font-medium text-pink-800 mb-1">Fonctionnalités avancées</h5>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li>• Gestion des commentaires</li>
                    <li>• Réponses automatiques</li>
                    <li>• Statistiques d'engagement</li>
                    <li>• Support client intégré</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-yellow-800">
                <strong>Prérequis :</strong> Vous devez avoir un compte Instagram Business pour utiliser cette fonctionnalité.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up-delay 1s ease-out;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}