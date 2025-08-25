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
        if (event === 'SIGNED_IN' && session) {
          // Attendre que l'état soit mis à jour avant de rediriger
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 100);
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
        // Simulation pour la démo
        if (credentials.otp === '1234') {
          // Créer une session simulée pour la démo
          toast.success('Connexion réussie (démo)');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 100);
          return true;
        } else {
          throw new Error('Code OTP invalide. Pour la démo, utilisez 1234.');
        }
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
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
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
  };
}