import { useState, useEffect } from 'react';
import { Plan } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PlanFormProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<Plan>) => void;
  onSave?: (plan: Plan) => void;
}

export function PlanForm({ plan, isSelected, onSelect, onChange, onSave }: PlanFormProps) {
  const [features, setFeatures] = useState<string[]>(plan.features || []);
  const [newFeature, setNewFeature] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localPlan, setLocalPlan] = useState<Plan>(plan);
  
  // Actualizar el estado local cuando el plan cambia desde fuera
  useEffect(() => {
    setLocalPlan(plan);
  }, [plan]);

  // Función para aplicar cambios y marcar como modificado
  const handleChange = (updates: Partial<Plan>) => {
    const updatedPlan = { ...localPlan, ...updates };
    setLocalPlan(updatedPlan);
    setHasUnsavedChanges(true);
    onChange(updates);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      handleChange({ features: updatedFeatures });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    handleChange({ features: updatedFeatures });
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(localPlan);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
            >
              {isSelected ? <ChevronUp /> : <ChevronDown />}
            </Button>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-500 font-medium flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Cambios sin guardar
              </span>
            )}
            <Switch
              checked={localPlan.isActive}
              onCheckedChange={(checked) => handleChange({ isActive: checked })}
            />
          </div>
        </div>

        {isSelected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Plan</Label>
                <Input
                  id="name"
                  value={localPlan.name}
                  onChange={(e) => handleChange({ name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Etiqueta</Label>
                <Input
                  id="badge"
                  value={localPlan.badge}
                  onChange={(e) => handleChange({ badge: e.target.value })}
                  placeholder="Ej: Más Popular"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio Base</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={localPlan.basePrice}
                  onChange={(e) => handleChange({ basePrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceMultiplier">Multiplicador de Precio</Label>
                <Input
                  id="priceMultiplier"
                  type="number"
                  step="0.1"
                  value={localPlan.priceMultiplier}
                  onChange={(e) => handleChange({ priceMultiplier: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDays">Máximo de Días</Label>
                <Input
                  id="maxDays"
                  type="number"
                  value={localPlan.maxDays}
                  onChange={(e) => handleChange({ maxDays: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceDetail">Detalle de Precio</Label>
                <Input
                  id="priceDetail"
                  value={localPlan.priceDetail}
                  onChange={(e) => handleChange({ priceDetail: e.target.value })}
                  placeholder="Ej: por día / por persona"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={localPlan.description}
                onChange={(e) => handleChange({ description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Características</Label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={feature} disabled />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Nueva característica"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  />
                  <Button onClick={handleAddFeature}>Agregar</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Coberturas</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medical_coverage">Cobertura Médica</Label>
                  <Input
                    id="medical_coverage"
                    type="number"
                    value={localPlan.coverageDetails?.medicalCoverage || 0}
                    onChange={(e) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        medicalCoverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage_coverage">Cobertura de Equipaje</Label>
                  <Input
                    id="luggage_coverage"
                    type="number"
                    value={localPlan.coverageDetails?.luggageCoverage || 0}
                    onChange={(e) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        luggageCoverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_coverage">Cobertura de Cancelación</Label>
                  <Input
                    id="cancellation_coverage"
                    type="number"
                    value={localPlan.coverageDetails?.cancellationCoverage || 0}
                    onChange={(e) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        cancellationCoverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="covid_coverage"
                    checked={localPlan.coverageDetails?.covidCoverage}
                    onCheckedChange={(checked) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        covidCoverage: checked
                      }
                    })}
                  />
                  <Label htmlFor="covid_coverage">Cobertura COVID-19</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pre_existing_conditions"
                    checked={localPlan.coverageDetails?.preExistingConditions}
                    onCheckedChange={(checked) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        preExistingConditions: checked
                      }
                    })}
                  />
                  <Label htmlFor="pre_existing_conditions">Condiciones Preexistentes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="adventure_sports"
                    checked={localPlan.coverageDetails?.adventureSports}
                    onCheckedChange={(checked) => handleChange({
                      coverageDetails: {
                        ...localPlan.coverageDetails,
                        adventureSports: checked
                      }
                    })}
                  />
                  <Label htmlFor="adventure_sports">Deportes de Aventura</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {isSelected && (
        <CardFooter className="flex justify-between pt-4 border-t">
          {hasUnsavedChanges && (
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cambios sin guardar</AlertTitle>
              <AlertDescription>
                Tienes cambios sin guardar en este plan. Haz clic en "Guardar Cambios" para aplicarlos.
              </AlertDescription>
            </Alert>
          )}
          <div className="ml-auto">
            <Button 
              onClick={handleSave} 
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
