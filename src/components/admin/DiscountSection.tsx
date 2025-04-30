import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { useSettingsStore } from '@/store/settingsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateUUID } from '@/lib/utils';
import type { DiscountItem } from '@/types/content';

export function DiscountSection() {
  const { content, updateContent } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');

  const discountSection = content?.discountSection || {
    sectionTitle: '',
    sectionSubtitle: '',
    badgeText: '',
    viewAllButtonText: '',
    discounts: []
  };

  const handleSectionUpdate = (field: string, value: string) => {
    updateContent({
      discountSection: {
        ...discountSection,
        [field]: value
      }
    });
  };

  const addNewDiscount = () => {
    const newDiscount: DiscountItem = {
      id: generateUUID(),
      title: "Nueva Oferta",
      description: "Descripción de la nueva oferta",
      discount: 10, // Mantenemos por compatibilidad
      discountPercentage: 10, // Agregamos el campo requerido
      code: "NEWDISCOUNT",
      expiryDate: new Date().toISOString(),
      imageSrc: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80",
      active: true,
      order: discountSection.discounts.length + 1,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: [...discountSection.discounts, newDiscount]
      }
    });
  };

  const updateDiscount = (id: string, updates: Partial<DiscountItem>) => {
    const updatedDiscounts = discountSection.discounts.map(discount =>
      discount.id === id ? { ...discount, ...updates } : discount
    );

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: updatedDiscounts
      }
    });
  };

  const deleteDiscount = (id: string) => {
    const updatedDiscounts = discountSection.discounts.filter(discount => discount.id !== id);
    
    updateContent({
      discountSection: {
        ...discountSection,
        discounts: updatedDiscounts
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="discounts">Descuentos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración General</h2>
            <div className="space-y-4">
              <div>
                <Label>Título de la sección</Label>
                <Input
                  value={discountSection.sectionTitle}
                  onChange={(e) => handleSectionUpdate('sectionTitle', e.target.value)}
                  placeholder="Ej: Descuentos Especiales"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={discountSection.sectionSubtitle}
                  onChange={(e) => handleSectionUpdate('sectionSubtitle', e.target.value)}
                  placeholder="Ej: Aprovecha nuestras ofertas exclusivas"
                />
              </div>
              <div>
                <Label>Texto de la insignia</Label>
                <Input
                  value={discountSection.badgeText}
                  onChange={(e) => handleSectionUpdate('badgeText', e.target.value)}
                  placeholder="Ej: Oferta"
                />
              </div>
              <div>
                <Label>Texto del botón Ver Todos</Label>
                <Input
                  value={discountSection.viewAllButtonText}
                  onChange={(e) => handleSectionUpdate('viewAllButtonText', e.target.value)}
                  placeholder="Ej: Ver todas las ofertas"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Descuentos</h2>
              <Button onClick={addNewDiscount}>Agregar Descuento</Button>
            </div>
            <div className="space-y-6">
              {discountSection.discounts.map((discount) => (
                <Card key={discount.id} className="p-4 border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={discount.title}
                        onChange={(e) => updateDiscount(discount.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Código</Label>
                      <Input
                        value={discount.code}
                        onChange={(e) => updateDiscount(discount.id, { code: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={discount.description}
                        onChange={(e) => updateDiscount(discount.id, { description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>URL de la imagen</Label>
                      <Input
                        value={discount.imageSrc}
                        onChange={(e) => updateDiscount(discount.id, { imageSrc: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descuento (%)</Label>
                      <Input
                        type="number"
                        value={discount.discount}
                        onChange={(e) => updateDiscount(discount.id, { discount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Válido hasta</Label>
                      <DatePicker
                        date={new Date(discount.validUntil)}
                        onSelect={(date) => updateDiscount(discount.id, { validUntil: date.toISOString() })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={discount.active}
                        onCheckedChange={(checked) => updateDiscount(discount.id, { active: checked })}
                      />
                      <Label>Activo</Label>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        onClick={() => deleteDiscount(discount.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
