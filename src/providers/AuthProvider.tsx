'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email?: string; password?: string; phone?: string; otp?: string }) => Promise<boolean>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<boolean>;
  socialLogin: (provider: 'google' | 'facebook') => Promise<boolean>;
  logout: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Pour la compatibilité avec le code existant qui utilise useSupabaseSession
export function useSupabaseSession() {
  const { user, session, isLoading } = useAuthContext();
  return { user, session, isLoading };
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}