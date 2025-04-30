import { create } from 'zustand';
import type { AdminSettings } from '@/types';
import type { ContentSettings } from '@/types/content';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { ContentService } from '@/services/contentService';

interface SettingsState {
  settings: AdminSettings | null;
  content: ContentSettings | null;
  localSettings: AdminSettings | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  fetchSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<AdminSettings>) => void;
  updateContent: (newContent: Partial<ContentSettings>) => void;
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
  content: null,
  localSettings: null,
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      // Verificar la conexión primero
      const { error: connectionError } = await supabase
        .from('system_settings')
        .select('count')
        .single();

      if (connectionError) {
        if (connectionError.code === 'PGRST116') {
          // No data found, this is okay
        } else if (connectionError.code === 'PGRST401') {
          throw new Error('Error de autenticación. Por favor, verifique las credenciales.');
        } else if (connectionError.message?.includes('network')) {
          throw new Error('Error de conexión. Por favor, verifique su conexión a internet y las configuraciones de Supabase.');
        } else {
          throw connectionError;
        }
      }

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

      if (zonesError) {
        if (zonesError.code === 'PGRST401') {
          throw new Error('Error de autenticación al acceder a las zonas.');
        }
        throw zonesError;
      }

      // Obtener los rangos de edad
      const { data: ageRangesData, error: ageRangesError } = await supabase
        .from('age_ranges')
        .select('*')
        .order('"minAge"');

      if (ageRangesError) {
        if (ageRangesError.code === 'PGRST401') {
          throw new Error('Error de autenticación al acceder a los rangos de edad.');
        }
        throw ageRangesError;
      }

      // Obtener los contactos de emergencia
      const { data: emergencyContactsData, error: emergencyContactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('is_active', true)
        .order('priority');

      if (emergencyContactsError) {
        if (emergencyContactsError.code === 'PGRST401') {
          throw new Error('Error de autenticación al acceder a los contactos de emergencia.');
        }
        throw emergencyContactsError;
      }

      // Obtener el contenido
      const content = await ContentService.getContent();

      // Si no hay configuración, retornar null
      if (!settingsData) {
        set({
          settings: null,
          content: content || null,
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
        content: content || null,
        localSettings: settings,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false,
      });

    } catch (error: any) {
      console.error('Error fetching settings:', error);
      const errorMessage = error.message || 'Error al cargar la configuración del sistema';
      set({
        isLoading: false,
        error: errorMessage,
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },

  updateLocalSettings: (newSettings) => {
    const currentLocalSettings = get().localSettings;
    if (!currentLocalSettings) {
      // Si no hay configuración local, crear una nueva
      set({
        localSettings: newSettings as AdminSettings,
        hasUnsavedChanges: true,
      });
      return;
    }

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

  updateContent: (newContent) => {
    const { content } = get();
    set({
      content: { ...content, ...newContent },
      hasUnsavedChanges: true
    });
  },

  saveSettings: async () => {
    const { localSettings, content } = get();
    try {
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
            localSettings.zones.map(({ id, name, priceMultiplier, countries }) => ({
              id,
              settings_id: localSettings.id,
              name,
              priceMultiplier,
              countries,
            }))
          );

        if (zonesError) {
          if (zonesError.code === 'PGRST401') {
            throw new Error('Error de autenticación al actualizar las zonas.');
          }
          throw zonesError;
        }
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

        if (ageRangesError) {
          if (ageRangesError.code === 'PGRST401') {
            throw new Error('Error de autenticación al actualizar los rangos de edad.');
          }
          throw ageRangesError;
        }
      }

      // Si hay contactos de emergencia nuevos, actualizarlos
      if (localSettings.emergencyContacts) {
        const { error: emergencyContactsError } = await supabase
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