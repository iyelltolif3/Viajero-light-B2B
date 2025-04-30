export interface Traveler {
  age: number;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  price_multiplier: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface QuoteFormData {
  origin: string;
  destination: Destination | null;
  dates: {
    departure_date?: Date;
    return_date?: Date;
  };
  travelers: { age: number }[];
  contact_info?: {
    phone: string;
    email: string;
  };
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
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Voucher {
  id: string;
  plan_id: string;
  user_id: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
    nationality: string;
  }[];
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  emergency_contact: {
    name: string;
    phone: string;
    email: string;
  };
  qr_code: string;
  created_at: string;
  updated_at: string;
}

export interface Assistance {
  id: string;
  plan_name: string;
  status: 'active' | 'future' | 'expired';
  start_date: string;
  end_date: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
    nationality: string;
  }[];
  contact_info: {
    phone: string;
    email: string;
  };
  total_price: number;
  plan_details: {
    coverage_details: {
      medical_coverage: number;
      luggage_coverage: number;
      cancellation_coverage: number;
      covid_coverage: boolean;
      pre_existing_conditions: boolean;
      adventure_sports: boolean;
    };
    features: string[];
  };
  destination: {
    name: string;
    region: string;
  };
}

// Re-export all types from settings
export * from './settings';
// Re-export all types from content
export { 
  type ContentSettings,
  type DiscountSection,
  type DiscountItem
} from './content';