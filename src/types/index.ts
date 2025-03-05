export interface Traveler {
  id?: string;
  age: number;
}

export interface QuoteFormData {
  origin: string;
  destination: {
    name: string;
    [key: string]: any;
  } | null;
  dates: {
    departureDate: Date | undefined;
    returnDate: Date | undefined;
  };
  travelers: Traveler[];
}

export interface QuoteCalculationParams {
  zone: string;
  duration: number;
  travelers: Traveler[];
  category: 'standard' | 'premium';
} 