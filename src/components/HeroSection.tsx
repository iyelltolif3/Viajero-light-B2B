
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Carousel from './ui/carousel-custom';
import DestinationSelector from './DestinationSelector';
import DateSelector from './DateSelector';
import TravelQuotes from './TravelQuotes';
import { Input } from './ui/input';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  // State for form data
  const [formData, setFormData] = useState({
    origin: null as any,
    destination: null as any,
    dates: {
      departureDate: undefined as Date | undefined,
      returnDate: undefined as Date | undefined,
    }
  });

  // Background carousel images
  const backgroundImages = [
    <div key="image1" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80')" }} />,
    <div key="image2" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80')" }} />,
    <div key="image3" className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80')" }} />,
  ];

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically connect to an API or navigate to results page
    console.log('Search submitted:', formData);
  };

  return (
    <section className={cn("relative min-h-[700px] flex flex-col", className)}>
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0 brightness-[0.85]">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            ¡COTIZA AHORA TU ASISTENCIA DE VIAJE!
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Explore Chile with confidence. We handle the details so you can focus on creating memories.
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden animate-scale-in">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="flex flex-col space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">PAÍS DE ORIGEN</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-travel-600 dark:text-travel-400" />
                      </div>
                      <Input 
                        value="Chile" 
                        readOnly 
                        className="pl-10 bg-gray-100 dark:bg-gray-800" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">PAÍS DE DESTINO</label>
                    <DestinationSelector
                      label=""
                      placeholder="¿A dónde viajas?"
                      onSelect={(value) => setFormData({ ...formData, destination: value })}
                      value={formData.destination}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <DateSelector
                  onDatesChange={(dates) => setFormData({ ...formData, dates })}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              size="lg"
              className="w-full bg-travel-600 hover:bg-travel-700 text-white font-bold transition-colors group dark:bg-travel-700 dark:hover:bg-travel-800"
            >
              <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              COTIZAR GRATIS
            </Button>
          </form>
        </div>
        
        {/* Feature Highlight Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg text-center text-white">
            <div className="mx-auto w-16 h-16 bg-travel-600 dark:bg-travel-700 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Pérdida de equipaje</h3>
            <p className="text-sm text-white/80">Cobertura por pérdida o demora de equipaje durante tu viaje.</p>
          </div>
          
          <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg text-center text-white">
            <div className="mx-auto w-16 h-16 bg-travel-600 dark:bg-travel-700 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Atención médica por accidente</h3>
            <p className="text-sm text-white/80">Asistencia médica durante emergencias en tu viaje.</p>
          </div>
          
          <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg text-center text-white">
            <div className="mx-auto w-16 h-16 bg-travel-600 dark:bg-travel-700 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Cancelación de vuelo</h3>
            <p className="text-sm text-white/80">Reembolso por cancelaciones inesperadas de vuelos.</p>
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
