
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Facebook, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome back to Wanderlust Assist!",
      });
      // Redirect user to home page
      navigate('/');
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome to Wanderlust Assist!",
      });
      // Redirect user to home page
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: `${provider} login successful`,
        description: "You're now logged in to Wanderlust Assist!",
      });
      // Redirect user to home page
      navigate('/');
    }, 1500);
  };

  return (
    <div className={cn("glass-morphism rounded-xl p-8 w-full max-w-md", className)}>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Registrate</TabsTrigger>
        </TabsList>
        
        {/* Social Login Buttons */}
        <div className="mb-6 space-y-3">
          <Button 
            variant="outline" 
            className="w-full bg-white text-travel-800 border-travel-200 hover:bg-travel-50 flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin('Google')}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.788 5.108A9 9 0 1021.447 12h-8.5" />
            </svg>
            Continua con Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-none flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={isLoading}
          >
            <Facebook size={16} />
            Continua con Facebook
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-travel-500">
            O
          </span>
        </div>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-login">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-travel-500" />
                <Input 
                  id="email-login"
                  name="email"
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password-login">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  ¿Ha olvidado su contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-travel-500" />
                <Input 
                  id="password-login"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10"
                  value={authForm.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-travel-500 hover:text-travel-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-register">Correo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-travel-500" />
                <Input 
                  id="email-register"
                  name="email"
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-register">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-travel-500" />
                <Input 
                  id="password-register"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10"
                  value={authForm.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-travel-500 hover:text-travel-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirma Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-travel-500" />
                <Input 
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10"
                  value={authForm.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
            
            <p className="text-xs text-travel-500 text-center">
              Al registrarse, acepta nuestra{" "}
              <a href="#" className="text-primary hover:underline">Terminos de servicio</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline">Política de privacidad</a>
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LoginForm;
