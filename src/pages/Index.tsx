import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import HeroSection from '@/components/HeroSection';
import DiscountSection from '@/components/DiscountSection';
import { ThemeToggle } from '@/components/theme-toggle';

const Index = () => {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Destinos', href: '#destinations' },
    { label: 'Ofertas', href: '#offers' },
    { label: 'Sobre nosotros', href: '#about' },
    { label: 'Contacto', href: '#contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="font-bold text-xl text-foreground">
              Viajero - Light
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary text-sm font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Login/Register Button & Theme Toggle (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-border text-foreground hover:text-primary">
                  <User className="h-4 w-4 mr-2" />
                  Registrarse
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
                <div className="flex flex-col h-full pb-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="font-bold text-xl text-foreground">
                      Viajero - Light
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThemeToggle />
                      <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 pt-4">
                    {navItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="text-foreground hover:text-primary py-2 text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                  
                  <div className="mt-auto pt-6">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-center">
                        <User className="h-4 w-4 mr-2" />
                        Sign In / Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Discount Section */}
      <DiscountSection />

      {/* Footer */}
      <footer className="bg-primary/95 text-primary-foreground py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Mawdy - MiA Travel</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
            Su socio de confianza para experiencias de viaje memorables en todo Chile.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Booking Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-travel-300 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Mawdy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
