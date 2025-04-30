import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas. Por favor, verifica el archivo .env');
}

// Crear el cliente de Supabase con configuración mejorada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'viajero-light-b2b' }
  }
});

// Función de utilidad para reintentar operaciones de base de datos
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Si es un error de autenticación, no reintentar
      if (error.code === 'PGRST401') {
        throw new Error('Error de autenticación. Por favor, inicie sesión nuevamente.');
      }
      
      // Si es el último intento, lanzar el error
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
};

// Auth helpers con manejo de errores mejorado
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales inválidas. Por favor, verifique su email y contraseña.');
      }
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error en signInWithEmail:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { data, error };
  } catch (error: any) {
    console.error('Error en signInWithGoogle:', error);
    throw new Error(error.message || 'Error al iniciar sesión con Google');
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error en signUpWithEmail:', error);
    throw new Error(error.message || 'Error al registrarse');
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Error en signOut:', error);
    throw new Error(error.message || 'Error al cerrar sesión');
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    throw new Error(error.message || 'Error al restablecer la contraseña');
  }
};

// Auth state management
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error: any) {
    console.error('Error en getCurrentUser:', error);
    throw new Error(error.message || 'Error al obtener el usuario actual');
  }
};

export const onAuthStateChange = (callback: (event: any, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};