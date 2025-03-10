import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Assistance {
  id: string;
  planName: string;
  status: 'active' | 'expired' | 'future';
  startDate: string;
  endDate: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
  }[];
  totalPrice: number;
}

const mockAssistances: Assistance[] = [
  {
    id: '1',
    planName: 'Plan Básico',
    status: 'active',
    startDate: '2024-03-15',
    endDate: '2024-03-30',
    travelers: [
      { name: 'Juan Pérez', age: 35, passport: 'AB123456' }
    ],
    totalPrice: 74.85
  },
  {
    id: '2',
    planName: 'Plan Premium',
    status: 'future',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    travelers: [
      { name: 'María González', age: 28, passport: 'CD789012' },
      { name: 'Carlos González', age: 30, passport: 'EF345678' }
    ],
    totalPrice: 239.70
  }
];

export default function Assistances() {
  const [filter, setFilter] = useState({
    status: '',
    dateRange: '',
    search: ''
  });

  const columns: ColumnDef<Assistance>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'planName',
      header: 'Plan',
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={
              status === 'active' ? 'default' :
              status === 'expired' ? 'destructive' :
              'secondary'
            }
          >
            {status === 'active' ? 'Activa' :
             status === 'expired' ? 'Expirada' :
             'Futura'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'startDate',
      header: 'Fecha Inicio',
      cell: ({ row }) => {
        const date = new Date(row.getValue('startDate'));
        return format(date, 'dd MMM yyyy', { locale: es });
      }
    },
    {
      accessorKey: 'endDate',
      header: 'Fecha Fin',
      cell: ({ row }) => {
        const date = new Date(row.getValue('endDate'));
        return format(date, 'dd MMM yyyy', { locale: es });
      }
    },
    {
      accessorKey: 'travelers',
      header: 'Viajeros',
      cell: ({ row }) => {
        const travelers = row.getValue('travelers') as Assistance['travelers'];
        return travelers.map(t => t.name).join(', ');
      }
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalPrice'));
        return `$${amount.toFixed(2)}`;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              // Implementar vista detallada
              console.log('Ver detalles de:', row.original);
            }}
          >
            Ver Detalles
          </Button>
        );
      }
    }
  ];

  const filteredAssistances = mockAssistances.filter(assistance => {
    if (filter.status && assistance.status !== filter.status) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        assistance.planName.toLowerCase().includes(searchLower) ||
        assistance.travelers.some(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.passport.toLowerCase().includes(searchLower)
        )
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Asistencias</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las asistencias de viaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Estado</Label>
              <Select
                value={filter.status}
                onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="future">Futuras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rango de Fechas</Label>
              <Select
                value={filter.dateRange}
                onValueChange={(value) => setFilter(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por nombre, plan o pasaporte..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredAssistances}
          />
        </CardContent>
      </Card>
    </div>
  );
} 