import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssistancesStore } from '@/store/assistancesStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function Vouchers() {
  const { assistances } = useAssistancesStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Activa</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirada</Badge>;
      case 'future':
        return <Badge variant="secondary">Futura</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Mis Asistencias de Viaje</CardTitle>
          <CardDescription>
            Visualiza y descarga tus vouchers de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistances.map((assistance) => (
              <Card key={assistance.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{assistance.planName}</CardTitle>
                      <CardDescription>
                        {assistance.destination.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(assistance.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Fechas</div>
                      <div className="font-medium">
                        {formatDate(assistance.startDate)} - {formatDate(assistance.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Viajeros</div>
                      <div className="font-medium">
                        {assistance.travelers.map(t => t.name).join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="font-medium">
                        ${assistance.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="w-full" onClick={() => {
                        // Implementar vista detallada
                        console.log('Ver detalles:', assistance);
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // Implementar descarga de voucher
                        console.log('Descargar voucher:', assistance);
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 