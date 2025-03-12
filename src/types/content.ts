export interface DiscountContent {
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  viewAllButtonText: string;
  discounts: DiscountItem[];
}

export interface DiscountItem {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  imageSrc: string;
  active: boolean;
  order: number;
}

export interface ContentSettings {
  discountSection: DiscountContent;
}
