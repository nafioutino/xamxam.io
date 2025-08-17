'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { PencilIcon, PhotoIcon, VideoCameraIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

type ContentType = 'text' | 'image' | 'video' | 'customization';

interface GeneratedContent {
  id: string;
  type: ContentType;
  prompt: string;
  result: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'processing';
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir une description pour générer du contenu');
      return;
    }

    setIsGenerating(true);

    // Add a new content with processing status
    const newContent: GeneratedContent = {
      id: `content-${Date.now()}`,
      type: activeTab,
      prompt,
      result: '',
      timestamp: new Date().toLocaleString(),
      status: 'processing',
    };

    setGeneratedContents([newContent, ...generatedContents]);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock content based on type
      let result = '';

      switch (activeTab) {
        case 'text':
          result = generateMockText(prompt);
          break;
        case 'image':
          result = `https://placehold.co/600x400?text=${encodeURIComponent(prompt.substring(0, 20))}...`;
          break;
        case 'video':
          result = '#video-placeholder'; // In a real app, this would be a video URL
          break;
        case 'customization':
          result = generateMockCustomization(prompt);
          break;
      }

      // Update the content with the result
      const updatedContents = generatedContents.map((content) =>
        content.id === newContent.id
          ? { ...content, result, status: 'completed' as const }
          : content
      );

      setGeneratedContents([{ ...newContent, result, status: 'completed' }, ...updatedContents.slice(1)]);
      setSelectedContent({ ...newContent, result, status: 'completed' });
      toast.success(`${getContentTypeLabel(activeTab)} généré avec succès`);
    } catch (error) {
      console.error('Error generating content:', error);
      
      // Update the content with failed status
      const updatedContents = generatedContents.map((content) =>
        content.id === newContent.id
          ? { ...content, status: 'failed' as const }
          : content
      );

      setGeneratedContents(updatedContents);
      toast.error(`Erreur lors de la génération du ${getContentTypeLabel(activeTab).toLowerCase()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockText = (prompt: string) => {
    // Generate mock marketing text based on the prompt
    if (prompt.toLowerCase().includes('promotion')) {
      return `🔥 PROMOTION EXCEPTIONNELLE 🔥\n\nNe manquez pas notre offre spéciale ! Jusqu'à 50% de réduction sur une sélection d'articles. Profitez de cette occasion unique pour renouveler votre garde-robe avec nos dernières tendances.\n\nOffre valable jusqu'au 30 juin. Livraison gratuite pour toute commande supérieure à 25 000 FCFA.\n\n#Promotion #Soldes #Shopping`;
    } else if (prompt.toLowerCase().includes('nouveau') || prompt.toLowerCase().includes('collection')) {
      return `✨ NOUVELLE COLLECTION ✨\n\nDécouvrez notre nouvelle collection été 2023 ! Des pièces uniques, des matières premium et des designs exclusifs vous attendent dans nos boutiques et sur notre site web.\n\nExprimez votre style avec nos créations inspirées des dernières tendances mondiales.\n\n#NouvelleCollection #Mode #Été2023`;
    } else {
      return `🛍️ DÉCOUVREZ NOS PRODUITS 🛍️\n\nQualité, style et confort - nos produits sont conçus pour répondre à toutes vos attentes. Fabriqués avec les meilleurs matériaux, ils vous accompagneront dans toutes vos aventures quotidiennes.\n\nCommandez dès maintenant et recevez votre colis en 48h !\n\n#Qualité #Style #Satisfaction`;
    }
  };

  const generateMockCustomization = (prompt: string) => {
    // Generate mock customization options based on the prompt
    return `Options de personnalisation :\n\n- Style : ${prompt.includes('moderne') ? 'Moderne' : prompt.includes('classique') ? 'Classique' : 'Contemporain'}\n- Palette de couleurs : ${prompt.includes('bleu') ? 'Tons bleus' : prompt.includes('rouge') ? 'Tons rouges' : 'Tons neutres'}\n- Éléments visuels : ${prompt.includes('photo') ? 'Photos' : 'Illustrations'}\n- Ton de communication : ${prompt.includes('formel') ? 'Formel' : 'Décontracté'}\n- Recommandations : Utiliser des visuels ${prompt.includes('minimaliste') ? 'minimalistes' : 'expressifs'}, Adapter le contenu pour ${prompt.includes('jeune') ? 'un public jeune' : 'tous les âges'}`;
  };

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case 'text':
        return 'Texte';
      case 'image':
        return 'Image';
      case 'video':
        return 'Vidéo';
      case 'customization':
        return 'Personnalisation';
      default:
        return '';
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'text':
        return <PencilIcon className="h-5 w-5" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'customization':
        return <AdjustmentsHorizontalIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const renderContentPreview = (content: GeneratedContent) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100 whitespace-pre-wrap text-base">
            {content.result}
          </div>
        );
      case 'image':
        return (
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100">
            <img
              src={content.result}
              alt={content.prompt}
              className="w-full h-auto rounded-md"
            />
          </div>
        );
      case 'video':
        return (
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md flex items-center justify-center">
              <div className="text-center">
                <VideoCameraIcon className="h-14 w-14 text-gray-400 mx-auto" />
                <p className="mt-3 text-base text-gray-500">
                  Aperçu vidéo (simulation)
                </p>
              </div>
            </div>
          </div>
        );
      case 'customization':
        return (
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100 whitespace-pre-wrap text-base">
            {content.result}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Création de contenu IA</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tab.Group onChange={(index) => setActiveTab(['text', 'image', 'video', 'customization'][index] as ContentType)}>
          <Tab.List className="flex bg-gray-50 border-b border-gray-200">
            {['text', 'image', 'video', 'customization'].map((type) => (
              <Tab
                key={type}
                className={({ selected }) =>
                  `flex-1 py-4 px-1 text-base font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  {getContentTypeIcon(type as ContentType)}
                  <span>{getContentTypeLabel(type as ContentType)}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {['text', 'image', 'video', 'customization'].map((type) => (
              <Tab.Panel key={type} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-base font-medium text-gray-700">
                      {type === 'text'
                        ? 'Décrivez précisément le texte marketing que vous souhaitez générer (promotion, annonce, etc.)'
                        : type === 'image'
                        ? 'Décrivez en détail l\'image que vous souhaitez générer (style, couleurs, éléments)'
                        : type === 'video'
                        ? 'Décrivez la vidéo que vous souhaitez générer (durée, style, message principal)'
                        : 'Décrivez le style et les préférences pour personnaliser votre contenu'}
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="prompt"
                        name="prompt"
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-md p-3"
                        placeholder={`Exemple : ${type === 'text' ? 'Une promotion spéciale pour notre nouvelle collection d\'été avec 30% de réduction' : type === 'image' ? 'Un produit cosmétique élégant sur fond blanc avec des fleurs et un effet de lumière douce' : type === 'video' ? 'Une vidéo de 30 secondes présentant notre boutique avec des clients satisfaits et nos produits phares' : 'Style moderne avec des tons bleus, des photos de qualité et un ton décontracté pour un public jeune'}`}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                  </div>

                  {type === 'customization' && (
                    <div className="mt-1">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Référence visuelle pour la personnalisation (optionnel)
                      </label>
                      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Télécharger un fichier</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={() => toast.success('Fonctionnalité de téléchargement à implémenter')}
                              />
                            </label>
                            <p className="pl-1">ou glisser-déposer</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Téléchargez des images d'inspiration (PNG, JPG, GIF jusqu'à 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Génération en cours...
                        </>
                      ) : (
                        `Générer ${getContentTypeLabel(activeTab).toLowerCase()}`
                      )}
                    </button>
                  </div>
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-6 sm:px-6 border-b border-gray-200">
            <h3 className="text-xl font-medium leading-6 text-gray-900">Historique de contenu</h3>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {generatedContents.length === 0 ? (
              <li className="px-5 py-6 sm:px-6 text-center text-gray-500 text-base">
                Aucun contenu généré
              </li>
            ) : (
              generatedContents.map((content) => (
                <li
                  key={content.id}
                  onClick={() => setSelectedContent(content)}
                  className={`px-5 py-5 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${selectedContent?.id === content.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getContentTypeIcon(content.type)}
                      <span className="ml-2 text-base font-medium text-gray-900">
                        {getContentTypeLabel(content.type)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${content.status === 'completed' ? 'bg-green-100 text-green-800' : content.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {content.status === 'completed'
                        ? 'Complété'
                        : content.status === 'processing'
                        ? 'En cours'
                        : 'Échoué'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-base text-gray-500 truncate">{content.prompt}</p>
                  <p className="mt-1.5 text-sm text-gray-400">{content.timestamp}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="lg:col-span-2 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-6 sm:px-6 border-b border-gray-200">
            <h3 className="text-xl font-medium leading-6 text-gray-900">Aperçu du contenu</h3>
          </div>
          <div className="p-7">
            {selectedContent ? (
              <div>
                <div className="mb-5">
                  <h4 className="text-base font-medium text-gray-500">Description</h4>
                  <p className="mt-2 text-base">{selectedContent.prompt}</p>
                </div>
                <div className="mb-5">
                  <h4 className="text-base font-medium text-gray-500">Résultat</h4>
                  {selectedContent.status === 'completed' ? (
                    renderContentPreview(selectedContent)
                  ) : selectedContent.status === 'processing' ? (
                    <div className="flex justify-center items-center h-48 bg-gray-50 rounded-md border border-gray-100">
                      <div className="text-center">
                        <svg
                          className="animate-spin h-10 w-10 text-gray-400 mx-auto"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="mt-3 text-base text-gray-500">Génération en cours...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-48 bg-gray-50 rounded-md border border-gray-100">
                      <div className="text-center">
                        <svg
                          className="h-10 w-10 text-red-400 mx-auto"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-3 text-base text-gray-500">
                          La génération a échoué. Veuillez réessayer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedContent.status === 'completed' && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => toast.success('Contenu téléchargé')}
                      className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Télécharger
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success('Contenu partagé')}
                      className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Partager
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success('Contenu publié')}
                      className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Publier
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-72">
                <div className="text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-base font-medium text-gray-900">
                    Aucun contenu sélectionné
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Générez du contenu ou sélectionnez un élément dans l'historique.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}