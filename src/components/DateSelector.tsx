import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format, addDays, isBefore, isAfter, isSameDay, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DateSelectorProps {
  className?: string;
  onDatesChange?: (dates: { departureDate: Date | undefined; returnDate: Date | undefined }) => void;
}

const DateSelector = ({ className, onDatesChange }: DateSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<{
    departureDate: Date | undefined;
    returnDate: Date | undefined;
  }>({
    departureDate: undefined,
    returnDate: undefined,
  });

  const [activeCalendar, setActiveCalendar] = useState<'departure' | 'return'>('departure');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [previewDays, setPreviewDays] = useState<number | null>(null);

  // Minimum dates (today for departure, departure date + 1 day for return)
  const today = new Date();
  const minReturnDate = dates.departureDate ? addDays(dates.departureDate, 1) : today;

  // Function to handle date selection
  const handleSelect = useCallback((date: Date | undefined) => {
    if (activeCalendar === 'departure') {
      // If selecting departure date
      if (date) {
        // If return date exists and is before the new departure date, clear return date
        const newReturnDate = dates.returnDate && isBefore(dates.returnDate, date) 
          ? undefined 
          : dates.returnDate;
          
        const newDates = { departureDate: date, returnDate: newReturnDate };
        setDates(newDates);
        onDatesChange?.(newDates);
        
        // If no return date set, automatically switch to return selection
        if (!newReturnDate) {
          setActiveCalendar('return');
        }
      } else {
        const newDates = { ...dates, departureDate: undefined };
        setDates(newDates);
        onDatesChange?.(newDates);
      }
    } else {
      // If selecting return date
      const newDates = { ...dates, returnDate: date };
      setDates(newDates);
      onDatesChange?.(newDates);
      
      // If both dates are set, close the popover
      if (dates.departureDate && date) {
        setTimeout(() => setOpen(false), 300);
      }
    }
  }, [activeCalendar, dates, onDatesChange]);

  // Calcular días de previsualización cuando el cursor está sobre una fecha
  useEffect(() => {
    if (!hoveredDate) {
      setPreviewDays(null);
      return;
    }
    
    // Si estamos seleccionando la fecha de salida y no hay fecha de regreso seleccionada
    if (activeCalendar === 'departure') {
      if (dates.returnDate) {
        // Calcular días entre la fecha bajo el cursor y la fecha de regreso
        const days = differenceInDays(dates.returnDate, hoveredDate);
        if (days >= 0) {
          setPreviewDays(days);
        } else {
          setPreviewDays(null);
        }
      } else {
        setPreviewDays(null);
      }
    }
    // Si estamos seleccionando la fecha de regreso y hay fecha de salida
    else if (activeCalendar === 'return' && dates.departureDate) {
      // Calcular días entre la fecha de salida y la fecha bajo el cursor
      const days = differenceInDays(hoveredDate, dates.departureDate);
      if (days >= 0) {
        setPreviewDays(days);
      } else {
        setPreviewDays(null);
      }
    } else {
      setPreviewDays(null);
    }
  }, [hoveredDate, dates.departureDate, dates.returnDate, activeCalendar]);

  // Handler para cuando el cursor entra en una fecha
  const handleDayMouseEnter = useCallback((date: Date) => {
    setHoveredDate(date);
  }, []);
  
  // Handler para cuando el cursor sale del calendario
  const handleDayMouseLeave = useCallback(() => {
    setHoveredDate(null);
    setPreviewDays(null);
  }, []);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <label htmlFor="departure-date" className="text-sm font-medium text-foreground block mb-1.5">
            Fecha de salida
          </label>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                id="departure-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-background/80 backdrop-blur-sm",
                  !dates.departureDate && "text-muted-foreground",
                  activeCalendar === 'departure' && open && "ring-2 ring-primary ring-opacity-50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dates.departureDate ? format(dates.departureDate, "MMMM d, yyyy") : "Selecciona fecha de salida"}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[450px] p-4 bg-card">
              <div className="flex flex-col">
                <div className="pb-4">
                  <div className="flex justify-between gap-2">
                    <button 
                      className={cn(
                        "flex-1 text-sm font-medium px-2 py-1.5 rounded-md transition-colors", 
                        activeCalendar === 'departure' 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setActiveCalendar('departure')}
                    >
                      Salida
                    </button>
                    <button 
                      className={cn(
                        "flex-1 text-sm font-medium px-2 py-1.5 rounded-md transition-colors", 
                        activeCalendar === 'return' 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setActiveCalendar('return')}
                    >
                      Regreso
                    </button>
                  </div>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={activeCalendar === 'departure' ? dates.departureDate : dates.returnDate}
                  onSelect={handleSelect}
                  initialFocus
                  disabled={(date) => {
                    // For departure: disable dates before today
                    if (activeCalendar === 'departure') {
                      return isBefore(date, today) && !isSameDay(date, today);
                    }
                    // For return: disable dates before departure date + 1 day
                    return !dates.departureDate || 
                      isBefore(date, minReturnDate) && 
                      !isSameDay(date, minReturnDate);
                  }}
                  className="rounded-md border"
                  classNames={{
                    caption: "flex justify-center pt-1 relative items-center bg-primary/5 rounded-t-md py-2",
                    caption_label: "text-sm font-medium text-primary"
                  }}
                  modifiers={{
                    departure: (date) => dates.departureDate ? isSameDay(date, dates.departureDate) : false,
                    return: (date) => dates.returnDate ? isSameDay(date, dates.returnDate) : false,
                    inRange: (date) => {
                      return dates.departureDate && 
                             dates.returnDate && 
                             isAfter(date, dates.departureDate) && 
                             isBefore(date, dates.returnDate);
                    },
                    // Estilos para previsualización de rango al pasar el cursor
                    previewRange: (date) => {
                      if (!hoveredDate) return false;

                      // Vista previa al seleccionar fecha de salida
                      if (activeCalendar === 'departure') {
                        return dates.returnDate && 
                               isAfter(date, hoveredDate) && 
                               isBefore(date, dates.returnDate);
                      }
                      // Vista previa al seleccionar fecha de regreso
                      else if (activeCalendar === 'return') {
                        return dates.departureDate && 
                               isAfter(date, dates.departureDate) && 
                               isBefore(date, hoveredDate);
                      }
                      return false;
                    },
                    // Resaltar fecha bajo el cursor
                    preview: (date) => hoveredDate ? isSameDay(date, hoveredDate) : false
                  }}
                  modifiersClassNames={{
                    departure: "bg-primary text-primary-foreground font-bold",
                    return: "bg-primary text-primary-foreground font-bold",
                    inRange: "bg-primary/20 text-foreground hover:bg-primary/30",
                    selected: "bg-primary text-primary-foreground",
                    previewRange: "bg-primary/10 text-foreground",
                    preview: "border-primary border-2 font-medium"
                  }}
                  onDayMouseEnter={handleDayMouseEnter}
                  onDayMouseLeave={handleDayMouseLeave}
                  modifiersStyles={{
                    selected: { fontWeight: "bold" }
                  }}
                />
                {/* Información de días seleccionados o previsualizados */}
                <div className="pt-4 text-sm border-t mt-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {dates.departureDate ? 
                        (dates.returnDate ? 
                          `${format(dates.departureDate, "MMM d")} - ${format(dates.returnDate, "MMM d, yyyy")}` : 
                          (hoveredDate && activeCalendar === 'return' && isAfter(hoveredDate, dates.departureDate) ? 
                            `${format(dates.departureDate, "MMM d")} - ${format(hoveredDate, "MMM d, yyyy")}` : 
                            "Selecciona fecha de regreso")) : 
                        "Selecciona fechas"}
                    </p>
                    {/* Badge con número de días */}
                    {(dates.departureDate && dates.returnDate) || previewDays ? (
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold transition-all">
                        {previewDays !== null ? 
                          `${previewDays} días` : 
                          `${differenceInDays(dates.returnDate!, dates.departureDate!)} días`}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1">
          <label htmlFor="return-date" className="text-sm font-medium text-foreground block mb-1.5">
            Fecha de regreso
          </label>
          <Button
            id="return-date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-background/80 backdrop-blur-sm",
              !dates.returnDate && "text-muted-foreground",
              activeCalendar === 'return' && open && "ring-2 ring-primary ring-opacity-50"
            )}
            onClick={() => {
              setActiveCalendar('return');
              setOpen(true);
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dates.returnDate ? format(dates.returnDate, "MMMM d, yyyy") : "Selecciona fecha de regreso"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
