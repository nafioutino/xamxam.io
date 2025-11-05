'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { profileImages } from './profile-data';
// Icônes Heroicons pour la navigation remplacées par des icônes Lucide modernes
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingTransition from '@/components/auth/LoadingTransition';
import { useShop } from '@/hooks/useShop';

import { Home, Package, Share2, MessagesSquare, Bot, Wand2, ShoppingCart, BarChart3, Settings } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Catalogue', href: '/dashboard/catalogue', icon: Package },
  { name: 'Canaux', href: '/dashboard/channels', icon: Share2 },
  { name: 'Boîte de réception', href: '/dashboard/inbox', icon: MessagesSquare },
  { name: 'Agent IA', href: '/dashboard/ai-agent', icon: Bot },
  { name: 'Création de contenu', href: '/dashboard/content', icon: Wand2 },
  { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Statistiques', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout, clearTransition, isTransitioning } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [dashboardReady, setDashboardReady] = useState(false);
  const { shop } = useShop();
  
  useEffect(() => {
    // Utiliser l'avatar de l'utilisateur s'il existe, sinon une image générique
    if (shop?.owner?.avatarUrl) {
      setProfileImage(shop.owner.avatarUrl);
    } else if (!profileImage && profileImages && profileImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * profileImages.length);
      setProfileImage(profileImages[randomIndex].image);
    }
  }, [shop, profileImage]);

  // Indiquer que le dashboard est prêt après le montage
  useEffect(() => {
    if (!isLoading && user) {
      // Attendre un peu pour s'assurer que tout est rendu
      const timer = setTimeout(() => {
        setDashboardReady(true);
        // Désactiver l'état de transition
        if (clearTransition) {
          clearTransition();
        }
      }, 800); // Augmenté à 800ms pour donner le temps au dashboard de se rendre
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, clearTransition]);

  // Afficher le loader si en transition ou en chargement
  if (isTransitioning || isLoading) {
    // Si l'utilisateur n'est plus authentifié, c'est une déconnexion
    const message = !isAuthenticated ? "Déconnexion en cours" : "Chargement du dashboard";
    return <LoadingTransition message={message} />;
  }

  const handleLogout = async () => {
    // La transition sera gérée automatiquement par useAuth
    await logout();
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Toaster position="top-right" />
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="relative w-12 h-12 mr-3 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <span className="text-xl font-bold text-white">X</span>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-blue-600">XAMXAM</h1>
            </div>
            <div className="px-4 py-3 border-t border-b border-gray-200 mt-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {profileImage ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                        src={profileImage}
                        alt={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                        {(user?.user_metadata?.full_name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-lg font-medium text-gray-800">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                    </div>
                    <div className="text-base font-medium text-gray-500">{user?.email || ''}</div>
                  </div>
                </div>
              </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer transition-colors ${isActive ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-8 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="relative w-10 h-10 mr-3 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                      <span className="text-lg font-bold text-white">X</span>
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-blue-600">XAMXAM</h1>
              </div>
              <div className="px-4 py-3 border-t border-b border-gray-200 mt-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {profileImage ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                        src={profileImage}
                        alt={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold border-2 border-blue-200">
                        {(user?.user_metadata?.full_name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{user?.email || ''}</div>
                  </div>
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => {
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${isActive ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-8 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}