// 'use client';

// import { useState, useEffect } from 'react';
// import { ArrowLeft, MessageSquare } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { setCookie } from 'cookies-next';

// export default function ConnectWhatsAppPage() {
//   const router = useRouter();
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [csrfToken, setCsrfToken] = useState<string>('');

//   // Générer un token CSRF unique
//   useEffect(() => {
//     const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
//       .map(b => b.toString(16).padStart(2, '0'))
//       .join('');
//     setCsrfToken(token);
    
//     // Stocker le token dans un cookie pour vérification ultérieure
//     setCookie('csrf_token', token, {
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax', // Changé de 'strict' à 'lax' pour permettre les redirections cross-site
//       path: '/',
//       maxAge: 60 * 15, // 15 minutes
//       httpOnly: true // Cookie accessible uniquement côté serveur pour sécurité
//     });
//   }, []);

//   // Configuration Meta pour WhatsApp Business
//   const whatsappConfig = {
//     clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
//     redirectUri: 'https://www.xamxam.io/api/auth/callback/meta',
//     scopes: [
//       'whatsapp_business_management',
//       'whatsapp_business_messaging',
//       'business_management'
//     ]
//   };

//   const handleWhatsAppConnect = () => {
//     if (isConnecting || !csrfToken) return;
    
//     setIsConnecting(true);
    
//     // Construire l'URL d'authentification Meta pour WhatsApp Business
//     const metaAuthUrl = 
//       `https://www.facebook.com/v23.0/dialog/oauth?` +
//       `client_id=${whatsappConfig.clientId}&` +
//       `redirect_uri=${encodeURIComponent(whatsappConfig.redirectUri)}&` +
//       `scope=${encodeURIComponent(whatsappConfig.scopes.join(','))}&` +
//       `response_type=code&` +
//       `state=${csrfToken}&` +
//       `extras={"setup":{"channel":"whatsapp"}}`;
    
//     // Rediriger vers Meta
//     window.location.href = metaAuthUrl;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button
//             onClick={() => router.back()}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Connecter WhatsApp Business
//           </h1>
//         </div>

//         {/* WhatsApp Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
//           <div className="text-center">
//             {/* WhatsApp Icon */}
//             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
//               <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
//               </svg>
//             </div>
            
//             {/* Title and Description */}
//             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
//               WhatsApp Business
//             </h2>
//             <p className="text-gray-600 mb-8 max-w-md mx-auto">
//               Connectez votre compte WhatsApp Business pour gérer vos conversations WhatsApp directement depuis Zoba et offrir un support client optimal.
//             </p>
            
//             {/* Connect Button */}
//             <button
//               onClick={handleWhatsAppConnect}
//               disabled={isConnecting || !csrfToken}
//               className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//             >
//               {isConnecting ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
//                   Connexion en cours...
//                 </>
//               ) : (
//                 <>
//                   <MessageSquare className="w-5 h-5 mr-3" />
//                   Connecter WhatsApp Business
//                 </>
//               )}
//             </button>
            
//             {/* Security Note */}
//             <p className="text-sm text-gray-500 mt-6">
//               🔒 Vos données sont sécurisées. Nous ne stockons que les informations nécessaires au fonctionnement du service.
//             </p>
//           </div>
//         </div>

//         {/* Info Section */}
//         <div className="bg-green-50 border border-green-200 rounded-lg p-6">
//           <h4 className="font-medium text-green-900 mb-3">
//             Fonctionnalités WhatsApp Business
//           </h4>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <h5 className="font-medium text-green-800 mb-2">Gestion des messages :</h5>
//               <ul className="text-sm text-green-700 space-y-1">
//                 <li>• Messages WhatsApp entrants</li>
//                 <li>• Réponses depuis l'interface Zoba</li>
//                 <li>• Historique des conversations</li>
//                 <li>• Notifications en temps réel</li>
//               </ul>
//             </div>
//             <div>
//               <h5 className="font-medium text-green-800 mb-2">Fonctionnalités avancées :</h5>
//               <ul className="text-sm text-green-700 space-y-1">
//                 <li>• Messages automatiques</li>
//                 <li>• Templates de messages</li>
//                 <li>• Gestion des commandes</li>
//                 <li>• Statistiques détaillées</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="mt-4 space-y-3">
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-sm text-yellow-800">
//                 <strong>Prérequis :</strong> Vous devez avoir un compte WhatsApp Business API approuvé par Meta.
//               </p>
//             </div>
            
//             <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-sm text-blue-800">
//                 <strong>Note :</strong> La configuration WhatsApp Business peut nécessiter une validation supplémentaire de Meta.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /app/dashboard/channels/connect/whatsapp/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react'; // Importer useRef et useCallback
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MessageSquare, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { shopService } from '@/services/shopService';

const WHATSAPP_ENGINE_URL = process.env.NEXT_PUBLIC_WHATSAPP_ENGINE_URL || 'https://xamxam-whatsapp-engine.onrender.com:8000';

// Sanitize QR code source (supports data URLs and http/https)
const sanitizeQrSrc = (src?: string): string => {
  if (!src) return '';
  const s = String(src).trim();
  if (!s) return '';
  if (s.startsWith('data:image')) return s;
  try {
    const u = new URL(s);
    return u.protocol.startsWith('http') ? s : '';
  } catch {
    return '';
  }
};

export default function ConnectWhatsAppPage() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState('Initialisation...');
  const [shopId, setShopId] = useState<string | null>(null);
  const router = useRouter();
  
  // On utilise une Ref pour que l'instance de la socket persiste
  // à travers les cycles de montage/démontage de React Strict Mode.
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchShopId = async () => {
      try {
        console.log('Client - Fetching shop via shopService');
        const shop = await shopService.getUserShop();
        console.log('Client - Shop service response:', shop);
        
        if (shop) {
          console.log('Client - Setting shopId:', shop.id);
          setShopId(shop.id);
          setStatus('Prêt à connecter au service WhatsApp...');
        } else {
          console.error('Client - No shop found for this user');
          setStatus('Erreur : Impossible de trouver votre boutique.');
          toast.error('Aucune boutique trouvée pour votre compte.');
        }
      } catch (error) {
        console.error("Failed to fetch shopId", error);
        setStatus('Erreur de configuration du compte.');
        toast.error('Erreur lors de la récupération de votre boutique.');
      }
    };
    fetchShopId();
  }, [user]);

  // On utilise useCallback pour que la fonction finalizeConnection
  // ne change pas à chaque rendu, évitant des reconnexions inutiles.
  const finalizeConnection = useCallback(async (currentShopId: string, whatsappNumber: string) => {
    console.log('Client - finalizeConnection called with:', { shopId: currentShopId, externalId: whatsappNumber });
    
    try {
      console.log('Client - Making API request to /api/channels/whatsapp');
      const response = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: currentShopId, externalId: whatsappNumber }),
      });
      
      console.log('Client - API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Client - API error response:', errorText);
        throw new Error(`Failed to finalize connection: ${errorText}`);
      }
      
      toast.success('Compte WhatsApp connecté avec succès !');
      router.push('/dashboard/channels');
    } catch (error) {
      console.error('Error finalizing connection:', error);
      toast.error('Erreur lors de la finalisation.');
    }
  }, [router]);


  useEffect(() => {
    if (!shopId) return;

    // Si la socket existe déjà dans notre Ref, on ne fait rien.
    // C'est la clé pour éviter la double connexion.
    if (socketRef.current) return;

    // On crée la socket et on la stocke DANS LA REF.
    socketRef.current = io(WHATSAPP_ENGINE_URL);
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      setStatus('Connexion au service...');
      socket.emit('start-session', { shopId });
    });

    socket.on('qr', (data: { qr: string }) => {
      console.log('QR event received by client');
      setQrCode(data.qr);
      setStatus('Veuillez scanner le QR code avec votre téléphone.');
    });

    socket.on('connected', (data: { status: string, jid: string }) => {
      console.log('Connected event received by client');
      setQrCode('');
      setStatus('Connecté ! Finalisation...');
      finalizeConnection(shopId, data.jid);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    // La fonction de nettoyage sera appelée quand le composant est vraiment quitté.
    return () => {
      if (socketRef.current) {
        console.log('Cleanup: Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [shopId, finalizeConnection]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            Connecter votre compte WhatsApp
          </h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-700 mb-4">{status}</p>
          {(() => {
            const safe = sanitizeQrSrc(qrCode);
            return safe ? (
              <div className="flex flex-col items-center">
                <img src={safe} alt="QR Code WhatsApp" width={300} height={300} className="rounded-lg border border-gray-200" loading="lazy" />
                <p className="text-sm text-gray-500 mt-2">Scannez ce QR code avec WhatsApp sur votre téléphone.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <QrCode className="w-16 h-16 text-gray-400" />
                <p className="text-sm mt-2">En attente du QR code...</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}