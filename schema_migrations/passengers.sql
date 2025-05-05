-- Schema para almacenar información de viajeros y asistencias
-- Crear tabla para almacenar datos de personas
CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('RUT', 'DNI', 'PASSPORT')),
    document_number TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT,
    nationality TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para almacenar asistencias
CREATE TABLE IF NOT EXISTS public.assistances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'future', 'expired', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    destination_name TEXT NOT NULL,
    destination_region TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    voucher_code TEXT,
    voucher_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para almacenar detalles del plan de asistencia
CREATE TABLE IF NOT EXISTS public.assistance_plan_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistance_id UUID REFERENCES public.assistances(id) ON DELETE CASCADE,
    medical_coverage NUMERIC,
    luggage_coverage NUMERIC,
    cancellation_coverage NUMERIC,
    covid_coverage BOOLEAN DEFAULT false,
    pre_existing_conditions BOOLEAN DEFAULT false,
    adventure_sports BOOLEAN DEFAULT false,
    features JSONB, -- Almacena características como array JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de relación entre asistencias y pasajeros (muchos a muchos)
CREATE TABLE IF NOT EXISTS public.assistance_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistance_id UUID REFERENCES public.assistances(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES public.passengers(id) ON DELETE CASCADE,
    age_at_purchase INT NOT NULL, -- Edad al momento de comprar
    is_primary BOOLEAN DEFAULT false, -- Indica si es el pasajero principal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (assistance_id, passenger_id) -- Un pasajero solo puede estar una vez en una asistencia
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_assistances_user_id ON public.assistances(user_id);
CREATE INDEX IF NOT EXISTS idx_assistances_status ON public.assistances(status);
CREATE INDEX IF NOT EXISTS idx_assistance_passengers_assistance_id ON public.assistance_passengers(assistance_id);
CREATE INDEX IF NOT EXISTS idx_assistance_passengers_passenger_id ON public.assistance_passengers(passenger_id);
CREATE INDEX IF NOT EXISTS idx_assistance_plan_details_assistance_id ON public.assistance_plan_details(assistance_id);

-- Crear función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a todas las tablas
CREATE TRIGGER update_passengers_updated_at
BEFORE UPDATE ON public.passengers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistances_updated_at
BEFORE UPDATE ON public.assistances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistance_plan_details_updated_at
BEFORE UPDATE ON public.assistance_plan_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistance_passengers_updated_at
BEFORE UPDATE ON public.assistance_passengers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar permisos RLS (Row Level Security)
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_plan_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_passengers ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para cada tabla
CREATE POLICY "Usuarios pueden ver solo sus propios pasajeros"
ON public.passengers FOR SELECT
USING (
  id IN (
    SELECT passenger_id FROM public.assistance_passengers 
    WHERE assistance_id IN (
      SELECT id FROM public.assistances WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Usuarios pueden ver solo sus propias asistencias"
ON public.assistances FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver solo sus propios detalles de plan"
ON public.assistance_plan_details FOR SELECT
USING (
  assistance_id IN (
    SELECT id FROM public.assistances WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden ver solo sus propias relaciones de pasajeros"
ON public.assistance_passengers FOR SELECT
USING (
  assistance_id IN (
    SELECT id FROM public.assistances WHERE user_id = auth.uid()
  )
);

-- Políticas para inserción, actualización y eliminación también deberían ser configuradas
-- según los requisitos específicos de la aplicación
