import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useSettingsStore } from '@/store/settingsStore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, isAdmin, isLoggingOut, isAuthenticating } = useAuth();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // Valores predeterminados para branding si no están configurados
  const primaryColor = settings?.branding?.primaryColor || "#E11D48";
  const secondaryColor = settings?.branding?.secondaryColor || "#1E293B";
  const companyName = settings?.branding?.companyName || "Viajero";
  const logo = settings?.branding?.logo || "";
  
  // Asegurarse de que el componente sólo se renderiza completamente en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          {logo ? (
            <img 
              src={logo} 
              alt={companyName}
              className="h-8 w-auto"
            />
          ) : (
            <span className="font-bold text-primary-color">{companyName}</span>
          )}
        </Link>
        <div className="flex flex-1 items-center space-x-2 justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/planes" className="text-sm font-medium transition-colors hover:text-primary-color">
              Planes
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/settings" className="text-sm font-medium transition-colors hover:text-primary-color">
                  Configuración
                </Link>
                <Link to="/admin/assistances" className="text-sm font-medium transition-colors hover:text-primary-color">
                  Asistencias
                </Link>
                <Badge className="bg-primary-color text-white flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="text-xs">Administrador</span>
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoggingOut && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Cerrando sesión...</span>
              </div>
            )}
            {isAuthenticating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Autenticando...</span>
              </div>
            )}
            {user && !isLoggingOut && !isAuthenticating ? (
              <UserMenu />
            ) : !isLoggingOut && !isAuthenticating ? (
              <Button className="bg-primary-color hover:opacity-90 transition-opacity text-white">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
} 