/**
 * Representa un destino disponible para selección.
 */
export interface Destination {
  id: string;
  name: string;
  region: string;
  price_multiplier: number;
  risk_level: 'low' | 'medium' | 'high';
}

/**
 * Representa una zona geográfica con sus países y propiedades.
 */
export interface Zone {
  id: string;
  name: string;
  priceMultiplier: number;
  countries: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Parámetros necesarios para calcular una cotización.
 */
export interface QuoteCalculationParams {
  zone: string;
  duration: number;
  travelers: { age: number }[];
  category: string;
}

/**
 * Resultado de un cálculo de precio.
 */
export interface PriceResult {
  subtotal: number;
  tax: number;
  commission?: number;
  total: number;
  pricePerDay: number;
  currency: string;
}

/**
 * Información de un plan de seguro.
 */
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