import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Settings,
  Users,
  Headphones,
  LogOut,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/UserMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/settingsStore';

// Track instances of AdminNavbar to prevent duplicate rendering
let navbarInstanceCounter = 0;

export function AdminNavbar() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSettingsStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Company branding information
  const companyName = settings?.branding?.companyName || "Viajero";
  const logo = settings?.branding?.logo || "";

  // Check for duplicate rendering
  const [instanceId] = useState(() => {
    navbarInstanceCounter++;
    return navbarInstanceCounter;
  });
  
  // Only render the first instance of the navbar
  // This prevents duplicate navbars from appearing
  if (instanceId > 1) {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Asistencias',
      href: '/admin/assistances',
      icon: Headphones,
      current: location.pathname === '/admin/assistances'
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 justify-between items-center">
          {/* Logo y navegación desktop */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/admin" className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt={companyName} className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{companyName}</span>
                )}
                <Badge variant="outline" className="flex items-center text-xs py-0 h-5">
                  <span>Admin</span>
                </Badge>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    item.current
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User section with avatar and admin badge */}
          <div className="hidden md:flex md:items-center gap-4">
            {isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="text-xs">Administrador</span>
              </Badge>
            )}
            <UserMenu />
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isAdmin && (
              <div className="px-3 py-2 mb-4">
                <Badge variant="secondary" className="w-full flex items-center justify-center py-1">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                  <span>Administrador</span>
                </Badge>
              </div>
            )}
            
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium rounded-md',
                  item.current
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-gray-600 dark:text-gray-300"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
