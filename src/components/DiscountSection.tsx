import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, CalendarDays, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Carousel from './ui/carousel-custom';
import { useSettingsStore } from '@/store/settingsStore';
import type { DiscountItem } from '@/types';

interface DiscountCardProps {
  title: string;
  description: string;
  discountPercentage: number;
  validUntil: string;
  imageSrc?: string;
  className?: string;
}

function DiscountCard({
  title,
  description,
  discountPercentage,
  validUntil,
  imageSrc,
  className,
}: DiscountCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    // Configurar animación de hover avanzada
    const tl = gsap.timeline({ paused: true });
    tl.to(card.querySelector('.bg-image'), { 
      scale: 1.1, 
      duration: 0.8, 
      ease: 'power2.out' 
    }, 0);
    tl.to(card.querySelector('.discount-badge'), { 
      y: -5, 
      scale: 1.05, 
      duration: 0.5, 
      ease: 'back.out' 
    }, 0);
    tl.to(card.querySelector('h3'), { 
      y: -3, 
      duration: 0.5, 
      ease: 'power1.out' 
    }, 0.1);
    tl.to(card.querySelector('button'), { 
      y: -3, 
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
      duration: 0.5, 
      ease: 'power1.out' 
    }, 0.2);
    
    // Escuchar eventos de mouse para activar la animación
    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mouseleave', () => tl.reverse());
    
    return () => {
      card.removeEventListener('mouseenter', () => tl.play());
      card.removeEventListener('mouseleave', () => tl.reverse());
      tl.kill();
    };
  }, []);
  return (
    <div 
      ref={cardRef}
      className={cn(
        "relative h-full overflow-hidden rounded-xl border border-travel-100 group transition-all duration-300 hover:shadow-lg will-change-transform",
        className
      )}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-image transition-transform will-change-transform"
        style={{ backgroundImage: `url(${imageSrc})` }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-travel-950/90 via-travel-900/50 to-travel-950/20" />
      <div className="relative h-full flex flex-col justify-end p-6 z-10 card-content">
        <div className="mb-auto">
          <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm discount-badge shadow-glow card-animate-item">
            <Percent className="mr-1 h-3 w-3" />
            {discountPercentage}% Off
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2 card-animate-item">{title}</h3>
        <p className="text-white/80 text-sm mb-4 card-animate-item">{description}</p>
        
        <div className="flex items-center text-white/70 text-xs mb-4 card-animate-item">
          <Clock className="h-3 w-3 mr-1" />
          <span>Expira: {validUntil}</span>
        </div>
        
        <Button variant="outline" className="bg-travel-100/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white card-animate-item shadow-sm transition-all duration-300">
          Ver oferta
        </Button>
      </div>
    </div>
  );
}

interface DiscountSectionProps {
  className?: string;
}

// GSAP sin dependencia de ScrollTrigger

export function DiscountSection({ className }: DiscountSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Solo inicializamos las animaciones si el elemento existe
    if (!sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      // Animaciones básicas sin dependencias de scroll
      
      // Animación simple del título
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.2
      });
      
      // Animación del badge
      gsap.from(badgeRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        delay: 0.3
      });
      
      // Animación del subtítulo
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.4
      });

      // Seleccionamos todas las tarjetas de descuento
      const cards = document.querySelectorAll('.discount-card');
      
      // Animamos cada tarjeta con efecto escalonado simple
      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 0.5 + (index * 0.1)
        });
        
        // Animación para elementos internos de cada tarjeta
        const cardElements = card.querySelectorAll('.card-animate-item');
        cardElements.forEach((element, elemIndex) => {
          gsap.from(element, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            delay: 0.6 + (index * 0.1) + (elemIndex * 0.05)
          });
        });
      });
      
      // Animación simple del botón
      gsap.from(buttonRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.8
      });
      
      // Mantenemos el efecto hover para las tarjetas
      cards.forEach(card => {
        // Timeline para el hover
        const hoverTL = gsap.timeline({ paused: true });
        
        // Elementos dentro de la tarjeta
        const bgImage = card.querySelector('.bg-image');
        const content = card.querySelector('.card-content');
        const button = card.querySelector('button');
        
        // Animaciones en hover (simplificadas)
        if (bgImage) {
          hoverTL.to(bgImage, {
            scale: 1.05,
            duration: 0.3
          }, 0);
        }
        
        if (content) {
          hoverTL.to(content, {
            y: -3,
            duration: 0.3
          }, 0);
        }
        
        if (button) {
          hoverTL.to(button, {
            y: -2,
            backgroundColor: "rgba(255,255,255,0.2)",
            duration: 0.3
          }, 0.1);
        }
        
        // Asignar eventos
        card.addEventListener('mouseenter', () => hoverTL.play());
        card.addEventListener('mouseleave', () => hoverTL.reverse());
      });
    }, sectionRef);
    
    return () => ctx.revert(); // Limpieza
  }, []);
  const { settings } = useSettingsStore();
  
  // Si settings o content.discountSection no existen, no renderizar nada
  if (!settings || !settings.content || !settings.content.discountSection) {
    return null;
  }
  
  const { sectionTitle, sectionSubtitle, badgeText, viewAllButtonText, discounts = [] } = settings.content.discountSection;

  // Filter active discounts and sort by order - con verificación adicional
  const activeDiscounts = discounts
    ?.filter(discount => discount?.active) 
    ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Mobile carousel items
  const mobileCarouselItems = activeDiscounts.map((discount) => (
    <div key={discount.id} className="h-full w-full px-1">
      <DiscountCard
        title={discount.title}
        description={discount.description}
        discountPercentage={discount.discountPercentage}
        validUntil={discount.validUntil}
        imageSrc={discount.imageSrc}
        className="h-full"
      />
    </div>
  ));

  return (
    <section ref={sectionRef} className={cn("py-16 px-4 md:px-8 lg:px-16", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div ref={badgeRef} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            <Percent className="mr-2 h-4 w-4" />
            {badgeText}
          </div>
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">{sectionTitle}</h2>
          <p ref={subtitleRef} className="text-gray-700 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Desktop - Grid Layout */}
        <div ref={cardsRef} className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDiscounts.slice(0, 3).map((discount) => (
            <DiscountCard key={discount.id} {...discount} className="h-full discount-card" />
          ))}
        </div>

        {/* Mobile - Carousel Layout */}
        <div ref={cardsRef} className="md:hidden h-[400px]">
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
        <div ref={buttonRef} className="text-center mt-10">
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
