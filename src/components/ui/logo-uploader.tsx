import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { toast } from './use-toast';
import { Upload, X } from 'lucide-react';

interface LogoUploaderProps {
  currentLogo?: string;
  onLogoChange: (logo: string) => void;
}

export function LogoUploader({ currentLogo, onLogoChange }: LogoUploaderProps) {
  const [preview, setPreview] = useState<string>(currentLogo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato no válido",
        description: "Por favor, selecciona una imagen (PNG, JPG, SVG).",
        variant: "destructive"
      });
      return;
    }

    // Validar el tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 2MB.",
        variant: "destructive"
      });
      return;
    }

    // Convertir directamente a base64 sin validar dimensiones
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onLogoChange(base64String);
      
      toast({
        title: "Logo cargado",
        description: "La imagen del logo se ha cargado correctamente.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreview('');
    onLogoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Logo</Label>
        <div className="mt-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
          />
          <div className="flex items-center gap-4">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain rounded border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {preview ? 'Cambiar Logo' : 'Subir Logo'}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Formatos aceptados: PNG, JPG, SVG. Tamaño máximo: 2MB.
      </p>
    </div>
  );
} 