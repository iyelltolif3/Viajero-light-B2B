import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useSettingsStore } from '@/store/settingsStore';
import { Loader2, ShieldAlert, Menu, X, Phone, Globe2, HelpCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, isAdmin, isLoggingOut, isAuthenticating } = useAuth();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const primaryColor = settings?.branding?.primaryColor || "#E11D48";
  const secondaryColor = settings?.branding?.secondaryColor || "#1E293B";
  const companyName = settings?.branding?.companyName || "Viajero";
  const logo = settings?.branding?.logo || "";

  const navItems = [
    { label: 'Planes de Asistencia', href: '/planes', icon: Globe2 },
    { label: 'Mis Asistencias', href: '/mis-asistencias', icon: FileText },
    { label: 'Centro de Ayuda', href: '/ayuda', icon: HelpCircle },
    { label: 'Contacto', href: '/contacto', icon: Phone },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            {logo ? (
              <img src={logo} alt={companyName} className="h-8 w-auto" />
            ) : (
              <span className="font-bold text-xl text-primary">{companyName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Items */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Auth Status */}
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

          {/* User Menu or Login Button */}
          <div className="hidden md:block">
            {user && !isLoggingOut && !isAuthenticating ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span className="text-xs">Administrador</span>
                  </Badge>
                )}
                <UserMenu />
              </div>
            ) : !isLoggingOut && !isAuthenticating ? (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            ) : null}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <span className="font-semibold text-lg">{companyName}</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex flex-col space-y-4 mt-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth */}
                <div className="mt-auto pt-6">
                  {user && !isLoggingOut && !isAuthenticating ? (
                    <div className="space-y-4">
                      {isAdmin && (
                        <div className="px-2">
                          <Badge variant="secondary" className="w-full justify-center py-1">
                            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                            <span>Administrador</span>
                          </Badge>
                        </div>
                      )}
                      <UserMenu />
                    </div>
                  ) : !isLoggingOut && !isAuthenticating ? (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link to="/login">Iniciar Sesión</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}