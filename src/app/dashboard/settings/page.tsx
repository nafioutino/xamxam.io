'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { UserIcon, BuildingStorefrontIcon, BellIcon, ShieldCheckIcon, CreditCardIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type TabType = 'profile' | 'store' | 'notifications' | 'security' | 'payments' | 'faq';

interface StoreHours {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  minOrderValue: number;
  estimatedTime: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profil utilisateur
  const [userProfile, setUserProfile] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33612345678',
    role: 'Administrateur',
    language: 'fr',
  });

  // Configuration de la boutique
  const [storeInfo, setStoreInfo] = useState({
    name: 'Ma Boutique',
    description: 'Boutique de vêtements et accessoires de mode',
    address: '123 Rue du Commerce, 75001 Paris',
    phone: '+33123456789',
    email: 'contact@maboutique.com',
    website: 'https://www.maboutique.com',
    logo: '/placeholder-logo.png',
  });

  // Horaires d'ouverture
  const [storeHours, setStoreHours] = useState<StoreHours[]>([
    { day: 'Lundi', open: true, openTime: '09:00', closeTime: '19:00' },
    { day: 'Mardi', open: true, openTime: '09:00', closeTime: '19:00' },
    { day: 'Mercredi', open: true, openTime: '09:00', closeTime: '19:00' },
    { day: 'Jeudi', open: true, openTime: '09:00', closeTime: '19:00' },
    { day: 'Vendredi', open: true, openTime: '09:00', closeTime: '19:00' },
    { day: 'Samedi', open: true, openTime: '10:00', closeTime: '18:00' },
    { day: 'Dimanche', open: false, openTime: '10:00', closeTime: '18:00' },
  ]);

  // Zones de livraison
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([
    { id: 'zone1', name: 'Centre-ville', price: 0, minOrderValue: 15, estimatedTime: '30-45 min' },
    { id: 'zone2', name: 'Périphérie', price: 2.99, minOrderValue: 20, estimatedTime: '45-60 min' },
    { id: 'zone3', name: 'Banlieue', price: 4.99, minOrderValue: 25, estimatedTime: '60-90 min' },
  ]);

  // Méthodes de paiement
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'cash', name: 'Espèces à la livraison', enabled: true },
    { id: 'card', name: 'Carte bancaire en ligne', enabled: true },
    { id: 'transfer', name: 'Virement bancaire', enabled: false },
    { id: 'mobile', name: 'Paiement mobile (Orange Money, Wave, etc.)', enabled: true },
  ]);

  // FAQ personnalisée
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 'faq1',
      question: 'Quels sont vos délais de livraison ?',
      answer: 'Nos délais de livraison varient selon votre zone. En centre-ville, comptez 30-45 minutes. Pour la périphérie, 45-60 minutes. Pour la banlieue, 60-90 minutes.',
    },
    {
      id: 'faq2',
      question: 'Comment puis-je suivre ma commande ?',
      answer: 'Vous recevrez un lien de suivi par SMS dès que votre commande sera en préparation. Vous pourrez suivre en temps réel l\'état de votre commande.',
    },
    {
      id: 'faq3',
      question: 'Quelles sont vos conditions de retour ?',
      answer: 'Vous disposez de 14 jours pour retourner un article. Il doit être dans son état d\'origine, non utilisé et dans son emballage d\'origine.',
    },
  ]);

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    newOrder: true,
    orderStatus: true,
    customerMessages: true,
    paymentConfirmation: true,
    marketingCampaigns: false,
    systemUpdates: true,
  });

  // Sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    ipRestriction: false,
    dataEncryption: true,
  });

  // Gestion des horaires d'ouverture
  const handleHoursChange = (index: number, field: keyof StoreHours, value: any) => {
    const updatedHours = [...storeHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setStoreHours(updatedHours);
  };

  // Ajout d'une zone de livraison
  const handleAddDeliveryZone = () => {
    const newZone: DeliveryZone = {
      id: `zone${deliveryZones.length + 1}`,
      name: 'Nouvelle zone',
      price: 0,
      minOrderValue: 0,
      estimatedTime: '30-60 min',
    };
    setDeliveryZones([...deliveryZones, newZone]);
  };

  // Suppression d'une zone de livraison
  const handleRemoveDeliveryZone = (id: string) => {
    setDeliveryZones(deliveryZones.filter((zone) => zone.id !== id));
  };

  // Mise à jour d'une zone de livraison
  const handleUpdateDeliveryZone = (id: string, field: keyof DeliveryZone, value: any) => {
    setDeliveryZones(
      deliveryZones.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone))
    );
  };

  // Ajout d'un élément FAQ
  const handleAddFAQItem = () => {
    const newItem: FAQItem = {
      id: `faq${faqItems.length + 1}`,
      question: 'Nouvelle question',
      answer: 'Nouvelle réponse',
    };
    setFaqItems([...faqItems, newItem]);
  };

  // Suppression d'un élément FAQ
  const handleRemoveFAQItem = (id: string) => {
    setFaqItems(faqItems.filter((item) => item.id !== id));
  };

  // Mise à jour d'un élément FAQ
  const handleUpdateFAQItem = (id: string, field: keyof FAQItem, value: string) => {
    setFaqItems(faqItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Sauvegarde des paramètres
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simuler une requête API
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres enregistrés avec succès');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Paramètres</h1>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? (
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
              Enregistrement...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tab.Group onChange={(index) => setActiveTab(['profile', 'store', 'notifications', 'security', 'payments', 'faq'][index] as TabType)}>
          <Tab.List className="flex bg-gray-50 border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Profil</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <BuildingStorefrontIcon className="h-5 w-5" />
                <span>Boutique</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <BellIcon className="h-5 w-5" />
                <span>Notifications</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Sécurité</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCardIcon className="h-5 w-5" />
                <span>Paiements</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-4 px-1 text-sm font-medium text-center focus:outline-none ${selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span>FAQ</span>
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Profil */}
            <Tab.Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informations personnelles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Mettez à jour vos informations personnelles et vos préférences.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        value={userProfile.role}
                        onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option>Administrateur</option>
                        <option>Gestionnaire</option>
                        <option>Vendeur</option>
                        <option>Support client</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse e-mail
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Numéro de téléphone
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Langue préférée
                    </label>
                    <div className="mt-1">
                      <select
                        id="language"
                        name="language"
                        value={userProfile.language}
                        onChange={(e) => setUserProfile({ ...userProfile, language: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="fr">Français</option>
                        <option value="en">Anglais</option>
                        <option value="wo">Wolof</option>
                        <option value="di">Dioula</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => toast.success('Mot de passe réinitialisé')}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Réinitialiser le mot de passe
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Boutique */}
            <Tab.Panel className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informations de la boutique</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez les informations de base de votre boutique.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                      Nom de la boutique
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="store-name"
                        id="store-name"
                        value={storeInfo.name}
                        onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
                      Email de contact
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="store-email"
                        id="store-email"
                        value={storeInfo.email}
                        onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">
                      Téléphone de la boutique
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="store-phone"
                        id="store-phone"
                        value={storeInfo.phone}
                        onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="store-website" className="block text-sm font-medium text-gray-700">
                      Site web
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="store-website"
                        id="store-website"
                        value={storeInfo.website}
                        onChange={(e) => setStoreInfo({ ...storeInfo, website: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">
                      Adresse
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="store-address"
                        id="store-address"
                        value={storeInfo.address}
                        onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="store-description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="store-description"
                        name="store-description"
                        rows={3}
                        value={storeInfo.description}
                        onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Brève description de votre boutique. Cette description sera visible par vos clients.
                    </p>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                    <div className="mt-1 flex items-center">
                      <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                      <button
                        type="button"
                        onClick={() => toast.success('Fonctionnalité de téléchargement à implémenter')}
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Horaires d'ouverture</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Définissez les horaires d'ouverture de votre boutique.
                  </p>

                  <div className="mt-4 space-y-4">
                    {storeHours.map((day, index) => (
                      <div key={day.day} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700">{day.day}</span>
                        </div>
                        <div className="flex items-center h-5">
                          <input
                            id={`open-${day.day}`}
                            name={`open-${day.day}`}
                            type="checkbox"
                            checked={day.open}
                            onChange={(e) => handleHoursChange(index, 'open', e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`open-${day.day}`} className="ml-2 text-sm text-gray-700">
                            Ouvert
                          </label>
                        </div>
                        {day.open && (
                          <div className="flex space-x-2 items-center">
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                            />
                            <span className="text-gray-500">à</span>
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Zones de livraison</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Définissez les zones de livraison et les frais associés.
                  </p>

                  <div className="mt-4 space-y-4">
                    {deliveryZones.map((zone) => (
                      <div key={zone.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={zone.name}
                            onChange={(e) => handleUpdateDeliveryZone(zone.id, 'name', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Nom de la zone"
                          />
                        </div>
                        <div className="w-32">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">FCFA</span>
                            </div>
                            <input
                              type="number"
                              value={zone.price}
                              onChange={(e) => handleUpdateDeliveryZone(zone.id, 'price', parseFloat(e.target.value))}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">FCFA</span>
                            </div>
                            <input
                              type="number"
                              value={zone.minOrderValue}
                              onChange={(e) =>
                                handleUpdateDeliveryZone(zone.id, 'minOrderValue', parseFloat(e.target.value))
                              }
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="w-32">
                          <input
                            type="text"
                            value={zone.estimatedTime}
                            onChange={(e) => handleUpdateDeliveryZone(zone.id, 'estimatedTime', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="30-45 min"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliveryZone(zone.id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleAddDeliveryZone}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ajouter une zone
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Notifications */}
            <Tab.Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Préférences de notification</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez les notifications que vous souhaitez recevoir.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="newOrder"
                        name="newOrder"
                        type="checkbox"
                        checked={notificationSettings.newOrder}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            newOrder: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="newOrder" className="font-medium text-gray-700">
                        Nouvelles commandes
                      </label>
                      <p className="text-gray-500">Recevez une notification lorsqu'une nouvelle commande est passée.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="orderStatus"
                        name="orderStatus"
                        type="checkbox"
                        checked={notificationSettings.orderStatus}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            orderStatus: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="orderStatus" className="font-medium text-gray-700">
                        Changements de statut des commandes
                      </label>
                      <p className="text-gray-500">
                        Recevez une notification lorsque le statut d'une commande change.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="customerMessages"
                        name="customerMessages"
                        type="checkbox"
                        checked={notificationSettings.customerMessages}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            customerMessages: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="customerMessages" className="font-medium text-gray-700">
                        Messages clients
                      </label>
                      <p className="text-gray-500">
                        Recevez une notification lorsqu'un client vous envoie un message.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="paymentConfirmation"
                        name="paymentConfirmation"
                        type="checkbox"
                        checked={notificationSettings.paymentConfirmation}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentConfirmation: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="paymentConfirmation" className="font-medium text-gray-700">
                        Confirmations de paiement
                      </label>
                      <p className="text-gray-500">
                        Recevez une notification lorsqu'un paiement est confirmé.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="marketingCampaigns"
                        name="marketingCampaigns"
                        type="checkbox"
                        checked={notificationSettings.marketingCampaigns}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            marketingCampaigns: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="marketingCampaigns" className="font-medium text-gray-700">
                        Campagnes marketing
                      </label>
                      <p className="text-gray-500">
                        Recevez des notifications sur les nouvelles fonctionnalités et les campagnes marketing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="systemUpdates"
                        name="systemUpdates"
                        type="checkbox"
                        checked={notificationSettings.systemUpdates}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            systemUpdates: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="systemUpdates" className="font-medium text-gray-700">
                        Mises à jour système
                      </label>
                      <p className="text-gray-500">
                        Recevez des notifications sur les mises à jour et les maintenances du système.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Sécurité */}
            <Tab.Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres de sécurité</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez les paramètres de sécurité de votre compte.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="twoFactorAuth"
                        name="twoFactorAuth"
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="twoFactorAuth" className="font-medium text-gray-700">
                        Authentification à deux facteurs
                      </label>
                      <p className="text-gray-500">
                        Activez l'authentification à deux facteurs pour renforcer la sécurité de votre compte.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="ipRestriction"
                        name="ipRestriction"
                        type="checkbox"
                        checked={securitySettings.ipRestriction}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipRestriction: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="ipRestriction" className="font-medium text-gray-700">
                        Restriction d'adresse IP
                      </label>
                      <p className="text-gray-500">
                        Limitez l'accès à votre compte à des adresses IP spécifiques.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="dataEncryption"
                        name="dataEncryption"
                        type="checkbox"
                        checked={securitySettings.dataEncryption}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            dataEncryption: e.target.checked,
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="dataEncryption" className="font-medium text-gray-700">
                        Chiffrement des données
                      </label>
                      <p className="text-gray-500">
                        Activez le chiffrement des données pour protéger vos informations sensibles.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                      Délai d'expiration de session (minutes)
                    </label>
                    <div className="mt-1">
                      <select
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: e.target.value,
                          })
                        }
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 heure</option>
                        <option value="120">2 heures</option>
                        <option value="240">4 heures</option>
                      </select>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Définissez la durée après laquelle une session inactive sera automatiquement déconnectée.
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => toast.success('Journal d\'activité ouvert')}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Voir le journal d'activité
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Paiements */}
            <Tab.Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Méthodes de paiement</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez les méthodes de paiement que vous acceptez.
                  </p>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={method.id}
                          name={method.id}
                          type="checkbox"
                          checked={method.enabled}
                          onChange={(e) =>
                            setPaymentMethods(
                              paymentMethods.map((m) =>
                                m.id === method.id ? { ...m, enabled: e.target.checked } : m
                              )
                            )
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={method.id} className="font-medium text-gray-700">
                          {method.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => toast.success('Configuration des passerelles de paiement')}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Configurer les passerelles de paiement
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* FAQ */}
            <Tab.Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">FAQ personnalisée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez les questions fréquemment posées pour votre boutique. Ces informations seront utilisées par l'agent IA pour répondre aux questions des clients.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-md p-4">
                      <div className="mb-2">
                        <label htmlFor={`question-${item.id}`} className="block text-sm font-medium text-gray-700">
                          Question
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id={`question-${item.id}`}
                            value={item.question}
                            onChange={(e) => handleUpdateFAQItem(item.id, 'question', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`answer-${item.id}`} className="block text-sm font-medium text-gray-700">
                          Réponse
                        </label>
                        <div className="mt-1">
                          <textarea
                            id={`answer-${item.id}`}
                            rows={3}
                            value={item.answer}
                            onChange={(e) => handleUpdateFAQItem(item.id, 'answer', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQItem(item.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddFAQItem}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ajouter une question
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}