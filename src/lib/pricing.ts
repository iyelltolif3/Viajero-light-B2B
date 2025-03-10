import { QuoteCalculationParams } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlansStore } from '@/store/plansStore';

// Precios base por categoría (USD por día)
const BASE_PRICES = {
    basic: 5,
    standard: 8,
    premium: 12
  };
  
  // Multiplicadores por zona
  const ZONE_MULTIPLIERS = {
    'Sudamerica': 1.0,
    'Caribe': 1.3,
    'Norte America': 1.5,
    'Europa': 1.4,
    'Asia': 1.6,
    'Sudeste Asiatico': 1.7,
    'Oceania': 1.8,
    'Africa': 1.9,
    'Mediterraneo': 1.4
  };
  
  // Factores etarios
  const AGE_FACTORS = {
    '0-11': 1.2,
    '12-64': 1.0,
    '65+': 1.5
  };
  
export function calculateQuote(params: QuoteCalculationParams) {
  const { settings } = useSettingsStore.getState();
  const { plans } = usePlansStore.getState();

  // Encontrar el plan
  const plan = plans.find(p => p.name.toLowerCase().includes(params.category.toLowerCase()));
  if (!plan) throw new Error('Plan no encontrado');

  // Encontrar la zona
  const zone = settings.zones.find(z => z.name === params.zone);
  if (!zone) throw new Error('Zona no encontrada');

  // Calcular precio base por día
  const baseDailyPrice = plan.basePrice * zone.priceMultiplier;

  // Calcular precio por viajero teniendo en cuenta rangos de edad
  const travelersPrice = params.travelers.reduce((total, traveler) => {
    // Encontrar el rango de edad aplicable
    const ageRange = settings.ageRanges.find(
      range => traveler.age >= range.min && traveler.age <= range.max
    );

    if (!ageRange) {
      console.warn(`No se encontró rango de edad para ${traveler.age} años`);
      return total + baseDailyPrice;
    }

    return total + (baseDailyPrice * ageRange.priceMultiplier);
  }, 0);

  // Calcular precio total
  const subtotal = travelersPrice * params.duration;
  const tax = subtotal * (settings.paymentSettings.taxRate / 100);
  const commission = subtotal * (settings.paymentSettings.commissionRate / 100);
  const total = subtotal + tax + commission;

  return {
    subtotal,
    tax,
    commission,
    total,
    pricePerDay: travelersPrice,
    currency: settings.paymentSettings.currency
  };
}