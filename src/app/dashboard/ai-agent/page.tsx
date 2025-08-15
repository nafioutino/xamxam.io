'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  type: 'text' | 'audio';
  audioUrl?: string;
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: 'Bonjour ! Je suis ZOBA, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !isRecording) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would call the AI service
      // For demo, we'll simulate responses based on keywords
      let responseContent = '';
      
      if (input.toLowerCase().includes('bonjour') || input.toLowerCase().includes('salut')) {
        responseContent = 'Bonjour ! Comment puis-je vous aider avec votre boutique aujourd\'hui ?';
      } else if (input.toLowerCase().includes('prix') || input.toLowerCase().includes('tarif')) {
        responseContent = 'Les prix de nos produits varient selon les catégories. Souhaitez-vous des informations sur une catégorie spécifique ?';
      } else if (input.toLowerCase().includes('livraison')) {
        responseContent = 'Nous proposons la livraison gratuite pour les commandes supérieures à 25 000 FCFA. Le délai de livraison est généralement de 2 à 3 jours ouvrables';
      } else if (input.toLowerCase().includes('stock') || input.toLowerCase().includes('disponible')) {
        responseContent = 'Je peux vérifier la disponibilité des produits pour vous. Quel produit vous intéresse ?';
      } else if (input.toLowerCase().includes('promotion') || input.toLowerCase().includes('réduction')) {
        responseContent = 'Nous avons actuellement une promotion de 20% sur tous les articles de la collection été. Utilisez le code SUMMER20 lors de votre commande.';
      } else if (input.toLowerCase().includes('retour') || input.toLowerCase().includes('remboursement')) {
        responseContent = 'Notre politique de retour permet un remboursement intégral dans les 14 jours suivant la réception de votre commande, à condition que les articles soient retournés dans leur état d\'origine.';
      } else if (input.toLowerCase().includes('paiement')) {
        responseContent = 'Nous acceptons les paiements par carte bancaire, PayPal, et virement bancaire. Tous les paiements sont sécurisés par notre système de cryptage SSL.';
      } else {
        responseContent = 'Merci pour votre message. Je vais analyser votre demande et vous apporter la meilleure réponse possible. Avez-vous des précisions à apporter ?';
      }

      // Add AI response to chat
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        type: 'text',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Une erreur est survenue lors du traitement de votre message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = () => {
    // In a real app, this would use the Web Audio API
    setIsRecording(true);
    toast.success('Enregistrement audio démarré');
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.success('Enregistrement audio terminé');
    
    // Simulate processing audio
    setIsProcessing(true);
    
    setTimeout(() => {
      // Add user audio message
      const userMessage: Message = {
        id: `user-audio-${Date.now()}`,
        content: 'Message audio',
        role: 'user',
        timestamp: new Date().toLocaleTimeString(),
        type: 'audio',
        audioUrl: '#audio-message', // In a real app, this would be a URL to the audio file
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      // Simulate AI processing
      setTimeout(() => {
        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: 'J\'ai bien reçu votre message audio. Comment puis-je vous aider davantage ?',
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          type: 'text',
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsProcessing(false);
      }, 1500);
    }, 1000);
  };

  const toggleAudioPlayback = (messageId: string) => {
    if (isPlaying === messageId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(messageId);
      // In a real app, this would play the audio file
      setTimeout(() => {
        setIsPlaying(null);
      }, 3000);
    }
  };

  const handleHumanHandoff = () => {
    toast.success('Transfert vers un conseiller humain initié');
    
    // Simulate handoff process
    setIsProcessing(true);
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: 'Je vais transférer votre conversation à un conseiller humain. Un membre de notre équipe prendra en charge votre demande dans les plus brefs délais. Merci de votre patience.',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        type: 'text',
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Assistant IA</h1>
        <button
          onClick={handleHumanHandoff}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Transférer à un humain
        </button>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-4 max-w-xs sm:max-w-md lg:max-w-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {message.type === 'text' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAudioPlayback(message.id)}
                      className={`p-2 rounded-full ${isPlaying === message.id ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {isPlaying === message.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 bg-blue-500 rounded-full ${isPlaying === message.id ? 'animate-progress' : 'w-0'}`}
                          style={{
                            width: isPlaying === message.id ? '100%' : '0%',
                            transition: 'width 3s linear',
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs">0:03</span>
                  </div>
                )}
                <div
                  className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg p-4 max-w-xs sm:max-w-md">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isRecording || isProcessing}
            ></textarea>
            <div className="flex">
              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className={`px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-gray-200'} text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !isRecording) || isProcessing}
                className="bg-blue-600 text-white rounded-r-md px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => toast.success('Fonctionnalité de synthèse vocale à implémenter')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                Réponse vocale
              </button>
            </div>
            <div className="flex space-x-2">
              <select
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                defaultValue="fr"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="wo">Wolof</option>
                <option value="di">Dioula</option>
              </select>
              <button
                onClick={() => {
                  setMessages([{
                    id: 'welcome',
                    content: 'Bonjour ! Je suis ZOBA, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
                    role: 'assistant',
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'text',
                  }]);
                  toast.success('Conversation réinitialisée');
                }}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s linear;
        }
      `}</style>
    </div>
  );
}