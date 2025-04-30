import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import { AdminLayout as AdminLayoutMain } from '@/layouts/AdminLayout';
// Nota: Usamos AdminLayoutMain que contiene solo la barra 'Panel Admin'

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
        <Route path="/admin" element={<AdminLayoutMain />}>
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