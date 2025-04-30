import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSettings, AgeRange } from '@/types';
import { generateUUID } from '@/lib/utils';

interface AgeRangesSectionProps {
  settings: AdminSettings;
  onUpdate: (newSettings: Partial<AdminSettings>) => void;
}

export function AgeRangesSection({ settings, onUpdate }: AgeRangesSectionProps) {
  const handleAddAgeRange = () => {
    const newAgeRange: AgeRange = {
      id: generateUUID(),
      settings_id: settings.id || '',
      name: '',
      min_age: 0,
      max_age: 0,
      price_multiplier: 1,
    };

    onUpdate({
      ageRanges: [...(settings.ageRanges || []), newAgeRange],
    });
  };

  const handleDeleteAgeRange = (index: number) => {
    const newAgeRanges = [...settings.ageRanges];
    newAgeRanges.splice(index, 1);
    onUpdate({ ageRanges: newAgeRanges });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Rangos de Edad</h2>
        <Button onClick={handleAddAgeRange}>Agregar Rango</Button>
      </div>
      <div className="space-y-6">
        {settings.ageRanges.map((ageRange, index) => (
          <Card key={ageRange.id} className="p-4 border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={ageRange.name}
                  onChange={(e) => {
                    const newAgeRanges = [...settings.ageRanges];
                    newAgeRanges[index] = {
                      ...ageRange,
                      name: e.target.value,
                    };
                    onUpdate({ ageRanges: newAgeRanges });
                  }}
                />
              </div>
              <div>
                <Label>Edad mínima</Label>
                <Input
                  type="number"
                  min={0}
                  value={ageRange.min_age}
                  onChange={(e) => {
                    const newAgeRanges = [...settings.ageRanges];
                    newAgeRanges[index] = {
                      ...ageRange,
                      min_age: parseInt(e.target.value) || 0,
                    };
                    onUpdate({ ageRanges: newAgeRanges });
                  }}
                />
              </div>
              <div>
                <Label>Edad máxima</Label>
                <Input
                  type="number"
                  min={0}
                  value={ageRange.max_age}
                  onChange={(e) => {
                    const newAgeRanges = [...settings.ageRanges];
                    newAgeRanges[index] = {
                      ...ageRange,
                      max_age: parseInt(e.target.value) || 0,
                    };
                    onUpdate({ ageRanges: newAgeRanges });
                  }}
                />
              </div>
              <div>
                <Label>Multiplicador de precio</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={ageRange.price_multiplier}
                  onChange={(e) => {
                    const newAgeRanges = [...settings.ageRanges];
                    newAgeRanges[index] = {
                      ...ageRange,
                      price_multiplier: parseFloat(e.target.value) || 0,
                    };
                    onUpdate({ ageRanges: newAgeRanges });
                  }}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteAgeRange(index)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
