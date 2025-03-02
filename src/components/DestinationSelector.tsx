
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, MapPin, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Destination {
  id: string;
  name: string;
  country: string;
  type: 'city' | 'country' | 'landmark';
}

// Sample Chile-centric destination data
const popularDestinations: Destination[] = [
  { id: 'santiago', name: 'Santiago', country: 'Chile', type: 'city' },
  { id: 'valparaiso', name: 'Valparaíso', country: 'Chile', type: 'city' },
  { id: 'pucon', name: 'Pucón', country: 'Chile', type: 'city' },
  { id: 'vina-del-mar', name: 'Viña del Mar', country: 'Chile', type: 'city' },
  { id: 'san-pedro-atacama', name: 'San Pedro de Atacama', country: 'Chile', type: 'city' },
  { id: 'puerto-varas', name: 'Puerto Varas', country: 'Chile', type: 'city' },
  { id: 'chiloe', name: 'Chiloé', country: 'Chile', type: 'landmark' },
  { id: 'torres-del-paine', name: 'Torres del Paine', country: 'Chile', type: 'landmark' },
  { id: 'easter-island', name: 'Easter Island', country: 'Chile', type: 'landmark' },
  { id: 'argentina', name: 'Argentina', country: 'Argentina', type: 'country' },
  { id: 'peru', name: 'Peru', country: 'Peru', type: 'country' },
  { id: 'bolivia', name: 'Bolivia', country: 'Bolivia', type: 'country' },
  { id: 'brazil', name: 'Brazil', country: 'Brazil', type: 'country' },
  { id: 'united-states', name: 'United States', country: 'United States', type: 'country' },
  { id: 'spain', name: 'Spain', country: 'Spain', type: 'country' },
];

interface DestinationSelectorProps {
  label: string;
  placeholder?: string;
  onSelect: (destination: Destination | null) => void;
  value?: Destination | null;
  className?: string;
}

export function DestinationSelector({
  label,
  placeholder = 'Search destinations...',
  onSelect,
  value,
  className,
}: DestinationSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <label className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-background text-left text-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            {value ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-travel-600 dark:text-travel-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{value.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{value.country}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
            )}
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px] max-h-[300px] overflow-hidden">
          <Command>
            <CommandInput placeholder={placeholder} className="h-9" />
            <CommandList>
              <CommandEmpty>No destination found.</CommandEmpty>
              <CommandGroup heading="Popular Destinations">
                {popularDestinations.map((destination) => (
                  <CommandItem
                    key={destination.id}
                    value={`${destination.name}-${destination.country}`}
                    onSelect={() => {
                      onSelect(destination);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-travel-600 dark:text-travel-400" />
                      <span className="font-medium">{destination.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{destination.country}</span>
                    </div>
                    {value?.id === destination.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DestinationSelector;
