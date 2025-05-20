import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import { ExtendedUser, createUser, updateUserRole } from "@/services/userService";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDialogProps {
  initialData?: ExtendedUser;
  onComplete?: () => void;
}

export function UserDialog({ initialData, onComplete }: UserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(initialData?.role || "user");
  const { toast } = useToast();

  const isEditing = Boolean(initialData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateUserRole(initialData.id, role);
        toast({
          title: "Usuario actualizado",
          description: `El rol del usuario ha sido actualizado correctamente`,
        });
      } else {
        if (!email || !password) {
          toast({
            title: "Error",
            description: "Por favor complete todos los campos",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        await createUser(email, password, role);
        toast({
          title: "Usuario creado",
          description: `El usuario ${email} ha sido creado correctamente`,
        });
      }

      if (onComplete) {
        onComplete();
      }

      setOpen(false);
      if (!isEditing) {
        // Reset form fields only when creating new user
        setEmail("");
        setPassword("");
        setRole("user");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Ocurrió un error al procesar su solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "sm" : "default"}>
          {isEditing ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar usuario" : "Crear nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualice la información del usuario."
              : "Complete los campos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                disabled={isEditing}
              />
            </div>
            {!isEditing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as "admin" | "user")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
