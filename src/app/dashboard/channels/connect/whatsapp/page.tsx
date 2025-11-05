'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { shopService } from '@/services/shopService';

export default function ConnectWhatsAppPage() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState('Initialisation...');
  const [shopId, setShopId] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Récupérer le shop ID
  useEffect(() => {
    if (!user) return;
    
    const fetchShop = async () => {
      try {
        const shop = await shopService.getUserShop();
        if (shop) {
          setShopId(shop.id);
          setStatus('Prêt à démarrer la connexion...');
        } else {
          setStatus('Erreur : Aucune boutique trouvée.');
          toast.error('Aucune boutique trouvée pour votre compte.');
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
        setStatus('Erreur de configuration.');
        toast.error('Erreur lors de la récupération de votre boutique.');
      }
    };
    
    fetchShop();
  }, [user]);

  // Créer l'instance Evolution API et obtenir le QR code
  const startConnection = async () => {
    if (!shopId || isLoading) return;
    
    setIsLoading(true);
    
    // Vérifier d'abord si un canal WhatsApp est déjà connecté pour ce shop
    try {
      const statusRes = await fetch('/api/channels/status');
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        const alreadyConnected = !!statusJson?.connectedChannels?.whatsapp;
        if (alreadyConnected) {
          setIsConnected(true);
          setStatus('Vous êtes déjà connecté à WhatsApp. Aucun scan nécessaire.');
          toast.success('Compte WhatsApp déjà connecté');
          setIsLoading(false);
          // Optionnel: redirection rapide vers la liste des canaux
          setTimeout(() => router.push('/dashboard/channels'), 1500);
          return;
        }
      }
    } catch (e) {
      // Si la vérification échoue, on continue mais on log
      console.error('Pré-vérification statut canaux échouée:', e);
    }

    setStatus('Création de l\'instance WhatsApp...');
    
    try {
      // Étape 1: Créer l'instance
      const createResponse = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action: 'create_instance' }),
      });
      
      const createData = await createResponse.json();
      
      if (!createResponse.ok || !createData.success) {
        const errorMsg = createData.error || 'Failed to create instance';
        console.error('Instance creation failed:', createData);
        throw new Error(errorMsg);
      }
      
      // Si l'instance existe déjà et est connectée, ne pas générer de QR
      if (createData.existing) {
        setIsConnected(true);
        setStatus('Vous êtes déjà connecté à WhatsApp. Aucun scan nécessaire.');
        toast.success('Compte WhatsApp déjà connecté');
        setIsLoading(false);
        setTimeout(() => router.push('/dashboard/channels'), 1500);
        return;
      }

      const instanceId = createData.instanceName;
      setInstanceName(instanceId);
      
      setStatus('Génération du QR code...');
      
      // Étape 2: Obtenir le QR code
      await fetchQRCode(instanceId);
      
    } catch (error: any) {
      console.error('Error starting connection:', error);
      const errorMessage = error.message || 'Erreur inconnue';
      setStatus(`Erreur: ${errorMessage}`);
      
      if (errorMessage.includes('timeout')) {
        toast.error('Le serveur Evolution API ne répond pas. Vérifiez votre configuration.');
      } else if (errorMessage.includes('not configured')) {
        toast.error('Evolution API non configuré. Contactez l\'administrateur.');
      } else if (errorMessage.toLowerCase().includes('already connected')) {
        setIsConnected(true);
        toast.success('Compte WhatsApp déjà connecté');
        setTimeout(() => router.push('/dashboard/channels'), 1500);
      } else {
        toast.error(`Erreur: ${errorMessage}`);
      }
      
      setIsLoading(false);
    }
  };
  
  // Récupérer le QR code
  const fetchQRCode = async (instanceId: string) => {
    try {
      const qrResponse = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopId, 
          action: 'get_qrcode',
          instanceName: instanceId 
        }),
      });
      
      if (!qrResponse.ok) {
        throw new Error('Failed to get QR code');
      }
      
      const qrData = await qrResponse.json();
      
      console.log('QR Data received:', qrData);
      
      // Vérifier que le QR code existe
      if (!qrData.success || !qrData.qrcode) {
        throw new Error('QR code not available in response');
      }
      
      // Le QR code est en base64 avec le préfixe data:image/png;base64,
      const qrCodeBase64 = qrData.qrcode.startsWith('data:') 
        ? qrData.qrcode 
        : `data:image/png;base64,${qrData.qrcode}`;
      
      setQrCode(qrCodeBase64);
      setStatus('Scannez le QR code avec WhatsApp sur votre téléphone');
      setIsLoading(false);
      
      // Démarrer la vérification du statut
      startStatusPolling(instanceId);
      
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Erreur lors de la génération du QR code.');
      setIsLoading(false);
    }
  };
  
  // Polling pour vérifier le statut de connexion
  const startStatusPolling = (instanceId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/channels/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shopId, 
            action: 'check_status',
            instanceName: instanceId 
          }),
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'open') {
            clearInterval(interval);
            setIsConnected(true);
            setQrCode('');
            setStatus(`Connecté avec succès ! (${statusData.profileName || 'WhatsApp'})`);
            toast.success('WhatsApp connecté avec succès !');
            
            setTimeout(() => {
              router.push('/dashboard/channels');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 3000); // Vérifier toutes les 3 secondes
    
    // Arrêter après 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            Connecter WhatsApp Business
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            {isLoading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {isConnected && <CheckCircle className="w-5 h-5 text-green-600" />}
            <p className="text-gray-700 font-medium">{status}</p>
          </div>

          {/* QR Code ou bouton de démarrage */}
          {!qrCode && !isConnected && (
            <div className="flex flex-col items-center py-8">
              <QrCode className="w-20 h-20 text-gray-300 mb-4" />
              <button
                onClick={startConnection}
                disabled={!shopId || isLoading}
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 mr-2" />
                    Démarrer la connexion
                  </>
                )}
              </button>
            </div>
          )}

          {/* QR Code Display */}
          {qrCode && !isConnected && (
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-green-200 rounded-xl">
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  width={300} 
                  height={300} 
                  className="rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
                1. Ouvrez WhatsApp sur votre téléphone<br />
                2. Appuyez sur <strong>Menu</strong> ou <strong>Paramètres</strong> et sélectionnez <strong>Appareils connectés</strong><br />
                3. Appuyez sur <strong>Connecter un appareil</strong><br />
                4. Scannez ce QR code
              </p>
            </div>
          )}

          {/* Success State */}
          {isConnected && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Connexion réussie !
              </p>
              <p className="text-gray-600">
                Redirection vers vos canaux...
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">
            📱 À propos de cette connexion
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Connexion sécurisée via Evolution API</li>
            <li>✓ Vos messages sont chiffrés de bout en bout</li>
            <li>✓ Vous pouvez vous déconnecter à tout moment</li>
            <li>✓ Compatible avec WhatsApp Business</li>
          </ul>
        </div>
      </div>
    </div>
  );
}