import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    // Récupérer la session actuelle lors du chargement
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Configurer l'écouteur pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    credentials: { email?: string; password?: string; phone?: string; otp?: string },
    callbackUrl?: string
  ) => {
    try {
      setIsLoading(true);
      
      if (credentials.email && credentials.password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (error) throw error;
        
        toast.success('Connexion réussie');
        
        if (callbackUrl) {
          router.push(callbackUrl);
        }
        
        router.refresh();
        return true;
      } else if (credentials.phone && credentials.otp) {
        // Pour l'instant, nous ne gérons pas l'authentification par téléphone avec Supabase
        // Cette fonctionnalité pourrait être ajoutée ultérieurement
        toast.error('L\'authentification par téléphone n\'est pas encore disponible');
        return false;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook', callbackUrl?: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}${callbackUrl || '/dashboard'}`
        }
      });
      
      if (error) throw error;
      
      // Pas besoin de rediriger manuellement car Supabase gère la redirection
      return true;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(error.message || `Erreur lors de la connexion avec ${provider}`);
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
      router.push('/');
      router.refresh();
      return true;
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la déconnexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    socialLogin,
    logout,
  };
}