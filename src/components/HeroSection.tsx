import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Carousel from './ui/carousel-custom';
import DestinationSelector from './DestinationSelector';
import DateSelector from './DateSelector';
import TravelQuotes from './TravelQuotes';
import { Input } from './ui/input';
import TravelerSelector from './TravelerSelector';
import { calculateQuote } from '@/lib/pricing';
import { QuoteFormData, QuoteCalculationParams } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  // State for form data
  const [formData, setFormData] = useState<QuoteFormData>({
    origin: 'Chile',
    destination: null,
    dates: {
      departureDate: undefined,
      returnDate: undefined,
    },
    travelers: [{ age: 18 }]
  });

  const navigate = useNavigate();

  // Background carousel images
  const backgroundImages = [
    <div key="image1" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80')" }} />,
    <div key="image2" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80')" }} />,
    <div key="image3" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80')" }} />,
  ];
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar datos necesarios
    if (!formData.destination || !formData.dates.departureDate || !formData.dates.returnDate) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos necesarios.",
        variant: "destructive"
      });
      return;
    }

    // Calcular duración en días
    const duration = Math.ceil(
      (formData.dates.returnDate.getTime() - formData.dates.departureDate.getTime()) / 
      (1000 * 3600 * 24)
    );

    // Calcular cotización
    const quoteParams: QuoteCalculationParams = {
      zone: formData.destination.name,
      duration,
      travelers: formData.travelers,
      category: 'standard'
    };

    const quote = calculateQuote(quoteParams);

    // Guardar la cotización en sessionStorage para recuperarla en el checkout
    sessionStorage.setItem('lastQuote', JSON.stringify({
      quote,
      formData
    }));

    // Redirigir al checkout
    navigate('/checkout');
  }

  return (
    <section className={cn("relative min-h-screen flex flex-col", className)}>
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <Carousel
          items={backgroundImages}
          controls={false}
          animation="fade"
          interval={7000}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10 dark:from-black/60 dark:via-black/50 dark:to-black/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-16 md:py-24">
        <div className="text-center mb-8 md:mb-12 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            ¡COTIZA AHORA TU ASISTENCIA DE VIAJE!
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          Explora sin límites con seguridad: nosotros protegemos tus planes para que tus únicas compañías sean la aventura y la tranquilidad
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <form onSubmit={handleSubmit}>
            {/* Main Form Card */}
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-[20px] shadow-xl p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[180px_220px_1fr_140px_80px] gap-4 lg:gap-6 items-start">
                {/* Origin Country */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    País de origen
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-travel-600" />
                    </div>
                    <Input 
                      value={formData.origin}
                      readOnly 
                      className="w-full pl-10 h-12 bg-gray-50 border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                {/* Destination Country */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    País de destino
                  </label>
                  <DestinationSelector
                    label=""
                    placeholder="¿A dónde viajas?"
                    onSelect={(value) => setFormData({ ...formData, destination: value })}
                    value={formData.destination}
                    className="w-full [&_button]:h-12 [&_button]:pl-10"
                  />
                </div>

                {/* Dates */}
                <div>
                  <DateSelector
                    onDatesChange={(dates) => setFormData({ ...formData, dates })}
                    className="w-full [&_button]:h-12"
                  />
                </div>

                {/* Travelers */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    Viajeros
                  </label>
                  <TravelerSelector
                    onTravelersChange={(ages) => setFormData(prev => ({...prev, travelers: ages}))}
                    className="w-full [&_button]:h-12"
                  />
                </div>

                {/* Submit Button */}
                <div className="self-end">
                  <Button
                    type="submit"
                    className="w-full bg-travel-600/90 hover:bg-travel-700 text-white font-medium h-12 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] text-sm"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Feature Highlight Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-colors duration-200">
            <div className="mx-auto w-16 h-16 bg-travel-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Pérdida de equipaje</h3>
            <p className="text-sm text-white/90">Cobertura por pérdida o demora de equipaje durante tu viaje.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-colors duration-200">
            <div className="mx-auto w-16 h-16 bg-travel-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Atención médica por accidente</h3>
            <p className="text-sm text-white/90">Asistencia médica durante emergencias en tu viaje.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-colors duration-200">
            <div className="mx-auto w-16 h-16 bg-travel-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Cancelación de vuelo</h3>
            <p className="text-sm text-white/90">Reembolso por cancelaciones inesperadas de vuelos.</p>
          </div>
        </div>
      </div>
      
      {/* Quote Bar */}
      <div className="relative z-20 mt-auto mx-4 md:mx-8 lg:mx-16 mb-8">
        <TravelQuotes className="rounded-xl" />
      </div>
    </section>
  );
}

export default HeroSection;
