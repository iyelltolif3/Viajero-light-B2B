import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { ContentSettings, DiscountContent, DiscountItem } from '@/types/content';

type ContentSection = Database['public']['Tables']['content_sections']['Row'];
type DiscountItemDB = Database['public']['Tables']['discount_items']['Row'];

export async function getDiscountSection(): Promise<DiscountContent> {
  // Get section data
  const { data: sectionData, error: sectionError } = await supabase
    .from('content_sections')
    .select('*')
    .eq('type', 'discount')
    .single();

  if (sectionError) throw sectionError;

  // Get discount items
  const { data: itemsData, error: itemsError } = await supabase
    .from('discount_items')
    .select('*')
    .eq('section_id', sectionData.id)
    .order('order');

  if (itemsError) throw itemsError;

  return {
    sectionTitle: sectionData.title,
    sectionSubtitle: sectionData.subtitle || '',
    badgeText: sectionData.badge_text || '',
    viewAllButtonText: sectionData.button_text || '',
    discounts: itemsData.map(mapDiscountItemFromDB),
  };
}

export async function updateDiscountSection(content: DiscountContent): Promise<void> {
  // First, get the section ID
  const { data: section, error: sectionError } = await supabase
    .from('content_sections')
    .select('id')
    .eq('type', 'discount')
    .single();

  if (sectionError) throw sectionError;

  // Update section data
  const { error: updateError } = await supabase
    .from('content_sections')
    .update({
      title: content.sectionTitle,
      subtitle: content.sectionSubtitle,
      badge_text: content.badgeText,
      button_text: content.viewAllButtonText,
      updated_at: new Date().toISOString(),
    })
    .eq('id', section.id);

  if (updateError) throw updateError;

  // Get existing items to compare
  const { data: existingItems, error: itemsError } = await supabase
    .from('discount_items')
    .select('id')
    .eq('section_id', section.id);

  if (itemsError) throw itemsError;

  const existingIds = new Set(existingItems.map(item => item.id));
  const newIds = new Set(content.discounts.map(item => item.id));

  // Items to delete
  const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('discount_items')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) throw deleteError;
  }

  // Update or insert items
  for (const item of content.discounts) {
    const dbItem = mapDiscountItemToDB(item, section.id);
    
    if (existingIds.has(item.id)) {
      // Update existing item
      const { error: updateItemError } = await supabase
        .from('discount_items')
        .update(dbItem)
        .eq('id', item.id);

      if (updateItemError) throw updateItemError;
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('discount_items')
        .insert(dbItem);

      if (insertError) throw insertError;
    }
  }
}

function mapDiscountItemFromDB(dbItem: DiscountItemDB): DiscountItem {
  return {
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description,
    discount: dbItem.discount,
    expiryDate: dbItem.expiry_date,
    imageSrc: dbItem.image_url,
    active: dbItem.active,
    order: dbItem.order,
  };
}

function mapDiscountItemToDB(item: DiscountItem, sectionId: string): Omit<DiscountItemDB, 'created_at'> {
  return {
    id: item.id,
    section_id: sectionId,
    title: item.title,
    description: item.description,
    discount: item.discount,
    expiry_date: item.expiryDate,
    image_url: item.imageSrc,
    active: item.active,
    order: item.order,
    updated_at: new Date().toISOString(),
  };
}
