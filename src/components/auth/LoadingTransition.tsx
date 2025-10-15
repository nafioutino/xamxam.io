'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingTransitionProps {
  message?: string;
  showLogo?: boolean;
}

export default function LoadingTransition({ 
  message = "Connexion en cours...", 
  showLogo = true 
}: LoadingTransitionProps) {
  const [dots, setDots] = useState('');

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      {/* Fond avec gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo */}
        {showLogo && (
          <div className="animate-bounce">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Image
                src="/logo/logo_xamxam.jpg"
                alt="XAMXAM"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Spinner principal */}
        <div className="relative">
          {/* Cercle extérieur */}
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
          </div>
          
          {/* Cercle intérieur */}
          <div className="absolute inset-2 w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 rounded-full animate-spin animation-reverse">
            <div className="w-full h-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {message}{dots}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Veuillez patienter quelques instants
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Styles pour l'animation reverse */}
      <style jsx>{`
        .animation-reverse {
          animation-direction: reverse;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}