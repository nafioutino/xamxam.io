// useAuth.ts - Hook optimisé
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const supabase = createClient();

  useEffect(() => {
    // Récupérer la session actuelle lors du chargement
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Configurer l'écouteur pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Gestion automatique de la redirection après connexion
        // Seulement si on n'est pas déjà sur une page dashboard
        if (event === 'SIGNED_IN' && session) {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/dashboard')) {
            // Attendre que l'état soit mis à jour avant de rediriger
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh();
            }, 100);
          }
        }
        
        // Gestion automatique de la redirection après déconnexion
        if (event === 'SIGNED_OUT') {
          // Attendre que l'état soit mis à jour avant de rediriger
          setTimeout(() => {
            router.push('/auth/login');
            router.refresh();
          }, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const sendOTP = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du code OTP');
      }

      if (data.demo) {
        toast.success('Code OTP envoyé (mode démo) - Utilisez 1234');
      } else {
        toast.success('Code OTP envoyé avec succès');
      }
      
      return true;
    } catch (error: unknown) {
      console.error('Send OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code OTP';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, code: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code OTP invalide');
      }

      if (data.isNewUser) {
        toast.success('Compte créé et connexion réussie!');
      } else {
        toast.success('Connexion réussie!');
      }
      
      // Rediriger vers le dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 100);
      
      return true;
    } catch (error: unknown) {
      console.error('Verify OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification du code OTP';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: { email?: string; password?: string; phone?: string; otp?: string }
  ) => {
    try {
      setIsLoading(true);
      
      if (credentials.email && credentials.password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (error) throw error;
        
        // Ne pas rediriger ici, laisser l'onAuthStateChange gérer
        return true;
      } else if (credentials.phone && credentials.otp) {
        // Utiliser la nouvelle méthode verifyOTP
        return await verifyOTP(credentials.phone, credentials.otp);
      }
      
      return false;
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion';
      
      // Rediriger vers la page d'erreur personnalisée pour les erreurs d'authentification
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        router.push('/auth/error?error=InvalidLoginCredentials');
      } else {
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            next: '/dashboard'
          }
        }
      });
      
      if (error) throw error;
      
      // Pour OAuth, la redirection se fait automatiquement
      // Pas besoin de retourner true/false car l'utilisateur sera redirigé
      return true;
    } catch (error: unknown) {
      console.error(`${provider} login error:`, error);
      const errorMessage = error instanceof Error ? error.message : `Erreur lors de la connexion avec ${provider}`;
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: { name: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            display_name: credentials.name,
            full_name: credentials.name,
          },
        },
      });
      
      if (error) throw error;
      
      // Si l'inscription réussit et que l'utilisateur est automatiquement connecté
      if (data.user && data.session) {
        toast.success('Inscription réussie! Redirection vers le dashboard...');
        // La redirection sera gérée par onAuthStateChange
        return true;
      } else {
        // Si une vérification d'email est requise
        toast.success('Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte.');
        return true;
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success('Déconnexion réussie');
      // La redirection sera gérée automatiquement par onAuthStateChange
      return true;
    } catch (error: unknown) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la déconnexion';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    logout,
    sendOTP,
    verifyOTP,
  };
}