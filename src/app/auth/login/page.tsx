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
import { supabase } from '@/lib/supabase';

const phoneSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
});

const otpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(4, 'Le code OTP doit contenir 4 chiffres'),
});

const emailSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, socialLogin } = useAuth();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      // Note: Supabase ne supporte pas nativement l'authentification par téléphone + OTP
      // Cette fonctionnalité nécessiterait une implémentation personnalisée
      // Pour l'instant, nous affichons un message d'information
      toast.error('L\'authentification par téléphone n\'est pas encore disponible avec Supabase');
      
      // Pour les besoins de la démo, nous simulons l'envoi d'un OTP
      setPhoneNumber(data.phone);
      otpForm.setValue('phone', data.phone);
      setStep('otp');
    } catch (error) {
      console.error('OTP request error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    try {
      // Note: Supabase ne supporte pas nativement l'authentification par téléphone + OTP
      // Cette fonctionnalité nécessiterait une implémentation personnalisée
      
      // Pour les besoins de la démo, nous simulons une vérification réussie
      if (data.otp === '1234') {
        toast.success('Connexion réussie');
        router.push('/dashboard');
      } else {
        throw new Error('Code OTP invalide. Pour la démo, utilisez 1234.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la vérification du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      // Utilisation directe de Supabase pour la connexion
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) throw error;
      
      toast.success('Connexion réussie');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Email login error:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      // Pas besoin de rediriger manuellement car Supabase gère la redirection
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      toast.error(error.message || `Erreur lors de la connexion avec ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <UnauthGuard>
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">ZOBA</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {authMethod === 'phone' ? 'Connexion par téléphone' : 'Connexion par email'}
          </h2>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`px-5 py-3 rounded-md text-base font-medium ${authMethod === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Téléphone
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`px-5 py-3 rounded-md text-base font-medium ${authMethod === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Email
          </button>
        </div>

        {authMethod === 'phone' ? (
          step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="mt-8 space-y-6">
              <div>
                <label htmlFor="phone" className="block text-base font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="mt-2">
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    {...phoneForm.register('phone')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Envoi en cours...' : 'Recevoir un code OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="mt-8 space-y-6">
              <div>
                <p className="text-base text-gray-600 mb-4">
                  Un code à 4 chiffres a été envoyé au {phoneNumber}
                </p>
                <label htmlFor="otp" className="block text-base font-medium text-gray-700">
                  Code OTP
                </label>
                <div className="mt-2">
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    {...otpForm.register('otp')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="1234"
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="mt-2 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-base text-blue-600 hover:text-blue-500"
                >
                  Changer de numéro
                </button>
                <button
                  type="button"
                  onClick={() => onPhoneSubmit({ phone: phoneNumber })}
                  className="text-base text-blue-600 hover:text-blue-500"
                >
                  Renvoyer le code
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Vérification...' : 'Se connecter'}
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...emailForm.register('email')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                  placeholder="exemple@email.com"
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-2 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
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
                  autoComplete="current-password"
                  {...emailForm.register('password')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                />
              </div>
              {emailForm.formState.errors.password && (
                <p className="mt-2 text-sm text-red-600">{emailForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="text-base">
                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Pas encore de compte ? S'inscrire
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignIn('google')}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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
              onClick={() => handleSocialSignIn('facebook')}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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