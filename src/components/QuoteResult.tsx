interface QuoteResultProps {
    quote: {
      total: number;
      breakdown: {
        basePrice: number;
        zoneMultiplier: number;
        ageFactor: number;
        duration: number;
        travelers: number;
      };
    };
  }
  
  export function QuoteResult({ quote }: QuoteResultProps) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-travel-800 mb-4">
          Total: ${quote.total.toFixed(2)}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Precio base/día:</span>
            <span>${quote.breakdown.basePrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Multiplicador zona:</span>
            <span>{quote.breakdown.zoneMultiplier}x</span>
          </div>
          <div className="flex justify-between">
            <span>Factor etario:</span>
            <span>{quote.breakdown.ageFactor}x</span>
          </div>
          <div className="flex justify-between">
            <span>Duración:</span>
            <span>{quote.breakdown.duration} días</span>
          </div>
          <div className="flex justify-between">
            <span>Viajeros:</span>
            <span>{quote.breakdown.travelers}</span>
          </div>
        </div>
      </div>
    );
  }