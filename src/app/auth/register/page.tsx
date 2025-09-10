'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import UnauthGuard from '@/components/auth/UnauthGuard';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, socialLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFormLoading = isLoading || authLoading;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const success = await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      if (success) {
        // La redirection sera gérée automatiquement par le hook useAuth
        // via onAuthStateChange si l'utilisateur est connecté automatiquement
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      await socialLogin(provider);
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    }
  };

  return (
    <UnauthGuard>
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">XAMXAM</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Créer un compte
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-700">
              Nom
            </label>
            <div className="mt-2">
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...form.register('name')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                placeholder="Votre nom"
              />
            </div>
            {form.formState.errors.name && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700">
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                placeholder="exemple@email.com"
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register('password')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
              />
            </div>
            {form.formState.errors.password && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div className="text-base">
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isFormLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFormLoading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-base">
              <span className="bg-gray-50 px-3 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSignIn('google')}
              disabled={isFormLoading}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-3 px-5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn('facebook')}
              disabled={isFormLoading}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-3 px-5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
    </UnauthGuard>
  );
}