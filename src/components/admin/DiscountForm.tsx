import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import type { AdminSettings } from '@/types';

interface DiscountItemProps {
  discount: {
    id: string;
    title: string;
    description: string;
    code: string;
    discountPercentage: number;
    validUntil: string;
    imageSrc?: string;
    active?: boolean;
  };
  index: number;
  localSettings: Partial<AdminSettings>;
  setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AdminSettings>>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  handleSave: () => Promise<void>;
}

export const DiscountItem: React.FC<DiscountItemProps> = ({
  discount,
  index,
  localSettings,
  setLocalSettings,
  setHasUnsavedChanges,
  handleSave
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar si es una imagen
    if (!file.type.match(/image.*/)) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Leer archivo como base64
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64String = ev.target?.result as string;
      if (base64String) {
        const updatedDiscounts = [...localSettings.content.discountSection.discounts];
        updatedDiscounts[index] = {
          ...updatedDiscounts[index],
          imageSrc: base64String
        };
        
        setLocalSettings(prev => ({
          ...prev,
          content: {
            ...prev.content,
            discountSection: {
              ...prev.content?.discountSection,
              discounts: updatedDiscounts
            }
          }
        }));
        setHasUnsavedChanges(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    const updatedDiscounts = [...localSettings.content.discountSection.discounts];
    updatedDiscounts[index] = {
      ...updatedDiscounts[index],
      [field]: value
    };
    
    setLocalSettings(prev => ({
      ...prev,
      content: {
        ...prev.content,
        discountSection: {
          ...prev.content?.discountSection,
          discounts: updatedDiscounts
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleDelete = () => {
    const updatedDiscounts = [...localSettings.content.discountSection.discounts];
    updatedDiscounts.splice(index, 1);
    
    setLocalSettings(prev => ({
      ...prev,
      content: {
        ...prev.content,
        discountSection: {
          ...prev.content?.discountSection,
          discounts: updatedDiscounts
        }
      }
    }));
    setHasUnsavedChanges(true);
    
    // Guardar inmediatamente los cambios
    setTimeout(() => {
      handleSave();
    }, 300);
  };

  return (
    <Card key={discount.id} className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{discount.title}</div>
          <div className="text-sm text-muted-foreground">{discount.description}</div>
          <div className="mt-2 text-sm">Código: <span className="font-mono bg-muted px-1 rounded">{discount.code}</span></div>
          <div className="text-sm">Descuento: {discount.discountPercentage}%</div>
          <div className="text-sm">Válido hasta: {discount.validUntil}</div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor={`discount-title-${index}`}>Título</Label>
          <Input
            id={`discount-title-${index}`}
            value={discount.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor={`discount-code-${index}`}>Código</Label>
          <Input
            id={`discount-code-${index}`}
            value={discount.code}
            onChange={(e) => handleChange('code', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor={`discount-percentage-${index}`}>Porcentaje</Label>
          <Input
            id={`discount-percentage-${index}`}
            type="number"
            value={discount.discountPercentage}
            onChange={(e) => handleChange('discountPercentage', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor={`discount-validUntil-${index}`}>Válido hasta</Label>
          <Input
            id={`discount-validUntil-${index}`}
            type="date"
            value={discount.validUntil}
            onChange={(e) => handleChange('validUntil', e.target.value)}
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor={`discount-description-${index}`}>Descripción</Label>
          <Textarea
            id={`discount-description-${index}`}
            value={discount.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
        
        <div className="col-span-2">
          <Label>Imagen del Descuento</Label>
          <div className="flex flex-col space-y-2">
            {discount.imageSrc && (
              <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden mb-2">
                <img 
                  src={discount.imageSrc} 
                  alt={discount.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              id={`discount-image-${index}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground">Sube una imagen o ingresa una URL</p>
            <Input
              id={`discount-image-url-${index}`}
              placeholder="URL o código base64 de la imagen"
              value={discount.imageSrc || ''}
              onChange={(e) => handleChange('imageSrc', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="col-span-2">
          <Label htmlFor={`discount-active-${index}`} className="flex items-center space-x-2 cursor-pointer">
            <Switch
              id={`discount-active-${index}`}
              checked={discount.active}
              onCheckedChange={(checked) => handleChange('active', checked)}
            />
            <span>Activo</span>
          </Label>
        </div>
      </div>
    </Card>
  );
};

export default DiscountItem;
