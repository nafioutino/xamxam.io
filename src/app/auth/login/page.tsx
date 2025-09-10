'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import UnauthGuard from '@/components/auth/UnauthGuard';
import { useAuth } from '@/hooks/useAuth';

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
  const { login, socialLogin, isLoading: authLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: '', otp: '' },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '' },
  });

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      toast.error('L\'authentification par téléphone n\'est pas encore disponible avec Supabase');
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
      const success = await login({ phone: data.phone, otp: data.otp });
      if (!success) {
        // L'erreur est déjà gérée dans le hook login
        return;
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Erreur lors de la vérification du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      const success = await login({ email: data.email, password: data.password });
      if (!success) {
        // L'erreur est déjà gérée dans le hook login
        return;
      }
    } catch (error) {
      console.error('Email login error:', error);
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const success = await socialLogin(provider);
      if (!success) {
        // L'erreur est déjà gérée dans le hook socialLogin
        return;
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || authLoading;

  return (
    <UnauthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">XAMXAM</h1>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {authMethod === 'phone' ? 'Connexion par téléphone' : 'Connexion par email'}
            </h2>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setStep('phone');
              }}
              disabled={loading}
              className={`px-5 py-3 rounded-md text-base font-medium transition-colors disabled:opacity-50 ${
                authMethod === 'phone' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Téléphone
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              disabled={loading}
              className={`px-5 py-3 rounded-md text-base font-medium transition-colors disabled:opacity-50 ${
                authMethod === 'email' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
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
                      disabled={loading}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      'Recevoir un code OTP'
                    )}
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
                      disabled={loading}
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
                    disabled={loading}
                    className="text-base text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors"
                  >
                    Changer de numéro
                  </button>
                  <button
                    type="button"
                    onClick={() => onPhoneSubmit({ phone: phoneNumber })}
                    disabled={loading}
                    className="text-base text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors"
                  >
                    Renvoyer le code
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Vérification...
                      </div>
                    ) : (
                      'Se connecter'
                    )}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                {emailForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600">{emailForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/auth/forgot-password" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connexion...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-base text-gray-600">Pas encore de compte ? </span>
                <Link 
                  href="/auth/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-gray-50 px-2 text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
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
                )}
                Google
              </button>

              <button
                onClick={() => handleSocialSignIn('facebook')}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                Facebook
              </button>
            </div>
          </div>

          {/* Message d'information pour la démo */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Démo
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Pour tester l&apos;authentification par téléphone, utilisez le code OTP : <strong>1234</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnauthGuard>
  );
}