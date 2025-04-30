import { useState } from 'react';
import { Plan } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlanFormProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<Plan>) => void;
}

export function PlanForm({ plan, isSelected, onSelect, onChange }: PlanFormProps) {
  const [features, setFeatures] = useState<string[]>(plan.features || []);
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      onChange({ features: updatedFeatures });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    onChange({ features: updatedFeatures });
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
          <Switch
            checked={plan.isActive}
            onCheckedChange={(checked) => onChange({ isActive: checked })}
          />
        </div>

        {isSelected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Plan</Label>
                <Input
                  id="name"
                  value={plan.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Etiqueta</Label>
                <Input
                  id="badge"
                  value={plan.badge}
                  onChange={(e) => onChange({ badge: e.target.value })}
                  placeholder="Ej: Más Popular"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio Base</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={plan.basePrice}
                  onChange={(e) => onChange({ basePrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceMultiplier">Multiplicador de Precio</Label>
                <Input
                  id="priceMultiplier"
                  type="number"
                  step="0.1"
                  value={plan.priceMultiplier}
                  onChange={(e) => onChange({ priceMultiplier: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDays">Máximo de Días</Label>
                <Input
                  id="maxDays"
                  type="number"
                  value={plan.maxDays}
                  onChange={(e) => onChange({ maxDays: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceDetail">Detalle de Precio</Label>
                <Input
                  id="priceDetail"
                  value={plan.priceDetail}
                  onChange={(e) => onChange({ priceDetail: e.target.value })}
                  placeholder="Ej: por día / por persona"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={plan.description}
                onChange={(e) => onChange({ description: e.target.value })}
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
                    value={plan.coverageDetails?.medicalCoverage || 0}
                    onChange={(e) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
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
                    value={plan.coverageDetails?.luggageCoverage || 0}
                    onChange={(e) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
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
                    value={plan.coverageDetails?.cancellationCoverage || 0}
                    onChange={(e) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
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
                    checked={plan.coverageDetails?.covidCoverage}
                    onCheckedChange={(checked) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
                        covidCoverage: checked
                      }
                    })}
                  />
                  <Label htmlFor="covid_coverage">Cobertura COVID-19</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pre_existing_conditions"
                    checked={plan.coverageDetails?.preExistingConditions}
                    onCheckedChange={(checked) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
                        preExistingConditions: checked
                      }
                    })}
                  />
                  <Label htmlFor="pre_existing_conditions">Condiciones Preexistentes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="adventure_sports"
                    checked={plan.coverageDetails?.adventureSports}
                    onCheckedChange={(checked) => onChange({
                      coverageDetails: {
                        ...plan.coverageDetails,
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
    </Card>
  );
}
