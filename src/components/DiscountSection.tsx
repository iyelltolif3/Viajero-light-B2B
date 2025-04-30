import React from 'react';
import { Clock, CalendarDays, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Carousel from './ui/carousel-custom';
import { useSettingsStore } from '@/store/settingsStore';
import type { DiscountItem } from '@/types/content';

interface DiscountCardProps extends DiscountItem {
  className?: string;
}

function DiscountCard({
  title,
  description,
  discount,
  expiryDate,
  imageSrc,
  className,
}: DiscountCardProps) {
  return (
    <div className={cn(
      "relative h-full overflow-hidden rounded-xl border border-gray-200 group transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
      className
    )}>
      {/* Imagen de fondo con opacidad aumentada */}
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
           style={{ backgroundImage: `url(${imageSrc})` }} />
      {/* Gradient más sutil para que se vea mejor la imagen */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        <div className="mb-auto">
          <span className="inline-flex items-center rounded-full bg-primary/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Percent className="mr-1 h-3 w-3" />
            {discount} Off
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-sm mb-4">{description}</p>
        
        <div className="flex items-center text-white/80 text-xs mb-4">
          <Clock className="h-3 w-3 mr-1" />
          <span>Expira: {expiryDate}</span>
        </div>
        
        <Button variant="outline" className="bg-black/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:text-white">
          Ver oferta
        </Button>
      </div>
    </div>
  );
}

interface DiscountSectionProps {
  className?: string;
}

export function DiscountSection({ className }: DiscountSectionProps) {
  const { content } = useSettingsStore();

  // Si no hay contenido, inicializar con valores por defecto
  if (!content?.discountSection) {
    return null; // O podrías mostrar un mensaje de carga o un estado vacío
  }

  const { sectionTitle, sectionSubtitle, badgeText, viewAllButtonText, discounts } = content.discountSection;

  // Filter active discounts and sort by order
  const activeDiscounts = discounts
    ?.filter(discount => discount.active)
    ?.sort((a, b) => a.order - b.order) || [];

  // Mobile carousel items
  const mobileCarouselItems = activeDiscounts.map((discount, index) => (
    <div key={discount.id} className="h-full w-full px-1">
      <DiscountCard {...discount} className="h-full" />
    </div>
  ));

  return (
    <section className={cn("py-16 px-4 md:px-8 lg:px-16", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            <Percent className="mr-2 h-4 w-4" />
            {badgeText}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">{sectionTitle}</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Desktop - Mosaic Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-4">
          {activeDiscounts.length > 0 && (
            <div className="md:col-span-6 lg:col-span-8 h-[300px]">
              <DiscountCard key={activeDiscounts[0].id} {...activeDiscounts[0]} className="h-full" />
            </div>
          )}
          
          <div className="md:col-span-6 lg:col-span-4 grid grid-rows-2 gap-4 h-[300px]">
            {activeDiscounts.length > 1 && (
              <div className="h-full">
                <DiscountCard key={activeDiscounts[1].id} {...activeDiscounts[1]} className="h-full" />
              </div>
            )}
            {activeDiscounts.length > 2 && (
              <div className="h-full">
                <DiscountCard key={activeDiscounts[2].id} {...activeDiscounts[2]} className="h-full" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-3 h-[200px]">
            {activeDiscounts.length > 3 && (
              <DiscountCard key={activeDiscounts[3].id} {...activeDiscounts[3]} className="h-full" />
            )}
          </div>
          
          <div className="md:col-span-5 h-[200px]">
            {activeDiscounts.length > 4 && (
              <DiscountCard key={activeDiscounts[4].id} {...activeDiscounts[4]} className="h-full" />
            )}
          </div>
          
          <div className="md:col-span-4 h-[200px]">
            {activeDiscounts.length > 5 && (
              <DiscountCard key={activeDiscounts[5].id} {...activeDiscounts[5]} className="h-full" />
            )}
          </div>
        </div>

        {/* Mobile - Carousel Layout */}
        <div className="md:hidden h-[400px]">
          <Carousel
            items={mobileCarouselItems}
            autoplay={true}
            interval={5000}
            controls={true}
            indicators={true}
            className="h-full"
            animation="slide"
          />
        </div>

        {/* View All Offers Button */}
        <div className="text-center mt-10">
          <Button variant="outline" className="border-travel-300 text-travel-800 hover:bg-travel-100">
            <CalendarDays className="mr-2 h-4 w-4" />
            {viewAllButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default DiscountSection;
