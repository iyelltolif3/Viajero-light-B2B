import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signUpWithEmail, signOut, resetPassword, signInWithGoogle } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        const { user } = await signInWithEmail(email, password);
        setUser(user);
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    signInWithGoogle: async () => {
      try {
        const { data, error } = await signInWithGoogle();
        if (error) throw error;
      } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const { user } = await signUpWithEmail(email, password);
        setUser(user);
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },
    logout: async () => {
      try {
        await signOut();
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    requestPasswordReset: async (email: string) => {
      try {
        await resetPassword(email);
      } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};