import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/Auth/LoginForm';
import { ThemeToggle } from '@/components/theme-toggle';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{
          backgroundImage: 'url("/travel-background.jpg")', // Necesitarás agregar esta imagen
          filter: 'brightness(0.7)'
        }}
      />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-primary/90">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-semibold text-white">
              Viajero Light
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mb-8 text-center">
          
        </div>
        
        <LoginForm className="animate-fade-in" />
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 md:px-6 text-center text-white/80 text-sm">
        <p>© {new Date().getFullYear()} Mawdy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
