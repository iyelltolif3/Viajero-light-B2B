import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signUpWithEmail, signOut, resetPassword, signInWithGoogle } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/config/adminEmails';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  isAdmin: boolean;
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Verificar si un usuario es administrador
  const checkIfAdmin = (user: User | null) => {
    if (!user || !user.email) return false;
    return isAuthorizedAdmin(user.email);
  };

  // Configurar el usuario con sus datos y rol
  const setupUser = (user: User | null) => {
    if (!user) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    const admin = checkIfAdmin(user);
    setIsAdmin(admin);

    const userData = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        role: admin ? 'admin' : 'user'
      }
    };
    setUser(userData);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setupUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
        setupUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticating,
    isLoggingOut,
    isAdmin,
    signIn: async (email: string, password: string) => {
      setIsAuthenticating(true);
      try {
        const { user } = await signInWithEmail(email, password);
        setupUser(user);
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente",
          variant: "default",
        });
      } catch (error: any) {
        console.error('Error signing in:', error);
        toast({
          title: "Error al iniciar sesión",
          description: error.message || "Verifica tus credenciales e intenta de nuevo",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    signInWithGoogle: async () => {
      setIsAuthenticating(true);
      try {
        const { data, error } = await signInWithGoogle();
        if (error) throw error;
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión con Google correctamente",
          variant: "default",
        });
      } catch (error: any) {
        console.error('Error signing in with Google:', error);
        toast({
          title: "Error al iniciar sesión con Google",
          description: error.message || "Ocurrió un error al intentar iniciar sesión con Google",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    signUp: async (email: string, password: string) => {
      setIsAuthenticating(true);
      try {
        const { user } = await signUpWithEmail(email, password);
        setupUser(user);
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente",
          variant: "default",
        });
      } catch (error: any) {
        console.error('Error signing up:', error);
        toast({
          title: "Error al registrarse",
          description: error.message || "Ocurrió un error al intentar crear tu cuenta",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    logout: async () => {
      setIsLoggingOut(true);
      try {
        await signOut();
        setUser(null);
        setIsAdmin(false);
        toast({
          title: "Cierre de sesión exitoso",
          description: "Has cerrado sesión correctamente",
          variant: "default",
        });
      } catch (error: any) {
        console.error('Error signing out:', error);
        toast({
          title: "Error al cerrar sesión",
          description: error.message || "Ocurrió un error al intentar cerrar sesión",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoggingOut(false);
      }
    },
    requestPasswordReset: async (email: string) => {
      setIsAuthenticating(true);
      try {
        await resetPassword(email);
        toast({
          title: "Solicitud enviada",
          description: "Se ha enviado un correo para restablecer tu contraseña",
          variant: "default",
        });
      } catch (error: any) {
        console.error('Error requesting password reset:', error);
        toast({
          title: "Error al solicitar cambio de contraseña",
          description: error.message || "Ocurrió un error al solicitar el cambio de contraseña",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsAuthenticating(false);
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