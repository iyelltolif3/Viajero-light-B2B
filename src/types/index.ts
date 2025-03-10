export interface Traveler {
  age: number;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  priceMultiplier: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface QuoteFormData {
  origin: string;
  destination: Destination | null;
  dates: {
    departureDate?: Date;
    returnDate?: Date;
  };
  travelers: { age: number }[];
}

export interface QuoteCalculationParams {
  zone: string;
  duration: number;
  travelers: { age: number }[];
  category: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDetail: string;
  features: string[];
  badge: string;
  maxDays: number;
  basePrice: number;
  priceMultiplier: number;
  coverageDetails: {
    medicalCoverage: number;
    luggageCoverage: number;
    cancellationCoverage: number;
    covidCoverage: boolean;
    preExistingConditions: boolean;
    adventureSports: boolean;
  };
}

export interface Voucher {
  id: string;
  planId: string;
  userId: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
    nationality: string;
  }[];
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  emergencyContact: {
    name: string;
    phone: string;
    email: string;
  };
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistance {
  id: string;
  planName: string;
  status: 'active' | 'expired' | 'future';
  startDate: string;
  endDate: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
    nationality: string;
  }[];
  totalPrice: number;
  planDetails: {
    coverageDetails: {
      medicalCoverage: number;
      luggageCoverage: number;
      cancellationCoverage: number;
      covidCoverage: boolean;
      preExistingConditions: boolean;
      adventureSports: boolean;
    };
    features: string[];
  };
  destination: {
    name: string;
    region: string;
  };
}

export interface Settings {
  zones: {
    id: string;
    name: string;
    priceMultiplier: number;
    countries: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  ageRanges: {
    min: number;
    max: number;
    priceMultiplier: number;
  }[];
  emergencyContacts: {
    id: string;
    country: string;
    phone: string;
    email: string;
    address: string;
  }[];
  notifications: {
    beforeExpiration: number[];
    reminderEmails: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
  };
  paymentSettings: {
    currency: string;
    acceptedMethods: string[];
    taxRate: number;
    commissionRate: number;
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