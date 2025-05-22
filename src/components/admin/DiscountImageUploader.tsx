import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DiscountImageUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  initialImage?: string;
  onImageUploaded?: (value: string) => void;
  className?: string;
}

export function DiscountImageUploader({ 
  value, 
  onChange, 
  initialImage, 
  onImageUploaded, 
  className 
}: DiscountImageUploaderProps) {
  // Usar initialImage si está disponible, de lo contrario usar value
  const imageValue = value || initialImage || '';  
  // Usar onChange si está disponible, de lo contrario usar onImageUploaded
  const handleChange = onChange || onImageUploaded || (() => {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar los 2MB');
      return;
    }
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convertir la imagen a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange(base64String);
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('Error al procesar la imagen');
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al cargar la imagen');
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    handleChange('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Imagen del descuento</Label>
      
      {imageValue ? (
        <div className="relative">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-input bg-background">
            <img 
              src={imageValue} 
              alt="Vista previa del descuento" 
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-[16/9] rounded-md border border-dashed border-input bg-background p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
            </div>
            <div className="text-xs text-muted-foreground">
              PNG, JPG o GIF (max. 2MB)
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}
      
      {loading && <p className="text-sm text-muted-foreground">Procesando imagen...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
