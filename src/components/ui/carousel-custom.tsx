
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  items: ReactNode[];
  autoplay?: boolean;
  interval?: number;
  controls?: boolean;
  indicators?: boolean;
  className?: string;
  slideClassName?: string;
  animation?: 'fade' | 'slide';
}

export function Carousel({
  items,
  autoplay = true,
  interval = 5000,
  controls = true,
  indicators = true,
  className = '',
  slideClassName = '',
  animation = 'fade'
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Threshold for swipe detection (in pixels)
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1));
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1));
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Autoplay functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoplay && !isHovering) {
      intervalId = setInterval(nextSlide, interval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoplay, interval, nextSlide, isHovering]);

  const getAnimationClass = (index: number) => {
    if (animation === 'fade') {
      return activeIndex === index ? 'opacity-100' : 'opacity-0';
    } else {
      if (activeIndex === index) return 'translate-x-0 opacity-100';
      if (activeIndex > index) return '-translate-x-full opacity-0';
      return 'translate-x-full opacity-0';
    }
  };

  const getTransitionClass = () => {
    return animation === 'fade' 
      ? 'transition-opacity duration-500 ease-in-out' 
      : 'transition-all duration-500 ease-in-out';
  };

  return (
    <div 
      className={cn('relative overflow-hidden rounded-lg w-full', className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-full">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'absolute top-0 left-0 w-full h-full',
              getAnimationClass(index),
              getTransitionClass(),
              slideClassName
            )}
            aria-hidden={activeIndex !== index}
          >
            {item}
          </div>
        ))}
      </div>
      
      {/* Controls */}
      {controls && items.length > 1 && (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-4 -translate-y-1/2 z-10 glass-morphism p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-travel-800" />
          </button>
          
          <button
            type="button"
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 glass-morphism p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-travel-800" />
          </button>
        </>
      )}
      
      {/* Indicators */}
      {indicators && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                activeIndex === index 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/60 hover:bg-white/80'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
