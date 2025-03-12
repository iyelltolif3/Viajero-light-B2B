import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  to: string;
}

function StatCard({ title, value, description, icon, to }: StatCardProps) {
  return (
    <Link to={to}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  // Mock data - replace with real API calls
  const stats = {
    activeAssistances: 156,
    totalUsers: 423,
    pendingSettings: 2,
    monthlyActivity: "+12.5%"
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Asistencias Activas"
          value={stats.activeAssistances}
          description="Total de asistencias vigentes"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          to="/admin/assistances"
        />
        
        <StatCard
          title="Usuarios Registrados"
          value={stats.totalUsers}
          description="Total de usuarios en la plataforma"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          to="/admin/users"
        />
        
        <StatCard
          title="Configuraciones Pendientes"
          value={stats.pendingSettings}
          description="Ajustes que requieren revisión"
          icon={<Settings className="h-4 w-4 text-muted-foreground" />}
          to="/admin/settings"
        />
        
        <StatCard
          title="Actividad Mensual"
          value={stats.monthlyActivity}
          description="Comparado al mes anterior"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          to="/admin/assistances"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestión de Asistencias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administra las asistencias activas, revisa el historial y gestiona solicitudes.
              </p>
              <Link 
                to="/admin/assistances"
                className="inline-block mt-4 text-sm text-primary hover:underline"
              >
                Ir a Asistencias →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administra usuarios, roles y permisos del sistema.
              </p>
              <Link 
                to="/admin/users"
                className="inline-block mt-4 text-sm text-primary hover:underline"
              >
                Ir a Usuarios →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajusta la configuración general, branding y parámetros del sistema.
              </p>
              <Link 
                to="/admin/settings"
                className="inline-block mt-4 text-sm text-primary hover:underline"
              >
                Ir a Configuración →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
