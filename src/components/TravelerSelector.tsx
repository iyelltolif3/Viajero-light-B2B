
import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Minus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Traveler {
  type: 'adult' | 'child' | 'infant';
  count: number;
  ageDescription: string;
}

interface TravelerSelectorProps {
  onTravelersChange?: (travelers: Traveler[]) => void;
  className?: string;
}

export function TravelerSelector({ onTravelersChange, className }: TravelerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [travelers, setTravelers] = useState<Traveler[]>([
    { type: 'adult', count: 1, ageDescription: '12+ years' },
    { type: 'child', count: 0, ageDescription: '2-11 years' },
    { type: 'infant', count: 0, ageDescription: 'Under 2 years' },
  ]);

  // Function to update traveler counts
  const updateTravelerCount = (type: 'adult' | 'child' | 'infant', increment: boolean) => {
    const newTravelers = travelers.map(traveler => {
      if (traveler.type === type) {
        const newCount = increment ? traveler.count + 1 : Math.max(0, traveler.count - 1);
        
        // Adults minimum count is 1
        if (type === 'adult' && newCount < 1) {
          return traveler;
        }
        
        return { ...traveler, count: newCount };
      }
      return traveler;
    });
    
    setTravelers(newTravelers);
    onTravelersChange && onTravelersChange(newTravelers);
  };

  // Get total travelers count
  const totalTravelers = travelers.reduce((sum, traveler) => sum + traveler.count, 0);
  
  // Get summary text
  const getSummaryText = () => {
    const parts = [];
    
    travelers.forEach(traveler => {
      if (traveler.count > 0) {
        parts.push(`${traveler.count} ${traveler.type}${traveler.count !== 1 ? 's' : ''}`);
      }
    });
    
    return parts.join(', ');
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor="travelers" className="text-sm font-medium text-travel-800 block mb-1.5">
        Travelers
      </label>
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
              <span className={cn(totalTravelers > 1 ? "text-travel-800" : "text-travel-400")}>
                {totalTravelers > 1 ? getSummaryText() : "Select travelers"}
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
          <div className="p-4 space-y-5">
            {travelers.map((traveler) => (
              <div key={traveler.type} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-travel-800 capitalize">{traveler.type}s</p>
                  <p className="text-xs text-travel-500">{traveler.ageDescription}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateTravelerCount(traveler.type, false)}
                    disabled={traveler.type === 'adult' && traveler.count <= 1}
                  >
                    <Minus className="h-3 w-3" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  <span className="w-10 text-center font-medium text-travel-800">
                    {traveler.count}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateTravelerCount(traveler.type, true)}
                    disabled={totalTravelers >= 9}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="sr-only">Increase</span>
                  </Button>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-travel-800">Total travelers</p>
                <p className="text-xs text-travel-500">Maximum 9 travelers</p>
              </div>
              <span className="font-semibold text-travel-800">{totalTravelers}</span>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TravelerSelector;
