import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Destination } from '@/types/destination';

interface DestinationSelectorProps {
  value: Destination | null;
  onSelect: (destination: Destination) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function DestinationSelector({ 
  value, 
  onSelect, 
  label = "Seleccionar destino", 
  placeholder = "Seleccionar destino",
  className 
}: DestinationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettingsStore();

  const destinations = settings?.zones?.map(zone => ({
    id: zone.id || `zone-${Math.random().toString(36).substr(2, 9)}`,
    name: zone.name || 'Zona sin nombre',
    region: zone.name || 'Región desconocida',
    priceMultiplier: typeof zone.priceMultiplier === 'number' ? zone.priceMultiplier : 1,
    riskLevel: zone.riskLevel || 'low'
  } as Destination)) || [];

  const handleSelect = useCallback((destination: Destination) => {
    onSelect(destination);
    setIsOpen(false);
  }, [onSelect]);

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between btn-outline-primary relative", 
          !value && "text-muted-foreground",
          className
        )}
        style={{ borderColor: 'var(--primary)', color: value ? 'var(--primary)' : undefined }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-5 w-5 text-travel-600" />
        </div>
        <span className="flex-1 text-left pl-8">
          {value?.name || placeholder}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg">
          <div className="max-h-[300px] overflow-auto p-2">
            {destinations.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No hay destinos disponibles.
              </div>
            ) : (
              <div className="space-y-1">
                {destinations.map((destination) => (
                  <Button
                    key={destination.id}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 font-normal",
                      value?.id === destination.id && "bg-accent"
                    )}
                    onClick={() => handleSelect(destination)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value?.id === destination.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 truncate">{destination.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
