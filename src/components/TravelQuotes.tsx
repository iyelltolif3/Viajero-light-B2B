
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "Travel isn't always pretty. It isn't always comfortable. Sometimes it hurts, it even breaks your heart. But that's okay. The journey changes you; it should change you.",
    author: "Anthony Bourdain"
  },
  {
    text: "The world is a book and those who do not travel read only one page.",
    author: "Saint Augustine"
  },
  {
    text: "Travel makes one modest. You see what a tiny place you occupy in the world.",
    author: "Gustave Flaubert"
  },
  {
    text: "We travel not to escape life, but for life not to escape us.",
    author: "Anonymous"
  },
  {
    text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    author: "Marcel Proust"
  }
];

interface TravelQuotesProps {
  className?: string;
}

export function TravelQuotes({ className }: TravelQuotesProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  
  useEffect(() => {
    if (isPaused) return;
    
    const intervalId = setInterval(() => {
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentQuote((prevQuote) => {
          const currentIndex = quotes.findIndex(quote => quote.text === prevQuote.text);
          const nextIndex = (currentIndex + 1) % quotes.length;
          return quotes[nextIndex];
        });
        
        setFadeState('in');
      }, 500); // Half of transition time
      
    }, 8000); // Change quote every 8 seconds
    
    return () => clearInterval(intervalId);
  }, [isPaused]);
  
  return (
    <div 
      className={cn(
        "w-full py-3 px-6 glass-morphism relative overflow-hidden",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={cn(
          "flex items-center justify-center text-center transition-opacity duration-1000",
          fadeState === 'out' ? 'opacity-0' : 'opacity-100'
        )}
      >
        <blockquote className="max-w-3xl mx-auto">
          <p className="text-travel-800 text-sm md:text-base italic">"{currentQuote.text}"</p>
          <footer className="text-travel-600 text-xs md:text-sm mt-2">— {currentQuote.author}</footer>
        </blockquote>
      </div>
    </div>
  );
}

export default TravelQuotes;
