import React from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export function QuoteForm() {
  const [origin] = React.useState('Chile');
  const [destination, setDestination] = React.useState('');
  const [departureDate, setDepartureDate] = React.useState<Date>();
  const [returnDate, setReturnDate] = React.useState<Date>();
  const [travelers, setTravelers] = React.useState(1);

  return (
    <div className="w-full max-w-5xl bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      {/* País de origen */}
      <div className="md:col-span-2 relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          País de origen
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={origin}
            disabled
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* País de destino */}
      <div className="md:col-span-3 relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          País de destino
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="¿A dónde viajas?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Fecha de salida */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha de salida
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !departureDate && 'text-gray-500'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {departureDate ? departureDate.toLocaleDateString() : 'Selecciona fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Fecha de regreso */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha de regreso
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !returnDate && 'text-gray-500'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {returnDate ? returnDate.toLocaleDateString() : 'Selecciona fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={returnDate}
              onSelect={setReturnDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Viajeros */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Viajeros
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Users className="mr-2 h-4 w-4" />
              {travelers} {travelers === 1 ? 'viajero' : 'viajeros'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Número de viajeros</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    disabled={travelers <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{travelers}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTravelers(Math.min(10, travelers + 1))}
                    disabled={travelers >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Botón Cotizar */}
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-transparent mb-1">
          Cotizar
        </label>
        <Button className="w-full bg-primary hover:bg-primary/90" size="default">
          Cotizar
        </Button>
      </div>
    </div>
  );
} 