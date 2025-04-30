import { BaseModel } from './settings';

export interface DiscountItem {
  id: string;
  title: string;
  description: string;
  discount?: number; // Mantenemos para compatibilidad con el código actual
  discountPercentage: number; // Campo que realmente espera la base de datos
  code: string;
  expiryDate?: string; // Probablemente ya no se usa
  imageSrc?: string;
  active: boolean;
  order: number;
  validUntil: string;
}

export interface DiscountSection {
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  viewAllButtonText: string;
  discounts: DiscountItem[];
}

export interface ContentSettings extends BaseModel {
  discountSection: DiscountSection;
}
