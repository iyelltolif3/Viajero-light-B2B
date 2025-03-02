
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Carousel from './ui/carousel-custom';
import DestinationSelector from './DestinationSelector';
import DateSelector from './DateSelector';
import TravelQuotes from './TravelQuotes';

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
            Discover Your Perfect Journey in Chile
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Explore Chile with confidence. We handle the details so you can focus on creating memories.
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl mx-auto glass-morphism rounded-xl overflow-hidden animate-scale-in">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <DestinationSelector
                label="From"
                placeholder="Where are you departing from?"
                onSelect={(value) => setFormData({ ...formData, origin: value })}
                value={formData.origin}
              />
              
              <DestinationSelector
                label="To"
                placeholder="Where in Chile?"
                onSelect={(value) => setFormData({ ...formData, destination: value })}
                value={formData.destination}
              />
              
              <DateSelector
                onDatesChange={(dates) => setFormData({ ...formData, dates })}
              />
            </div>
            
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-8 bg-primary hover:bg-primary/90 transition-colors group"
            >
              <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Find Flights
            </Button>
          </form>
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
