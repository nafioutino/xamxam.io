'use client';

import React, { useState, useRef } from 'react';
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
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
  Target,
  Lightbulb,
  BookOpen,
  Plus,
  X,
  Check,
  AlertCircle,
  User,
  Languages,
  Palette,
  Signature,
  Briefcase,
  HelpCircle,
  ShoppingBag,
  Headphones,
  DollarSign,
  Rocket,
  ClipboardList,
  Eye
} from 'lucide-react';

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

interface OrganizationInfo {
  name: string;
  description: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  targetAudience: string;
  values: string[];
  mission: string;
}

interface AgentPersonality {
  name: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  language: string;
  expertise: string[];
  responseStyle: 'concise' | 'detailed' | 'conversational';
  greeting: string;
  signature: string;
}

export default function AIAgentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // État pour les informations de l'organisation
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: '',
    description: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    targetAudience: '',
    values: [],
    mission: ''
  });

  // État pour la personnalité de l'agent
  const [agentPersonality, setAgentPersonality] = useState<AgentPersonality>({
    name: 'Assistant XAMXAM',
    tone: 'professional',
    language: 'fr',
    expertise: [],
    responseStyle: 'conversational',
    greeting: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
    signature: 'Cordialement, votre assistant virtuel'
  });

  // État pour la base de connaissances
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [newTextContent, setNewTextContent] = useState('');
  const [newTextTitle, setNewTextTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newUrlTitle, setNewUrlTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'organization' | 'personality' | 'knowledge'>('organization');
  const [newValue, setNewValue] = useState('');
  const [newExpertise, setNewExpertise] = useState('');

  // Gestion des fichiers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newItem: KnowledgeItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'document',
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        status: 'processing'
      };

      setKnowledgeBase(prev => [...prev, newItem]);

      // Simuler le traitement du fichier
      setTimeout(() => {
        setKnowledgeBase(prev => 
          prev.map(item => 
            item.id === newItem.id 
              ? { ...item, status: 'ready' as const }
              : item
          )
        );
        toast.success(`Document "${file.name}" ajouté à la base de connaissances`);
      }, 2000);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Ajouter du contenu textuel
  const handleAddTextContent = () => {
    if (!newTextTitle.trim() || !newTextContent.trim()) {
      toast.error('Veuillez remplir le titre et le contenu');
      return;
    }

    const newItem: KnowledgeItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'text',
      title: newTextTitle,
      content: newTextContent,
      uploadedAt: new Date(),
      status: 'ready'
    };

    setKnowledgeBase(prev => [...prev, newItem]);
    setNewTextTitle('');
    setNewTextContent('');
    toast.success('Contenu textuel ajouté à la base de connaissances');
  };

  // Ajouter une URL
  const handleAddUrl = () => {
    if (!newUrlTitle.trim() || !newUrl.trim()) {
      toast.error('Veuillez remplir le titre et l\'URL');
      return;
    }

    const newItem: KnowledgeItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'url',
      title: newUrlTitle,
      url: newUrl,
      uploadedAt: new Date(),
      status: 'processing'
    };

    setKnowledgeBase(prev => [...prev, newItem]);
    setNewUrlTitle('');
    setNewUrl('');

    // Simuler le traitement de l'URL
    setTimeout(() => {
      setKnowledgeBase(prev => 
        prev.map(item => 
          item.id === newItem.id 
            ? { ...item, status: 'ready' as const }
            : item
        )
      );
      toast.success('URL ajoutée à la base de connaissances');
    }, 1500);
  };

  // Supprimer un élément de la base de connaissances
  const handleDeleteKnowledgeItem = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
    toast.success('Élément supprimé de la base de connaissances');
  };

  // Ajouter une valeur
  const handleAddValue = () => {
    if (!newValue.trim()) return;
    setOrganizationInfo(prev => ({
      ...prev,
      values: [...prev.values, newValue.trim()]
    }));
    setNewValue('');
  };

  // Supprimer une valeur
  const handleRemoveValue = (index: number) => {
    setOrganizationInfo(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  // Ajouter une expertise
  const handleAddExpertise = () => {
    if (!newExpertise.trim()) return;
    setAgentPersonality(prev => ({
      ...prev,
      expertise: [...prev.expertise, newExpertise.trim()]
    }));
    setNewExpertise('');
  };

  // Supprimer une expertise
  const handleRemoveExpertise = (index: number) => {
    setAgentPersonality(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  // Sauvegarder la configuration
  const handleSave = () => {
    // Ici, vous ajouteriez la logique pour sauvegarder en base de données
    toast.success('Configuration de l\'agent IA sauvegardée avec succès !');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personnalisation de l'Agent IA</h1>
                <p className="text-sm text-gray-600">Configurez votre assistant virtuel personnalisé pour une expérience unique</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('organization')}
                className={`${
                  activeTab === 'organization'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-3'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } flex-1 py-4 px-6 border-b-2 font-semibold text-sm flex items-center justify-center space-x-3 transition-all duration-200 cursor-pointer`}
              >
                <Building2 className="h-5 w-5" />
                <span>Organisation</span>
              </button>
              <button
                onClick={() => setActiveTab('personality')}
                className={`${
                  activeTab === 'personality'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-3'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } flex-1 py-4 px-6 border-b-2 font-semibold text-sm flex items-center justify-center space-x-3 transition-all duration-200 cursor-pointer`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Personnalité</span>
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`${
                  activeTab === 'knowledge'
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-3'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } flex-1 py-4 px-6 border-b-2 font-semibold text-sm flex items-center justify-center space-x-3 transition-all duration-200 cursor-pointer`}
              >
                <Brain className="h-5 w-5" />
                <span>Base de connaissances</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'organization' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg mr-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                Informations sur votre organisation
              </h2>
              <p className="text-gray-600">Définissez l'identité et les valeurs de votre organisation pour personnaliser votre agent IA</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations de base */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                      Informations générales
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom de l'organisation *
                        </label>
                        <input
                          type="text"
                          value={organizationInfo.name}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Ex: XAMXAM Solutions"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description de l'organisation *
                        </label>
                        <textarea
                          value={organizationInfo.description}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                          placeholder="Décrivez votre organisation, ses activités principales et ce qui la rend unique..."
                        />
                      </div>

                      <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Secteur d'activité *
                         </label>
                         <select
                           value={organizationInfo.industry}
                           onChange={(e) => setOrganizationInfo(prev => ({ ...prev, industry: e.target.value }))}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white cursor-pointer"
                         >
                           <option value="">Sélectionnez un secteur</option>
                           <option value="technology">Technologie & Innovation</option>
                           <option value="commerce">Commerce & Retail</option>
                           <option value="services">Services professionnels</option>
                           <option value="education">Éducation & Formation</option>
                           <option value="healthcare">Santé & Bien-être</option>
                           <option value="finance">Finance & Assurance</option>
                           <option value="manufacturing">Industrie & Manufacturing</option>
                           <option value="hospitality">Hôtellerie & Restauration</option>
                           <option value="other">Autre</option>
                         </select>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-blue-600" />
                      Coordonnées
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Globe className="h-4 w-4 mr-1 text-gray-500" />
                          Site web
                        </label>
                        <input
                          type="url"
                          value={organizationInfo.website}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="https://www.example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-500" />
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={organizationInfo.phone}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="+221 XX XXX XX XX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-500" />
                          Email de contact
                        </label>
                        <input
                          type="email"
                          value={organizationInfo.email}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="contact@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          Adresse
                        </label>
                        <textarea
                          value={organizationInfo.address}
                          onChange={(e) => setOrganizationInfo(prev => ({ ...prev, address: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                          placeholder="Adresse complète de votre organisation"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section étendue */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Public cible
                    </h3>
                    <textarea
                      value={organizationInfo.targetAudience}
                      onChange={(e) => setOrganizationInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                      placeholder="Décrivez votre public cible : qui sont vos clients idéaux ? Quels sont leurs besoins et attentes ?"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                       <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
                       Mission
                     </h3>
                     <textarea
                       value={organizationInfo.mission}
                       onChange={(e) => setOrganizationInfo(prev => ({ ...prev, mission: e.target.value }))}
                       rows={4}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white resize-none"
                       placeholder="Quelle est la mission de votre organisation ? Quel est votre objectif principal ?"
                     />
                   </div>
                </div>

                {/* Valeurs */}
                 <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <Users className="h-5 w-5 mr-2 text-green-600" />
                     Valeurs de l'organisation
                   </h3>
                   <p className="text-sm text-gray-600 mb-4">Ajoutez les valeurs fondamentales qui guident votre organisation</p>
                   
                   <div className="flex flex-wrap gap-3 mb-4">
                     {organizationInfo.values.map((value, index) => (
                       <span
                         key={index}
                         className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm"
                       >
                         {value}
                         <button
                           onClick={() => handleRemoveValue(index)}
                           className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-green-600 hover:bg-green-200 hover:text-green-800 transition-colors duration-200 cursor-pointer"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </span>
                     ))}
                   </div>
                   
                   <div className="flex gap-3">
                     <input
                       type="text"
                       value={newValue}
                       onChange={(e) => setNewValue(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                       className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                       placeholder="Ex: Innovation, Intégrité, Excellence..."
                     />
                     <button
                       onClick={handleAddValue}
                       className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                     >
                       <Plus className="h-5 w-5" />
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personality' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                Personnalité de votre agent IA
              </h2>
              <p className="text-gray-600">Définissez le caractère et le style de communication de votre assistant virtuel</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Caractéristiques principales */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Caractéristiques principales
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom de l'agent *
                        </label>
                        <input
                          type="text"
                          value={agentPersonality.name}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                          placeholder="Ex: Assistant XAMXAM, Sophie, Alex..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Langue principale
                        </label>
                        <select
                          value={agentPersonality.language}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white cursor-pointer"
                        >
                          <option value="fr">Français</option>
                          <option value="en">Anglais</option>
                          <option value="wo">Wolof</option>
                          <option value="ar">Arabe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ton de communication *
                        </label>
                        <select
                          value={agentPersonality.tone}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, tone: e.target.value as 'professional' | 'friendly' | 'casual' | 'formal' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white cursor-pointer"
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
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-pink-600" />
                      Style de communication
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Style de réponse
                        </label>
                        <select
                          value={agentPersonality.responseStyle}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, responseStyle: e.target.value as 'concise' | 'detailed' | 'conversational' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white cursor-pointer"
                        >
                          <option value="concise">Concis et direct</option>
                          <option value="detailed">Détaillé et explicatif</option>
                          <option value="conversational">Conversationnel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message d'accueil
                        </label>
                        <textarea
                          rows={3}
                          value={agentPersonality.greeting}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, greeting: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white resize-none"
                          placeholder="Le premier message que vos clients verront"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Signature
                        </label>
                        <input
                          type="text"
                          value={agentPersonality.signature}
                          onChange={(e) => setAgentPersonality(prev => ({ ...prev, signature: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white"
                          placeholder="Comment l'agent signe ses messages"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section étendue */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-indigo-600" />
                    Domaines d'expertise
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Définissez les domaines dans lesquels votre agent excelle</p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {agentPersonality.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200 shadow-sm"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveExpertise(index)}
                          className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 transition-colors duration-200 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                      placeholder="Ex: Vente, Support technique, Mode..."
                    />
                    <button
                      onClick={handleAddExpertise}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Base de connaissances
              </h2>
              <p className="text-gray-600">Alimentez votre agent IA avec des documents, contenus et ressources pertinents</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section Upload de documents */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-blue-600" />
                      Documents et fichiers
                    </h3>
                    
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-25 transition-all duration-300 cursor-pointer group">
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        <Upload className="mx-auto h-16 w-16 text-blue-400 group-hover:text-blue-500" />
                      </div>
                      <div className="mt-6">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="block text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                            Glissez vos documents ici
                          </span>
                          <span className="mt-2 block text-sm text-gray-600">
                            ou cliquez pour parcourir vos fichiers
                          </span>
                          <span className="mt-3 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            PDF, DOC, TXT • Max 10MB
                          </span>
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ajout de contenu texte */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                      Contenu texte personnalisé
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Titre du contenu
                        </label>
                        <input
                          type="text"
                          value={newTextTitle}
                          onChange={(e) => setNewTextTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                          placeholder="Ex: FAQ, Procédures, Informations produits..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contenu
                        </label>
                        <textarea
                          value={newTextContent}
                          onChange={(e) => setNewTextContent(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white resize-none"
                          placeholder="Ajoutez des informations importantes : FAQ, procédures, politiques, descriptions de produits..."
                        />
                      </div>
                      <button
                        onClick={handleAddTextContent}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter le contenu
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section URLs et ressources */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2 text-orange-600" />
                      Ressources web
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Titre de la ressource
                        </label>
                        <input
                          type="text"
                          value={newUrlTitle}
                          onChange={(e) => setNewUrlTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                          placeholder="Ex: Documentation API, Guide utilisateur..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          URL de la ressource
                        </label>
                        <input
                          type="url"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                          placeholder="https://example.com/documentation"
                        />
                      </div>
                      <button
                        onClick={handleAddUrl}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter l'URL
                      </button>
                    </div>
                  </div>

                  {/* Suggestions de contenu */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-teal-600" />
                      Suggestions de contenu
                    </h3>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">Ajoutez ces types de contenu pour améliorer votre agent :</p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { icon: ClipboardList, title: 'FAQ clients', desc: 'Questions fréquemment posées' },
                          { icon: ShoppingBag, title: 'Catalogue produits', desc: 'Descriptions et spécifications' },
                          { icon: Headphones, title: 'Procédures support', desc: 'Guides de résolution' },
                          { icon: Building2, title: 'Informations entreprise', desc: 'Histoire, valeurs, équipe' },
                          { icon: DollarSign, title: 'Tarifs et conditions', desc: 'Grilles tarifaires, CGV' },
                          { icon: Rocket, title: 'Guides utilisateur', desc: 'Tutoriels et modes d\'emploi' }
                        ].map((suggestion, index) => {
                          const IconComponent = suggestion.icon;
                          return (
                            <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-teal-200 hover:border-teal-300 transition-colors duration-200 cursor-pointer">
                              <IconComponent className="h-6 w-6 mr-3 text-teal-600" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
                                <p className="text-xs text-gray-600">{suggestion.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
      </div>
    </div>
  );
}