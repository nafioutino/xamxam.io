'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { profileImages } from './profile-data';
import {
  HomeIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  RadioIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Catalogue', href: '/dashboard/catalogue', icon: ShoppingBagIcon },
  { name: 'Canaux', href: '/dashboard/channels', icon: RadioIcon },
  { name: 'Boîte de réception', href: '/dashboard/inbox', icon: ChatBubbleLeftRightIcon },
  { name: 'Agent IA', href: '/dashboard/ai-agent', icon: SparklesIcon },
  { name: 'Création de contenu', href: '/dashboard/content', icon: DocumentTextIcon },
  { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingBagIcon },
  { name: 'Statistiques', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  
  useEffect(() => {
    // Sélectionner une image de profil aléatoire parmi les images disponibles
    if (profileImages && profileImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * profileImages.length);
      setProfileImage(profileImages[randomIndex].image);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
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
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
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
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
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
                className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  {profileImage ? (
                    <img
                      className="inline-block h-10 w-10 rounded-full object-cover border-2 border-blue-200"
                      src={profileImage}
                      alt={user?.name || 'Profile'}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold border-2 border-blue-200">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || 'Utilisateur'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 group-hover:text-gray-700 hover:underline"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
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
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                      src={profileImage || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}&background=random`}
                      alt={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-500 group-hover:text-gray-700 hover:underline"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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