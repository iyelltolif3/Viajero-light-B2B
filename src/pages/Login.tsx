import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/Auth/LoginForm';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
      {/* Círculos decorativos y fondo */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gray-300/30"></div>
      <div className="absolute -left-20 bottom-0 w-40 h-40 rounded-full bg-gray-300/20"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-gray-300/10"></div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="text-xl md:text-2xl font-semibold text-gray-900">
              Viajero Light
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Content */}
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-lg mx-auto">
        <div className="w-full max-w-md text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
          <p className="text-gray-600">Accede a tu cuenta para gestionar tus asistencias de viaje</p>
        </div>
        
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <LoginForm className="animate-fade-in" />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 md:px-6 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Viajero Light. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Login;
