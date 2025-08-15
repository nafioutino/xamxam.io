'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'OAuthSignin': 'Erreur lors de la connexion avec le fournisseur d\'authentification.',
      'OAuthCallback': 'Erreur lors de la réponse du fournisseur d\'authentification.',
      'OAuthCreateAccount': 'Impossible de créer un compte utilisateur avec ce fournisseur.',
      'EmailCreateAccount': 'Impossible de créer un compte utilisateur avec cet email.',
      'Callback': 'Erreur lors du processus d\'authentification.',
      'OAuthAccountNotLinked': 'Cet email est déjà associé à un autre compte.',
      'EmailSignin': 'Erreur lors de l\'envoi de l\'email de connexion.',
      'CredentialsSignin': 'Identifiants invalides.',
      'SessionRequired': 'Vous devez être connecté pour accéder à cette page.',
      'default': 'Une erreur est survenue lors de l\'authentification.'
    };

    setError(errorParam ? (errorMessages[errorParam] || errorMessages.default) : errorMessages.default);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">ZOBA</h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-red-600">
            Erreur d'authentification
          </h2>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 mb-6">{error}</p>
            <div className="flex flex-col space-y-4">
              <Link href="/auth/login" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Retour à la page de connexion
              </Link>
              <Link href="/" className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}