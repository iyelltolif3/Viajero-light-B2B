import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/Navbar';
import AppRoutes from '@/routes';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlansStore } from '@/store/plansStore';
import { useEffect, useState } from 'react';
import { PageLoadingScreen } from '@/components/ui/loading-screen';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { settings } = useSettingsStore();
  const { plans } = usePlansStore();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Simular una pequeña carga para mostrar la pantalla de carga
    // y verificar que los stores estén inicializados correctamente
    const timer = setTimeout(() => {
      if (settings && plans) {
        setIsReady(true);
      }
    }, 800); // Pequeño retraso para que la pantalla de carga sea visible
    
    return () => clearTimeout(timer);
  }, [settings, plans]);

  if (!isReady) {
    return (
      <PageLoadingScreen message="Inicializando aplicación..." />
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Solo mostrar el Navbar principal si no es una ruta de admin y el usuario no es admin */}
      {!isAdminRoute && !isAdmin && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="viajero-theme">
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
