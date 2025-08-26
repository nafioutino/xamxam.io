'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { useShop } from '@/hooks/useShop';
import { shopService, UpdateShopData } from '@/services/shopService';
import { Store, Clock, MapPin, FileText, Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour au dashboard
            </Link>
          </div>
          <div className="flex items-center">
            <Store className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres de la Boutique</h1>
              <p className="text-gray-600">Gérez les informations de votre boutique</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
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
                  
                  return (
                    <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700">{day.label}</span>
                      </div>
                      
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Annuler
              </Link>
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
    </div>
  );
}