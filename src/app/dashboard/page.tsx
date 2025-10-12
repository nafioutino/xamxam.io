'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import Link from 'next/link';

import ShopGuard from '@/components/auth/ShopGuard';
import { ShoppingBag, MessagesSquare, Wand2, BarChart3, DollarSign, Users } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
  animationDelayClass?: string;
}

const StatsCard = ({ title, value, icon, change, positive, animationDelayClass }: StatsCardProps) => (
  <div className={`bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${animationDelayClass ?? ''}`}>
    <div className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-50 rounded-md p-4 shadow-md">{icon}</div>
        <div className="ml-6 w-0 flex-1">
          <dl>
            <dt className="text-base font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-xl font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    {change && (
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="text-sm">
          <span
            className={`font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}
          >
            {positive ? '↑' : '↓'} {change}
          </span>{' '}
          <span className="text-gray-500 text-sm">vs mois précédent</span>
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
  animationDelayClass?: string;
}

const QuickAction = ({ title, description, icon, href, color, animationDelayClass }: QuickActionProps) => (
  <Link
    href={href}
    className={`group relative rounded-lg border border-gray-300 bg-white px-6 py-6 shadow-md flex items-center space-x-4 hover:border-${color}-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-${color}-500 animate-in fade-in slide-in-from-bottom-2 ${animationDelayClass ?? ''}`}
  >
    <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-${color}-50 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <span className="absolute inset-0" aria-hidden="true" />
      <p className="text-base font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 truncate">{description}</p>
    </div>
  </Link>
);

function DashboardContent() {
  const { user } = useAuth();
  const { shop } = useShop();
  const [statsLoading, setStatsLoading] = useState(true);
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
        revenue: '12 500 FCFA',
        orders: 124,
        customers: 89,
        conversionRate: '3.2%',
      });
      setStatsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {statsLoading ? (
        <div className="animate-pulse">
          <h1 className="text-2xl font-semibold text-gray-900 h-8 bg-gray-200 rounded w-1/4 mb-6"></h1>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Commerçant'}
              </h1>
              {shop && (
                <p className="text-lg text-gray-600 mt-1">
                  Boutique: <span className="font-medium text-blue-600">{shop.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Chiffre d'affaires"
              value={stats.revenue}
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              change="12%"
              positive={true}
              animationDelayClass="animation-delay-100"
            />
            <StatsCard
              title="Commandes"
              value={stats.orders}
              icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
              change="8%"
              positive={true}
              animationDelayClass="animation-delay-200"
            />
            <StatsCard
              title="Clients"
              value={stats.customers}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              change="5%"
              positive={true}
              animationDelayClass="animation-delay-300"
            />
            <StatsCard
              title="Taux de conversion"
              value={stats.conversionRate}
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              change="2%"
              positive={false}
              animationDelayClass="animation-delay-400"
            />
          </div>

          <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Ajouter un produit"
              description="Créez un nouveau produit dans votre catalogue"
              icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
              href="/dashboard/catalogue/new"
              color="blue"
              animationDelayClass="animation-delay-100"
            />
            <QuickAction
              title="Voir les messages"
              description="Consultez vos conversations récentes"
              icon={<MessagesSquare className="h-6 w-6 text-indigo-600" />}
              href="/dashboard/inbox"
              color="indigo"
              animationDelayClass="animation-delay-200"
            />
            <QuickAction
              title="Générer du contenu"
              description="Créez du contenu marketing avec l'IA"
              icon={<Wand2 className="h-6 w-6 text-purple-600" />}
              href="/dashboard/content"
              color="purple"
              animationDelayClass="animation-delay-300"
            />
          </div>

          <div className="mt-8 bg-white shadow-lg overflow-hidden sm:rounded-lg border border-gray-100">
            <div className="px-6 py-6 sm:px-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl leading-6 font-medium text-gray-900">Commandes récentes</h3>
                <p className="mt-1 max-w-2xl text-base text-gray-500">Vos 5 dernières commandes</p>
              </div>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voir toutes les commandes
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 font-medium text-gray-500 text-base">
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
                  amount: '1 250 FCFA',
                },
                {
                  id: 'ORD-002',
                  customer: 'Amadou Sow',
                  status: 'En livraison',
                  statusColor: 'blue',
                  amount: '890 FCFA',
                },
                {
                  id: 'ORD-003',
                  customer: 'Fatou Ndiaye',
                  status: 'Payé',
                  statusColor: 'indigo',
                  amount: '2 100 FCFA',
                },
                {
                  id: 'ORD-004',
                  customer: 'Ousmane Diallo',
                  status: 'En préparation',
                  statusColor: 'yellow',
                  amount: '750 FCFA',
                },
                {
                  id: 'ORD-005',
                  customer: 'Aïda Mbaye',
                  status: 'En attente',
                  statusColor: 'gray',
                  amount: '1 500 FCFA',
                },
              ].map((order, i) => (
                <div
                  key={order.id}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 text-base`}
                >
                  <div className="font-medium text-blue-600">{order.id}</div>
                  <div>{order.customer}</div>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${order.statusColor}-100 text-${order.statusColor}-800`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div>{order.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ShopGuard>
      <DashboardContent />
    </ShopGuard>
  );
}