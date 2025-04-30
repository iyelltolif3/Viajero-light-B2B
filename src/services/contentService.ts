import { supabase } from '@/lib/supabase';
import type { 
  ContentSettings,
  DiscountSection,
  DiscountItem
} from '@/types/content';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class ContentService {
  static async getContent(): Promise<ContentSettings | null> {
    try {
      const { data, error } = await supabase
        .from('system_content')
        .select('*')
        .single();

      if (error) throw error;
      
      // Buscar cualquier propiedad que contenga 'discount' o 'content'
      const discountColumnName = Object.keys(data).find(key => 
        key.toLowerCase().includes('discount') || key.toLowerCase().includes('content')
      );
      
      if (discountColumnName && data[discountColumnName]) {
        // Asegurarnos de que el frontend siempre vea los datos como discountSection
        return {
          ...data,
          discountSection: data[discountColumnName]
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      throw error;
    }
  }

  static async getDiscountSection(): Promise<DiscountSection> {
    try {
      // Primero obtenemos todos los campos para ver cuál contiene los descuentos
      const { data: content, error } = await supabase
        .from('system_content')
        .select('*')
        .single();

      if (error) throw error;
      
      // Buscar cualquier propiedad que contenga 'discount' o 'content'
      const discountColumnName = Object.keys(content).find(key => 
        key.toLowerCase().includes('discount') || key.toLowerCase().includes('content')
      );
      
      if (!discountColumnName || !content[discountColumnName]) {
        // Devolver estructura por defecto si no hay datos
        return {
          sectionTitle: 'Descuentos Especiales',
          sectionSubtitle: 'Aprovecha nuestras ofertas exclusivas',
          badgeText: 'Oferta',
          viewAllButtonText: 'Ver todas las ofertas',
          discounts: []
        };
      }
      
      return content[discountColumnName];
    } catch (error) {
      console.error('Error al obtener sección de descuentos:', error);
      throw error;
    }
  }

  static async updateDiscountSection(discountSection: DiscountSection): Promise<void> {
    try {
      // Primero obtenemos la estructura actual para saber exactamente qué columnas existen
      const { data: currentData, error: fetchError } = await supabase
        .from('system_content')
        .select('*')
        .single();
          
      if (fetchError) {
        throw new Error(`Error al obtener estructura actual: ${fetchError.message}`);
      }
      
      // Transformar los campos para que coincidan con el esquema de la base de datos
      const transformedDiscounts = discountSection.discounts.map(discount => ({
        id: discount.id,
        title: discount.title,
        description: discount.description,
        discountPercentage: discount.discountPercentage || discount.discount || 0,
        code: discount.code,
        validUntil: discount.validUntil,
        imageSrc: discount.imageSrc || '',
        active: discount.active,
        order: discount.order
      }));

      const transformedSection = {
        sectionTitle: discountSection.sectionTitle,
        sectionSubtitle: discountSection.sectionSubtitle,
        badgeText: discountSection.badgeText,
        viewAllButtonText: discountSection.viewAllButtonText,
        discounts: transformedDiscounts
      };
      
      // Encontrar el nombre correcto de la columna en la base de datos
      const discountColumnName = Object.keys(currentData).find(key => 
        key.toLowerCase().includes('discount') || key.toLowerCase().includes('content')
      );
      
      if (!discountColumnName) {
        throw new Error('No se pudo encontrar la columna para almacenar los descuentos');
      }
      
      console.log(`Actualizando columna ${discountColumnName} con los nuevos datos`);
      
      // Crear el objeto de actualización dinámicamente con el nombre de columna correcto
      const updateData = {};
      updateData[discountColumnName] = transformedSection;

      // Hacer la actualización con el nombre de campo correcto y usando el ID real
      const { error } = await supabase
        .from('system_content')
        .update(updateData)
        .eq('id', currentData.id); // Usamos el ID que encontramos en la consulta

      if (error) {
        console.error('Error al actualizar contenido:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en updateDiscountSection:', error);
      throw error;
    }
  }

  static async getActiveDiscounts(): Promise<DiscountItem[]> {
    try {
      // Primero obtenemos todos los campos para ver cuál contiene los descuentos
      const { data: content, error } = await supabase
        .from('system_content')
        .select('*')
        .single();

      if (error) throw error;
      
      // Buscar cualquier propiedad que contenga 'discount' o 'content'
      const discountColumnName = Object.keys(content).find(key => 
        key.toLowerCase().includes('discount') || key.toLowerCase().includes('content')
      );
      
      if (!discountColumnName || !content[discountColumnName] || !content[discountColumnName].discounts) {
        return []; // No hay descuentos disponibles
      }

      return content[discountColumnName].discounts.filter(
        discount => discount.active && new Date(discount.validUntil) > new Date()
      ).sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error al obtener descuentos activos:', error);
      throw error;
    }
  }

  static async createDiscount(discount: Omit<DiscountItem, 'id' | 'active' | 'order'>): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const newDiscount: DiscountItem = {
      id: generateUUID(),
      ...discount,
      active: true,
      order: content.discountSection.discounts.length
    };

    const updatedDiscounts = [...content.discountSection.discounts, newDiscount];
    const updatedSection = {
      ...content.discountSection,
      discounts: updatedDiscounts
    };

    const { error: updateError } = await supabase
      .from('system_content')
      .update({
        discountSection: updatedSection
      })
      .eq('id', 1);

    if (updateError) throw updateError;
  }

  static async updateDiscount(id: string, updates: Partial<DiscountItem>): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const updatedDiscounts = content.discountSection.discounts.map(discount =>
      discount.id === id ? { ...discount, ...updates } : discount
    );

    const updatedSection = {
      ...content.discountSection,
      discounts: updatedDiscounts
    };

    const { error: updateError } = await supabase
      .from('system_content')
      .update({
        discountSection: updatedSection
      })
      .eq('id', 1);

    if (updateError) throw updateError;
  }

  static async deleteDiscount(id: string): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const updatedDiscounts = content.discountSection.discounts
      .filter(discount => discount.id !== id)
      .map((discount, index) => ({ ...discount, order: index }));

    const updatedSection = {
      ...content.discountSection,
      discounts: updatedDiscounts
    };

    const { error: updateError } = await supabase
      .from('system_content')
      .update({
        discountSection: updatedSection
      })
      .eq('id', 1);

    if (updateError) throw updateError;
  }

  static async reorderDiscounts(orderedIds: string[]): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const discountMap = new Map<string, DiscountItem>(
      content.discountSection.discounts.map(discount => [discount.id, discount])
    );

    const updatedDiscounts = orderedIds
      .map((id, index) => {
        const discount = discountMap.get(id);
        if (!discount) return null;
        
        const updatedDiscount: DiscountItem = {
          id: discount.id,
          title: discount.title,
          description: discount.description,
          code: discount.code,
          discountPercentage: discount.discountPercentage,
          validUntil: discount.validUntil,
          active: discount.active,
          order: index
        };

        if (discount.imageSrc) {
          updatedDiscount.imageSrc = discount.imageSrc;
        }

        return updatedDiscount;
      })
      .filter((discount): discount is DiscountItem => discount !== null);

    const updatedSection = {
      ...content.discountSection,
      discounts: updatedDiscounts
    };

    const { error: updateError } = await supabase
      .from('system_content')
      .update({
        discountSection: updatedSection
      })
      .eq('id', 1);

    if (updateError) throw updateError;
  }

  static async initializeContent(): Promise<void> {
    try {
      // Primero verificamos si ya existe contenido
      const { data: existingContent, error: checkError } = await supabase
        .from('system_content')
        .select('id')
        .limit(1);
        
      if (checkError) {
        console.error('Error al verificar contenido existente:', checkError);
        throw checkError;
      }
      
      // Si ya existe contenido, no hacer nada
      if (existingContent && existingContent.length > 0) {
        console.log('Ya existe contenido, no es necesario inicializar');
        return;
      }
      
      // Genera un UUID válido para el nuevo registro
      const newId = generateUUID();
      
      // Intentamos crear el registro con cada posible nombre de columna hasta que uno funcione
      const columnOptions = ['discounts', 'discount_section', 'content', 'discount_content'];
      
      for (const columnName of columnOptions) {
        try {
          // Creamos el contenido inicial con el nombre de columna actual
          const initialContent = {
            id: newId
          };
          
          // Agregamos dinámicamente la propiedad con el nombre de columna
          initialContent[columnName] = {
            sectionTitle: 'Descuentos Especiales',
            sectionSubtitle: 'Aprovecha nuestras ofertas exclusivas',
            badgeText: 'Oferta',
            viewAllButtonText: 'Ver todas las ofertas',
            discounts: []
          };
          
          const { error } = await supabase
            .from('system_content')
            .insert(initialContent);
            
          if (!error) {
            console.log(`Contenido inicializado correctamente usando la columna '${columnName}'`);
            return;
          }
        } catch (innerError) {
          console.error(`Error al intentar con columna '${columnName}':`, innerError);
          // Continuamos con el siguiente intento
        }
      }
      
      // Si llegamos aquí, ninguno de los intentos funcionó
      throw new Error('No se pudo inicializar el contenido con ninguno de los nombres de columna probados');
    } catch (error) {
      console.error('Error en initializeContent:', error);
      throw error;
    }
  }
}
