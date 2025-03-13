import { create } from 'zustand';
import type { AdminSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface SettingsState {
  settings: AdminSettings | null;
  localSettings: AdminSettings | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  fetchSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<AdminSettings>) => void;
  saveSettings: () => Promise<void>;
  discardChanges: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  localSettings: null,
  isLoading: true,
  error: null,
  hasUnsavedChanges: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      // Obtener la configuración del sistema
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // Obtener las zonas
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .order('name');

      if (zonesError) throw zonesError;

      // Obtener los rangos de edad
      const { data: ageRangesData, error: ageRangesError } = await supabase
        .from('age_ranges')
        .select('*')
        .order('"minAge"');

      if (ageRangesError) throw ageRangesError;

      // Obtener los contactos de emergencia
      const { data: emergencyContactsData, error: emergencyContactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('"isActive"', true)
        .order('priority');

      if (emergencyContactsError) throw emergencyContactsError;

      // Si no hay configuración, retornar null
      if (!settingsData) {
        set({
          settings: null,
          localSettings: null,
          isLoading: false,
          error: null,
          hasUnsavedChanges: false,
        });
        return;
      }

      // Combinar todos los datos
      const settings: AdminSettings = {
        ...settingsData,
        zones: zonesData || [],
        ageRanges: ageRangesData || [],
        emergencyContacts: emergencyContactsData || [],
      };

      set({
        settings,
        localSettings: settings,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false,
      });

    } catch (error: any) {
      console.error('Error fetching settings:', error);
      set({
        isLoading: false,
        error: error.message || 'Error al cargar la configuración del sistema',
      });
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del sistema",
        variant: "destructive",
      });
    }
  },

  updateLocalSettings: (newSettings) => {
    const currentLocalSettings = get().localSettings;
    if (!currentLocalSettings) return;

    const updatedSettings = {
      ...currentLocalSettings,
      ...newSettings,
    };

    set({
      localSettings: updatedSettings,
      hasUnsavedChanges: true,
    });
  },

  saveSettings: async () => {
    try {
      const { localSettings } = get();
      if (!localSettings) return;

      set({ isLoading: true, error: null });

      // Si no hay configuración previa, crear una nueva
      if (!get().settings) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('system_settings')
          .insert({
            brandName: localSettings.brandName,
            brandLogo: localSettings.brandLogo,
            primaryColor: localSettings.primaryColor,
            secondaryColor: localSettings.secondaryColor,
            tertiaryColor: localSettings.tertiaryColor,
            notificationSettings: localSettings.notificationSettings,
            paymentSettings: localSettings.paymentSettings,
            notifications: localSettings.notifications,
            branding: localSettings.branding,
          })
          .select()
          .single();

        if (settingsError) throw settingsError;

        // Actualizar el estado con la nueva configuración
        set({
          settings: {
            ...settingsData,
            zones: [],
            ageRanges: [],
            emergencyContacts: [],
          },
          hasUnsavedChanges: false,
          isLoading: false,
        });

        toast({
          title: "Éxito",
          description: "Configuración inicial creada correctamente",
        });

        return;
      }

      // Si ya existe configuración, actualizarla
      const { error: settingsError } = await supabase
        .from('system_settings')
        .update({
          brandName: localSettings.brandName,
          brandLogo: localSettings.brandLogo,
          primaryColor: localSettings.primaryColor,
          secondaryColor: localSettings.secondaryColor,
          tertiaryColor: localSettings.tertiaryColor,
          notificationSettings: localSettings.notificationSettings,
          paymentSettings: localSettings.paymentSettings,
          notifications: localSettings.notifications,
          branding: localSettings.branding,
        })
        .eq('id', localSettings.id);

      if (settingsError) throw settingsError;

      // Si hay zonas nuevas, actualizarlas
      if (localSettings.zones) {
        const { error: zonesError } = await supabase
          .from('zones')
          .upsert(
            localSettings.zones.map(zone => ({
              ...zone,
              settingsId: localSettings.id,
            }))
          );

        if (zonesError) throw zonesError;
      }

      // Si hay rangos de edad nuevos, actualizarlos
      if (localSettings.ageRanges) {
        const { error: ageRangesError } = await supabase
          .from('age_ranges')
          .upsert(
            localSettings.ageRanges.map(range => ({
              ...range,
              minAge: range.minAge,
              maxAge: range.maxAge,
              priceMultiplier: range.priceMultiplier,
              settingsId: localSettings.id,
            }))
          );

        if (ageRangesError) throw ageRangesError;
      }

      // Si hay contactos de emergencia nuevos, actualizarlos
      if (localSettings.emergencyContacts) {
        const { error: contactsError } = await supabase
          .from('emergency_contacts')
          .upsert(
            localSettings.emergencyContacts.map(contact => ({
              ...contact,
              isActive: contact.isActive,
              settingsId: localSettings.id,
            }))
          );

        if (contactsError) throw contactsError;
      }

      // Actualizar el estado con los cambios guardados
      set({
        settings: localSettings,
        hasUnsavedChanges: false,
        isLoading: false,
      });

      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });

    } catch (error: any) {
      console.error('Error updating settings:', error);
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar la configuración',
      });
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  },

  discardChanges: () => {
    const { settings } = get();
    set({
      localSettings: settings,
      hasUnsavedChanges: false,
    });
    toast({
      title: "Cambios descartados",
      description: "Se han restaurado los valores anteriores",
    });
  },
}));