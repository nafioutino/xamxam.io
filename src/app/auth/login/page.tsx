'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import UnauthGuard from '@/components/auth/UnauthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Smartphone, KeyRound, LogIn, UserPlus, Check, RefreshCw, Phone, Facebook, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import React from 'react';

// Schemas de validation
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

// Types
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type AuthMethod = 'phone' | 'email';
type AuthStep = 'phone' | 'otp';

// Composants UI réutilisables
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
);

const FormInput = ({ 
  label, 
  error, 
  icon, 
  iconComponent,
  className = "", 
  ...props 
}: any) => (
  <div className="space-y-2">
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
      {iconComponent && <span className="mr-2">{iconComponent}</span>}
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
    <div className="relative group">
      <input
        className={`
          w-full px-4 py-3 rounded-xl border-2 
          bg-white/90 dark:bg-gray-800/90
          border-gray-200 dark:border-gray-600
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 
          hover:border-gray-300 dark:hover:border-gray-500
          transition-all duration-300 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          group-hover:shadow-md
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : ''}
          ${className}
        `}
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {iconComponent && React.cloneElement(iconComponent, { className: 'h-5 w-5 text-gray-400' })}
      </div>
    </div>
    {error && (
      <p className="text-sm text-red-500 flex items-center mt-1 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
        <span className="mr-2 text-red-500">⚠️</span>
        {error.message}
      </p>
    )}
  </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = "", 
  iconLeft,
  iconRight,
  ...props 
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  [key: string]: any;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500 hover:border-gray-300 dark:hover:border-gray-500",
    success: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500",
    outline: "border-2 border-current bg-transparent hover:bg-current hover:text-white",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg hover:shadow-xl hover:bg-white/30 focus:ring-white/50"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <div className="mr-2"><LoadingSpinner /></div>}
      {!loading && iconLeft && <div className="mr-2">{iconLeft}</div>}
      <span>{loading ? "Chargement..." : children}</span>
      {!loading && iconRight && <div className="ml-2">{iconRight}</div>}
    </button>
  );
};

const SocialButton = ({ provider, onClick, loading, icon, customIcon }: any) => {
  const getProviderIcon = () => {
    if (customIcon) return customIcon;
    if (icon) return icon;
    
    if (provider === 'google') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    } else if (provider === 'facebook') {
      return <Facebook className="w-5 h-5 text-[#1877F2]" />;
    }
    
    return null;
  };
  
  return (
    <Button
      variant="secondary"
      onClick={() => onClick(provider)}
      disabled={loading}
      className="w-full group relative overflow-hidden"
      iconLeft={getProviderIcon()}
    >
      Continuer avec {provider === 'google' ? 'Google' : 'Facebook'}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
    </Button>
  );
};

const AuthMethodToggle = ({ authMethod, setAuthMethod, loading, setStep }: any) => (
  <div className="flex bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 mb-8 shadow-inner">
    {(['phone', 'email'] as AuthMethod[]).map((method) => (
      <button
        key={method}
        type="button"
        onClick={() => {
          setAuthMethod(method);
          if (method === 'phone') setStep('phone');
        }}
        disabled={loading}
        className={`
          flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
          flex items-center justify-center
          ${authMethod === method 
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-750/50'
          }
        `}
      >
        {method === 'phone' ? (
          <Smartphone className="w-4 h-4 mr-2" />
        ) : (
          <Mail className="w-4 h-4 mr-2" />
        )}
        {method === 'phone' ? 'Téléphone' : 'Email'}
      </button>
    ))}
  </div>
);

export default function LoginPage() {
  const { login, socialLogin, sendOTP, isLoading: authLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation states
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Set page loaded after mount for animations
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Initialisation des formulaires
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

  // Gestionnaires d'événements
  const handlePhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      const success = await sendOTP(data.phone);
      if (success) {
        setPhoneNumber(data.phone);
        otpForm.setValue('phone', data.phone);
        setStep('otp');
      }
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    try {
      await login({ phone: data.phone, otp: data.otp });
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      toast.error('Code OTP invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Erreur connexion email:', error);
      toast.error('Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      await socialLogin(provider);
    } catch (error) {
      console.error(`Erreur ${provider}:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || authLoading;

  return (
    <UnauthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Fond avec gradient et formes */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/10 z-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        {/* Container principal responsive */}
        <div className={`w-full max-w-6xl transition-all duration-700 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row rounded-3xl shadow-2xl overflow-hidden">
            {/* Colonne de gauche (image/branding) - visible uniquement sur desktop */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-white text-4xl font-bold mb-6">XAMXAM</div>
                <h2 className="text-white text-3xl font-bold mb-6">Gérez votre commerce en toute simplicité</h2>
                <p className="text-blue-100 text-xl mb-8">La plateforme tout-en-un pour développer votre business via WhatsApp et autres canaux de messagerie.</p>
                
                {/* Image SVG sécurisée */}
                <div className="flex justify-center items-center my-8">
                  <Image 
                    src="/auth/secure-login.svg" 
                    alt="Connexion sécurisée" 
                    width={300} 
                    height={300} 
                    className="max-w-full h-auto animate-float"
                    priority
                  />
                </div>
              </div>
              
              <div className="relative z-10 mt-auto">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <div className="font-medium">Facile à utiliser</div>
                    <div className="text-blue-100 text-sm">Interface intuitive et conviviale</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <div className="font-medium">Sécurisé</div>
                    <div className="text-blue-100 text-sm">Protection de vos données garantie</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite (formulaire) */}
            <div className="w-full lg:w-1/2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-8 lg:p-12">
              {/* Carte principale avec animation */}
              <div className={`transition-all duration-500 transform ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="relative mx-auto w-20 h-20 mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                    <span className="text-2xl font-bold text-white">X</span>
                  </div>
                </div>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                XAMXAM
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">
                Bienvenue
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connectez-vous pour continuer
              </p>
            </div>

            {/* Sélecteur de méthode d'authentification */}
            <AuthMethodToggle 
              authMethod={authMethod} 
              setAuthMethod={setAuthMethod}
              loading={loading}
              setStep={setStep}
            />

            {/* Formulaires */}
            {authMethod === 'phone' ? (
              step === 'phone' ? (
                // Formulaire téléphone
                <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
                  <FormInput
                    id="phone"
                    type="tel"
                    label="Numéro de téléphone"
                    iconComponent={<Smartphone className="w-5 h-5 text-blue-500" />}
                    placeholder="+221 XX XXX XX XX"
                    autoComplete="tel"
                    error={phoneForm.formState.errors.phone}
                    disabled={loading}
                    className="pl-12"
                    {...phoneForm.register('phone')}
                  />
                  
                  <div className="relative mt-8">
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full overflow-hidden group"
                      size="lg"
                      iconLeft={!loading && <Smartphone className="w-5 h-5" />}
                    >
                      Recevoir le code OTP
                    </Button>
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                  </div>
                </form>
              ) : (
                // Formulaire OTP
                <div className="space-y-6">
                  <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-inner border border-blue-100 dark:border-blue-800/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-lg">
                      Code envoyé
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-500" />
                      Vérifiez vos SMS au {phoneNumber}
                    </p>
                  </div>

                  <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                    <FormInput
                      id="otp"
                      type="text"
                      label="Code de vérification"
                      iconComponent={<KeyRound className="w-5 h-5 text-blue-500" />}
                      placeholder="• • • •"
                      className="text-center text-2xl tracking-[1rem] font-mono"
                      inputMode="numeric"
                      maxLength={4}
                      error={otpForm.formState.errors.otp}
                      disabled={loading}
                      {...otpForm.register('otp')}
                    />
                    
                    <div className="space-y-4">
                      <div className="relative overflow-hidden group">
                        <Button
                          type="submit"
                          variant="success"
                          loading={loading}
                          className="w-full"
                          size="lg"
                          iconLeft={!loading && <Check className="w-5 h-5" />}
                        >
                          Vérifier le code
                        </Button>
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStep('phone')}
                          disabled={loading}
                          iconLeft={<ChevronLeft className="w-4 h-4" />}
                          className="group"
                        >
                          Changer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 group"
                          onClick={() => handlePhoneSubmit({ phone: phoneNumber })}
                          disabled={loading}
                          iconLeft={<RefreshCw className="w-4 h-4 group-hover:animate-spin" />}
                        >
                          Renvoyer
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )
            ) : (
              // Formulaire email
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                <FormInput
                  id="email"
                  type="email"
                  label="Adresse email"
                  iconComponent={<Mail className="w-5 h-5 text-blue-500" />}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  error={emailForm.formState.errors.email}
                  disabled={loading}
                  className="pl-12"
                  {...emailForm.register('email')}
                />
                
                <FormInput
                  id="password"
                  type="password"
                  label="Mot de passe"
                  iconComponent={<Lock className="w-5 h-5 text-blue-500" />}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  error={emailForm.formState.errors.password}
                  disabled={loading}
                  className="pl-12"
                  {...emailForm.register('password')}
                />

                <div className="flex flex-wrap items-center justify-between text-sm gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 group-hover:shadow-sm"
                      disabled={loading}
                    />
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-200">Se souvenir</span>
                  </label>
                  <Link 
                    href="/auth/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group transition-all duration-200 hover:translate-x-1"
                  >
                    <KeyRound className="w-4 h-4 group-hover:animate-pulse" />
                    Mot de passe oublié ?
                  </Link>
                </div>

                <div className="relative overflow-hidden group">
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                    size="lg"
                    iconLeft={!loading && <LogIn className="w-5 h-5" />}
                  >
                    Se connecter
                  </Button>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Pas encore de compte ?
                  </p>
                  <div className="relative inline-block overflow-hidden group">
                    <Link 
                      href="/auth/register"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 group-hover:scale-105 group"
                    >
                      <UserPlus className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                      Créer un compte
                    </Link>
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                  </div>
                </div>
              </form>
            )}

            {/* Connexion sociale */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                  Ou continuer avec
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative overflow-hidden group">
                  <SocialButton
                    provider="google"
                    onClick={handleSocialLogin}
                    loading={loading}
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    }
                    className="transform transition-all duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                </div>
                
                <div className="relative overflow-hidden group">
                  <SocialButton
                    provider="facebook"
                    onClick={handleSocialLogin}
                    loading={loading}
                    icon={
                      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    }
                    className="transform transition-all duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Info démo avec animation */}
            <div className={`mt-8 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl text-center shadow-inner transform hover:scale-105 transition-all duration-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-yellow-400/10 to-amber-400/5 animate-pulse opacity-70 pointer-events-none"></div>
                <div className="flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400 animate-float" />
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200 bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-amber-400 dark:to-yellow-300">
                    Mode Démo
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                  Utilisez ces identifiants pour tester l'application :
                </p>
                <div className="mt-2 text-xs space-y-2">
                  <div className="bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200/50 dark:border-amber-700/30 shadow-sm">
                    <span className="font-medium text-amber-800 dark:text-amber-200">Email:</span>{' '}
                    <code className="bg-white/70 dark:bg-black/30 px-2 py-1 rounded-md ml-1 font-mono">demo@xamxam.com</code>
                  </div>
                  <div className="bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200/50 dark:border-amber-700/30 shadow-sm">
                    <span className="font-medium text-amber-800 dark:text-amber-200">Mot de passe:</span>{' '}
                    <code className="bg-white/70 dark:bg-black/30 px-2 py-1 rounded-md ml-1 font-mono">password123</code>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lien vers la page d'inscription - visible uniquement sur mobile */}
            <div className="mt-6 text-center lg:hidden">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous n'avez pas de compte ?{' '}
                <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  Inscrivez-vous
                </Link>
              </p>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnauthGuard>
  );
}