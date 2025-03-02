
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

// Sample destination data
const popularDestinations: Destination[] = [
  { id: 'paris', name: 'Paris', country: 'France', type: 'city' },
  { id: 'london', name: 'London', country: 'United Kingdom', type: 'city' },
  { id: 'rome', name: 'Rome', country: 'Italy', type: 'city' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', type: 'city' },
  { id: 'newyork', name: 'New York', country: 'United States', type: 'city' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', type: 'city' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', type: 'city' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', type: 'city' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', type: 'city' },
  { id: 'hongkong', name: 'Hong Kong', country: 'China', type: 'city' },
  { id: 'morocco', name: 'Morocco', country: 'Morocco', type: 'country' },
  { id: 'thailand', name: 'Thailand', country: 'Thailand', type: 'country' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', type: 'landmark' },
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
      <label className="text-sm font-medium mb-1.5 text-travel-800">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-travel-200 bg-white/80 backdrop-blur-sm text-left text-sm hover:bg-white hover:border-travel-300 transition-colors"
          >
            {value ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-travel-600" />
                  <span className="font-medium text-travel-900">{value.name}</span>
                  <span className="text-xs text-travel-500">{value.country}</span>
                </div>
              </>
            ) : (
              <span className="text-travel-400">{placeholder}</span>
            )}
            <Search className="h-4 w-4 text-travel-500 shrink-0" />
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
                      <MapPin className="h-4 w-4 text-travel-600" />
                      <span className="font-medium">{destination.name}</span>
                      <span className="text-xs text-travel-500">{destination.country}</span>
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
