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
  emergencyContacts: EmergencyContact[];
  notificationSettings: NotificationSettings;
  paymentSettings: PaymentSettings;
  zones: Zone[];
  ageRanges: AgeRange[];
  notifications: {
    beforeExpiration: number[];
    reminderEmails: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
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
