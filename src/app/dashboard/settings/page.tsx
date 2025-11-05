'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { useShop } from '@/hooks/useShop';
import { shopService, UpdateShopData } from '@/services/shopService';
import { Store, Clock, MapPin, FileText, Loader2, Save, User, Image as ImageIcon, Package, ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const shopSettingsSchema = z.object({
  name: z.string().min(2, 'Le nom de la boutique doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  address: z.string().optional(),
  openingHours: z.object({
    monday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    tuesday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    wednesday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    thursday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    friday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    saturday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
    sunday: z.object({
      closed: z.boolean(),
      open: z.string().optional(),
      close: z.string().optional(),
    }).optional(),
  }).optional(),
});

type ShopSettingsFormValues = z.infer<typeof shopSettingsSchema>;

const daysOfWeek = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

export default function ShopSettingsPage() {
  const { shop, isLoading: shopLoading, refetch } = useShop();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Profil: nom + avatar
  const [profileName, setProfileName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [optimizeImage, setOptimizeImage] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ShopSettingsFormValues>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      openingHours: {
        monday: { closed: false, open: '09:00', close: '18:00' },
        tuesday: { closed: false, open: '09:00', close: '18:00' },
        wednesday: { closed: false, open: '09:00', close: '18:00' },
        thursday: { closed: false, open: '09:00', close: '18:00' },
        friday: { closed: false, open: '09:00', close: '18:00' },
        saturday: { closed: false, open: '09:00', close: '18:00' },
        sunday: { closed: true, open: '09:00', close: '18:00' },
      },
    },
  });

  // Charger les données de la boutique dans le formulaire
  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name || '',
        description: shop.description || '',
        address: shop.address || '',
        openingHours: shop.openingHours || {
          monday: { closed: false, open: '09:00', close: '18:00' },
          tuesday: { closed: false, open: '09:00', close: '18:00' },
          wednesday: { closed: false, open: '09:00', close: '18:00' },
          thursday: { closed: false, open: '09:00', close: '18:00' },
          friday: { closed: false, open: '09:00', close: '18:00' },
          saturday: { closed: false, open: '09:00', close: '18:00' },
          sunday: { closed: true, open: '09:00', close: '18:00' },
        },
      });

      // Précharger le profil (nom + avatar) depuis le propriétaire de la boutique
      setProfileName(shop.owner?.fullName || '');
      setAvatarUrl(shop.owner?.avatarUrl || '');
    }
  }, [shop, reset]);

  const onSubmit = async (data: ShopSettingsFormValues) => {
    if (!shop) {
      toast.error('Aucune boutique trouvée');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updateData: UpdateShopData = {
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        openingHours: data.openingHours,
      };

      await shopService.updateShop(shop.id, updateData);
      await refetch(); // Rafraîchir les données
      
      toast.success('Paramètres de la boutique mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utilitaire: recadrer au centre et redimensionner l'image en carré 512x512
  const processImageToSquare = async (file: File, targetSize = 512): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const size = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = Math.max(0, Math.floor((img.naturalWidth - size) / 2));
          const sy = Math.max(0, Math.floor((img.naturalHeight - size) / 2));

          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            return reject(new Error('Contexte canvas introuvable'));
          }
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error('Échec de la conversion image'));
            const processedFile = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(processedFile);
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Impossible de charger l’image'));
        };
        img.src = url;
      } catch (e) {
        reject(e as Error);
      }
    });
  };

  // Upload avatar vers Supabase Storage et mettre à jour l'URL locale
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const userId = shop?.owner?.id;
      if (!userId) {
        toast.error('Utilisateur introuvable pour téléverser la photo');
        return;
      }

      // Option d’optimisation: recadrer en carré et compresser en JPEG
      const processed = optimizeImage ? await processImageToSquare(file, 512) : file;
      const fileExt = optimizeImage ? 'jpg' : (file.name.split('.').pop() || 'png');
      // Ne pas préfixer par "avatars/" car le bucket est déjà spécifié via .from('avatars')
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processed, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Échec du téléversement. Veuillez saisir l'URL de la photo.");
        return;
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (publicData?.publicUrl) {
        setAvatarUrl(publicData.publicUrl);
        toast.success('Photo téléversée');
      } else {
        // Fallback: tenter une URL signée (si bucket non public)
        const { data: signedData, error: signedError } = await supabase.storage
          .from('avatars')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 an

        if (signedError || !signedData?.signedUrl) {
          toast.error("Impossible d'obtenir l'URL de la photo");
        } else {
          setAvatarUrl(signedData.signedUrl);
          toast.success('Photo téléversée (URL signée)');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du téléversement');
    } finally {
      setIsUploading(false);
    }
  };

  // Sauvegarder le profil via API
  const handleSaveProfile = async () => {
    if (!shop?.owner?.id) {
      toast.error('Profil propriétaire introuvable');
      return;
    }
    try {
      setIsSavingProfile(true);
      const response = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shop.owner.id, fullName: profileName, avatarUrl }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Erreur API profil');
      }
      toast.success('Profil mis à jour');
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Chargement...</h2>
          <p className="text-sm text-gray-500">Récupération des paramètres de votre boutique</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Aucune boutique trouvée</h2>
          <p className="text-sm text-gray-500 mb-4">Vous devez d'abord créer une boutique</p>
          <Link
            href="/dashboard/onboarding"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Créer une boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Aperçu de la boutique */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-6">
            <Store className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Aperçu de la boutique</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                )}
                {shop.address && (
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {shop.address}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <Package className="h-3.5 w-3.5 mr-1" /> Produits
                </div>
                <div className="text-lg font-semibold text-gray-900">{shop._count?.products ?? 0}</div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Commandes
                </div>
                <div className="text-lg font-semibold text-gray-900">{shop._count?.orders ?? 0}</div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <Users className="h-3.5 w-3.5 mr-1" /> Clients
                </div>
                <div className="text-lg font-semibold text-gray-900">{shop._count?.customers ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Profil minimaliste */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Profil</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="mt-3">
                <label className="inline-flex items-center px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 cursor-pointer">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Téléverser une photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="ml-2 inline-flex items-center px-3 py-2 text-xs rounded-md border bg-white hover:bg-gray-50"
                >
                  Supprimer
                </button>
                {isUploading && (
                  <p className="text-xs text-gray-500 mt-2">Téléversement en cours...</p>
                )}
                <div className="mt-2 flex items-center text-xs text-gray-600">
                  <input
                    id="optimizeImage"
                    type="checkbox"
                    className="mr-2"
                    checked={optimizeImage}
                    onChange={(e) => setOptimizeImage(e.target.checked)}
                  />
                  <label htmlFor="optimizeImage">Optimiser en 512x512 (recadrage centré)</label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'avatar</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-500">Astuce: carré 512x512 recommandé (optimisation automatique activable)</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer le profil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire Boutique */}
      <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
            {/* Informations générales */}
            <div>
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la boutique *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nom de votre boutique"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Décrivez votre boutique..."
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register('address')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Adresse de votre boutique"
                  />
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div>
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Horaires d'ouverture</h2>
              </div>
              
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayData = watch(`openingHours.${day.key}` as any);
                  const isClosed = dayData?.closed;
                  const hasHours = !isClosed && dayData?.open && dayData?.close;
                  const badgeClass = isClosed
                    ? 'bg-gray-100 text-gray-700'
                    : hasHours
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700';
                  const badgeText = isClosed
                    ? 'Fermé'
                    : hasHours
                    ? 'Ouvert'
                    : 'Heures non définies';

                  return (
                    <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-gray-700">{day.label}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${badgeClass}`}>{badgeText}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${day.key}-closed`}
                            {...register(`openingHours.${day.key}.closed` as any)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day.key}-closed`} className="ml-2 text-sm text-gray-700">
                            Fermé
                          </label>
                        </div>

                        {!isClosed && (
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <input
                                type="time"
                                {...register(`openingHours.${day.key}.open` as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <span className="text-gray-500">à</span>
                              <input
                                type="time"
                                {...register(`openingHours.${day.key}.close` as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Format 24h, ex: 09:00 à 18:00</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}