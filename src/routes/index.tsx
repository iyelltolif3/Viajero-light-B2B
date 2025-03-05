import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Componente para rutas protegidas (requieren autenticación)
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Puedes crear un componente de loading más elaborado
  }

  if (!user) {
    // Guardamos la URL actual para redirigir después del login
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas de autenticación (solo accesibles sin autenticación)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    // Si hay un parámetro redirect en la URL, redirigimos ahí, sino al home
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirect') || '/';
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Index />} />
      
      {/* Rutas de autenticación */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />

      {/* Rutas protegidas */}
      <Route
        path="/checkout/*"
        element={
          <PrivateRoute>
            {/* Aquí irían los componentes relacionados con la compra */}
            <div>Proceso de compra (protegido)</div>
          </PrivateRoute>
        }
      />

      <Route
        path="/my-account/*"
        element={
          <PrivateRoute>
            {/* Aquí irían los componentes relacionados con la cuenta del usuario */}
            <div>Mi cuenta (protegido)</div>
          </PrivateRoute>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 