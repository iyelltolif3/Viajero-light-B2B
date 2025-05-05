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
  updateSettings: (newSettings: Partial<AdminSettings>) => void; // Alias para mantener compatibilidad
  saveSettings: () => Promise<void>;
  saveZone: (zone: any) => Promise<void>;
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
      
      // Agregar un timeout más largo para evitar AbortError
      const maxRetries = 3;
      let retryCount = 0;
      let settingsData = null;
      let settingsError = null;
      
      // Intentar obtener la configuración con reintentos
      while (retryCount < maxRetries && !settingsData) {
        try {
          // Obtener la configuración del sistema
          const result = await supabase
            .from('system_settings')
            .select('*')
            .single();
            
          settingsData = result.data;
          settingsError = result.error;
          
          // Si hay datos, salir del bucle
          if (settingsData) break;
          
          // Si hay un error que no sea de datos no encontrados, salir del bucle
          if (settingsError && settingsError.code !== 'PGRST116') break;
          
        } catch (err) {
          console.log(`Intento ${retryCount + 1} fallido:`, err);
          settingsError = err;
        }
        
        // Incrementar contador de reintentos
        retryCount++;
        
        // Esperar antes del siguiente intento (espera exponencial)
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

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
        .eq('isActive', true)
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

      // Transformar las zonas de la base de datos al formato de la aplicación
      const transformedZones = (zonesData || []).map(dbZone => {
        // Asegurar que todos los campos importantes existen y tienen valores válidos
        return {
          id: dbZone.id,
          settingsId: dbZone.settingsId,
          name: dbZone.name || 'Sin nombre',
          description: dbZone.description || '',
          // Algunos campos en la base de datos están en camelCase y otros en snake_case
          priceMultiplier: typeof dbZone.priceMultiplier === 'number' ? dbZone.priceMultiplier : 1,
          riskLevel: 'low', // Este campo no existe en la base de datos
          countries: Array.isArray(dbZone.countries) ? dbZone.countries : [],
          // No existe una columna is_active en la base de datos, así que usamos un valor por defecto
          isActive: true,
          // Mapear campos snake_case a camelCase para TypeScript
          createdAt: dbZone.created_at,
          updatedAt: dbZone.updated_at,
          // Conservar los campos originales también para evitar pérdida de datos
          created_at: dbZone.created_at,
          updated_at: dbZone.updated_at
        };
      });

      console.log('Zonas transformadas desde la BD:', JSON.stringify(transformedZones, null, 2));
      
      // Combinar todos los datos
      const settings: AdminSettings = {
        ...settingsData,
        content: settingsData.content || defaultContent,
        zones: transformedZones,
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
  
  // Alias para mantener compatibilidad con código existente
  updateSettings: (newSettings) => {
    get().updateLocalSettings(newSettings);
  },

  saveSettings: async () => {
    try {
      const { localSettings } = get();
      if (!localSettings) return;

      set({ isLoading: true, error: null });
      
      console.log('Guardando configuración completa:', localSettings);
      
      // 1. Extraer los valores de branding con fallbacks por seguridad
      const brandingValues = localSettings.branding || {};
      
      // 2. Crear un objeto para la tabla system_settings
      const settingsToSave = {
        // ID es obligatorio para la actualización
        "id": localSettings.id,
        
        // Estos campos son exactamente los que vemos en la captura de pantalla
        "brandName": (brandingValues as any)?.companyName || '',  // Texto
        "brandLogo": (brandingValues as any)?.logo || '',         // Texto (base64)
        "primaryColor": (brandingValues as any)?.primaryColor || '#0f172a',  // Texto
        "secondaryColor": (brandingValues as any)?.secondaryColor || '#64748b',  // Texto
        "tertiaryColor": '#e2e8f0',  // Texto
        
        // Campos JSONB que vemos en la captura
        "notificationSettings": { emailEnabled: false, smsEnabled: false, pushEnabled: false },
        "paymentSettings": { currency: 'USD', taxRate: 0 },
        "notifications": {
          beforeExpiration: [30, 15, 7]
        },
        
        // El campo branding como JSONB
        "branding": {
          logo: (brandingValues as any)?.logo || '',
          companyName: (brandingValues as any)?.companyName || '',
          contactEmail: (brandingValues as any)?.contactEmail || '',
          supportPhone: (brandingValues as any)?.supportPhone || '',
          primaryColor: (brandingValues as any)?.primaryColor || '#0f172a',
          secondaryColor: (brandingValues as any)?.secondaryColor || '#64748b'
        },
        
        "updated_at": new Date().toISOString()
      };

      // PASO 1: Guardar la configuración general
      let mainConfigSaved = false;
      
      // Si no hay configuración previa, crear una nueva
      if (!localSettings.id) {
        const { data, error } = await supabase
          .from('system_settings')
          .insert([settingsToSave])
          .select();

        if (error) throw error;
        console.log('Configuración principal creada:', data);
        mainConfigSaved = true;
        
        // Actualizar el estado local con el nuevo ID
        if (data && data[0]) {
          localSettings.id = data[0].id;
        }
      } else {
        // Actualizar la configuración existente
        const { data, error } = await supabase
          .from('system_settings')
          .update(settingsToSave)
          .eq('id', localSettings.id)
          .select();

        if (error) throw error;
        console.log('Configuración principal actualizada:', data);
        mainConfigSaved = true;
      }
      
      // PASO 2: Guardar las zonas en su tabla correspondiente
      let zonesSaved = false;
      
      if (localSettings.zones && localSettings.zones.length > 0) {
        // Asegurarnos de hacer log completo de los datos que enviaremos, para depuración
        console.log('Zonas en localSettings antes de guardar:', JSON.stringify(localSettings.zones, null, 2));
        
        // Verificación crítica: asegurar que tenemos un ID de configuración válido
        if (!localSettings.id) {
          console.error('Error: No se puede guardar zonas sin un ID de configuración válido');
          toast({
            title: "Error",
            description: "No se pueden guardar zonas sin configuración previa. Guarde primero la configuración general.",
            variant: "destructive",
          });
          throw new Error('No settings ID available for saving zones');
        }
        
        // Crear array para guardar las zonas para Supabase
        const safeSaveZones = [];
        
        // Verificar cada zona y asegurarnos que tenga el formato correcto
        for (const zone of localSettings.zones) {
          // Generar ID único para zonas nuevas
          const zoneId = zone.id || crypto.randomUUID();
          
          // Convertir explícitamente todos los campos necesarios
          const preparedZone = {
            id: zoneId,
            settings_id: localSettings.id,
            name: zone.name || 'Sin nombre',
            description: zone.description || '',
            // Usar los campos que sabemos que existen en la base de datos
            price_multiplier: typeof zone.priceMultiplier === 'number' ? zone.priceMultiplier : 1,
            countries: Array.isArray(zone.countries) ? zone.countries : [],
            risk_level: zone.riskLevel || 'low',
            // Camel case tal como está en la base de datos
            isActive: typeof zone.isActive === 'boolean' ? zone.isActive : true,
            // Usar created_at si existe, de lo contrario usar la fecha actual
            created_at: zone.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Añadir la zona preparada a la lista de zonas a guardar
          safeSaveZones.push(preparedZone);
          
          // Si esta zona no tenía ID, actualizamos la zona original con el nuevo ID
          if (!zone.id) {
            zone.id = zoneId;
          }
        }
        
        // Imprimir lo que vamos a guardar para depuración
        console.log('Zonas preparadas para guardar:', JSON.stringify(safeSaveZones, null, 2));
        
        if (safeSaveZones.length === 0) {
          console.warn('No hay zonas válidas para guardar');
          toast({
            title: "Advertencia",
            description: "No se encontraron zonas válidas para guardar",
            variant: "default",
          });
        } else {
          try {
            // Insertar o actualizar zonas usando upsert
            const { data: insertedData, error: insertError } = await supabase
              .from('zones')
              .upsert(safeSaveZones, { onConflict: 'id' })
              .select();
              
            if (insertError) {
              console.error('Error al insertar zonas:', insertError);
              throw insertError;
            }
            
            console.log('Zonas insertadas exitosamente:', insertedData);
            zonesSaved = true;
            
            // Obtener IDs de zonas guardadas
            const savedZoneIds = safeSaveZones.map(z => z.id);
            
            // Eliminar zonas que ya no existen en la configuración local
            if (savedZoneIds.length > 0) {
              const { error: cleanupError } = await supabase
                .from('zones')
                .delete()
                .eq('settings_id', localSettings.id)
                .not('id', 'in', `(${savedZoneIds.map(id => `'${id}'`).join(',')})`);
                
              if (cleanupError) {
                console.error('Error al limpiar zonas antiguas:', cleanupError);
              } else {
                console.log('Limpieza de zonas antiguas completada');
              }
            }
          } catch (err) {
            console.error('Error al guardar zonas:', err);
            toast({
              title: "Error",
              description: "Hubo un problema al guardar las zonas",
              variant: "destructive",
            });
            throw err;
          }
        }
      } else {
        console.log('No hay zonas para guardar');  
      }
      
      // PASO 3: Refrescar los datos para asegurar que están actualizados
      // En lugar de obtener nuevos datos que pueden causar discrepancias,
      // actualizamos directamente el estado global con los datos que ya guardamos
      set({
        settings: { ...localSettings },  // Usamos spread para crear una nueva referencia
        localSettings: { ...localSettings },  // Sincronizamos localSettings también
        hasUnsavedChanges: false,
        isLoading: false,
      });
      
      // Después de actualizar el estado, ahora sí recargamos los datos
      // para futuras operaciones, pero no actualizamos la UI con estos datos
      setTimeout(() => {
        get().fetchSettings();
      }, 500);

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

  saveZone: async (zone) => {
    try {
      set({ isLoading: true, error: null });
      const { localSettings } = get();
      
      if (!localSettings || !localSettings.id) {
        throw new Error("No hay configuración de sistema disponible para guardar la zona");
      }
      
      // Asegurar que la zona tenga el settings_id correcto
      if (!zone.settings_id) {
        zone.settings_id = localSettings.id;
      }

      // Preparar la zona para guardar con los campos correctos para la base de datos
      const preparedZone = {
        id: zone.id || crypto.randomUUID(),
        settings_id: zone.settings_id || zone.settingsId,
        name: zone.name || 'Sin nombre',
        description: zone.description || '',
        priceMultiplier: typeof zone.priceMultiplier === 'number' ? zone.priceMultiplier : 1,
        // riskLevel no existe en la base de datos, lo omitimos
        countries: Array.isArray(zone.countries) ? zone.countries : [],
        // No incluimos is_active porque no existe en la tabla zones
        created_at: zone.created_at || zone.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Guardando zona individual:', JSON.stringify(preparedZone, null, 2));
      
      // Guardar la zona en la base de datos
      const { data: savedZone, error } = await supabase
        .from('zones')
        .upsert(preparedZone)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Zona guardada exitosamente:', savedZone);
      
      // Actualizar la zona en el estado local
      if (localSettings.zones) {
        const updatedZones = localSettings.zones.map(z => 
          z.id === savedZone.id ? { ...z, ...savedZone } : z
        );
        
        // Si la zona no existía, añadirla
        if (!updatedZones.some(z => z.id === savedZone.id)) {
          updatedZones.push(savedZone);
        }
        
        // Actualizar el estado
        set({
          localSettings: { ...localSettings, zones: updatedZones },
          settings: { ...localSettings, zones: updatedZones },
          isLoading: false,
        });
      }
      
      toast({
        title: "Zona guardada",
        description: "La zona ha sido guardada exitosamente",
      });
      
      return savedZone;
    } catch (error: any) {
      console.error('Error al guardar la zona:', error);
      set({ isLoading: false, error: error.message });
      toast({
        title: "Error",
        description: "No se pudo guardar la zona: " + error.message,
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