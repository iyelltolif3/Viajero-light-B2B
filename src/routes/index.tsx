import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoadingScreen } from '@/components/ui/loading-screen';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';

// Pages
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile'; 
import Vouchers from '@/pages/Vouchers';
import Planes from '@/pages/Planes';
import Checkout from '@/pages/Checkout';
import { Dashboard, Settings, Users, Assistances, ContentSettings } from '@/pages/admin';
import CheckoutRedesigned from '@/pages/checkout-redesigned';

// Protección de rutas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Prevent admin users from accessing client routes
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
}

// Contenedor de carga
function LoadingPage() {
  // Utilizamos el componente LoadingScreen que ahora tiene la animación de maleta
  return <PageLoadingScreen message="Preparando tu viaje..." />;
}

export default function AppRoutes() {
  return (
    <React.Suspense fallback={<LoadingPage />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de checkout */}
        <Route 
          path="/checkout" 
          element={<PrivateRoute><Checkout /></PrivateRoute>} 
        />
        <Route 
          path="/checkout-new" 
          element={<PrivateRoute><CheckoutRedesigned /></PrivateRoute>} 
        />
        
        {/* Rutas privadas de cliente */}
        <Route 
          path="/my-account/profile" 
          element={<PrivateRoute><Profile /></PrivateRoute>} 
        />
        <Route 
          path="/my-account/vouchers" 
          element={<PrivateRoute><Vouchers /></PrivateRoute>} 
        />
        
        {/* Rutas de administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="assistances" element={<Assistances />} />
          <Route path="content" element={<ContentSettings />} />
        </Route>
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
}