import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import DestinationSelector from '@/components/DestinationSelector';
import { CheckoutButton } from '@/components/ui/checkout-button';
import { usePlansStore } from '@/store/plansStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { Destination } from '@/types/destination';
import { calculateQuote } from '@/lib/pricing';
import { useToast } from '@/components/ui/use-toast';

// Función auxiliar para formatear moneda
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export default function CheckoutRedesigned() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans } = usePlansStore();
  const { settings } = useSettingsStore();
  
  // Estados
  const [destination, setDestination] = useState<Destination | null>(null);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [travelers, setTravelers] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(plans?.[0] || null);
  const [price, setPrice] = useState({ 
    subtotal: 0, 
    tax: 0, 
    total: 0, 
    pricePerDay: 0,
    currency: 'USD' 
  });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calcular precio cuando cambien los datos
  const recalcularPrecio = () => {
    if (!destination || !departureDate || !returnDate) {
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      const travelersArray = Array(travelers).fill({ age: 30 }); // Valor por defecto para pruebas
      
      const result = calculateQuote({
        zone: destination.region,
        duration,
        travelers: travelersArray,
        category: selectedPlan?.name || 'Standard'
      });
      
      setPrice({
        subtotal: result.subtotal,
        tax: result.tax,
        total: result.total,
        pricePerDay: result.pricePerDay,
        currency: result.currency
      });
    } catch (error) {
      console.error('Error al calcular el precio:', error);
      toast({
        title: 'Error al calcular el precio',
        description: 'Por favor intenta nuevamente con diferentes parámetros.',
        variant: 'destructive'
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleProcederPago = () => {
    if (!destination) {
      toast({
        title: 'Selecciona un destino',
        description: 'Por favor selecciona un destino para continuar',
        variant: 'destructive'
      });
      return;
    }
    
    // Aquí continuaría el flujo de pago
    toast({
      title: 'Procesando pago',
      description: 'Redirigiendo al procesador de pago...'
    });
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-6 text-primary-color"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Volver
      </Button>
      
      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Información del Viaje</h1>
        <p className="text-gray-500 mb-8">Complete los datos necesarios para su asistencia</p>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-1">Recotizar</h2>
          <p className="text-gray-500 text-sm mb-6">Modifica los detalles del viaje para actualizar el precio</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Destino</label>
              <DestinationSelector 
                value={destination} 
                onSelect={setDestination} 
                className="w-full border-primary-color"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Fechas</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha de salida</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full h-10 px-4 py-2 border rounded-md focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--primary)' }}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha de regreso</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full h-10 px-4 py-2 border rounded-md focus:outline-none focus:border-primary"
                      style={{ borderColor: 'var(--primary)' }}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Viajeros</label>
              <div className="relative">
                <button 
                  className="w-full h-10 px-4 py-2 border rounded-md flex items-center justify-between"
                  style={{ borderColor: 'var(--primary)' }}
                >
                  <span className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    {travelers} viajero{travelers !== 1 ? 's' : ''}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={recalcularPrecio}
                disabled={isCalculating}
                className="bg-primary-color hover:opacity-90 text-white"
              >
                {isCalculating ? 'Calculando...' : 'Recalcular'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-1">Información de Viajeros</h2>
          <p className="flex justify-between">
            <span className="text-gray-500 text-sm">Agrega los datos de cada viajero</span>
            <span className="text-sm font-medium">0 viajeros</span>
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <CheckoutButton 
            onClick={handleProcederPago}
            isProcessing={isCalculating}
            disabled={!destination || isCalculating}
            className="max-w-xs"
          >
            Proceder al Pago
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
} 