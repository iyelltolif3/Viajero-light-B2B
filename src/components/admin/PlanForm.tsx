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
            checked={plan.is_active}
            onCheckedChange={(checked) => onChange({ is_active: checked })}
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
                <Label htmlFor="price">Precio Base</Label>
                <Input
                  id="price"
                  type="number"
                  value={plan.base_price}
                  onChange={(e) => onChange({ base_price: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_multiplier">Multiplicador de Precio</Label>
                <Input
                  id="price_multiplier"
                  type="number"
                  step="0.1"
                  value={plan.price_multiplier}
                  onChange={(e) => onChange({ price_multiplier: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_days">Días Máximos</Label>
                <Input
                  id="max_days"
                  type="number"
                  value={plan.max_days}
                  onChange={(e) => onChange({ max_days: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_detail">Detalle de Precio</Label>
                <Input
                  id="price_detail"
                  value={plan.price_detail}
                  onChange={(e) => onChange({ price_detail: e.target.value })}
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
                    value={plan.coverage_details.medical_coverage}
                    onChange={(e) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        medical_coverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage_coverage">Cobertura de Equipaje</Label>
                  <Input
                    id="luggage_coverage"
                    type="number"
                    value={plan.coverage_details.luggage_coverage}
                    onChange={(e) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        luggage_coverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_coverage">Cobertura de Cancelación</Label>
                  <Input
                    id="cancellation_coverage"
                    type="number"
                    value={plan.coverage_details.cancellation_coverage}
                    onChange={(e) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        cancellation_coverage: Number(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="covid_coverage"
                    checked={plan.coverage_details.covid_coverage}
                    onCheckedChange={(checked) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        covid_coverage: checked
                      }
                    })}
                  />
                  <Label htmlFor="covid_coverage">Cobertura COVID-19</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pre_existing_conditions"
                    checked={plan.coverage_details.pre_existing_conditions}
                    onCheckedChange={(checked) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        pre_existing_conditions: checked
                      }
                    })}
                  />
                  <Label htmlFor="pre_existing_conditions">Condiciones Preexistentes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="adventure_sports"
                    checked={plan.coverage_details.adventure_sports}
                    onCheckedChange={(checked) => onChange({
                      coverage_details: {
                        ...plan.coverage_details,
                        adventure_sports: checked
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
