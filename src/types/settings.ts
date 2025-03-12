export interface AdminSettings {
  brandName: string;
  brandLogo: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  emergencyContacts: EmergencyContact[];
  notificationSettings: NotificationSettings;
  paymentSettings: PaymentSettings;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface PaymentSettings {
  currency: string;
  acceptedMethods: string[];
}
