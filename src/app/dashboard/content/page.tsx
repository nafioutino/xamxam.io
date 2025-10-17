'use client';

import { useState, useEffect } from 'react';
import { Send, FileText, Image, Video, Calendar, BarChart3, Facebook, Instagram, Link, Upload, Eye, Settings, Zap, Clock, TrendingUp, Sparkles, Loader2, Music } from 'lucide-react';
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
  const [publishMode, setPublishMode] = useState('draft');
  const [privacy, setPrivacy] = useState('SELF_ONLY');
  
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
                channelTypes.push({ key: 'instagram-dm', label: 'Instagram Direct', icon: Instagram });
              }
            } else if (type === 'tiktok') {
              allChannels.push({
                id: channel.id,
                externalId: channel.externalId,
                type,
                isActive: channel.isActive,
                pageName: channel.pageName || `TikTok ${channel.externalId}`
              });
              if (!channelTypes.find(ct => ct.key === 'tiktok')) {
                channelTypes.push({ key: 'tiktok', label: 'TikTok', icon: Music });
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
                (channelTypes[0].key === 'instagram-dm' && c.type === 'instagram') ||
                (channelTypes[0].key === 'tiktok' && c.type === 'tiktok')
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
    if (selectedChannelType === 'tiktok' && contentType !== 'video') {
      toast.error('❌ TikTok ne supporte que les vidéos', {
        duration: 5000,
        position: 'top-right',
      });
      return;
    }
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

      // Pour TikTok, ajouter le titre (utiliser le message comme titre)
      if (selectedChannelType === 'tiktok') {
        formData.append('title', message.trim());
        formData.append('publishMode', publishMode);
        formData.append('privacy', privacy);
      }

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
        (selectedChannelType === 'facebook-page' && channel.type === 'messenger' && channel.externalId === selectedPage) ||
        (selectedChannelType === 'tiktok' && channel.type === 'tiktok' && channel.externalId === selectedPage)
      );
      
      if (!selectedChannel) {
        const correctChannel = channels.find(channel => 
          (selectedChannelType === 'instagram-dm' && channel.type === 'instagram') ||
          (selectedChannelType === 'facebook-page' && channel.type === 'messenger') ||
          (selectedChannelType === 'tiktok' && channel.type === 'tiktok')
        );
        
        if (correctChannel) {
          formData.set('pageId', correctChannel.externalId);
        } else {
          throw new Error(`Aucun canal ${selectedChannelType} trouvé`);
        }
      }
      
      // Déterminer l'API à utiliser selon le type de canal
      let apiEndpoint = '/api/facebook/publish';
      if (selectedChannelType === 'instagram-dm') {
        apiEndpoint = '/api/instagram/publish';
      } else if (selectedChannelType === 'tiktok') {
        apiEndpoint = '/api/tiktok/publish';
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Afficher un message de succès adapté selon le canal et le mode
        if (selectedChannelType === 'tiktok') {
          // Message spécifique pour TikTok
          if (data.tiktokUrl) {
            // Mode direct avec lien
            toast.success(
              (t) => (
                <div className="flex flex-col gap-2">
                  <span className="font-semibold">🎉 {data.message}</span>
                  <a 
                    href={data.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 underline text-sm flex items-center gap-1"
                  >
                    <Music className="w-4 h-4" />
                    Voir sur TikTok
                  </a>
                </div>
              ),
              {
                duration: 8000,
                position: 'top-right',
              }
            );
          } else if (data.mode === 'draft') {
            // Mode brouillon avec instructions
            toast.success(
              (t) => (
                <div className="flex flex-col gap-2 max-w-sm">
                  <span className="font-semibold">📝 {data.message}</span>
                  <p className="text-sm text-gray-600">{data.instructions}</p>
                  <div className="flex items-center gap-1 text-xs text-pink-600 mt-1">
                    <Music className="w-3 h-3" />
                    <span>Ouvrez TikTok → Notifications 🔔</span>
                  </div>
                </div>
              ),
              {
                duration: 10000,
                position: 'top-right',
              }
            );
          } else {
            toast.success(`🎉 ${data.message}`, {
              duration: 5000,
              position: 'top-right',
            });
          }
        } else if (data.postLink) {
          // Autres plateformes avec lien
          toast.success(
            (t) => (
              <div className="flex flex-col gap-2">
                <span className="font-semibold">🎉 Publication réussie !</span>
                <a 
                  href={data.postLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                >
                  <Link className="w-4 h-4" />
                  Voir la publication
                </a>
              </div>
            ),
            {
              duration: 6000,
              position: 'top-right',
            }
          );
        } else {
          toast.success('🎉 Publication réussie !', {
            duration: 4000,
            position: 'top-right',
          });
        }
        
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
                    {selectedChannelType === 'tiktok' ? 'Description' : 
                     selectedChannelType === 'facebook-page' ? 'Que voulez-vous dire ?' : 
                     selectedChannelType === 'instagram-dm' ? 'Légende' : 'Message'}
                  </label>
                  {selectedChannelType !== 'tiktok' && (
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
                  )}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    selectedChannelType === 'tiktok' ? 'Décrivez votre vidéo TikTok... Ajoutez des hashtags populaires !' :
                    selectedChannelType === 'facebook-page' ? 'Que voulez-vous partager avec vos amis ?' :
                    selectedChannelType === 'instagram-dm' ? 'Rédigez une légende captivante... #hashtags' :
                    'Écrivez votre message ou cliquez sur \'Générer avec l\'IA\'...'
                  }
                  rows={6}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 resize-none ${
                    selectedChannelType === 'tiktok' ? 'focus:ring-pink-500 focus:border-pink-500' :
                    selectedChannelType === 'facebook-page' ? 'focus:ring-blue-500 focus:border-blue-500' :
                    selectedChannelType === 'instagram-dm' ? 'focus:ring-purple-500 focus:border-purple-500' :
                    'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    {message.length} caractères
                    {selectedChannelType === 'tiktok' && message.length > 150 && (
                      <span className="text-orange-500 ml-1">(Optimal: 100-150 caractères)</span>
                    )}
                    {selectedChannelType === 'facebook-page' && message.length > 250 && (
                      <span className="text-orange-500 ml-1">(Optimal: moins de 250 caractères)</span>
                    )}
                    {selectedChannelType === 'instagram-dm' && message.length > 125 && (
                      <span className="text-orange-500 ml-1">(Optimal: 125 caractères max)</span>
                    )}
                  </p>
                  {selectedChannelType === 'tiktok' && (
                    <p className="text-xs text-pink-600">
                      💡 Utilisez des hashtags tendance
                    </p>
                  )}
                </div>
              </div>

              {/* Aperçu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Eye className="h-4 w-4 inline mr-1" />
                  {selectedChannelType === 'tiktok' ? 'Aperçu de la description' : 'Aperçu'}
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[152px]">
                  {selectedChannelType === 'tiktok' ? (
                    // Aperçu spécifique TikTok
                    message.trim() ? (
                      <div className="bg-black rounded-lg p-4 text-white relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                              <Music className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">@votre_compte</p>
                              <p className="text-xs text-gray-300">Vidéo TikTok</p>
                            </div>
                          </div>
                          <div className="text-pink-500 text-xs">🎵 Son original</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 border-l-4 border-pink-500">
                          <p className="text-sm text-white whitespace-pre-wrap">{message}</p>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          💡 Cette description apparaîtra sous votre vidéo TikTok
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Music className="h-8 w-8 mb-2 text-pink-400" />
                        <p className="text-sm text-center">
                          Votre description TikTok apparaîtra ici
                        </p>
                        <p className="text-xs text-center mt-1">
                          Ajoutez des hashtags pour plus de visibilité !
                        </p>
                      </div>
                    )
                  ) : (
                    // Aperçu classique pour Facebook/Instagram
                    message.trim() ? (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedChannelType === 'facebook-page' ? 'bg-blue-600' :
                            selectedChannelType === 'instagram-dm' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
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
                    )
                  )}
                </div>
              </div>
            </div>

              {/* Types de contenu */}
            <div className="border-t pt-6">
              <p className="text-lg font-semibold text-gray-900 mb-4">Type de contenu</p>
              {selectedChannelType === 'tiktok' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Music className="h-4 w-4 inline mr-1" />
                    TikTok ne supporte que les vidéos
                  </p>
                </div>
              )}
              
              {/* Options spécifiques à TikTok */}
              {selectedChannelType === 'tiktok' && (
                <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Music className="h-4 w-4 mr-2 text-pink-600" />
                    Paramètres TikTok
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode de publication
                      </label>
                      <select 
                        value={publishMode}
                        onChange={(e) => setPublishMode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="draft">Enregistrer en brouillon</option>
                        <option value="direct">Publier maintenant</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {publishMode === 'draft' ? '📝 Sera sauvegardé dans vos brouillons TikTok' : '🚀 Publication immédiate sur votre profil'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qui peut voir cette vidéo
                      </label>
                      <select 
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="SELF_ONLY">Moi uniquement</option>
                        <option value="MUTUAL_FOLLOW_FRIENDS">Amis</option>
                        <option value="PUBLIC_TO_EVERYONE">Tout le monde</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {privacy === 'SELF_ONLY' ? '🔒 Visible par vous seulement' : 
                         privacy === 'MUTUAL_FOLLOW_FRIENDS' ? '👥 Visible par vos amis' : 
                         '🌍 Visible par tous les utilisateurs TikTok'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-pink-100 rounded-lg">
                    <p className="text-xs text-pink-800">
                      💡 <strong>Conseil TikTok :</strong> Utilisez des hashtags tendance (#fyp #viral #trending) et publiez aux heures de pointe (18h-22h) pour maximiser votre portée !
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setContentType('text')}
                  disabled={selectedChannelType === 'tiktok'}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedChannelType === 'tiktok' 
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                      : contentType === 'text'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${
                      selectedChannelType === 'tiktok'
                        ? 'bg-gray-200'
                        : contentType === 'text' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                      <FileText className={`h-6 w-6 ${
                        selectedChannelType === 'tiktok'
                          ? 'text-gray-400'
                          : contentType === 'text' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                    </div>
                    <span className={`font-medium ${
                      selectedChannelType === 'tiktok'
                        ? 'text-gray-400'
                        : contentType === 'text' ? 'text-blue-700' : 'text-gray-700'
                      }`}>Texte</span>
                    {selectedChannelType === 'facebook-page' && contentType !== 'text' && (
                      <span className="text-xs text-blue-600">Idéal pour Facebook</span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setContentType('image')}
                  disabled={selectedChannelType === 'tiktok'}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedChannelType === 'tiktok' 
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                      : contentType === 'image'
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${
                      selectedChannelType === 'tiktok'
                        ? 'bg-gray-200'
                        : contentType === 'image' ? 'bg-green-500' : 'bg-gray-100 group-hover:bg-green-100'
                      }`}>
                      <Image 
                        className={`h-6 w-6 ${
                          selectedChannelType === 'tiktok'
                            ? 'text-gray-400'
                            : contentType === 'image' ? 'text-white' : 'text-gray-600 group-hover:text-green-600'
                        }`} 
                      />
                    </div>
                    <span className={`font-medium ${
                      selectedChannelType === 'tiktok'
                        ? 'text-gray-400'
                        : contentType === 'image' ? 'text-green-700' : 'text-gray-700'
                      }`}>Image</span>
                    {selectedChannelType === 'instagram-dm' && contentType !== 'image' && (
                      <span className="text-xs text-purple-600">Parfait pour Instagram</span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setContentType('video')}
                  className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${contentType === 'video'
                      ? selectedChannelType === 'tiktok' 
                        ? 'bg-gradient-to-br from-pink-50 to-purple-100 border-pink-300 shadow-lg'
                        : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-xl transition-colors ${
                      contentType === 'video' 
                        ? selectedChannelType === 'tiktok' ? 'bg-pink-500' : 'bg-purple-500'
                        : 'bg-gray-100 group-hover:bg-purple-100'
                      }`}>
                      <Video className={`h-6 w-6 ${
                        contentType === 'video' ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                        }`} />
                    </div>
                    <span className={`font-medium ${
                      contentType === 'video' 
                        ? selectedChannelType === 'tiktok' ? 'text-pink-700' : 'text-purple-700'
                        : 'text-gray-700'
                      }`}>Vidéo</span>
                    {selectedChannelType === 'tiktok' && (
                      <span className="text-xs text-pink-600 font-medium">Obligatoire</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Section image (conditionnelle) */}
            {contentType === 'image' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Image</p>
                  {selectedChannelType === 'instagram-dm' && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      📐 Format carré ou vertical recommandé
                    </span>
                  )}
                  {selectedChannelType === 'facebook-page' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      📐 Format 1200x630px optimal
                    </span>
                  )}
                </div>
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
                        className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group ${
                          selectedChannelType === 'instagram-dm' 
                            ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                            : selectedChannelType === 'facebook-page'
                            ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-center">
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${
                            selectedChannelType === 'instagram-dm' 
                              ? 'text-purple-400 group-hover:text-purple-500'
                              : selectedChannelType === 'facebook-page'
                              ? 'text-blue-400 group-hover:text-blue-500'
                              : 'text-gray-400 group-hover:text-blue-500'
                          }`} />
                          <p className={`text-sm font-medium ${
                            selectedChannelType === 'instagram-dm' 
                              ? 'text-purple-600 group-hover:text-purple-600'
                              : selectedChannelType === 'facebook-page'
                              ? 'text-blue-600 group-hover:text-blue-600'
                              : 'text-gray-600 group-hover:text-blue-600'
                          }`}>
                            Cliquez pour sélectionner une image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF jusqu'à 10MB
                            {selectedChannelType === 'instagram-dm' && ' • Format carré/vertical optimal'}
                            {selectedChannelType === 'facebook-page' && ' • 1200x630px recommandé'}
                          </p>
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Vidéo</p>
                  {selectedChannelType === 'tiktok' && (
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                      📱 Format vertical 9:16 optimal
                    </span>
                  )}
                </div>
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
                        className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group ${
                          selectedChannelType === 'tiktok' 
                            ? 'border-pink-300 hover:border-pink-400 hover:bg-pink-50'
                            : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-center">
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${
                            selectedChannelType === 'tiktok' 
                              ? 'text-pink-400 group-hover:text-pink-500'
                              : 'text-purple-400 group-hover:text-purple-500'
                          }`} />
                          <p className={`text-sm font-medium ${
                            selectedChannelType === 'tiktok' 
                              ? 'text-pink-600 group-hover:text-pink-600'
                              : 'text-purple-600 group-hover:text-purple-600'
                          }`}>
                            Cliquez pour sélectionner une vidéo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            MP4, MOV, AVI jusqu'à 100MB
                            {selectedChannelType === 'tiktok' && ' • Vertical 9:16 recommandé'}
                          </p>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 100MB - L'upload peut prendre plusieurs minutes
                      {selectedChannelType === 'tiktok' && (
                        <span className="block text-pink-600 mt-1">
                          💡 TikTok : Durée optimale 15-60 secondes
                        </span>
                      )}
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

            {/* Bouton de publication adaptatif */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-600">
                {message.trim() && (
                  <span className="flex items-center space-x-2">
                    {selectedChannelType === 'tiktok' && <Music className="h-4 w-4 text-pink-600" />}
                    {selectedChannelType === 'facebook-page' && <Facebook className="h-4 w-4 text-blue-600" />}
                    {selectedChannelType === 'instagram-dm' && <Instagram className="h-4 w-4 text-purple-600" />}
                    <span>
                      ✓ Prêt à publier sur {
                        selectedChannelType === 'tiktok' ? 'TikTok' :
                        selectedChannelType === 'facebook-page' ? 'Facebook' :
                        selectedChannelType === 'instagram-dm' ? 'Instagram' : 'votre canal'
                      }
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={handlePublish}
                disabled={!message.trim() || loading || (contentType === 'image' && !imageFile && !imageUrl) || (contentType === 'video' && !videoFile && !videoUrl)}
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 ${
                  selectedChannelType === 'tiktok' 
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white focus:ring-pink-500'
                    : selectedChannelType === 'facebook-page'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    : selectedChannelType === 'instagram-dm'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {selectedChannelType === 'instagram-dm' && contentType === 'video'
                      ? publishMode === 'draft' ? 'Sauvegarde en brouillon...' : 'Publication TikTok...'
                      : selectedChannelType === 'instagram-dm' && contentType === 'video'
                      ? 'Traitement vidéo Instagram...'
                      : contentType === 'video'
                        ? 'Upload vidéo...'
                        : 'Publication...'
                    }
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {selectedChannelType === 'tiktok' 
                      ? publishMode === 'draft' ? '📝 Sauvegarder en brouillon' : '🚀 Publier sur TikTok'
                      : selectedChannelType === 'facebook-page' 
                      ? '📘 Publier sur Facebook'
                      : selectedChannelType === 'instagram-dm'
                      ? '📸 Publier sur Instagram'
                      : 'Publier'
                    }
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