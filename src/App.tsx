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
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/layouts/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { fetchSettings } = useSettingsStore();
  const { fetchPlans } = usePlansStore();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

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
      }
    };

    loadInitialData();
  }, [fetchSettings, fetchPlans]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Si es una ruta de admin y el usuario es admin, usar AdminLayout
  if (isAdminRoute && isAdmin) {
    return (
      <AdminLayout>
        <AppRoutes />
      </AdminLayout>
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
