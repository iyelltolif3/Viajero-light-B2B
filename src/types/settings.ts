export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings extends BaseModel {
  brandName: string;
  brandLogo: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
  paymentSettings: {
    currency: string;
    taxRate: number;
    paymentMethods: string[];
  };
  notifications: {
    id: string;
    type: string;
    message: string;
    active: boolean;
  }[];
  branding: {
    logo: string;
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  content?: {
    discountSection: {
      sectionTitle: string;
      sectionSubtitle: string;
      badgeText: string;
      viewAllButtonText: string;
      discounts: Array<{
        id: string;
        title: string;
        description: string;
        code: string;
        discountPercentage: number;
        validUntil: string;
        imageSrc?: string;
        active: boolean;
        order: number;
      }>;
    };
    heroSection?: {
      title: string;
      subtitle: string;
      ctaText: string;
      backgroundImage: string;
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
  };
  zones: Zone[];
  ageRanges: AgeRange[];
  emergencyContacts: EmergencyContact[];
}

export interface Zone extends BaseModel {
  name: string;
  description: string;
  price_multiplier: number;
  risk_level: 'low' | 'medium' | 'high';
  countries: string[];
  is_active: boolean;
  order: number;
}

export interface AgeRange extends BaseModel {
  minAge: number;
  maxAge: number;
  price_multiplier: number;
  description: string;
  is_active: boolean;
  order: number;
}

export interface EmergencyContact extends BaseModel {
  name: string;
  phone: string;
  email: string;
  priority: number;
  is_active: boolean;
  description: string;
}
