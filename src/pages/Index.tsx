import { useEffect, useRef, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import DiscountSection from '@/components/DiscountSection';

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Renderizamos directamente todo el contenido sin animaciones basadas en scroll
  return (
    <div className="flex flex-col w-full">
      {/* Referencia para el Hero Section */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      {/* Contenido que aparece con scroll */}
      <div ref={contentRef} className="w-full">
        {/* Discount Section */}
        <div className="animate-section">
          <DiscountSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
