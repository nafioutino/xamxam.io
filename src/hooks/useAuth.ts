// import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function useAuth() {
  // Authentification simulée pour le développement
  // const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = false; // Pas de chargement
  const isAuthenticated = true; // Toujours authentifié
  const user = {
    id: 'user-123',
    name: 'Utilisateur Test',
    email: 'test@example.com',
    image: 'https://via.placeholder.com/150'
  }; // Utilisateur fictif

  const login = async (
    credentials: { email?: string; password?: string; phone?: string; otp?: string },
    callbackUrl?: string
  ) => {
    try {
      // Simulation de connexion réussie
      toast.success('Connexion réussie');
      
      if (callbackUrl) {
        router.push(callbackUrl);
      }
      
      router.refresh();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Une erreur est survenue lors de la connexion');
      return false;
    }
  };

  const socialLogin = async (provider: string, callbackUrl?: string) => {
    try {
      // Simulation de connexion sociale réussie
      toast.success(`Connexion avec ${provider} réussie`);
      router.push(callbackUrl || '/dashboard');
      return true;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Simulation de déconnexion réussie
      toast.success('Déconnexion réussie');
      router.push('/');
      router.refresh();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Une erreur est survenue lors de la déconnexion');
      return false;
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