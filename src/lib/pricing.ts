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
  
  export const calculateQuote = (inputs: {
    zone: string;
    duration: number;
    travelers: Array<{ age: number }>;
    category: keyof typeof BASE_PRICES;
  }) => {
    const basePrice = BASE_PRICES[inputs.category];
    const zoneMultiplier = ZONE_MULTIPLIERS[inputs.zone] || 1;
    
    const ageFactor = inputs.travelers.reduce((sum, traveler) => {
      let factor = AGE_FACTORS['12-64'];
      if (traveler.age <= 11) factor = AGE_FACTORS['0-11'];
      if (traveler.age >= 65) factor = AGE_FACTORS['65+'];
      return sum + factor;
    }, 0) / inputs.travelers.length;
  
    return {
      total: Number((
        basePrice *
        inputs.duration *
        zoneMultiplier *
        ageFactor *
        inputs.travelers.length
      ).toFixed(2)),
      breakdown: {
        basePrice,
        zoneMultiplier,
        ageFactor: Number(ageFactor.toFixed(2)),
        duration: inputs.duration,
        travelers: inputs.travelers.length
      }
    };
  };