-- Eliminar triggers
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
DROP TRIGGER IF EXISTS update_zones_updated_at ON public.zones;
DROP TRIGGER IF EXISTS update_age_ranges_updated_at ON public.age_ranges;
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON public.emergency_contacts;

-- Eliminar función de trigger
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar tablas existentes
DROP TABLE IF EXISTS public.emergency_contacts;
DROP TABLE IF EXISTS public.age_ranges;
DROP TABLE IF EXISTS public.zones;
DROP TABLE IF EXISTS public.plans;
DROP TABLE IF EXISTS public.system_settings;
