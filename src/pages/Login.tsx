
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/Auth/LoginForm';
import { ThemeToggle } from '@/components/theme-toggle';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-semibold text-foreground">
              Wanderlust Assist
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your travel plans and bookings</p>
        </div>
        
        <LoginForm className="animate-fade-in" />
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 md:px-6 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Wanderlust Assist. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
