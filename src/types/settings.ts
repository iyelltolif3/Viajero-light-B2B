export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
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
    companyName: string;
    contactEmail: string;
    supportPhone: string;
  };
}

export interface EmergencyContact extends BaseModel {
  settingsId: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  priority: number;
  isActive: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface PaymentSettings {
  currency: string;
  acceptedMethods: string[];
  taxRate: number;
  commissionRate: number;
}

export interface Zone extends BaseModel {
  settingsId: string;
  name: string;
  priceMultiplier: number;
  countries: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
}

export interface AgeRange extends BaseModel {
  settingsId: string;
  minAge: number;
  maxAge: number;
  priceMultiplier: number;
  isActive: boolean;
}

export interface ContentSettings extends BaseModel {
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
    }>;
  };
}
