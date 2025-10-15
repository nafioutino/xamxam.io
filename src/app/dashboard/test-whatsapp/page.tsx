'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/shopService';
import { Send, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestWhatsAppPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadShop();
    }
  }, [user]);

  const loadShop = async () => {
    try {
      const shop = await shopService.getUserShop();
      if (shop) {
        setShopId(shop.id);
        setInstanceName(`shop_${shop.id}`);
      }
    } catch (error) {
      console.error('Error loading shop:', error);
    }
  };

  const sendMessage = async () => {
    if (!phone || !message) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          action: 'send_message',
          instanceName,
          message: {
            to: phone.replace(/[^0-9]/g, ''), // Enlever les caractères non numériques
            text: message,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          messageId: data.messageId,
          status: data.status,
        });
        setMessage(''); // Réinitialiser le message
      } else {
        setError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/webhooks/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'messages.upsert',
          instance: instanceName,
          data: {
            key: {
              remoteJid: `${phone.replace(/[^0-9]/g, '')}@s.whatsapp.net`,
              fromMe: false,
              id: `test_${Date.now()}`,
            },
            pushName: 'Test User',
            message: {
              conversation: 'Test message from webhook simulator',
            },
            messageType: 'conversation',
            messageTimestamp: Math.floor(Date.now() / 1000),
          },
        }),
      });

      if (response.ok) {
        setResult({
          success: true,
          message: 'Webhook test envoyé ! Vérifiez la base de données.',
        });
      } else {
        setError('Erreur lors du test webhook');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            Test WhatsApp Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Testez l'envoi et la réception de messages WhatsApp
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Informations</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Shop ID:</strong> {shopId || 'Chargement...'}</p>
            <p><strong>Instance:</strong> {instanceName || 'Chargement...'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Envoyer un message */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Envoyer un message
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5585988888888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format international sans + (ex: 5585988888888)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={loading || !shopId}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tester le webhook */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Simuler un message entrant
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Simulez la réception d'un message pour tester le webhook.
                Le message sera enregistré dans la base de données.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de l'expéditeur
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5585988888888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={testWebhook}
                disabled={loading || !shopId || !phone}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Simuler un message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Erreur</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Succès !</h4>
                <p className="text-sm text-green-800">
                  {result.message || 'Opération réussie'}
                </p>
              </div>
            </div>
            <pre className="bg-white p-4 rounded text-xs overflow-auto border border-green-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Instructions</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Pour envoyer un message :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Entrez le numéro au format international (sans +)</li>
              <li>Écrivez votre message</li>
              <li>Cliquez sur "Envoyer le message"</li>
              <li>Le destinataire recevra le message sur WhatsApp</li>
            </ol>

            <p className="mt-4"><strong>Pour tester la réception :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Entrez un numéro de téléphone</li>
              <li>Cliquez sur "Simuler un message"</li>
              <li>Vérifiez la base de données (table Message, Conversation, Customer)</li>
            </ol>

            <p className="mt-4"><strong>Pour recevoir de vrais messages :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Assurez-vous que le webhook est configuré</li>
              <li>En local, utilisez ngrok pour exposer votre serveur</li>
              <li>Envoyez un message depuis un autre numéro WhatsApp</li>
              <li>Le message sera automatiquement enregistré</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
