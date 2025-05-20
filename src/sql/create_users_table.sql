-- Creación de la tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  last_sign_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configuración de RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los administradores vean todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'viajero.light.chile@gmail.com', 
      'gerencia@viajero.com', 
      'soporte@viajero.com'
    )
    OR
    (auth.jwt() ->> 'role' = 'admin')
  );

-- Política para permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Política para permitir que los administradores actualicen todos los usuarios
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'viajero.light.chile@gmail.com', 
      'gerencia@viajero.com', 
      'soporte@viajero.com'
    )
    OR
    (auth.jwt() ->> 'role' = 'admin')
  );

-- Política para permitir que los usuarios actualicen su propio perfil (excepto rol y estado)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = 'user' -- No permite cambiar a rol admin
  );

-- Política para permitir que los administradores inserten usuarios
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'viajero.light.chile@gmail.com', 
      'gerencia@viajero.com', 
      'soporte@viajero.com'
    )
    OR
    (auth.jwt() ->> 'role' = 'admin')
    OR
    auth.uid() = id -- permitir auto-registro
  );

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
