'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function ErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'OAuthSignin': 'Erreur lors de la connexion avec le fournisseur d&apos;authentification.',
      'OAuthCallback': 'Erreur lors de la réponse du fournisseur d&apos;authentification.',
      'OAuthCreateAccount': 'Impossible de créer un compte utilisateur avec ce fournisseur.',
      'EmailCreateAccount': 'Impossible de créer un compte utilisateur avec cet email.',
      'Callback': 'Erreur lors du processus d&apos;authentification.',
      'OAuthAccountNotLinked': 'Cet email est déjà associé à un autre compte.',
      'EmailSignin': 'Erreur lors de l&apos;envoi de l&apos;email de connexion.',
      'CredentialsSignin': 'Identifiants invalides.',
      'InvalidLoginCredentials': 'Identifiants de connexion invalides. Veuillez vérifier votre email et mot de passe.',
      'SessionRequired': 'Vous devez être connecté pour accéder à cette page.',
      'default': 'Une erreur est survenue lors de l&apos;authentification.'
    };

    setError(errorParam ? (errorMessages[errorParam] || errorMessages.default) : errorMessages.default);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Fond avec gradient et formes */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-gray-900 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Container principal responsive */}
      <div className="w-full max-w-6xl transition-all duration-700 transform translate-y-0 opacity-100">
        <div className="flex flex-col lg:flex-row rounded-3xl shadow-2xl overflow-hidden">
          {/* Colonne de gauche (image/branding) - visible uniquement sur desktop */}
          <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-blob"></div>
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10">
              <div className="relative h-20 w-40 mb-8">
                <Image 
                  src="/logo/XAMXAM-logo-blanc.png" 
                  alt="XAMXAM Logo" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                  priority
                />
              </div>
              <h2 className="text-white text-3xl font-bold mb-6">Besoin d'aide ?</h2>
              <p className="text-blue-100 text-xl mb-8">Nous sommes là pour vous aider à résoudre tout problème d'authentification.</p>
              
              {/* Image SVG sécurisée */}
              <div className="flex justify-center items-center my-8">
                <Image 
                  src="/auth/auth-error.svg" 
                  alt="Erreur d'authentification" 
                  width={300} 
                  height={300} 
                  className="max-w-full h-auto animate-float"
                  priority
                />
              </div>
            </div>
            
            <div className="relative z-10 mt-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-white">
                  <div className="font-medium">Support disponible</div>
                  <div className="text-blue-100 text-sm">Notre équipe est disponible pour vous aider</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne de droite (contenu d'erreur) */}
          <div className="w-full lg:w-1/2 bg-white/70 dark:bg-gray-800/90 backdrop-blur-xl p-8 lg:p-12 transition-all duration-300 hover:shadow-xl">
            <div className="transition-all duration-500 transform translate-y-0 opacity-100 scale-100">
              <div className="text-center lg:hidden mb-6">
                <div className="relative h-20 w-40 mx-auto">
                  <Image 
                    src="/logo/XAMXAM-logo-bleu.png" 
                    alt="XAMXAM Logo" 
                    fill 
                    style={{ objectFit: 'contain' }} 
                    priority
                  />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-2">
                Oups ! Une erreur est survenue
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">Problème d&apos;authentification</p>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300 hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 font-medium text-center">{error}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/auth/login" className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Retour à la connexion
                  </Link>
                  <Link href="/" className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ErrorContent />
    </Suspense>
  );
}