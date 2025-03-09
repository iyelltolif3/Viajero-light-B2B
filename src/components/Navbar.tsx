import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/UserMenu';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo y navegación principal */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              Viajero - Light
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/destinos" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Destinos
            </Link>
            <Link 
              to="/ofertas" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ofertas
            </Link>
            <Link 
              to="/sobre-nosotros" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre nosotros
            </Link>
            <Link 
              to="/contacto" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contacto
            </Link>
          </nav>
        </div>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/login?tab=register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 