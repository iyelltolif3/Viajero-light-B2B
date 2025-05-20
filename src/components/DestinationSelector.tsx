import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Detectar clics fuera del componente para cerrar el dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calcular posición del dropdown
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '200px',
    zIndex: 9999
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed' as const,
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999
      });
    }
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between btn-outline-primary relative", 
          !value && "text-muted-foreground",
          className
        )}
        style={{ 
          borderColor: 'var(--primary)', 
          color: value ? 'var(--primary)' : undefined, 
          backgroundColor: 'white'
        }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-5 w-5 text-travel-600" />
        </div>
        <span className="flex-1 text-left pl-8">
          {value?.name || placeholder}
        </span>
      </Button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            ...dropdownStyle,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '300px',
            overflow: 'auto',
            // Estas propiedades adicionales ayudarán a asegurar una opacidad completa
            backdropFilter: 'none',
            isolation: 'isolate'
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '0.5rem' }}>
            {destinations.length === 0 ? (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem 0', 
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                No hay destinos disponibles.
              </div>
            ) : (
              <div style={{ backgroundColor: 'white' }}>
                {destinations.map((destination) => (
                  <Button
                    key={destination.id}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 font-normal mb-1",
                      value?.id === destination.id ? "bg-gray-100" : "bg-white hover:bg-gray-100"
                    )}
                    style={{ 
                      backgroundColor: value?.id === destination.id ? '#f3f4f6' : 'white',
                      display: 'flex',
                      padding: '0.5rem'
                    }}
                    onClick={() => handleSelect(destination)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value?.id === destination.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span style={{ 
                      flexGrow: 1, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'left'
                    }}>
                      {destination.name}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
