import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Definición personalizada de usuario extendido que no requiere todas las propiedades de User de Supabase
export interface ExtendedUser {
  id: string;
  email?: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  last_sign_in_at?: string | null;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
  created_at?: string;
}

// Fetch all users from Supabase auth
export const fetchAllUsers = async (): Promise<ExtendedUser[]> => {
  try {
    // Since auth.admin.listUsers requires admin privileges, we'll use a more accessible method
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;

    // If no users table exists yet, try to get just the current user
    if (!data || data.length === 0) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        // Determine if user is admin based on email
        const isAdmin = authData.user.user_metadata?.role === 'admin' || 
          (authData.user.email && AUTHORIZED_ADMIN_EMAILS.includes(authData.user.email.toLowerCase()));
        
        return [{
          ...authData.user,
          role: isAdmin ? 'admin' : 'user',
          status: 'active'
        }];
      }
      return [];
    }

    // Map database users to ExtendedUser format
    return data.map(dbUser => {
      // Convert database user to our ExtendedUser format
      const isAdmin = dbUser.role === 'admin' || 
        (dbUser.email && AUTHORIZED_ADMIN_EMAILS.includes(dbUser.email.toLowerCase()));
      
      return {
        id: dbUser.id,
        email: dbUser.email,
        role: isAdmin ? 'admin' : 'user',
        status: dbUser.active ? 'active' : 'inactive',
        last_sign_in_at: dbUser.last_sign_in || null,
        user_metadata: {
          role: isAdmin ? 'admin' : 'user'
        }
      } as ExtendedUser;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (email: string, password: string, role: 'admin' | 'user'): Promise<ExtendedUser> => {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');
    
    // Then add the user to our users table for additional metadata
    const { error: dbError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email,
        role,
        active: true,
        created_at: new Date().toISOString()
      }
    ]);
    
    if (dbError) {
      console.error('Error adding user to database:', dbError);
      // Continue even if this fails as the auth user was created
    }

    return {
      ...authData.user,
      role,
      status: 'active'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: 'admin' | 'user'): Promise<ExtendedUser> => {
  try {
    // Update the user in our users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    
    if (dbError) throw dbError;
    
    // Get the updated user
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Usuario no encontrado');
    
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      status: data.active ? 'active' : 'inactive',
      last_sign_in_at: data.last_sign_in || null,
      user_metadata: {
        role: data.role
      }
    } as ExtendedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Disable a user
export const disableUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ active: false })
    .eq('id', userId);
  
  if (error) {
    console.error('Error disabling user:', error);
    throw error;
  }
};

// Enable a user
export const enableUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ active: true })
    .eq('id', userId);
  
  if (error) {
    console.error('Error enabling user:', error);
    throw error;
  }
};

// Import admin emails list to determine admin status
import { AUTHORIZED_ADMIN_EMAILS } from '@/config/adminEmails';
