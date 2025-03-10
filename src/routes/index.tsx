import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Páginas existentes - usando los nombres correctos
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile'; 
import Vouchers from '@/pages/Vouchers';
import Planes from '@/pages/Planes';
import Checkout from '@/pages/Checkout';
import AdminSettings from '@/pages/admin/Settings';
import Assistances from '@/pages/admin/Assistances';
import CheckoutRedesigned from '@/pages/checkout-redesigned';

// Protección de rutas
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

// Contenedor de carga
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-25" /> 
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin" />
        </div>
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout-new" element={<CheckoutRedesigned />} />
        
        {/* Rutas privadas */}
        <Route 
          path="/my-account/profile" 
          element={<PrivateRoute><Profile /></PrivateRoute>} 
        />
        <Route 
          path="/my-account/vouchers" 
          element={<PrivateRoute><Vouchers /></PrivateRoute>} 
        />
        
        {/* Rutas de administrador */}
        <Route 
          path="/admin/settings" 
          element={<AdminRoute><AdminSettings /></AdminRoute>} 
        />
        <Route 
          path="/admin/assistances" 
          element={<AdminRoute><Assistances /></AdminRoute>} 
        />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
} 