import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Destination } from '@/types/destination';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DestinationSelectorProps {
  value: Destination | null;
  onSelect: (destination: Destination) => void;
  label?: string;
  className?: string;
}

export default function DestinationSelector({ value, onSelect, label = "Seleccionar destino", className }: DestinationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettingsStore();

  // Lista segura de destinos predeterminados en caso de que falle la carga
  const defaultDestinations: Destination[] = [
    { id: 'default-1', name: 'América Latina', region: 'América Latina', priceMultiplier: 1, riskLevel: 'low' },
    { id: 'default-2', name: 'Europa', region: 'Europa', priceMultiplier: 1.4, riskLevel: 'low' },
    { id: 'default-3', name: 'Norteamérica', region: 'Norteamérica', priceMultiplier: 1.3, riskLevel: 'low' },
    { id: 'default-4', name: 'Asia', region: 'Asia', priceMultiplier: 1.5, riskLevel: 'medium' }
  ];

  // Verificar que los datos estén cargados
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (!settings?.zones?.length) {
        console.warn('No se encontraron zonas en la configuración');
        setError('No se pudieron cargar las zonas disponibles');
      } else {
        setError(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [settings?.zones]);

  // Mapear zonas a destinos con manejo seguro de errores
  const destinations = useMemo(() => {
    try {
      if (!settings?.zones?.length) {
        console.warn('Usando destinos predeterminados');
        return defaultDestinations;
      }
      
      return settings.zones.map(zone => ({
        id: zone.id || `zone-${Math.random().toString(36).substr(2, 9)}`,
        name: zone.name || 'Zona sin nombre',
        region: zone.name || 'Región desconocida',
        priceMultiplier: typeof zone.priceMultiplier === 'number' ? zone.priceMultiplier : 1,
        riskLevel: zone.riskLevel || 'low'
      } as Destination));
    } catch (error) {
      console.error('Error al procesar las zonas:', error);
      return defaultDestinations;
    }
  }, [settings?.zones]);

  // Filtrar destinos basados en la búsqueda
  const filteredDestinations = useMemo(() => {
    if (!search || !search.trim()) return destinations;
    
    try {
      const searchLower = search.toLowerCase().trim();
      return destinations.filter(dest => {
        if (!dest) return false;
        
        const nameMatch = dest.name ? dest.name.toLowerCase().includes(searchLower) : false;
        const regionMatch = dest.region ? dest.region.toLowerCase().includes(searchLower) : false;
        
        return nameMatch || regionMatch;
      });
    } catch (error) {
      console.error('Error al filtrar destinos:', error);
      return destinations;
    }
  }, [destinations, search]);

  // Manejar selección de destino con validación adicional
  const handleSelect = (destination: Destination) => {
    try {
      if (!destination || !destination.id) {
        console.error('Destino inválido seleccionado:', destination);
        return;
      }
      
      // Crear una copia limpia del objeto destino para evitar referencias circulares
      const cleanDestination: Destination = {
        id: destination.id,
        name: destination.name || 'Destino desconocido',
        region: destination.region || 'Región desconocida',
        priceMultiplier: typeof destination.priceMultiplier === 'number' ? destination.priceMultiplier : 1,
        riskLevel: destination.riskLevel || 'low'
      };
      
      onSelect(cleanDestination);
      setOpen(false);
      setSearch('');
    } catch (error) {
      console.error('Error al seleccionar destino:', error);
    }
  };

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <Button
        variant="outline"
        className={cn("w-full justify-center", className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Cargando destinos...</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          style={{ borderColor: 'var(--primary)' }}
        >
          {value?.name || label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar destino..." 
            value={search}
            onValueChange={setSearch}
          />
          {error ? (
            <div className="py-6 text-center text-sm text-destructive">
              {error}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Usar destinos predeterminados
                </Button>
              </div>
            </div>
          ) : (
            <>
              <CommandEmpty>No se encontraron destinos.</CommandEmpty>
              <ScrollArea className="max-h-[300px]">
                <CommandGroup>
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((destination) => (
                      <CommandItem
                        key={destination.id}
                        value={destination.name}
                        onSelect={() => handleSelect(destination)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?.id === destination.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {destination.name}
                      </CommandItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm">
                      No hay destinos disponibles
                    </div>
                  )}
                </CommandGroup>
              </ScrollArea>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
