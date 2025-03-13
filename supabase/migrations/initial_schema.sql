-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "brandName" TEXT NOT NULL DEFAULT 'Mi Empresa',
    "brandLogo" TEXT,
    "primaryColor" TEXT DEFAULT '#0f172a',
    "secondaryColor" TEXT DEFAULT '#64748b',
    "tertiaryColor" TEXT DEFAULT '#e2e8f0',
    "notificationSettings" JSONB DEFAULT '{
        "emailNotifications": true,
        "pushNotifications": false,
        "smsNotifications": false
    }'::jsonb,
    "paymentSettings" JSONB DEFAULT '{
        "currency": "USD",
        "acceptedMethods": ["card", "transfer"],
        "taxRate": 0,
        "commissionRate": 0
    }'::jsonb,
    notifications JSONB DEFAULT '{
        "beforeExpiration": [1, 7, 30],
        "reminderEmails": true,
        "smsNotifications": false,
        "whatsappNotifications": false
    }'::jsonb,
    branding JSONB DEFAULT '{
        "primaryColor": "#0f172a",
        "secondaryColor": "#64748b",
        "logo": "",
        "companyName": "Mi Empresa",
        "contactEmail": "",
        "supportPhone": ""
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de planes
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "priceMultiplier" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "priceDetail" TEXT DEFAULT 'por día / por persona',
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    badge TEXT DEFAULT '',
    "maxDays" INTEGER DEFAULT 30,
    "coverageDetails" JSONB DEFAULT '{
        "medicalCoverage": 0,
        "luggageCoverage": 0,
        "cancellationCoverage": 0,
        "covidCoverage": false,
        "preExistingConditions": false,
        "adventureSports": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de zonas
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    countries TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priceMultiplier" DECIMAL(10,2) DEFAULT 1,
    "settings_id" UUID REFERENCES public.system_settings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de rangos de edad
CREATE TABLE IF NOT EXISTS public.age_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "priceMultiplier" DECIMAL(10,2) DEFAULT 1,
    "settings_id" UUID REFERENCES public.system_settings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de contactos de emergencia
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    country TEXT,
    "isActive" BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    "settings_id" UUID REFERENCES public.system_settings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at
    BEFORE UPDATE ON public.zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_age_ranges_updated_at
    BEFORE UPDATE ON public.age_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial
INSERT INTO public.system_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
