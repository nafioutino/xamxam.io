'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ShopForm from '@/components/dashboard/ShopForm';
import { CheckCircle, Store, Sparkles, Users, TrendingUp, Rocket, Shield, Zap, MessageCircle, BarChart3, Globe, ShoppingBag, Bot, Headphones, CreditCard, Smartphone, Palette } from 'lucide-react';

const features = [
  {
    icon: ShoppingBag,
    title: 'Gestion de boutique',
    description: 'Gérez facilement vos produits, commandes et inventaire avec des outils intuitifs',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: Smartphone,
    title: 'Commerce conversationnel',
    description: 'Vendez directement via WhatsApp, Messenger et tous les canaux sociaux',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    icon: Bot,
    title: 'IA intégrée',
    description: 'Automatisez vos réponses et créez du contenu avec notre IA avancée',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics en temps réel',
    description: 'Tableaux de bord interactifs pour suivre vos performances et ROI',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    icon: CreditCard,
    title: 'Paiements sécurisés',
    description: 'Acceptez tous types de paiements avec une sécurité maximale',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600'
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'Une équipe dédiée pour vous accompagner dans votre réussite',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  }
];

const steps = [
  { number: 1, title: 'Informations de base', description: 'Nom, description, contact' },
  { number: 2, title: 'Configuration', description: 'Préférences et paramètres' },
  { number: 3, title: 'Lancement', description: 'Votre boutique est prête !' }
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSuccess = () => {
    setIsCompleted(true);
    // Rediriger vers le dashboard après un délai
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="max-w-lg w-full text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
            {/* Success animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <CheckCircle className="mx-auto h-20 w-20 text-emerald-500 relative animate-bounce" />
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
              🎉 Félicitations !
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Votre boutique <span className="font-semibold text-emerald-600">XAMXAM</span> a été créée avec succès !
            </p>
            
            {/* Loading animation */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Rocket className="h-5 w-5 text-blue-500 animate-bounce" />
              <span className="text-sm text-gray-500">Préparation de votre dashboard...</span>
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with animation */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">X</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
            Bienvenue sur XAMXAM !
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-2xl text-gray-700 mb-4">
              Bonjour <span className="font-semibold text-blue-600">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Commerçant'}</span> 👋
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Créons ensemble votre boutique en ligne et commençons votre aventure dans le commerce conversationnel
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-8 items-start">
          {/* Left Column - Features Grid */}
          <div className={`xl:col-span-2 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Tout ce dont vous avez besoin pour <span className="text-blue-600">réussir</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 100 + 500}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-2">
                    💡 Conseil de pro
                  </h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    Prenez le temps de bien remplir toutes les informations. Une boutique complète inspire plus confiance à vos clients et améliore votre visibilité.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 sticky top-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                  <Store className="h-8 w-8 text-white" />
                </div>
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
        </div>

        {/* Footer */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/50">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Besoin d'aide ?</span> Notre équipe est là pour vous accompagner
            </p>
            <a 
              href="mailto:support@xamxam.io" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer inline-flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>support@xamxam.io</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}