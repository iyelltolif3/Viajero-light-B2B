import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSettings, Zone } from '@/types';
import { generateUUID } from '@/lib/utils';

interface ZonesSectionProps {
  settings: AdminSettings;
  onUpdate: (newSettings: Partial<AdminSettings>) => void;
}

export function ZonesSection({ settings, onUpdate }: ZonesSectionProps) {
  const handleAddZone = () => {
    const newZone: Zone = {
      id: generateUUID(),
      settings_id: settings.id || '',
      name: '',
      description: '',
      countries: [],
      price_multiplier: 1,
    };

    onUpdate({
      zones: [...(settings.zones || []), newZone],
    });
  };

  const handleDeleteZone = (index: number) => {
    const newZones = [...settings.zones];
    newZones.splice(index, 1);
    onUpdate({ zones: newZones });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Zonas</h2>
        <Button onClick={handleAddZone}>Agregar Zona</Button>
      </div>
      <div className="space-y-6">
        {settings.zones.map((zone, index) => (
          <Card key={zone.id} className="p-4 border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={zone.name}
                  onChange={(e) => {
                    const newZones = [...settings.zones];
                    newZones[index] = {
                      ...zone,
                      name: e.target.value,
                    };
                    onUpdate({ zones: newZones });
                  }}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  value={zone.description}
                  onChange={(e) => {
                    const newZones = [...settings.zones];
                    newZones[index] = {
                      ...zone,
                      description: e.target.value,
                    };
                    onUpdate({ zones: newZones });
                  }}
                />
              </div>
              <div>
                <Label>Multiplicador de precio</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={zone.price_multiplier}
                  onChange={(e) => {
                    const newZones = [...settings.zones];
                    newZones[index] = {
                      ...zone,
                      price_multiplier: parseFloat(e.target.value) || 0,
                    };
                    onUpdate({ zones: newZones });
                  }}
                />
              </div>
              <div>
                <Label>Países (separados por coma)</Label>
                <Input
                  value={zone.countries.join(', ')}
                  onChange={(e) => {
                    const newZones = [...settings.zones];
                    newZones[index] = {
                      ...zone,
                      countries: e.target.value.split(',').map(c => c.trim()),
                    };
                    onUpdate({ zones: newZones });
                  }}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteZone(index)}
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
