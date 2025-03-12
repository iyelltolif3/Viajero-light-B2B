import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Users, 
  FileText, 
  AlertTriangle, 
  LogOut, 
  LayoutDashboard,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ to, icon, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-colors",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-primary"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function AdminNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      to: '/admin/assistances',
      label: 'Asistencias',
      icon: <Headphones className="h-4 w-4" />
    },
    {
      to: '/admin/users',
      label: 'Usuarios',
      icon: <Users className="h-4 w-4" />
    },
    {
      to: '/admin/content',
      label: 'Contenido',
      icon: <FileText className="h-4 w-4" />
    },
    {
      to: '/admin/settings',
      label: 'Configuración',
      icon: <Settings className="h-4 w-4" />
    }
  ];

  return (
    <>
      {/* Admin Warning Banner */}
      <Alert variant="destructive" className="rounded-none border-b">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Modo Administrador Activo
        </AlertTitle>
        <AlertDescription className="text-sm">
          Esta cuenta es exclusiva para tareas administrativas. Por razones de seguridad, no debe utilizarse para acceder a la plataforma de clientes.
          Si necesita acceder como cliente, por favor utilice una cuenta diferente.
        </AlertDescription>
      </Alert>

      {/* Admin Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-primary">Panel Admin</span>
            </Link>

            {/* Admin Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  isActive={location.pathname === item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </header>
    </>
  );
}
