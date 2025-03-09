import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido a Viajero Light!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      await signIn(authForm.email, authForm.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de nuevo a Viajero Light!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor, asegúrate de que las contraseñas coincidan.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
  
    try {
      await signUp(authForm.email, authForm.password);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. ¡Bienvenido a Viajero Light!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login with Supabase
    toast({
      title: "Próximamente",
      description: `El inicio de sesión con ${provider} estará disponible pronto.`,
    });
  };
  return (
    <div className={cn("backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-xl p-8 w-full max-w-md shadow-xl border border-white/20", className)}>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-100/50 dark:bg-gray-800/50">
          <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Iniciar Sesión
          </TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Registrarse
          </TabsTrigger>
        </TabsList>
        {/* Social Login Buttons */}
        <div className="mb-6 space-y-3">
          <Button 
            variant="outline" 
            className="w-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/90 flex items-center justify-center gap-2 transition-colors"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.788 5.108A9 9 0 1021.447 12h-8.5" />
            </svg>
            Continuar con Google
          </Button>
          
        </div>
        
        <div className="relative mb-6">
          <Separator className="bg-gray-300 dark:bg-gray-600" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 px-2 text-xs text-gray-500 dark:text-gray-400">
            O
          </span>
        </div>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-login" className="text-gray-700 dark:text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="email-login"
                  name="email"
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password-login" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  ¿Ha olvidado su contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="password-login"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={authForm.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
              disabled={isLoading}
            >
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
              <Label htmlFor="email-register" className="text-gray-700 dark:text-gray-300">Correo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="email-register"
                  name="email"
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-register" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="password-register"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={authForm.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirma Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={authForm.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Al registrarse, acepta nuestros{" "}
              <a href="#" className="text-primary hover:underline">Términos de servicio</a>
              {" "}y{" "}
              <a href="#" className="text-primary hover:underline">Política de privacidad</a>
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LoginForm;
