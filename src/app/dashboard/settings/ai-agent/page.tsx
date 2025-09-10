'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { SparklesIcon, LanguageIcon, UserIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'audio' | 'video';
  provider: string;
  enabled: boolean;
  isDefault: boolean;
}

export default function AIAgentSettingsPage() {
  // Langues supportées
  const [languages, setLanguages] = useState<Language[]>([
    { code: 'fr', name: 'Français', enabled: true },
    { code: 'en', name: 'Anglais', enabled: true },
    { code: 'wo', name: 'Wolof', enabled: true },
    { code: 'di', name: 'Dioula', enabled: false },
    { code: 'ar', name: 'Arabe', enabled: false },
    { code: 'es', name: 'Espagnol', enabled: false },
    { code: 'pt', name: 'Portugais', enabled: false },
  ]);

  // Modèles IA disponibles
  const [aiModels, setAiModels] = useState<AIModel[]>([
    {
      id: 'gpt4',
      name: 'GPT-4',
      description: 'Modèle de langage avancé d&apos;OpenAI pour la génération de texte.',
      type: 'text',
      provider: 'OpenAI',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'Modèle de langage alternatif pour la génération de texte.',
      type: 'text',
      provider: 'Mistral AI',
      enabled: false,
      isDefault: false,
    },
    {
      id: 'dalle3',
      name: 'DALL·E 3',
      description: 'Modèle de génération d&apos;images d&apos;OpenAI.',
      type: 'image',
      provider: 'OpenAI',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'stablediffusion',
      name: 'Stable Diffusion',
      description: 'Modèle alternatif pour la génération d&apos;images.',
      type: 'image',
      provider: 'Stability AI',
      enabled: false,
      isDefault: false,
    },
    {
      id: 'runwayml',
      name: 'Runway ML',
      description: 'Modèle de génération de vidéos.',
      type: 'video',
      provider: 'Runway',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'pikalabs',
      name: 'Pika Labs',
      description: 'Modèle alternatif pour la génération de vidéos courtes.',
      type: 'video',
      provider: 'Pika',
      enabled: false,
      isDefault: false,
    },
    {
      id: 'whisper',
      name: 'Whisper',
      description: 'Modèle de reconnaissance vocale pour la transcription audio.',
      type: 'audio',
      provider: 'OpenAI',
      enabled: true,
      isDefault: true,
    },
  ]);

  // Paramètres de l'agent IA
  const [agentSettings, setAgentSettings] = useState({
    name: 'XAMXAM Assistant',
    welcomeMessage: 'Bonjour ! Je suis l&apos;assistant virtuel de la boutique. Comment puis-je vous aider aujourd&apos;hui ?',
    transferMessage: 'Je vais transférer votre demande à un conseiller humain. Veuillez patienter un instant.',
    responseTime: 'fast',
    personality: 'professional',
    autoRespond: true,
    suggestProducts: true,
    collectFeedback: true,
    handoffThreshold: 3,
  });

  // Fonction pour activer/désactiver une langue
  const toggleLanguage = (code: string) => {
    setLanguages(
      languages.map((lang) => (lang.code === code ? { ...lang, enabled: !lang.enabled } : lang))
    );
  };

  // Fonction pour activer/désactiver un modèle IA
  const toggleAIModel = (id: string) => {
    setAiModels(
      aiModels.map((model) => (model.id === id ? { ...model, enabled: !model.enabled } : model))
    );
  };

  // Fonction pour définir un modèle par défaut pour un type spécifique
  const setDefaultModel = (id: string, type: 'text' | 'image' | 'audio' | 'video') => {
    setAiModels(
      aiModels.map((model) => {
        if (model.type === type) {
          return { ...model, isDefault: model.id === id };
        }
        return model;
      })
    );
  };

  // Fonction pour sauvegarder les paramètres
  const saveSettings = () => {
    toast.success('Paramètres de l&apos;agent IA enregistrés avec succès');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres de l&apos;Agent IA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configurez le comportement et les capacités de votre assistant virtuel.
          </p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Enregistrer les modifications
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Configuration générale */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
              Configuration générale
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700">
                  Nom de l&apos;assistant
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="agent-name"
                    id="agent-name"
                    value={agentSettings.name}
                    onChange={(e) => setAgentSettings({ ...agentSettings, name: e.target.value })}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="personality" className="block text-sm font-medium text-gray-700">
                  Personnalité
                </label>
                <div className="mt-1">
                  <select
                    id="personality"
                    name="personality"
                    value={agentSettings.personality}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, personality: e.target.value })
                    }
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="professional">Professionnelle</option>
                    <option value="friendly">Amicale</option>
                    <option value="casual">Décontractée</option>
                    <option value="formal">Formelle</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="welcome-message" className="block text-sm font-medium text-gray-700">
                  Message d&apos;accueil
                </label>
                <div className="mt-1">
                  <textarea
                    id="welcome-message"
                    name="welcome-message"
                    rows={3}
                    value={agentSettings.welcomeMessage}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, welcomeMessage: e.target.value })
                    }
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="transfer-message" className="block text-sm font-medium text-gray-700">
                  Message de transfert vers un humain
                </label>
                <div className="mt-1">
                  <textarea
                    id="transfer-message"
                    name="transfer-message"
                    rows={3}
                    value={agentSettings.transferMessage}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, transferMessage: e.target.value })
                    }
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comportement */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
              Comportement
            </h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="auto-respond"
                    name="auto-respond"
                    type="checkbox"
                    checked={agentSettings.autoRespond}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, autoRespond: e.target.checked })
                    }
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="auto-respond" className="font-medium text-gray-700">
                    Réponse automatique
                  </label>
                  <p className="text-gray-500">
                    L&apos;agent IA répondra automatiquement aux messages entrants sans intervention humaine.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="suggest-products"
                    name="suggest-products"
                    type="checkbox"
                    checked={agentSettings.suggestProducts}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, suggestProducts: e.target.checked })
                    }
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="suggest-products" className="font-medium text-gray-700">
                    Suggestion de produits
                  </label>
                  <p className="text-gray-500">
                    L&apos;agent IA suggérera des produits pertinents en fonction de la conversation.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="collect-feedback"
                    name="collect-feedback"
                    type="checkbox"
                    checked={agentSettings.collectFeedback}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, collectFeedback: e.target.checked })
                    }
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="collect-feedback" className="font-medium text-gray-700">
                    Collecte de feedback
                  </label>
                  <p className="text-gray-500">
                    L&apos;agent IA demandera un feedback après avoir résolu une demande client.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="response-time" className="block text-sm font-medium text-gray-700">
                  Temps de réponse
                </label>
                <div className="mt-1">
                  <select
                    id="response-time"
                    name="response-time"
                    value={agentSettings.responseTime}
                    onChange={(e) =>
                      setAgentSettings({ ...agentSettings, responseTime: e.target.value })
                    }
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="instant">Instantané</option>
                    <option value="fast">Rapide (quelques secondes)</option>
                    <option value="natural">Naturel (comme un humain)</option>
                    <option value="slow">Lent (pour réduire la charge serveur)</option>
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Contrôle la vitesse à laquelle l&apos;agent IA répond aux messages.
                </p>
              </div>

              <div>
                <label htmlFor="handoff-threshold" className="block text-sm font-medium text-gray-700">
                  Seuil de transfert vers un humain
                </label>
                <div className="mt-1">
                  <select
                    id="handoff-threshold"
                    name="handoff-threshold"
                    value={agentSettings.handoffThreshold.toString()}
                    onChange={(e) =>
                      setAgentSettings({
                        ...agentSettings,
                        handoffThreshold: parseInt(e.target.value),
                      })
                    }
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="1">1 tentative</option>
                    <option value="2">2 tentatives</option>
                    <option value="3">3 tentatives</option>
                    <option value="5">5 tentatives</option>
                    <option value="0">Jamais (toujours essayer de résoudre)</option>
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Nombre de tentatives infructueuses avant de transférer à un opérateur humain.
                </p>
              </div>
            </div>
          </div>

          {/* Langues supportées */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <LanguageIcon className="h-5 w-5 mr-2 text-blue-500" />
              Langues supportées
            </h3>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-500">
                Sélectionnez les langues que votre agent IA pourra comprendre et utiliser pour communiquer.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {languages.map((language) => (
                  <div key={language.code} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`language-${language.code}`}
                        name={`language-${language.code}`}
                        type="checkbox"
                        checked={language.enabled}
                        onChange={() => toggleLanguage(language.code)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`language-${language.code}`}
                        className="font-medium text-gray-700"
                      >
                        {language.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modèles IA */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
              Modèles d&apos;IA
            </h3>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-500">
                Configurez les modèles d&apos;IA que vous souhaitez utiliser pour différentes tâches.
              </p>

              {/* Modèles pour le texte */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Modèles de texte</h4>
                <div className="space-y-4">
                  {aiModels
                    .filter((model) => model.type === 'text')
                    .map((model) => (
                      <div key={model.id} className="flex items-start justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`model-${model.id}`}
                              name={`model-${model.id}`}
                              type="checkbox"
                              checked={model.enabled}
                              onChange={() => toggleAIModel(model.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`model-${model.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {model.name}
                              <span className="ml-2 text-xs text-gray-500">({model.provider})</span>
                            </label>
                            <p className="text-xs text-gray-500">{model.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id={`default-${model.id}`}
                            name="default-text-model"
                            type="radio"
                            checked={model.isDefault}
                            onChange={() => setDefaultModel(model.id, 'text')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <label
                            htmlFor={`default-${model.id}`}
                            className="ml-2 text-xs text-gray-700"
                          >
                            Par défaut
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Modèles pour les images */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Modèles d&apos;image</h4>
                <div className="space-y-4">
                  {aiModels
                    .filter((model) => model.type === 'image')
                    .map((model) => (
                      <div key={model.id} className="flex items-start justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`model-${model.id}`}
                              name={`model-${model.id}`}
                              type="checkbox"
                              checked={model.enabled}
                              onChange={() => toggleAIModel(model.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`model-${model.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {model.name}
                              <span className="ml-2 text-xs text-gray-500">({model.provider})</span>
                            </label>
                            <p className="text-xs text-gray-500">{model.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id={`default-${model.id}`}
                            name="default-image-model"
                            type="radio"
                            checked={model.isDefault}
                            onChange={() => setDefaultModel(model.id, 'image')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <label
                            htmlFor={`default-${model.id}`}
                            className="ml-2 text-xs text-gray-700"
                          >
                            Par défaut
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Modèles pour les vidéos */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Modèles de vidéo</h4>
                <div className="space-y-4">
                  {aiModels
                    .filter((model) => model.type === 'video')
                    .map((model) => (
                      <div key={model.id} className="flex items-start justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`model-${model.id}`}
                              name={`model-${model.id}`}
                              type="checkbox"
                              checked={model.enabled}
                              onChange={() => toggleAIModel(model.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`model-${model.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {model.name}
                              <span className="ml-2 text-xs text-gray-500">({model.provider})</span>
                            </label>
                            <p className="text-xs text-gray-500">{model.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id={`default-${model.id}`}
                            name="default-video-model"
                            type="radio"
                            checked={model.isDefault}
                            onChange={() => setDefaultModel(model.id, 'video')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <label
                            htmlFor={`default-${model.id}`}
                            className="ml-2 text-xs text-gray-700"
                          >
                            Par défaut
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Modèles pour l&apos;audio */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Modèles d&apos;audio</h4>
                <div className="space-y-4">
                  {aiModels
                    .filter((model) => model.type === 'audio')
                    .map((model) => (
                      <div key={model.id} className="flex items-start justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`model-${model.id}`}
                              name={`model-${model.id}`}
                              type="checkbox"
                              checked={model.enabled}
                              onChange={() => toggleAIModel(model.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`model-${model.id}`}
                              className="text-sm font-medium text-gray-700"
                            >
                              {model.name}
                              <span className="ml-2 text-xs text-gray-500">({model.provider})</span>
                            </label>
                            <p className="text-xs text-gray-500">{model.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id={`default-${model.id}`}
                            name="default-audio-model"
                            type="radio"
                            checked={model.isDefault}
                            onChange={() => setDefaultModel(model.id, 'audio')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <label
                            htmlFor={`default-${model.id}`}
                            className="ml-2 text-xs text-gray-700"
                          >
                            Par défaut
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}