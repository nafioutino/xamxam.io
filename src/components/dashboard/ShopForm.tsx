'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Store, Clock, MapPin, FileText, Loader2, Building2, Calendar, Timer, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Informations de base</h3>
              <p className="text-gray-600">Commençons par les informations essentielles de votre boutique</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                  <Store className="inline w-4 h-4 mr-2 text-blue-600" />
                  Nom de la boutique *
                </label>
                <input
                  id="name"
                  type="text"
                  {...form.register('name')}
                  className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-4 px-5 transition-all duration-200 hover:border-gray-300"
                  placeholder="Ex: Ma Super Boutique"
                />
                {form.formState.errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center mr-2">!</span>
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                  <Sparkles className="inline w-4 h-4 mr-2 text-purple-600" />
                  Description de votre boutique
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...form.register('description')}
                  className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-4 px-5 transition-all duration-200 hover:border-gray-300 resize-none"
                  placeholder="Décrivez votre boutique, vos produits, votre mission... Cela aidera vos clients à mieux vous connaître !"
                />
                {form.formState.errors.description && (
                  <p className="mt-2 text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">Optionnel - Mais recommandé pour inspirer confiance</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Localisation</h3>
              <p className="text-gray-600">Où se trouve votre boutique ? (Optionnel)</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline w-4 h-4 mr-2 text-emerald-600" />
                  Adresse de votre boutique
                </label>
                <textarea
                  id="address"
                  rows={3}
                  {...form.register('address')}
                  className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm py-4 px-5 transition-all duration-200 hover:border-gray-300 resize-none"
                  placeholder="123 Rue du Commerce, 75001 Paris, France"
                />
                {form.formState.errors.address && (
                  <p className="mt-2 text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">Cela aidera vos clients à vous trouver plus facilement</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800 mb-1">Pourquoi renseigner votre adresse ?</h4>
                    <ul className="text-xs text-emerald-700 space-y-1">
                      <li>• Améliore votre référencement local</li>
                      <li>• Inspire confiance à vos clients</li>
                      <li>• Facilite les livraisons et retraits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mb-3 shadow-lg">
                <Timer className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Horaires d'ouverture</h3>
              <p className="text-xs text-gray-600">Définissez vos horaires pour informer vos clients</p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {daysOfWeek.map(({ key, label }) => {
                const isClosed = form.watch(`openingHours.${key}.closed` as any);
                return (
                  <div key={key} className={`relative p-2.5 rounded-lg border transition-all duration-200 ${
                    isClosed 
                      ? 'border-gray-200 bg-gray-50/50' 
                      : 'border-purple-200 bg-purple-50/30'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-semibold whitespace-nowrap ${isClosed ? 'text-gray-400' : 'text-gray-700'}`}>
                          {label}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            {...form.register(`openingHours.${key}.closed` as any)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <span className={`text-xs whitespace-nowrap ${isClosed ? 'text-gray-500' : 'text-gray-600'}`}>
                            Fermé
                          </span>
                        </div>
                      </div>

                      {!isClosed && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input
                            type="time"
                            {...form.register(`openingHours.${key}.open` as any)}
                            className="rounded border border-gray-200 text-xs py-1 px-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer w-[70px]"
                          />
                          
                          <span className="text-gray-400 text-xs">→</span>
                          
                          <input
                            type="time"
                            {...form.register(`openingHours.${key}.close` as any)}
                            className="rounded border border-gray-200 text-xs py-1 px-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer w-[70px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200/50 mt-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-purple-800 mb-0.5">💡 Conseil</h4>
                  <p className="text-[10px] leading-relaxed text-purple-700">
                    Modifiables à tout moment depuis votre dashboard
                  </p>
                </div>
              </div>
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
        <div className="flex justify-between pt-8">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            {!isOnboarding && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
              >
                Annuler
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 border border-transparent rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isOnboarding ? 'Créer ma boutique' : 'Créer la boutique'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}