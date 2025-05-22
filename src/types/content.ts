import { BaseModel } from './settings';

export interface DiscountItem {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercentage: number;
  validUntil: string;
  imageSrc?: string;
  active?: boolean; // Opcional para compatibilidad con settings.ts
  order?: number;  // Opcional para compatibilidad con settings.ts
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
  heroSection?: {
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string;       // Requerido en settings.ts
  };
  featuresSection?: {
    title: string;
    subtitle: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
    }>;
  };
  testimonialSection?: {
    title: string;
    subtitle: string;
    testimonials: Array<{
      id: string;
      author: string;
      content: string;
      rating: number;
      avatar?: string;
    }>;
  };
}
