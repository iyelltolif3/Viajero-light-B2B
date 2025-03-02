
import React from 'react';
import { Clock, CalendarDays, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Carousel from './ui/carousel-custom';

interface DiscountCardProps {
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  imageSrc: string;
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
      "relative h-full overflow-hidden rounded-xl border border-travel-100 group transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
      className
    )}>
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
           style={{ backgroundImage: `url(${imageSrc})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-travel-950/90 via-travel-900/50 to-travel-950/20" />
      
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        <div className="mb-auto">
          <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Percent className="mr-1 h-3 w-3" />
            {discount} Off
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        
        <div className="flex items-center text-white/70 text-xs mb-4">
          <Clock className="h-3 w-3 mr-1" />
          <span>Expires: {expiryDate}</span>
        </div>
        
        <Button variant="outline" className="bg-travel-100/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white">
          View Offer
        </Button>
      </div>
    </div>
  );
}

interface DiscountSectionProps {
  className?: string;
}

export function DiscountSection({ className }: DiscountSectionProps) {
  // Sample discount data
  const discounts = [
    {
      title: "Summer Getaway",
      description: "Book now for special summer rates on tropical destinations.",
      discount: "25%",
      expiryDate: "August 31, 2023",
      imageSrc: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80",
    },
    {
      title: "Family Package",
      description: "Special rates for families traveling with children under 12.",
      discount: "15%",
      expiryDate: "December 31, 2023",
      imageSrc: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80",
    },
    {
      title: "Last Minute Deals",
      description: "Incredible savings on bookings made within 72 hours of departure.",
      discount: "40%",
      expiryDate: "Limited Availability",
      imageSrc: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80",
    },
    {
      title: "Weekend Escape",
      description: "Perfect short breaks for busy professionals.",
      discount: "20%",
      expiryDate: "Ongoing",
      imageSrc: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80",
    },
  ];

  // Mobile carousel items
  const mobileCarouselItems = discounts.map((discount, index) => (
    <div key={index} className="h-full w-full px-1">
      <DiscountCard {...discount} className="h-full" />
    </div>
  ));

  return (
    <section className={cn("py-16 px-4 md:px-8 lg:px-16 bg-travel-50", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            <Percent className="mr-2 h-4 w-4" />
            Limited Time Offers
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-travel-900 mb-4">Exclusive Discounts</h2>
          <p className="text-travel-600 max-w-2xl mx-auto">
            Take advantage of our special promotions and save on your next adventure.
          </p>
        </div>

        {/* Desktop - Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.slice(0, 3).map((discount, index) => (
            <DiscountCard key={index} {...discount} className="h-full" />
          ))}
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
            View All Special Offers
          </Button>
        </div>
      </div>
    </section>
  );
}

export default DiscountSection;
