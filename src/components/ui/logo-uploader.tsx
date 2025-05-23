import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { toast } from './use-toast';
import { Upload, X } from 'lucide-react';

interface LogoUploaderProps {
  currentLogo?: string;
  // Actualizada para aceptar un archivo o una URL string
  onLogoChange: (logo: File | string) => void;
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

    // Para la previsualización, convertimos a base64 localmente
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Generar previsualización en base64 solo para mostrar
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String); // Solo para previsualización local
      };
      reader.readAsDataURL(file);
      
      // Pasar el archivo original al componente padre
      onLogoChange(file);
    };

    img.src = objectUrl;
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