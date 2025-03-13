import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlansStore } from '@/store/plansStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { error: settingsError } = useSettingsStore();
  const { error: plansError } = usePlansStore();

  // Redirigir a usuarios no admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar />
      
      {/* Banner de advertencia para administradores */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-700">
        <div className="container mx-auto py-2 px-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Estás en el panel de administración. Ten cuidado con los cambios que realices.
          </p>
        </div>
      </div>

      {/* Mostrar errores de carga si existen */}
      {(settingsError || plansError) && (
        <div className="container mx-auto py-4 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {settingsError || plansError}. Los cambios que realices podrían no guardarse correctamente.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
