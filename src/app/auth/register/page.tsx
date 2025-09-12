'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import UnauthGuard from '@/components/auth/UnauthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, LogIn, UserPlus, Facebook, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Composant FormInput réutilisable avec icônes et design amélioré
const FormInput = ({ id, label, type = 'text', iconComponent, error, className = '', ...props }: {
  id: string;
  label: string;
  type?: string;
  iconComponent?: React.ReactNode;
  error?: any;
  className?: string;
  [key: string]: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        <span className="flex items-center">
          {iconComponent}
          {label}
        </span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${className}"
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.message}
        </p>
      )}
    </div>
  );
};

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, socialLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Set page loaded after mount for animations
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);
  
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Fond avec gradient et formes */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/10 z-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className={`max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-white/50 dark:border-gray-700/50 relative z-10 transform transition-all duration-500 hover:shadow-2xl ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center">
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
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Créez votre compte</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="name"
              label="Nom complet"
              type="text"
              iconComponent={<User className="w-5 h-5 text-blue-500 mr-2" />}
              placeholder="Entrez votre nom complet"
              autoComplete="name"
              error={form.formState.errors.name}
              className="pl-12"
              {...form.register('name')}
            />

            <FormInput
              id="email"
              label="Adresse email"
              type="email"
              iconComponent={<Mail className="w-5 h-5 text-blue-500 mr-2" />}
              placeholder="exemple@email.com"
              autoComplete="email"
              error={form.formState.errors.email}
              className="pl-12"
              {...form.register('email')}
            />
              
            <FormInput
              id="password"
              label="Mot de passe"
              type="password"
              iconComponent={<Lock className="w-5 h-5 text-blue-500 mr-2" />}
              placeholder="Minimum 6 caractères"
              autoComplete="new-password"
              error={form.formState.errors.password}
              className="pl-12"
              {...form.register('password')}
            />
              
            <FormInput
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              iconComponent={<CheckCircle2 className="w-5 h-5 text-blue-500 mr-2" />}
              placeholder="Répétez votre mot de passe"
              autoComplete="new-password"
              error={form.formState.errors.confirmPassword}
              className="pl-12"
              {...form.register('confirmPassword')}
            />

            <div className="pt-6">
              <div className="relative overflow-hidden group">
                <button
                  type="submit"
                  disabled={isFormLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                >
                  {isFormLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">⏳</span>
                      Création en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Créer mon compte
                    </span>
                  )}
                </button>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              </div>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 py-1 text-gray-500 font-medium rounded-full border border-gray-200 shadow-sm">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                disabled={isFormLoading}
                className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
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
                className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Facebook className="h-5 w-5 mr-2 text-[#1877F2]" />
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Déjà un compte ?
            </p>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-200 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </UnauthGuard>
  );
}