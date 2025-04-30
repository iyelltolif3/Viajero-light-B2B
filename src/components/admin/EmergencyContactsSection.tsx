import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSettings, EmergencyContact } from '@/types';
import { generateUUID } from '@/lib/utils';

interface EmergencyContactsSectionProps {
  settings: AdminSettings;
  onUpdate: (newSettings: Partial<AdminSettings>) => void;
}

export function EmergencyContactsSection({ settings, onUpdate }: EmergencyContactsSectionProps) {
  const handleAddContact = () => {
    const newContact: EmergencyContact = {
      id: generateUUID(),
      settings_id: settings.id || '',
      name: '',
      phone: '',
      email: '',
    };

    onUpdate({
      emergencyContacts: [...(settings.emergencyContacts || []), newContact],
    });
  };

  const handleDeleteContact = (index: number) => {
    const newContacts = [...settings.emergencyContacts];
    newContacts.splice(index, 1);
    onUpdate({ emergencyContacts: newContacts });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Contactos de Emergencia</h2>
        <Button onClick={handleAddContact}>Agregar Contacto</Button>
      </div>
      <div className="space-y-6">
        {settings.emergencyContacts.map((contact, index) => (
          <Card key={contact.id} className="p-4 border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...settings.emergencyContacts];
                    newContacts[index] = {
                      ...contact,
                      name: e.target.value,
                    };
                    onUpdate({ emergencyContacts: newContacts });
                  }}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...settings.emergencyContacts];
                    newContacts[index] = {
                      ...contact,
                      phone: e.target.value,
                    };
                    onUpdate({ emergencyContacts: newContacts });
                  }}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => {
                    const newContacts = [...settings.emergencyContacts];
                    newContacts[index] = {
                      ...contact,
                      email: e.target.value,
                    };
                    onUpdate({ emergencyContacts: newContacts });
                  }}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteContact(index)}
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
