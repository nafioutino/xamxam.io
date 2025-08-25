'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Store, Clock, MapPin, FileText, Loader2 } from 'lucide-react';
import { shopService, CreateShopData } from '@/services/shopService';

const shopSchema = z.object({
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

type ShopFormValues = z.infer<typeof shopSchema>;

interface ShopFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isOnboarding?: boolean;
}

const daysOfWeek = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

export default function ShopForm({ onSuccess, onCancel, isOnboarding = false }: ShopFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      openingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '', close: '', closed: true },
      },
    },
  });

  const onSubmit = async (data: ShopFormValues) => {
    try {
      setIsLoading(true);
      
      const shopData: CreateShopData = {
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        openingHours: data.openingHours || undefined,
      };

      await shopService.createShop(shopData);
      
      toast.success('Boutique créée avec succès!');
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la boutique');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Store className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
              <p className="text-sm text-gray-500">Commençons par les informations essentielles de votre boutique</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <input
                id="name"
                type="text"
                {...form.register('name')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-3 px-4"
                placeholder="Ex: Ma Super Boutique"
              />
              {form.formState.errors.name && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...form.register('description')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-3 px-4"
                placeholder="Décrivez votre boutique, vos produits, votre mission..."
              />
              {form.formState.errors.description && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPin className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Localisation</h3>
              <p className="text-sm text-gray-500">Où se trouve votre boutique ?</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                id="address"
                rows={3}
                {...form.register('address')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-3 px-4"
                placeholder="Adresse complète de votre boutique"
              />
              {form.formState.errors.address && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
              <p className="text-sm text-gray-500">Définissez vos horaires d'ouverture</p>
            </div>

            <div className="space-y-4">
              {daysOfWeek.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register(`openingHours.${key}.closed` as any)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Fermé</span>
                  </div>

                  {!form.watch(`openingHours.${key}.closed` as any) && (
                    <>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">De:</label>
                        <input
                          type="time"
                          {...form.register(`openingHours.${key}.open` as any)}
                          className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">À:</label>
                        <input
                          type="time"
                          {...form.register(`openingHours.${key}.close` as any)}
                          className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Étape {currentStep} sur {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Précédent
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {!isOnboarding && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isOnboarding ? 'Créer ma boutique' : 'Créer la boutique'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}