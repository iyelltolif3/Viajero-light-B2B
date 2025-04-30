import { supabase } from '@/lib/supabase';
import type { 
  ContentSettings,
  DiscountSection,
  DiscountItem
} from '@/types';

export class ContentService {
  static async getContent(): Promise<ContentSettings | null> {
    const { data, error } = await supabase
      .from('system_content')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async getDiscountSection(): Promise<DiscountSection> {
    const { data: content, error } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (error) throw error;
    return content.discountSection;
  }

  static async updateDiscountSection(discountSection: DiscountSection): Promise<void> {
    const { error } = await supabase
      .from('system_content')
      .update({ discountSection })
      .eq('id', 1); // Asumiendo que siempre hay un registro con id=1

    if (error) throw error;
  }

  static async getActiveDiscounts(): Promise<DiscountItem[]> {
    const { data: content, error } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (error) throw error;

    return content.discountSection.discounts.filter(
      discount => discount.active && new Date(discount.validUntil) > new Date()
    ).sort((a, b) => a.order - b.order);
  }

  static async createDiscount(discount: Omit<DiscountItem, 'id' | 'active' | 'order'>): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const newDiscount: DiscountItem = {
      id: Date.now().toString(),
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

  static async updateDiscount(id: string, updates: Partial<Omit<DiscountItem, 'id' | 'active' | 'order'>>): Promise<void> {
    const { data: content, error: getError } = await supabase
      .from('system_content')
      .select('discountSection')
      .single();

    if (getError) throw getError;

    const updatedDiscounts = content.discountSection.discounts.map(discount =>
      discount.id === id ? { 
        ...discount,
        ...updates,
        id: discount.id,
        active: discount.active,
        order: discount.order
      } : discount
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
}
