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

const defaultContent = {
  discountSection: {
    sectionTitle: "Ofertas y Descuentos",
    sectionSubtitle: "Descubre nuestras mejores ofertas y descuentos especiales",
    badgeText: "Descuentos Especiales",
    viewAllButtonText: "Ver todas las ofertas",
    discounts: []
  }
};

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
        .eq('is_active', true)
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
        content: settingsData.content || defaultContent,
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
      content: {
        ...currentLocalSettings.content,
        ...(newSettings.content || {}),
      },
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

      const settingsToSave = {
        brandName: localSettings.brandName,
        brandLogo: localSettings.brandLogo,
        primaryColor: localSettings.primaryColor,
        secondaryColor: localSettings.secondaryColor,
        tertiaryColor: localSettings.tertiaryColor,
        notificationSettings: localSettings.notificationSettings,
        paymentSettings: localSettings.paymentSettings,
        notifications: localSettings.notifications,
        branding: localSettings.branding,
        content: localSettings.content || defaultContent,
      };

      // Si no hay configuración previa, crear una nueva
      if (!get().settings) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('system_settings')
          .insert(settingsToSave)
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
        .update(settingsToSave)
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
            localSettings.ageRanges.map(ageRange => ({
              ...ageRange,
              settingsId: localSettings.id,
            }))
          );

        if (ageRangesError) throw ageRangesError;
      }

      // Si hay contactos de emergencia nuevos, actualizarlos
      if (localSettings.emergencyContacts) {
        const { error: emergencyContactsError } = await supabase
          .from('emergency_contacts')
          .upsert(
            localSettings.emergencyContacts.map(contact => ({
              ...contact,
              settingsId: localSettings.id,
            }))
          );

        if (emergencyContactsError) throw emergencyContactsError;
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
      console.error('Error saving settings:', error);
      set({
        isLoading: false,
        error: error.message || 'Error al guardar la configuración',
      });
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
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
  },
}));