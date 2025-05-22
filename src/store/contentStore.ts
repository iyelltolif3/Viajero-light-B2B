import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import type { ContentSettings, DiscountSection } from '@/types/content';

interface ContentState {
  content: ContentSettings;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  
  // Métodos para gestionar el contenido
  initializeContent: () => Promise<void>;
  updateContent: (updates: Partial<ContentSettings>) => void;
  saveContent: () => Promise<void>;
  discardContentChanges: () => void;
}

// Contenido por defecto
const defaultContent: ContentSettings = {
  id: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  discountSection: {
    sectionTitle: "Ofertas y Descuentos Especiales",
    sectionSubtitle: "Descubre nuestras mejores ofertas y descuentos para tus viajes",
    badgeText: "Oferta",
    viewAllButtonText: "Ver todas las ofertas",
    discounts: []
  },
  heroSection: {
    title: "Viaja seguro con nosotros",
    subtitle: "La mejor asistencia al viajero para tus aventuras",
    ctaText: "Cotiza ahora",
    imageUrl: ""
  }
};

// Indicador para evitar múltiples inicializaciones
let isInitializing = false;

export const useContentStore = create<ContentState>((set, get) => ({
  content: { ...defaultContent },
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,

  initializeContent: async () => {
    // Prevenir inicializaciones múltiples simultáneas
    if (isInitializing) {
      console.log('Ya hay una inicialización en progreso, saltando...');
      return;
    }
    
    // Verificar si ya tenemos contenido cargado
    const currentContent = get().content;
    if (currentContent.id && !get().hasUnsavedChanges) {
      console.log('Contenido ya inicializado, saltando...');
      return;
    }
    
    try {
      isInitializing = true;
      set({ isLoading: true, error: null });
      console.log('Iniciando carga de contenidos...');
      
      // Obtener el contenido directamente de la tabla system_content
      const { data, error } = await supabase
        .from('system_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error al cargar el contenido:', error);
        set({
          error: `Error al cargar el contenido: ${error.message}`,
          isLoading: false
        });
        return;
      }
      
      // Si no hay datos, usar contenido por defecto
      if (!data || data.length === 0) {
        console.log('No se encontró contenido previo, usando valores predeterminados');
        set({ 
          content: { ...defaultContent },
          isLoading: false
        });
        isInitializing = false;
        return;
      }
      
      // Usamos el primer registro ya que ordenamos por created_at descendente
      const contentRecord = data[0];
      console.log('Registro de contenido obtenido:', contentRecord);
      
      // Parsear los datos obtenidos de la base de datos
      let discountSectionData;
      try {
        // Intentamos parsear si es un string, o usar directamente si ya es un objeto
        discountSectionData = typeof contentRecord.discount_section === 'string' 
          ? JSON.parse(contentRecord.discount_section) 
          : (contentRecord.discount_section || {});
        
        // Aseguramos que discounts es un array
        if (!Array.isArray(discountSectionData.discounts)) {
          discountSectionData.discounts = [];
        }
      } catch (e) {
        console.error('Error al parsear discount_section:', e);
        discountSectionData = {};
      }
      
      console.log('Datos de descuentos cargados:', discountSectionData);
      
      // Construir el objeto de contenido normalizado
      const contentData: ContentSettings = {
        id: contentRecord.id || '',
        createdAt: contentRecord.created_at || new Date().toISOString(),
        updatedAt: contentRecord.updated_at || new Date().toISOString(),
        discountSection: {
          sectionTitle: discountSectionData.sectionTitle || defaultContent.discountSection.sectionTitle,
          sectionSubtitle: discountSectionData.sectionSubtitle || defaultContent.discountSection.sectionSubtitle,
          badgeText: discountSectionData.badgeText || defaultContent.discountSection.badgeText,
          viewAllButtonText: discountSectionData.viewAllButtonText || defaultContent.discountSection.viewAllButtonText,
          discounts: Array.isArray(discountSectionData.discounts) ? discountSectionData.discounts : []
        },
        heroSection: {
          title: defaultContent.heroSection.title,
          subtitle: defaultContent.heroSection.subtitle,
          ctaText: defaultContent.heroSection.ctaText,
          imageUrl: defaultContent.heroSection.imageUrl
        }
      };
      
      set({ 
        content: contentData,
        isLoading: false 
      });
      
    } catch (error) {
      console.error('Error inesperado al cargar el contenido:', error);
      set({ 
        error: 'Error inesperado al cargar el contenido',
        isLoading: false 
      });
    } finally {
      // Independientemente del resultado, resetear la bandera de inicialización
      isInitializing = false;
    }
  },

  updateContent: (updates: Partial<ContentSettings>) => {
    const currentContent = get().content;
    
    set({
      content: {
        ...currentContent,
        ...updates,
        updatedAt: new Date().toISOString()
      },
      hasUnsavedChanges: true
    });
  },

  saveContent: async () => {
    try {
      const content = get().content;
      set({ isLoading: true, error: null });
      
      // Preparar los datos para guardar en la tabla system_content
      // Asegurarnos de que el discount_section se guarde como un objeto JSON válido
      const contentForSave = {
        discount_section: JSON.stringify(content.discountSection),
        settings_id: content.id || null,  // Si no hay ID, será null
        updated_at: new Date().toISOString()
      };
      
      console.log('Guardando datos de descuentos:', contentForSave);
      
      // Si ya existe un ID, actualizar ese registro
      // Si no, crear uno nuevo
      const { data, error } = content.id ? 
        await supabase
          .from('system_content')
          .update(contentForSave)
          .eq('id', content.id)
          .select() :
        await supabase
          .from('system_content')
          .insert(contentForSave)
          .select();
      
      if (error) {
        console.error('Error al guardar los descuentos:', error);
        set({ 
          error: `Error al guardar los descuentos: ${error.message}`,
          isLoading: false 
        });
        throw error;
      }
      
      // Actualizar el ID si era un nuevo registro
      if (data && data.length > 0 && !content.id) {
        set({
          content: {
            ...content,
            id: data[0].id
          }
        });
      }
      
      // Si el guardado fue exitoso
      set({ 
        hasUnsavedChanges: false,
        isLoading: false 
      });
      
      toast({
        title: "Descuentos guardados",
        description: "Los cambios se han guardado correctamente.",
      });
      
    } catch (error: any) {
      console.error('Error al guardar los descuentos:', error);
      set({ 
        error: `Error al guardar los descuentos: ${error.message || JSON.stringify(error)}`,
        isLoading: false 
      });
      throw error;
    }
  },

  discardContentChanges: () => {
    // Volver a cargar el contenido desde la configuración principal
    get().initializeContent();
    set({ hasUnsavedChanges: false });
  }
}));
