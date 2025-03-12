import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Shield, User } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'user';
  lastLogin: string;
  status: 'active' | 'inactive';
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const users: UserData[] = [
    {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      lastLogin: '2024-03-11T20:00:00',
      status: 'active'
    },
    {
      id: '2',
      email: 'user@example.com',
      role: 'user',
      lastLogin: '2024-03-10T15:30:00',
      status: 'active'
    }
  ];

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Último Acceso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="flex w-fit items-center gap-1">
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.lastLogin).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Users;
