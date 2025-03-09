import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipo para los vouchers
interface Voucher {
  id: string;
  policyNumber: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending';
  travelers: number;
}

export default function Vouchers() {
  // Simulación de datos de vouchers
  const [vouchers] = useState<Voucher[]>([
    {
      id: '1',
      policyNumber: 'POL-2024-001',
      destination: 'Europa',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-15'),
      status: 'active',
      travelers: 2,
    },
    {
      id: '2',
      policyNumber: 'POL-2024-002',
      destination: 'Estados Unidos',
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-05-20'),
      status: 'pending',
      travelers: 1,
    },
  ]);

  const getStatusBadge = (status: Voucher['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    const labels = {
      active: 'Activo',
      expired: 'Expirado',
      pending: 'Pendiente',
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Mis Vouchers</CardTitle>
          <CardDescription>
            Gestiona tus vouchers de asistencia en viaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-4 md:space-y-0"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">Póliza: {voucher.policyNumber}</h3>
                    {getStatusBadge(voucher.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {voucher.destination} • {voucher.travelers} {voucher.travelers === 1 ? 'viajero' : 'viajeros'}
                  </p>
                  <p className="text-sm">
                    {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                  </p>
                </div>
                
                <div className="flex space-x-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </div>
            ))}

            {vouchers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No tienes vouchers activos en este momento.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 