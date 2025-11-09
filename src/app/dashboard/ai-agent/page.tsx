'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Bot, 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  Save, 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Lightbulb,
  BookOpen,
  Plus,
  X,
  Check,
  AlertCircle,
  User,
  Settings,
  Languages,
  Zap,
  Globe,
  Phone,
  Camera,
  Send,
} from 'lucide-react';
import { WhatsAppIcon, MessengerIcon, InstagramIcon } from '@/components/dashboard/ChannelIcons';

interface KnowledgeItem {
  id: string;
  type: 'document' | 'text' | 'url';
  title: string;
  content?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
}


interface AgentPersonality {
  name: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  language: string;
  responseStyle: 'concise' | 'detailed' | 'conversational';
  greeting: string;
}

export default function AIAgentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  // État pour la personnalité de l'agent
  const [agentPersonality, setAgentPersonality] = useState<AgentPersonality>({
    name: 'Assistant XAMXAM',
    tone: 'professional',
    language: 'fr',
    responseStyle: 'conversational',
    greeting: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'
  });

  // États pour l'activation des canaux
  const [channelStates, setChannelStates] = useState({
    whatsapp: false,
    messenger: false,
    instagram: false
  });

  // Charger la configuration existante au démarrage
  React.useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const response = await fetch('/api/agent/config');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.agentSettings) {
            const settings = data.data.agentSettings;
            
            // Charger la personnalité de l'agent
            setAgentPersonality({
              name: settings.name || 'Assistant XAMXAM',
              tone: settings.personality || 'professional',
              language: settings.language || 'fr',
              responseStyle: settings.responseTime || 'conversational',
              greeting: settings.welcomeMessage || 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'
            });

            // Charger les états des canaux
            setChannelStates(prev => ({
              ...prev,
              whatsapp: settings.isWhatsAppEnabled || false
            }));
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfiguration();
  }, []);

  // État pour la base de connaissances
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [newTextContent, setNewTextContent] = useState('');
  const [newTextTitle, setNewTextTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newUrlTitle, setNewUrlTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'personality' | 'knowledge' | 'configuration'>('personality');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState<'files' | 'webpages' | 'text' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Composants d'icônes professionnelles avec les vraies icônes des plateformes + Bot IA
  const WhatsAppBotIcon = () => (
    <div className="relative inline-flex items-center">
      <WhatsAppIcon className="w-5 h-5 text-green-600" />
      <Bot className="w-3 h-3 absolute -top-1 -right-1 text-blue-600 bg-white rounded-full p-0.5 shadow-sm" />
    </div>
  );

  const MessengerBotIcon = () => (
    <div className="relative inline-flex items-center">
      <MessengerIcon className="w-5 h-5 text-blue-600" />
      <Bot className="w-3 h-3 absolute -top-1 -right-1 text-blue-600 bg-white rounded-full p-0.5 shadow-sm" />
    </div>
  );

  const InstagramBotIcon = () => (
    <div className="relative inline-flex items-center">
      <InstagramIcon className="w-5 h-5 text-pink-600" />
      <Bot className="w-3 h-3 absolute -top-1 -right-1 text-blue-600 bg-white rounded-full p-0.5 shadow-sm" />
    </div>
  );

  // Fonctions de drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Créer un événement simulé pour réutiliser handleFileUpload
      const simulatedEvent = {
        target: { files: files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(simulatedEvent);
    }
  };

  // Gestion des fichiers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    setPendingFile(file);
    setIsDragOver(false);
    toast.success(`"${file.name}" prêt à être téléversé`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmFileUpload = async () => {
    if (!pendingFile) {
      toast.error('Veuillez sélectionner un fichier avant de téléverser');
      return;
    }

    if (isUploadingFile) return;

    const file = pendingFile;
    const newItemId = Date.now().toString();
    const newItem: KnowledgeItem = {
      id: newItemId,
      type: 'document',
      title: file.name,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'processing'
    };

    setKnowledgeBase(prev => [...prev, newItem]);
    setIsUploadingFile(true);
    toast.loading(`Téléversement de ${file.name}...`, { id: `upload-${newItemId}` });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed.');
      }

      setKnowledgeBase(prev => prev.map(item => item.id === newItemId ? { ...item, status: 'ready' } : item));
      toast.success('Document envoyé pour traitement !', { id: `upload-${newItemId}` });
      setPendingFile(null);
    } catch (error) {
      setKnowledgeBase(prev => prev.map(item => item.id === newItemId ? { ...item, status: 'error' } : item));
      toast.error('Erreur lors du téléversement.', { id: `upload-${newItemId}` });
      console.error('File upload error:', error);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelPendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Ajouter du contenu textuel
  const handleAddTextContent = async () => {
    if (!newTextTitle.trim() || !newTextContent.trim()) {
      toast.error('Veuillez remplir le titre et le contenu');
      return;
    }
    
    toast.loading('Ajout du contenu en cours...', { id: 'ingest-toast' });
    try {
      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'text',
          sourceData: newTextContent,
          sourceTitle: newTextTitle,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to ingest text content.');
      }
      
      // Ajoute à l'UI locale pour un retour immédiat (optimistic update)
      setKnowledgeBase(prev => [...prev, {
        id: Date.now().toString(),
        type: 'text',
        title: newTextTitle,
        content: newTextContent,
        uploadedAt: new Date(),
        status: 'ready' // On suppose que ça va marcher
      }]);

      setNewTextTitle('');
      setNewTextContent('');
      setSelectedKnowledgeType(null);
      toast.success('Contenu textuel envoyé pour traitement !', { id: 'ingest-toast' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du contenu.', { id: 'ingest-toast' });
      console.error('Text ingest error:', error);
    }
  };

  // Ajouter une URL
  const handleAddUrl = async () => {
    if (!newUrlTitle.trim() || !newUrl.trim()) {
      toast.error('Veuillez remplir le titre et l\'URL');
      return;
    }

    toast.loading('Traitement de l\'URL en cours...', { id: 'ingest-toast' });
    try {
      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'url',
          sourceData: newUrl,
          sourceTitle: newUrlTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to ingest URL.');
      }

      setKnowledgeBase(prev => [...prev, {
        id: Date.now().toString(),
        type: 'url',
        title: newUrlTitle,
        url: newUrl,
        uploadedAt: new Date(),
        status: 'ready'
      }]);

      setNewUrlTitle('');
      setNewUrl('');
      setSelectedKnowledgeType(null);
      toast.success('URL envoyée pour traitement !', { id: 'ingest-toast' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'URL.', { id: 'ingest-toast' });
      console.error('URL ingest error:', error);
    }
  };

  // Supprimer un élément de la base de connaissances
  const handleDeleteKnowledgeItem = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
    toast.success('Élément supprimé de la base de connaissances');
  };



  // Sauvegarder la configuration
  const handleSave = async () => {
    toast.loading('Sauvegarde en cours...', { id: 'save-toast' });
    try {
      const response = await fetch('/api/agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentSettings: {
            name: agentPersonality.name,
            personality: agentPersonality.tone,
            language: agentPersonality.language,
            responseTime: agentPersonality.responseStyle,
            welcomeMessage: agentPersonality.greeting,
            isWhatsAppEnabled: channelStates.whatsapp
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save configuration.');
      }
      
      toast.success('Configuration sauvegardée avec succès !', { id: 'save-toast' });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde.', { id: 'save-toast' });
      console.error('Save error:', error);
    }
  };

  // Fonction pour gérer l'activation/désactivation des canaux
  const handleToggleChannel = async (channel: 'whatsapp' | 'messenger' | 'instagram') => {
    const newState = !channelStates[channel];
    
    // Mettre à jour l'état local immédiatement pour une meilleure UX
    setChannelStates(prev => ({
      ...prev,
      [channel]: newState
    }));

    // Afficher un toast de chargement
    toast.loading(`${newState ? 'Activation' : 'Désactivation'} de l'agent IA pour ${channel}...`, { 
      id: `toggle-${channel}` 
    });

    try {
      // Sauvegarder la configuration avec le nouvel état
      const response = await fetch('/api/agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentSettings: {
            name: agentPersonality.name,
            personality: agentPersonality.tone,
            language: agentPersonality.language,
            responseTime: agentPersonality.responseStyle,
            welcomeMessage: agentPersonality.greeting,
            isWhatsAppEnabled: channel === 'whatsapp' ? newState : channelStates.whatsapp
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update channel configuration');
      }

      toast.success(
        `Agent IA ${newState ? 'activé' : 'désactivé'} pour ${channel} !`, 
        { id: `toggle-${channel}` }
      );
    } catch (error) {
      // Revenir à l'état précédent en cas d'erreur
      setChannelStates(prev => ({
        ...prev,
        [channel]: !newState
      }));
      
      toast.error(
        `Erreur lors de la ${newState ? 'activation' : 'désactivation'} pour ${channel}`, 
        { id: `toggle-${channel}` }
      );
      console.error('Toggle channel error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: KnowledgeItem['status']) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'ready':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Personnalisation de l'Agent IA</h1>
                <p className="text-sm text-gray-500">Configurez votre assistant virtuel personnalisé pour une expérience unique</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Navigation par onglets */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('personality')}
              className={`${
                activeTab === 'personality'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Personnalité</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`${
                activeTab === 'knowledge'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2`}
            >
              <Brain className="h-4 w-4" />
              <span>Base de connaissances</span>
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`${
                activeTab === 'configuration'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2`}
            >
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'personality' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Personnalité de votre agent IA</h2>
                  <p className="text-sm text-gray-500">Définissez le caractère et le style de communication de votre assistant virtuel</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Caractéristiques principales */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Caractéristiques principales
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom de l'agent *
                        </label>
                        <input
                          type="text"
                          value={agentPersonality.name}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Ex: Assistant XAMXAM, Sophie, Alex..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Langue principale
                        </label>
                        <select
                          value={agentPersonality.language}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                        >
                          <option value="fr">Français</option>
                          <option value="en">Anglais</option>
                          <option value="wo">Wolof</option>
                          <option value="ar">Arabe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ton de communication *
                        </label>
                        <select
                          value={agentPersonality.tone}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, tone: e.target.value as 'professional' | 'friendly' | 'casual' | 'formal' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                        >
                          <option value="professional">Professionnel et formel</option>
                          <option value="friendly">Amical et chaleureux</option>
                          <option value="casual">Décontracté et accessible</option>
                          <option value="formal">Formel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style de communication */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-pink-600" />
                      Style de communication
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Style de réponse
                        </label>
                        <select
                          value={agentPersonality.responseStyle}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, responseStyle: e.target.value as 'concise' | 'detailed' | 'conversational' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                        >
                          <option value="concise">Concis et direct</option>
                          <option value="detailed">Détaillé et explicatif</option>
                          <option value="conversational">Conversationnel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message d'accueil
                        </label>
                        <textarea
                          rows={4}
                          value={agentPersonality.greeting}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, greeting: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                          placeholder="Le premier message que vos clients verront..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section de conseils */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                  Conseils pour optimiser votre agent
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Ton de communication</h4>
                      <p className="text-xs text-gray-600 mt-1">Choisissez un ton qui correspond à votre marque et à votre audience cible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Message d'accueil</h4>
                      <p className="text-xs text-gray-600 mt-1">Un bon message d'accueil donne le ton et met vos clients en confiance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Base de connaissances</h2>
                  <p className="text-sm text-gray-500">Alimentez votre agent IA avec des documents, contenus et ressources pertinents</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {!selectedKnowledgeType ? (
                // Étape 1 : Sélection du type de connaissance
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Ajouter une base de connaissances</h3>
                    <p className="text-sm text-gray-500">Choisissez le type de contenu que vous souhaitez ajouter</p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Option Upload Files */}
                    <div 
                      onClick={() => setSelectedKnowledgeType('files')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                          Télécharger des fichiers
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Fichiers de taille inférieure à 10MB
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </div>
                    </div>

                    {/* Option Add Web Pages */}
                    <div 
                      onClick={() => setSelectedKnowledgeType('webpages')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                        <LinkIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                          Ajouter des pages Web
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Crawler le contenu de votre site web
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors duration-200" />
                      </div>
                    </div>

                    {/* Option Add Text */}
                    <div 
                      onClick={() => setSelectedKnowledgeType('text')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                          Ajouter du texte
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Ajouter des articles manuellement
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Étape 2 : Interface spécifique selon le type sélectionné
                <div>
                  {/* Header avec bouton retour */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedKnowledgeType(null)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Retour à la sélection
                    </button>
                    <div className="text-xs text-gray-500">
                      {selectedKnowledgeType === 'files' && 'Téléchargement de fichiers'}
                      {selectedKnowledgeType === 'webpages' && 'Pages Web'}
                      {selectedKnowledgeType === 'text' && 'Contenu texte'}
                    </div>
                  </div>

                  {/* Interface Upload de fichiers */}
                  {selectedKnowledgeType === 'files' && (
                    <div className="max-w-2xl mx-auto">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
                          Télécharger vos documents
                        </h3>
                        
                        <div 
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer group ${
                            isDragOver 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center">
                            <Upload className={`h-12 w-12 transition-colors duration-300 ${
                              isDragOver 
                                ? 'text-blue-600' 
                                : pendingFile
                                  ? 'text-blue-500'
                                  : 'text-gray-400 group-hover:text-blue-500'
                            }`} />
                            <span className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                              isDragOver 
                                ? 'text-blue-700' 
                                : 'text-gray-900 group-hover:text-blue-700'
                            }`}>
                              {isDragOver
                                ? 'Relâchez pour téléverser'
                                : pendingFile
                                  ? `Fichier sélectionné : ${pendingFile.name}`
                                  : 'Glissez vos documents ici'}
                            </span>
                            <span className="mt-1 text-xs text-gray-500">
                              {pendingFile ? 'Cliquez sur “Téléverser” pour lancer l’envoi' : 'ou cliquez pour parcourir vos fichiers'}
                            </span>
                            <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {pendingFile
                                ? `${formatFileSize(pendingFile.size)} • PDF, DOC, TXT, CSV, JSON`
                                : 'PDF, DOC, TXT, CSV, JSON • Max 10MB'}
                            </span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.csv,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                        </div>

                        {pendingFile && (
                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-blue-100 bg-blue-50/60 rounded-lg p-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Fichier prêt à l’envoi</p>
                              <p className="text-xs text-gray-600 mt-1">{pendingFile.name} • {formatFileSize(pendingFile.size)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleCancelPendingFile}
                                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={handleConfirmFileUpload}
                                disabled={isUploadingFile}
                                className={`px-3 py-2 text-xs sm:text-sm rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  isUploadingFile ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isUploadingFile ? 'Envoi...' : 'Téléverser'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interface Pages Web */}
                  {selectedKnowledgeType === 'webpages' && (
                    <div className="max-w-2xl mx-auto">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
                          Ajouter des pages Web
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom de la base de connaissances
                            </label>
                            <input
                              type="text"
                              value={newUrlTitle}
                              onChange={(e) => setNewUrlTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Ex: Documentation API, Guide utilisateur..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL du site web
                            </label>
                            <input
                              type="url"
                              value={newUrl}
                              onChange={(e) => setNewUrl(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="https://example.com/documentation"
                            />
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setSelectedKnowledgeType(null)}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleAddUrl}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interface Contenu texte */}
                  {selectedKnowledgeType === 'text' && (
                    <div className="max-w-2xl mx-auto">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
                          Ajouter du contenu texte
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Titre du contenu
                            </label>
                            <input
                              type="text"
                              value={newTextTitle}
                              onChange={(e) => setNewTextTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Ex: FAQ, Procédures, Informations produits..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contenu
                            </label>
                            <textarea
                              value={newTextContent}
                              onChange={(e) => setNewTextContent(e.target.value)}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                              placeholder="Ajoutez des informations importantes : FAQ, procédures, politiques, descriptions de produits..."
                            />
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setSelectedKnowledgeType(null)}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleAddTextContent}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Liste des éléments de la base de connaissances */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Éléments de la base de connaissances ({knowledgeBase.length})
                  </h3>
                  
                  {knowledgeBase.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Aucun élément ajouté</p>
                      <p className="text-gray-400 text-sm mt-2">Commencez par ajouter des documents, du contenu ou des URLs</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {knowledgeBase.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                              <div className="flex-shrink-0 mr-3">
                                {item.type === 'document' && (
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                  </div>
                                )}
                                {item.type === 'text' && (
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                  </div>
                                )}
                                {item.type === 'url' && (
                                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <LinkIcon className="h-5 w-5 text-orange-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                  <span>{item.type === 'document' ? 'Document' : item.type === 'text' ? 'Texte' : 'Lien'}</span>
                                  {item.fileSize && (
                                    <>
                                      <span>•</span>
                                      <span>{formatFileSize(item.fileSize)}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span>{item.uploadedAt.toLocaleDateString()}</span>
                                </div>
                                {item.content && (
                                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.content.substring(0, 100)}...</p>
                                )}
                                <div className="flex items-center mt-2">
                                  {getStatusIcon(item.status)}
                                  <span className="ml-2 text-xs text-gray-500 capitalize">
                                    {item.status === 'processing' ? 'Traitement...' : 
                                     item.status === 'ready' ? 'Prêt' : 'Erreur'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteKnowledgeItem(item.id)}
                              className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                  <p className="text-sm text-gray-500">Paramètres et intégrations de votre agent IA</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paramètres du modèle */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                      Paramètres du modèle IA
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modèle de langage
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer">
                          <option value="gpt-4">GPT-4 (Recommandé)</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-3">Claude 3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intégrations */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-green-600" />
                      Canaux de communication
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <WhatsAppBotIcon />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Activer l'agent dans WhatsApp</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={channelStates.whatsapp}
                            onChange={() => handleToggleChannel('whatsapp')}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessengerBotIcon />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Activer l'agent dans Messenger</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={channelStates.messenger}
                            onChange={() => handleToggleChannel('messenger')}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <InstagramBotIcon />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Activer l'agent dans Instagram</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={channelStates.instagram}
                            onChange={() => handleToggleChannel('instagram')}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section de test */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                  Test de configuration
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Testez votre agent avec ces paramètres avant de sauvegarder.
                </p>
                
                <button 
                  onClick={() => router.push('/dashboard/ai-agent/playground')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Tester l'agent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}