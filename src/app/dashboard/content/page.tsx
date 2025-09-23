'use client';

import { useState, useEffect } from 'react';
import { Send, FileText, Image, Video, Calendar, BarChart3, Facebook, Link, Upload, Eye, Settings, Zap, Clock, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConnectedChannel {
  id: string;
  externalId: string;
  type: string;
  isActive: boolean;
  pageName?: string;
}

interface ChannelType {
  key: string;
  label: string;
  icon: any;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  sku?: string;
  stock: number;
  category?: {
    id: string;
    name: string;
  };
}

export default function ContentPage() {
  const [message, setMessage] = useState('');
  const [selectedChannelType, setSelectedChannelType] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [availableChannelTypes, setAvailableChannelTypes] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // États pour l'IA
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Récupérer les canaux connectés
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels/status');
        if (response.ok) {
          const data = await response.json();

          // Mapper tous les canaux
          const allChannels: ConnectedChannel[] = [];
          const channelTypes: ChannelType[] = [];

          Object.entries(data.connectedChannels).forEach(([type, channel]: [string, any]) => {
            if (type === 'messenger') {
              allChannels.push({
                id: channel.id,
                externalId: channel.externalId,
                type,
                isActive: channel.isActive,
                pageName: channel.pageName || `Page ${channel.externalId}`
              });
              if (!channelTypes.find(ct => ct.key === 'facebook-page')) {
                channelTypes.push({ key: 'facebook-page', label: 'Facebook Page', icon: Facebook });
              }
            } else if (type === 'instagram') {
              allChannels.push({
                id: channel.id,
                externalId: channel.externalId,
                type,
                isActive: channel.isActive,
                pageName: channel.pageName || `Instagram ${channel.externalId}`
              });
              if (!channelTypes.find(ct => ct.key === 'instagram-dm')) {
                channelTypes.push({ key: 'instagram-dm', label: 'Instagram Direct', icon: Facebook });
              }
            }
          });

          setChannels(allChannels);
          setAvailableChannelTypes(channelTypes);

          if (channelTypes.length > 0) {
            setSelectedChannelType(channelTypes[0].key);
            if (allChannels.length > 0) {
              const firstChannelOfType = allChannels.find(c =>
                (channelTypes[0].key === 'facebook-page' && c.type === 'messenger') ||
                (channelTypes[0].key === 'instagram-dm' && c.type === 'instagram')
              );
              if (firstChannelOfType) {
                setSelectedPage(firstChannelOfType.externalId);
              }
            }
          }
        }
      } catch (err) {
        console.error('Erreur récupération canaux:', err);
      }
    };

    fetchChannels();
  }, []);

  // Récupérer les produits de l'utilisateur
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch('/api/products/user');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
          
          // Sélectionner le premier produit par défaut
          if (data.data && data.data.length > 0) {
            setSelectedProduct(data.data[0].id);
          }
        } else {
          console.error('Erreur récupération produits:', response.statusText);
          toast.error('Impossible de charger vos produits');
        }
      } catch (err) {
        console.error('Erreur récupération produits:', err);
        toast.error('Erreur lors du chargement des produits');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('❌ La vidéo est trop volumineuse (maximum 100MB)', {
          duration: 4000,
          position: 'top-right',
        });
        return;
      }

      setVideoFile(file);
      setVideoUrl('');
      setError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setVideoFile(null);
    setVideoPreview(url);
  };

  // Fonction de génération IA
  const handleGenerateAIContent = async () => {
    if (!selectedPage) {
      toast.error('❌ Veuillez sélectionner une page', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    if (!selectedProduct) {
      toast.error('❌ Veuillez sélectionner un produit', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading('🤖 Génération du contenu avec l\'IA...', {
      position: 'top-right',
    });

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const result = await response.json();
      
      // La réponse est un objet direct, pas un tableau
      const data = result;

      // Vérifier que les données existent
      if (!data || !data.generatedText || !data.generatedImageUrl) {
        console.error('Données manquantes:', { data, hasText: !!data?.generatedText, hasImage: !!data?.generatedImageUrl });
        throw new Error('Données incomplètes reçues de l\'API');
      }

      // Décoder les entités HTML
      const decodedText = data.generatedText
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'");
      
      const decodedImageUrl = data.generatedImageUrl
        .replace(/&amp;/g, '&');

      // Mettre à jour le formulaire avec les résultats
      setMessage(decodedText);
      setContentType('image');
      setImageUrl(decodedImageUrl);
      setImagePreview(decodedImageUrl);
      setImageFile(null);

      toast.success('✨ Contenu généré avec succès !', {
        id: toastId,
        duration: 4000,
        position: 'top-right',
      });
    } catch (error: any) {
      toast.error(`❌ ${error.message}`, {
        id: toastId,
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePublish = async () => {
    if (!message.trim() || !selectedChannelType) return;
    if ((selectedChannelType === 'facebook-page' || selectedChannelType === 'instagram-dm') && !selectedPage) return;
    if (contentType === 'image' && !imageFile && !imageUrl) return;
    if (contentType === 'video' && !videoFile && !videoUrl) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('message', message.trim());
      formData.append('pageId', selectedPage);
      formData.append('contentType', contentType);

      if (contentType === 'image') {
        if (imageFile) {
          formData.append('image', imageFile);
        } else if (imageUrl) {
          formData.append('imageUrl', imageUrl);
        }
      } else if (contentType === 'video') {
        if (videoFile) {
          formData.append('video', videoFile);
        } else if (videoUrl) {
          formData.append('videoUrl', videoUrl);
        }
      }

      // S'assurer que le bon ID de page est utilisé pour le canal sélectionné
      const selectedChannel = channels.find(channel => 
        (selectedChannelType === 'instagram-dm' && channel.type === 'instagram' && channel.externalId === selectedPage) ||
        (selectedChannelType === 'facebook-page' && channel.type === 'messenger' && channel.externalId === selectedPage)
      );
      
      if (!selectedChannel) {
        const correctChannel = channels.find(channel => 
          (selectedChannelType === 'instagram-dm' && channel.type === 'instagram') ||
          (selectedChannelType === 'facebook-page' && channel.type === 'messenger')
        );
        
        if (correctChannel) {
          formData.set('pageId', correctChannel.externalId);
        } else {
          throw new Error(`Aucun canal ${selectedChannelType} trouvé`);
        }
      }
      
      // Déterminer l'API à utiliser selon le type de canal
      const apiEndpoint = selectedChannelType === 'instagram-dm' ? '/api/instagram/publish' : '/api/facebook/publish';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Publication réussie !', {
          duration: 4000,
          position: 'top-right',
        });
        setMessage('');
        setImageFile(null);
        setImageUrl('');
        setImagePreview(null);
        setVideoFile(null);
        setVideoUrl('');
        setVideoPreview(null);
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de la publication'}`, {
          duration: 5000,
          position: 'top-right',
        });
      }
    } catch (err) {
      toast.error('❌ Erreur de connexion', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Création de Contenu</h1>
            <p className="text-blue-100 mt-1">
              Créez et publiez du contenu sur vos réseaux sociaux connectés
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Posts aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Engagement</p>
              <p className="text-3xl font-bold text-gray-900">-</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Programmés</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Canaux actifs</p>
              <p className="text-3xl font-bold text-gray-900">{availableChannelTypes.length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de publication */}
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Send className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Nouvelle Publication</h2>
        </div>

        {/* Messages de statut */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {availableChannelTypes.length === 0 ? (
          <div className="text-center py-8">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun canal connecté
            </h3>
            <p className="text-gray-600 mb-4">
              Connectez d'abord une page Facebook pour publier du contenu
            </p>
            <a
              href="/dashboard/channels"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Connecter un canal
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélection du type de canal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de canal
              </label>
              <select
                value={selectedChannelType}
                onChange={(e) => {
                  const newChannelType = e.target.value;
                  setSelectedChannelType(newChannelType);

                  // === LA LOGIQUE CORRIGÉE ===
                  // On cherche le PREMIER canal qui correspond au NOUVEAU type sélectionné.
                  let firstChannelOfNewType;
                  if (newChannelType === 'facebook-page') {
                    firstChannelOfNewType = channels.find(c => c.type === 'messenger');
                  } else if (newChannelType === 'instagram-dm') {
                    firstChannelOfNewType = channels.find(c => c.type === 'instagram');
                  }

                  // Si on a trouvé un canal correspondant, on met à jour l'ID sélectionné.
                  // Sinon, on met une chaîne vide pour éviter d'envoyer un mauvais ID.
                  if (firstChannelOfNewType) {
                    setSelectedPage(firstChannelOfNewType.externalId);
                  } else {
                    setSelectedPage('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {availableChannelTypes.map((channelType) => (
                  <option key={channelType.key} value={channelType.key}>
                    {channelType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de la page/compte (conditionnel) */}
            {selectedChannelType === 'facebook-page' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Facebook
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {channels.filter(c => c.type === 'messenger').map((channel) => (
                    <option key={channel.externalId} value={channel.externalId}>
                      {channel.pageName || `Page ${channel.externalId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedChannelType === 'instagram-dm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compte Instagram
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {channels.filter(c => c.type === 'instagram').map((channel) => (
                    <option key={channel.externalId} value={channel.externalId}>
                      {channel.pageName || `Instagram ${channel.externalId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sélecteur de produit pour l'IA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="h-4 w-4 inline mr-1" />
                Produit pour la génération IA
              </label>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-600">Chargement des produits...</span>
                </div>
              ) : products.length > 0 ? (
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price}€ {product.category ? `(${product.category.name})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Aucun produit trouvé. Ajoutez des produits dans votre catalogue pour utiliser la génération IA.
                  </p>
                </div>
              )}
              {selectedProduct && products.find(p => p.id === selectedProduct) && (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {products.find(p => p.id === selectedProduct)?.images?.[0] && (
                      <img
                        src={products.find(p => p.id === selectedProduct)?.images?.[0]}
                        alt="Produit"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-900">
                        {products.find(p => p.id === selectedProduct)?.name}
                      </p>
                      <p className="text-sm text-purple-700">
                        {products.find(p => p.id === selectedProduct)?.price}€
                      </p>
                      {products.find(p => p.id === selectedProduct)?.description && (
                        <p className="text-xs text-purple-600 mt-1 truncate">
                          {products.find(p => p.id === selectedProduct)?.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zone de texte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <button
                    onClick={handleGenerateAIContent}
                    disabled={isGeneratingAI || loading}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-1.5 cursor-pointer" />
                        Générer avec l'IA
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ou cliquez sur 'Générer avec l'IA'..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {message.length} caractères
                </p>
              </div>

              {/* Aperçu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Eye className="h-4 w-4 inline mr-1" />
                  Aperçu
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[152px]">
                  {message.trim() ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">P</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Votre Page</p>
                          <p className="text-xs text-gray-500">À l'instant</p>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-sm">L'aperçu apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Types de contenu */}
            <div className="border-t pt-6">
              <p className="text-lg font-semibold text-gray-900 mb-4">Type de contenu</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setContentType('text')}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${contentType === 'text'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${contentType === 'text' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                      <FileText className={`h-6 w-6 ${contentType === 'text' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                    </div>
                    <span className={`font-medium ${contentType === 'text' ? 'text-blue-700' : 'text-gray-700'
                      }`}>Texte</span>
                  </div>
                </button>
                <button
                  onClick={() => setContentType('image')}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${contentType === 'image'
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${contentType === 'image' ? 'bg-green-500' : 'bg-gray-100 group-hover:bg-green-100'
                      }`}>
                      <Image className={`h-6 w-6 ${contentType === 'image' ? 'text-white' : 'text-gray-600 group-hover:text-green-600'
                        }`} />
                    </div>
                    <span className={`font-medium ${contentType === 'image' ? 'text-green-700' : 'text-gray-700'
                      }`}>Image</span>
                  </div>
                </button>
                <button
                  onClick={() => setContentType('video')}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${contentType === 'video'
                      ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${contentType === 'video' ? 'bg-purple-500' : 'bg-gray-100 group-hover:bg-purple-100'
                      }`}>
                      <Video className={`h-6 w-6 ${contentType === 'video' ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                        }`} />
                    </div>
                    <span className={`font-medium ${contentType === 'video' ? 'text-purple-700' : 'text-gray-700'
                      }`}>Vidéo</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Section image (conditionnelle) */}
            {contentType === 'image' && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Image</p>
                <div className="space-y-4">
                  {/* Upload de fichier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Télécharger une image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                            Cliquez pour sélectionner une image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Ou URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Link className="h-4 w-4 inline mr-1" />
                      Ou URL de l'image
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Aperçu de l'image */}
                  {imagePreview && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aperçu
                      </label>
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section vidéo (conditionnelle) */}
            {contentType === 'video' && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Vidéo</p>
                <div className="space-y-4">
                  {/* Upload de fichier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Télécharger une vidéo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
                            Cliquez pour sélectionner une vidéo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI jusqu'à 100MB</p>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 100MB - L'upload peut prendre plusieurs minutes
                    </p>
                  </div>

                  {/* Ou URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Link className="h-4 w-4 inline mr-1" />
                      Ou URL de la vidéo
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://exemple.com/video.mp4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Aperçu de la vidéo */}
                  {videoPreview && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aperçu
                      </label>
                      <video
                        src={videoPreview}
                        controls
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bouton de publication */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                {message.trim() && (
                  <span>✓ Prêt à publier sur Facebook</span>
                )}
              </div>
              <button
                onClick={handlePublish}
                disabled={!message.trim() || loading || (contentType === 'image' && !imageFile && !imageUrl) || (contentType === 'video' && !videoFile && !videoUrl)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {selectedChannelType === 'instagram-dm' && contentType === 'video'
                      ? 'Traitement vidéo Instagram...'
                      : contentType === 'video'
                        ? 'Upload vidéo...'
                        : 'Publication...'
                    }
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publier maintenant
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prochaines fonctionnalités */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-3">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-900">
            Prochaines fonctionnalités
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Contenu multimédia</h4>
            <ul className="space-y-1">
              <li>✓ Publication d'images</li>
              <li>✓ Publication de vidéos</li>
              <li>• Carrousels d'images</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Planification</h4>
            <ul className="space-y-1">
              <li>• Programmation de posts</li>
              <li>• Calendrier éditorial</li>
              <li>• Publication automatique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}