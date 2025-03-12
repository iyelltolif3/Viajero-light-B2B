import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Save } from 'lucide-react';
import type { DiscountItem } from '@/types/content';
import { useToast } from '@/components/ui/use-toast';

export default function ContentSettings() {
  const { content, updateContent, initializeContent, saveContent } = useSettingsStore();
  const { toast } = useToast();
  const { discountSection } = content;

  useEffect(() => {
    initializeContent().catch(console.error);
  }, [initializeContent]);

  const handleSectionTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof discountSection
  ) => {
    updateContent({
      discountSection: {
        ...discountSection,
        [field]: e.target.value,
      },
    });
  };

  const handleDiscountChange = (
    id: string,
    field: keyof DiscountItem,
    value: string | boolean
  ) => {
    const updatedDiscounts = discountSection.discounts.map((discount) =>
      discount.id === id ? { ...discount, [field]: value } : discount
    );

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: updatedDiscounts,
      },
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(discountSection.discounts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: updatedItems,
      },
    });
  };

  const deleteDiscount = (id: string) => {
    const updatedDiscounts = discountSection.discounts.filter(
      (discount) => discount.id !== id
    );

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: updatedDiscounts,
      },
    });
  };

  const addNewDiscount = () => {
    const newDiscount: DiscountItem = {
      id: Date.now().toString(),
      title: "Nueva Oferta",
      description: "Descripción de la nueva oferta",
      discount: "10%",
      expiryDate: "Por definir",
      imageSrc: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80",
      active: true,
      order: discountSection.discounts.length + 1,
    };

    updateContent({
      discountSection: {
        ...discountSection,
        discounts: [...discountSection.discounts, newDiscount],
      },
    });
  };

  const handleSave = async () => {
    try {
      await saveContent();
      toast({
        title: "Cambios guardados",
        description: "Los cambios se han guardado correctamente en la base de datos.",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Hubo un error al guardar los cambios. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración de Contenido</h1>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="space-y-6">
        {/* Sección de Descuentos */}
        <Card>
          <CardHeader>
            <CardTitle>Sección de Descuentos</CardTitle>
            <CardDescription>
              Configura los textos y ofertas que aparecen en la sección de descuentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Textos principales */}
            <div className="space-y-4">
              <div>
                <Label>Título de la Sección</Label>
                <Input
                  value={discountSection.sectionTitle}
                  onChange={(e) => handleSectionTextChange(e, 'sectionTitle')}
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Textarea
                  value={discountSection.sectionSubtitle}
                  onChange={(e) => handleSectionTextChange(e, 'sectionSubtitle')}
                />
              </div>
              <div>
                <Label>Texto del Badge</Label>
                <Input
                  value={discountSection.badgeText}
                  onChange={(e) => handleSectionTextChange(e, 'badgeText')}
                />
              </div>
              <div>
                <Label>Texto del Botón "Ver Todas"</Label>
                <Input
                  value={discountSection.viewAllButtonText}
                  onChange={(e) => handleSectionTextChange(e, 'viewAllButtonText')}
                />
              </div>
            </div>

            {/* Lista de Descuentos */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ofertas</h3>
                <Button onClick={addNewDiscount}>Agregar Oferta</Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="discounts">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {discountSection.discounts.map((discount, index) => (
                        <Draggable
                          key={discount.id}
                          draggableId={discount.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border p-4"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-2 cursor-move"
                                >
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Input
                                      value={discount.title}
                                      onChange={(e) =>
                                        handleDiscountChange(
                                          discount.id,
                                          'title',
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                      placeholder="Título de la oferta"
                                    />
                                    <div className="flex items-center gap-4 ml-4">
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={discount.active}
                                          onCheckedChange={(checked) =>
                                            handleDiscountChange(
                                              discount.id,
                                              'active',
                                              checked
                                            )
                                          }
                                        />
                                        <Label>Activo</Label>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteDiscount(discount.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Textarea
                                    value={discount.description}
                                    onChange={(e) =>
                                      handleDiscountChange(
                                        discount.id,
                                        'description',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Descripción de la oferta"
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Descuento</Label>
                                      <Input
                                        value={discount.discount}
                                        onChange={(e) =>
                                          handleDiscountChange(
                                            discount.id,
                                            'discount',
                                            e.target.value
                                          )
                                        }
                                        placeholder="ej: 25%"
                                      />
                                    </div>
                                    <div>
                                      <Label>Fecha de Expiración</Label>
                                      <Input
                                        value={discount.expiryDate}
                                        onChange={(e) =>
                                          handleDiscountChange(
                                            discount.id,
                                            'expiryDate',
                                            e.target.value
                                          )
                                        }
                                        placeholder="ej: 31 de Diciembre, 2023"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>URL de la Imagen</Label>
                                    <Input
                                      value={discount.imageSrc}
                                      onChange={(e) =>
                                        handleDiscountChange(
                                          discount.id,
                                          'imageSrc',
                                          e.target.value
                                        )
                                      }
                                      placeholder="URL de la imagen"
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
