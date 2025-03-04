import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Minus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface TravelerSelectorProps {
  onTravelersChange?: (ages: number[]) => void;
  className?: string;
}

export function TravelerSelector({ onTravelersChange, className }: TravelerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [travelers, setTravelers] = useState<number[]>([18]); // Edad inicial por defecto

  const addTraveler = () => {
    if (travelers.length < 9) {
      const newTravelers = [...travelers, 18];
      setTravelers(newTravelers);
      onTravelersChange?.(newTravelers);
    }
  };

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      const newTravelers = travelers.filter((_, i) => i !== index);
      setTravelers(newTravelers);
      onTravelersChange?.(newTravelers);
    }
  };

  const updateAge = (index: number, value: string) => {
    const newAge = Math.max(0, Math.min(120, parseInt(value) || 0));
    const newTravelers = [...travelers];
    newTravelers[index] = newAge;
    setTravelers(newTravelers);
    onTravelersChange?.(newTravelers);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="travelers"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-white/80 backdrop-blur-sm group"
          >
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-travel-600" />
              <span className={cn(travelers.length > 1 ? "text-travel-800" : "text-travel-400")}>
                {travelers.length} {travelers.length === 1 ? "viajero" : "viajeros"}
              </span>
            </div>
            {open ? (
              <ChevronUp className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-white">
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              {travelers.map((age, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-12 text-travel-800">Viajero {index + 1}.</span>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => updateAge(index, e.target.value)}
                    className="h-8 w-20 text-center"
                    min={0}
                    max={120}
                  />
                  <span className="text-travel-600">años</span>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-auto"
                      onClick={() => removeTraveler(index)}
                    >
                      <Minus className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-travel-800">Total viajeros</p>
                <p className="text-xs text-travel-500">Máximo 9 viajeros</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-travel-800">{travelers.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={addTraveler}
                  disabled={travelers.length >= 9}
                >
                  <Plus className="h-4 w-4 text-travel-600" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full mt-2"
              onClick={() => setOpen(false)}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TravelerSelector;