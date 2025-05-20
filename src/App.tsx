import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AppRoutes from '@/routes';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlansStore } from '@/store/plansStore';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingScreen } from '@/components/ui/loading-screen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { fetchSettings, isLoading: settingsLoading } = useSettingsStore();
  const { fetchPlans, is_loading: plansLoading } = usePlansStore();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const location = useLocation();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Cargar los datos iniciales
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchSettings(),
          fetchPlans()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        // Retraso para asegurar que el splash sea visible por al menos 2 segundos
        setTimeout(() => {
          setInitialLoading(false);
        }, 2000);
      }
    };

    loadInitialData();
  }, [fetchSettings, fetchPlans]);

  // Mostrar el splash screen durante la carga inicial
  if (initialLoading || authLoading) {
    return <LoadingScreen message="Preparando tu viaje..." />;
  }

  // Todas las rutas, tanto de admin como de cliente, usan sus propios layouts
  // Verificar si estamos en la ruta de admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Para rutas de admin, no mostrar Navbar ni Footer 
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <AppRoutes />
        </main>
      </div>
    );
  }
  
  // Para rutas de cliente
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
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
