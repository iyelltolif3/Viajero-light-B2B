
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import HeroSection from '@/components/HeroSection';
import DiscountSection from '@/components/DiscountSection';

const Index = () => {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Offers', href: '#offers' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-travel-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-travel-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="font-bold text-xl text-travel-900">
              Wanderlust Assist
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-travel-600 hover:text-travel-900 text-sm font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Login/Register Button (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-travel-200 text-travel-700 hover:text-travel-900">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full pb-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="font-bold text-xl text-travel-900">
                      Wanderlust Assist
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 pt-4">
                    {navItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="text-travel-800 hover:text-travel-900 py-2 text-base font-medium transition-colors"
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
      <DiscountSection id="offers" />

      {/* Footer */}
      <footer className="bg-travel-900 text-travel-100 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Wanderlust Assist</h3>
            <p className="text-sm text-travel-300 mb-4">
              Your trusted partner for memorable travel experiences around the world.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-travel-300 hover:text-white transition-colors">
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
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-travel-800 text-center">
          <p className="text-sm text-travel-400">
            © {new Date().getFullYear()} Wanderlust Assist. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
