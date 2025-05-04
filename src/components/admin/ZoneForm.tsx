import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Zone } from '@/types';
import { AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ZoneFormProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<Zone>) => void;
  onSave: (zone: Zone) => void;
  onDelete: (zoneId: string) => void;
}

export function ZoneForm({
  zone,
  isSelected,
  onSelect,
  onChange,
  onSave,
  onDelete,
}: ZoneFormProps) {
  // Simplificamos para usar un estado local directo para los cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cuando se detecta cualquier cambio en el componente
  // Marcar como que hay cambios sin guardar
  const markAsChanged = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    console.log('Guardando zona:', zone);
    onSave(zone);
    
    // Resetear el estado de cambios sin guardar
    setHasUnsavedChanges(false);
    
    console.log('Cambios guardados exitosamente');
  };

  const handleAddCountry = () => {
    onChange({
      countries: [...zone.countries, '']
    });
    markAsChanged();
  };

  const handleUpdateCountry = (index: number, value: string) => {
    const newCountries = [...zone.countries];
    newCountries[index] = value;
    onChange({ countries: newCountries });
    markAsChanged();
  };

  const handleRemoveCountry = (index: number) => {
    const newCountries = zone.countries.filter((_, i) => i !== index);
    onChange({ countries: newCountries });
    markAsChanged();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="cursor-pointer" onClick={onSelect}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {zone.name || 'Nueva Zona'}
            {hasUnsavedChanges && (
              <span className="ml-2 text-sm font-normal text-destructive">
                (Cambios sin guardar)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center">
            <Select 
              value={zone.isActive ? "active" : "inactive"}
              onValueChange={(value) => onChange({ isActive: value === "active" })}
            >
              <SelectTrigger className="w-[140px] mr-4">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform ${isSelected ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>

      {isSelected && (
        <>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`zone-name-${zone.id}`}>Nombre de la Zona</Label>
                <Input
                  id={`zone-name-${zone.id}`}
                  value={zone.name || ''}
                  onChange={(e) => {
                    onChange({ name: e.target.value });
                    markAsChanged();
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`zone-multiplier-${zone.id}`}>Multiplicador de Precio</Label>
                <Input
                  id={`zone-multiplier-${zone.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={zone.priceMultiplier || 1}
                  onChange={(e) => {
                    onChange({ priceMultiplier: parseFloat(e.target.value) });
                    markAsChanged();
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`zone-risk-${zone.id}`}>Nivel de Riesgo</Label>
              <Select
                value={zone.riskLevel || 'low'}
                onValueChange={(value: 'low' | 'medium' | 'high') => {
                  onChange({ riskLevel: value });
                  markAsChanged();
                }}
              >
                <SelectTrigger id={`zone-risk-${zone.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Países</Label>
              <div className="space-y-2 mt-2">
                {zone.countries.map((country, countryIndex) => (
                  <div key={countryIndex} className="flex gap-2">
                    <Input
                      value={country || ''}
                      onChange={(e) => handleUpdateCountry(countryIndex, e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveCountry(countryIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddCountry}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar País
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-4 border-t">
            {hasUnsavedChanges && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cambios sin guardar</AlertTitle>
                <AlertDescription>
                  Has realizado cambios en esta zona que aún no se han guardado.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-2 ml-auto">
              {showDeleteConfirm ? (
                <div className="flex space-x-2">
                  <p className="text-destructive text-sm font-medium mr-2">¿Estás seguro?</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      onDelete(zone.id);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    Sí, eliminar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Zona
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!hasUnsavedChanges}
              >
                Guardar Cambios
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
