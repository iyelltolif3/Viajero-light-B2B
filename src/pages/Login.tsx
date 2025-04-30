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
        className="absolute inset-0 z-0" 
        style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 60%, #6b7280 100%)'
        }}
      />


      
      {/* Content */}
      {/* Botón Volver al inicio en la esquina superior izquierda */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:text-primary/90">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <LoginForm className="animate-fade-in" />
          </div>
        </div>
      </main>
      

    </div>
  );
};

export default Login;
