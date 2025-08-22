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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-40">
              <Image 
                src="/logo/Zoba-logo-bleu.png" 
                alt="ZOBA Logo" 
                fill 
                style={{ objectFit: 'contain' }} 
                priority
              />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Oups ! Une erreur est survenue
          </h2>
          <p className="mt-2 text-lg text-gray-600">Problème d&apos;authentification</p>
        </div>

        <div className="mt-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-xl text-gray-700 mb-8 font-medium">{error}</p>
            <div className="flex flex-col space-y-4">
              <Link href="/auth/login" className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Retour à la page de connexion
              </Link>
              <Link href="/" className="w-full py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Retour à l&apos;accueil
              </Link>
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