'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Bot,
  Send,
  User,
  MessageSquare,
  Loader2,
  Brain,
  Zap,
  Play,
  Lightbulb,
  Sparkles
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIPlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    
    // Mise à jour optimiste : ajouter le message utilisateur immédiatement
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage, 
      timestamp: new Date() 
    }]);
    
    // Vider le champ de texte
    setInputMessage('');
    setIsLoading(true);

    try {
      // Appel API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Ajouter la réponse de l'IA
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: data.reply, 
        timestamp: new Date() 
      }]);

      // Afficher des infos de debug si disponibles
      if (data.metadata) {
        console.log('[AI PLAYGROUND] Response metadata:', data.metadata);
      }

    } catch (error) {
      console.error('[AI PLAYGROUND] Error:', error);
      toast.error('Erreur lors de la communication avec l\'IA');
      
      // Ajouter un message d'erreur dans le chat
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Playground</h1>
                <p className="text-sm text-gray-500">Testez votre agent IA personnalisé en temps réel</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Brain className="h-4 w-4" />
              <span>RAG + GPT-4o-mini</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white border border-gray-200 rounded-lg min-h-[calc(100vh-220px)] flex flex-col">
          {/* Zone de conversation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bienvenue dans l'AI Playground !</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Posez une question à votre agent IA. Il s'appuiera sur la configuration et la base de connaissances que vous avez fournies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {[
                    "Quels sont vos produits ?",
                    "Comment puis-je vous contacter ?",
                    "Quelles sont vos valeurs ?",
                    "Pouvez-vous m'aider ?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="flex items-start gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm"
                    >
                      <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="flex-1 text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-white/20' 
                          : 'bg-blue-600/10 text-blue-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 max-w-[70%]">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">L'IA réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez votre question à l'agent IA..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="hidden sm:inline ml-2">
                  {isLoading ? 'Envoi...' : 'Envoyer'}
                </span>
              </button>
            </form>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 text-xs text-gray-500 gap-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3" />
                <span>Alimenté par vos connaissances</span>
              </div>
              <span>Appuyez sur Entrée pour envoyer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
