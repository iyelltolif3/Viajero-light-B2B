import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Destination } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    price_multiplier: typeof zone.priceMultiplier === 'number' ? zone.priceMultiplier : 1,
    risk_level: zone.riskLevel || 'low'
  } as Destination)) || [];

  const handleSelect = useCallback((destination: Destination) => {
    onSelect(destination);
    setIsOpen(false);
  }, [onSelect]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
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
      </PopoverTrigger>
      
      <PopoverContent 
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto"
        align="start" 
        sideOffset={5}
      >
        <div className="p-2 w-full">
          {destinations.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No hay destinos disponibles.
            </div>
          ) : (
            <div className="space-y-1">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className={cn(
                    "flex items-center px-2 py-2 rounded cursor-pointer",
                    value?.id === destination.id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => handleSelect(destination)}
                  style={{
                    transition: 'all 0.2s ease',
                    borderLeft: value?.id === destination.id ? '3px solid var(--primary)' : '3px solid transparent'
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0 mr-2",
                      value?.id === destination.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate">{destination.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
