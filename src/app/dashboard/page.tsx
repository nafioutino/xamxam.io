'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
}

const StatsCard = ({ title, value, icon, change, positive }: StatsCardProps) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    {change && (
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span
            className={`font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}
          >
            {positive ? '↑' : '↓'} {change}
          </span>{' '}
          <span className="text-gray-500">vs mois précédent</span>
        </div>
      </div>
    )}
  </div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const QuickAction = ({ title, description, icon, href, color }: QuickActionProps) => (
  <Link
    href={href}
    className={`relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-${color}-500`}
  >
    <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-${color}-50 flex items-center justify-center`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <span className="absolute inset-0" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 truncate">{description}</p>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: '0',
    orders: 0,
    customers: 0,
    conversionRate: '0%',
  });

  // Simulate loading data
  useEffect(() => {
    // In a real app, fetch data from API
    const timer = setTimeout(() => {
      setStats({
        revenue: '12 500 €',
        orders: 124,
        customers: 89,
        conversionRate: '3.2%',
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-semibold text-gray-900 h-8 bg-gray-200 rounded w-1/4 mb-6"></h1>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Bonjour, {session?.user?.name || 'Commerçant'}
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Chiffre d'affaires"
          value={stats.revenue}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-600" />}
          change="12%"
          positive={true}
        />
        <StatsCard
          title="Commandes"
          value={stats.orders}
          icon={<ShoppingBagIcon className="h-6 w-6 text-blue-600" />}
          change="8%"
          positive={true}
        />
        <StatsCard
          title="Clients"
          value={stats.customers}
          icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
          change="5%"
          positive={true}
        />
        <StatsCard
          title="Taux de conversion"
          value={stats.conversionRate}
          icon={<ChartBarIcon className="h-6 w-6 text-blue-600" />}
          change="2%"
          positive={false}
        />
      </div>

      <h2 className="text-lg font-medium text-gray-900 mt-8 mb-4">Actions rapides</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          title="Ajouter un produit"
          description="Créez un nouveau produit dans votre catalogue"
          icon={<ShoppingBagIcon className="h-6 w-6 text-blue-600" />}
          href="/dashboard/catalogue/new"
          color="blue"
        />
        <QuickAction
          title="Voir les messages"
          description="Consultez vos conversations récentes"
          icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />}
          href="/dashboard/inbox"
          color="indigo"
        />
        <QuickAction
          title="Générer du contenu"
          description="Créez du contenu marketing avec l'IA"
          icon={<SparklesIcon className="h-6 w-6 text-purple-600" />}
          href="/dashboard/content"
          color="purple"
        />
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Commandes récentes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Vos 5 dernières commandes</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voir toutes les commandes
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 font-medium text-gray-500 text-sm">
            <div>Commande</div>
            <div>Client</div>
            <div>Statut</div>
            <div>Montant</div>
          </div>
          {/* Sample orders - in a real app, fetch from API */}
          {[
            {
              id: 'ORD-001',
              customer: 'Marie Diop',
              status: 'Livré',
              statusColor: 'green',
              amount: '1 250 €',
            },
            {
              id: 'ORD-002',
              customer: 'Amadou Sow',
              status: 'En livraison',
              statusColor: 'blue',
              amount: '890 €',
            },
            {
              id: 'ORD-003',
              customer: 'Fatou Ndiaye',
              status: 'Payé',
              statusColor: 'indigo',
              amount: '2 100 €',
            },
            {
              id: 'ORD-004',
              customer: 'Ousmane Diallo',
              status: 'En préparation',
              statusColor: 'yellow',
              amount: '750 €',
            },
            {
              id: 'ORD-005',
              customer: 'Aïda Mbaye',
              status: 'En attente',
              statusColor: 'gray',
              amount: '1 500 €',
            },
          ].map((order, i) => (
            <div
              key={order.id}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 text-sm`}
            >
              <div className="font-medium text-blue-600">{order.id}</div>
              <div>{order.customer}</div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${order.statusColor}-100 text-${order.statusColor}-800`}
                >
                  {order.status}
                </span>
              </div>
              <div>{order.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}