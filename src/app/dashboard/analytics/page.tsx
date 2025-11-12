'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, BarChart3, MessagesSquare, ShoppingCart, Euro, RefreshCw } from 'lucide-react';

// Types pour les données de statistiques
type StatPeriod = 'day' | 'week' | 'month' | 'year';
type ChannelType = 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'tiktok' | 'email' | 'all';

interface ChannelStat {
  channel: ChannelType;
  conversations: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}

interface DailyStat {
  date: string;
  conversations: number;
  orders: number;
  revenue: number;
}

// Données simulées pour les statistiques
const generateMockChannelStats = (): ChannelStat[] => [
  {
    channel: 'whatsapp',
    conversations: 156,
    orders: 42,
    revenue: 3850.75,
    conversionRate: 26.9,
  },
  {
    channel: 'facebook',
    conversations: 89,
    orders: 21,
    revenue: 1950.25,
    conversionRate: 23.6,
  },
  {
    channel: 'instagram',
    conversations: 124,
    orders: 35,
    revenue: 3120.50,
    conversionRate: 28.2,
  },
  {
    channel: 'telegram',
    conversations: 45,
    orders: 8,
    revenue: 720.30,
    conversionRate: 17.8,
  },
  {
    channel: 'tiktok',
    conversations: 67,
    orders: 15,
    revenue: 1350.45,
    conversionRate: 22.4,
  },
  {
    channel: 'email',
    conversations: 38,
    orders: 12,
    revenue: 1080.20,
    conversionRate: 31.6,
  },
  {
    channel: 'all',
    conversations: 519,
    orders: 133,
    revenue: 12072.45,
    conversionRate: 25.6,
  },
];

const generateMockDailyStats = (): DailyStat[] => {
  const stats: DailyStat[] = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Générer des valeurs aléatoires mais réalistes
    const conversations = Math.floor(Math.random() * 50) + 20;
    const orders = Math.floor(conversations * (Math.random() * 0.3 + 0.1));
    const avgOrderValue = Math.random() * 50 + 50;
    const revenue = orders * avgOrderValue;
    
    stats.push({
      date: date.toISOString().split('T')[0],
      conversations,
      orders,
      revenue: parseFloat(revenue.toFixed(2)),
    });
  }
  
  return stats;
};

// Composant principal
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<StatPeriod>('week');
  const [channelStats, setChannelStats] = useState<ChannelStat[]>(generateMockChannelStats());
  const [dailyStats, setDailyStats] = useState<DailyStat[]>(generateMockDailyStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour simuler le rafraîchissement des données
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setChannelStats(generateMockChannelStats());
      setDailyStats(generateMockDailyStats());
      setIsRefreshing(false);
    }, 1000);
  };

  // Calculer les totaux et les variations
  const totalConversations = channelStats.find(stat => stat.channel === 'all')?.conversations || 0;
  const totalOrders = channelStats.find(stat => stat.channel === 'all')?.orders || 0;
  const totalRevenue = channelStats.find(stat => stat.channel === 'all')?.revenue || 0;
  const avgConversionRate = channelStats.find(stat => stat.channel === 'all')?.conversionRate || 0;

  // Simuler des variations par rapport à la période précédente
  const conversationsChange = 12.5;
  const ordersChange = 8.3;
  const revenueChange = 15.7;
  const conversionRateChange = -2.1;

  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Fonction pour obtenir la couleur en fonction de la variation
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Fonction pour obtenir l'icône en fonction de la variation
  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  // Fonction pour obtenir le libellé du canal
  const getChannelLabel = (channel: ChannelType) => {
    switch (channel) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'telegram':
        return 'Telegram';
      case 'tiktok':
        return 'TikTok';
      case 'email':
        return 'Email';
      case 'all':
        return 'Tous les canaux';
      default:
        return channel;
    }
  };

  // Fonction pour obtenir la couleur du canal
  const getChannelColor = (channel: ChannelType) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'instagram':
        return 'bg-purple-100 text-purple-800';
      case 'telegram':
        return 'bg-blue-100 text-blue-800';
      case 'tiktok':
        return 'bg-gray-100 text-gray-800';
      case 'email':
        return 'bg-yellow-100 text-yellow-800';
      case 'all':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé de la période
  const getPeriodLabel = (period: StatPeriod) => {
    switch (period) {
      case 'day':
        return 'Aujourd&apos;hui';
      case 'week':
        return 'Cette semaine';
      case 'month':
        return 'Ce mois';
      case 'year':
        return 'Cette année';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <div className="flex items-center space-x-4">
          <div>
            <select
              id="period"
              name="period"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={period}
              onChange={(e) => setPeriod(e.target.value as StatPeriod)}
            >
              <option value="day">Aujourd&apos;hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`-ml-1 mr-2 h-5 w-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Conversations */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessagesSquare className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversations</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{totalConversations}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(conversationsChange)}`}>
                        {getChangeIcon(conversationsChange)}
                        <span className="sr-only">
                          {conversationsChange >= 0 ? 'Augmentation' : 'Diminution'} de
                        </span>
                        {Math.abs(conversationsChange)}%
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-900">
                Voir toutes les conversations
              </a>
            </div>
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Commandes</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{totalOrders}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(ordersChange)}`}>
                        {getChangeIcon(ordersChange)}
                        <span className="sr-only">
                          {ordersChange >= 0 ? 'Augmentation' : 'Diminution'} de
                        </span>
                        {Math.abs(ordersChange)}%
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-900">
                Voir toutes les commandes
              </a>
            </div>
          </div>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Euro className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Chiffre d&apos;affaires</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(revenueChange)}`}>
                        {getChangeIcon(revenueChange)}
                        <span className="sr-only">
                          {revenueChange >= 0 ? 'Augmentation' : 'Diminution'} de
                        </span>
                        {Math.abs(revenueChange)}%
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-900">
                Voir les rapports financiers
              </a>
            </div>
          </div>
        </div>

        {/* Taux de conversion */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taux de conversion</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{avgConversionRate.toFixed(1)}%</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(conversionRateChange)}`}>
                        {getChangeIcon(conversionRateChange)}
                        <span className="sr-only">
                          {conversionRateChange >= 0 ? 'Augmentation' : 'Diminution'} de
                        </span>
                        {Math.abs(conversionRateChange)}%
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-900">
                Voir les analyses détaillées
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique d&apos;évolution (simulé avec des barres) */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Évolution des performances</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aperçu des conversations, commandes et revenus sur les 14 derniers jours
          </p>
        </div>
        <div className="p-4">
          <div className="h-80 relative">
            {/* Simulation d'un graphique avec des barres */}
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {dailyStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 w-12">
                  <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '200px' }}>
                    {/* Barre des conversations */}
                    <div
                      className="absolute bottom-0 left-0 w-4 bg-blue-500 rounded-t-md"
                      style={{ height: `${(stat.conversations / 70) * 100}%`, maxHeight: '100%' }}
                      title={`${stat.conversations} conversations`}
                    />
                    {/* Barre des commandes */}
                    <div
                      className="absolute bottom-0 right-0 w-4 bg-green-500 rounded-t-md"
                      style={{ height: `${(stat.orders / 20) * 100}%`, maxHeight: '100%' }}
                      title={`${stat.orders} commandes`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                    {new Date(stat.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            {/* Légende */}
            <div className="absolute top-0 right-0 flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1" />
                <span className="text-xs text-gray-500">Conversations</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
                <span className="text-xs text-gray-500">Commandes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des performances par canal */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Performance par canal</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comparaison des performances de vos différents canaux de communication
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Canal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Conversations
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Commandes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Chiffre d&apos;affaires
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Taux de conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {channelStats
                .filter((stat) => stat.channel !== 'all')
                .map((stat) => (
                  <tr key={stat.channel}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChannelColor(stat.channel)}`}
                        >
                          {getChannelLabel(stat.channel)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.conversations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(stat.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Total
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {channelStats.find((stat) => stat.channel === 'all')?.conversations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {channelStats.find((stat) => stat.channel === 'all')?.orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {formatCurrency(channelStats.find((stat) => stat.channel === 'all')?.revenue || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {channelStats.find((stat) => stat.channel === 'all')?.conversionRate.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recommandations IA</h3>
          <p className="mt-1 text-sm text-gray-500">
            Suggestions basées sur l&apos;analyse de vos données
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Instagram a le meilleur taux de conversion (28.2%). Envisagez d&apos;augmenter votre présence sur cette plateforme.
                </p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <a href="#" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                    Détails <span aria-hidden="true">&rarr;</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-yellow-700">
                  Votre taux de conversion global a diminué de 2.1% par rapport à la période précédente. Vérifiez vos scripts de réponse IA.
                </p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <a href="#" className="whitespace-nowrap font-medium text-yellow-700 hover:text-yellow-600">
                    Analyser <span aria-hidden="true">&rarr;</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-green-700">
                  Votre chiffre d&apos;affaires a augmenté de 15.7%. Continuez à promouvoir vos produits les plus vendus.
                </p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <a href="#" className="whitespace-nowrap font-medium text-green-700 hover:text-green-600">
                    Voir les produits <span aria-hidden="true">&rarr;</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}