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
    commissionRate?: number; // Añadido para soportar la tasa de comisión
  };
  notifications: {
    id: string;
    type: string;
    message: string;
    active: boolean;
    beforeExpiration?: boolean; // Para notificaciones previas a expiración
    reminderEmails?: boolean; // Para correos de recordatorio
    smsNotifications?: boolean; // Para notificaciones SMS
    whatsappNotifications?: boolean; // Para notificaciones WhatsApp
  }[];
  branding: {
    logo: string;
    companyName: string;
    contactEmail: string;
    supportPhone: string;
    favicon?: string; // Para el favicon del sitio
    primaryColor?: string; // Color primario en branding
    secondaryColor?: string; // Color secundario en branding
  };
  // Nuevas propiedades para alinear con el uso en el código
  content?: ContentSettings;
  zones?: Zone[];
  ageRanges?: AgeRange[];
  emergencyContacts?: EmergencyContact[];
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
  description?: string; // Campo opcional para soportar la descripción
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
  settings_id?: string; // Usamos el nombre exacto de la columna en la base de datos
  name: string;
  description?: string; // Agregado según el esquema real de la base de datos
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
  description?: string; // Campo opcional para soportar la descripción
  order?: number; // Propiedad para definir el orden
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
      active?: boolean;
      order?: number;
      imageSrc?: string;
    }>;
  };
  heroSection?: {
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string;
  };
}

export interface EndpointConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}
