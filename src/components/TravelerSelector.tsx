import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Minus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Traveler } from '@/types';

interface TravelerSelectorProps {
  travelers?: Traveler[];
  onTravelersChange: (travelers: Traveler[]) => void;
  className?: string;
}

export default function TravelerSelector({ travelers: initialTravelers = [{ age: 18 }], onTravelersChange, className }: TravelerSelectorProps) {
  const [travelers, setTravelers] = useState<Traveler[]>(initialTravelers);

  const handleAddTraveler = () => {
    const newTravelers = [...travelers, { age: 18 }];
    setTravelers(newTravelers);
    onTravelersChange(newTravelers);
  };

  const handleRemoveTraveler = (index: number) => {
    const newTravelers = travelers.filter((_, i) => i !== index);
    setTravelers(newTravelers);
    onTravelersChange(newTravelers);
  };

  const handleAgeChange = (index: number, age: number) => {
    const newTravelers = [...travelers];
    newTravelers[index] = { age };
    setTravelers(newTravelers);
    onTravelersChange(newTravelers);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !travelers.length && "text-muted-foreground",
              className
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>{travelers.length} {travelers.length === 1 ? 'viajero' : 'viajeros'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Viajeros</h4>
            <div className="space-y-4">
              {travelers.map((traveler, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={traveler.age}
                    onChange={(e) => handleAgeChange(index, parseInt(e.target.value))}
                  >
                    {Array.from({ length: 86 }, (_, i) => i).map((age) => (
                      <option key={age} value={age}>
                        {age} años
                      </option>
                    ))}
                  </select>
                  {travelers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTraveler(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              {travelers.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddTraveler}
                >
                  Agregar Viajero
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}