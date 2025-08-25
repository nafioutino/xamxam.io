'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ShopForm from '@/components/dashboard/ShopForm';
import { CheckCircle, Store, Sparkles, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Store,
    title: 'Gestion de boutique',
    description: 'Gérez facilement vos produits, commandes et inventaire'
  },
  {
    icon: Users,
    title: 'Relation client',
    description: 'Communiquez avec vos clients via tous les canaux'
  },
  {
    icon: Sparkles,
    title: 'IA intégrée',
    description: 'Créez du contenu automatiquement avec notre IA'
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Suivez vos performances et optimisez vos ventes'
  }
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSuccess = () => {
    setIsCompleted(true);
    // Rediriger vers le dashboard après un délai
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Félicitations !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre boutique a été créée avec succès. Vous allez être redirigé vers votre dashboard.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur ZOBA !
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Bonjour {user?.identities?.[0]?.identity_data?.display_name || user?.name || 'Commerçant'} 👋
          </p>
          <p className="text-lg text-gray-500">
            Configurons votre boutique pour commencer à vendre en ligne
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Conseil
              </h3>
              <p className="text-gray-600 text-sm">
                Prenez le temps de bien remplir les informations de votre boutique. 
                Cela aidera vos clients à vous trouver et à vous faire confiance.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Créer votre boutique
              </h2>
              <p className="text-gray-600">
                Quelques informations pour personnaliser votre espace de vente
              </p>
            </div>

            <ShopForm 
              onSuccess={handleSuccess}
              isOnboarding={true}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? Contactez notre équipe support à{' '}
            <a href="mailto:support@zoba.app" className="text-blue-600 hover:text-blue-700">
              support@zoba.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}