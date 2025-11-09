'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

const settingsNavigation = [
  {
    name: 'Boutique',
    href: '/dashboard/settings',
    icon: Store,
    description: 'Informations générales de votre boutique'
  }
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">Gérez les paramètres de votre boutique et de vos outils</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Description of current section */}
          <div className="mt-4">
            {settingsNavigation.map((item) => {
              if (pathname === item.href) {
                return (
                  <p key={item.name} className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}