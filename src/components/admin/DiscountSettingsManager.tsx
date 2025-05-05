import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useContentStore } from '@/store/contentStore';
import { DiscountImageUploader } from './DiscountImageUploader';
import { useToast } from '@/components/ui/use-toast';
import { GripVertical, Trash2, Plus, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import type { DiscountItem } from '@/types/content';

export default function DiscountSettingsManager() {
  const { content, updateContent, initializeContent, saveContent, hasUnsavedChanges } = useContentStore();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        await initializeContent();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error al cargar el contenido:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la configuración de descuentos',
          variant: 'destructive',
        });
      }
    };

    if (!isInitialized) {
      loadContent();
    }
  }, [initializeContent, isInitialized, toast]);

  const handleSectionTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    updateContent({
      discountSection: {
        ...content.discountSection,
        [field]: e.target.value,
      },
    });
  };

  const handleDiscountChange = (
    id: string,
    field: keyof DiscountItem,
    value: string | number | boolean
  ) => {
    const updatedDiscounts = content.discountSection.discounts.map((discount) =>
      discount.id === id ? { ...discount, [field]: value } : discount
    );

    updateContent({
      discountSection: {
        ...content.discountSection,
        discounts: updatedDiscounts,
      },
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(content.discountSection.discounts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    updateContent({
      discountSection: {
        ...content.discountSection,
        discounts: updatedItems,
      },
    });
  };

  const deleteDiscount = (id: string) => {
    const updatedDiscounts = content.discountSection.discounts.filter(
      (discount) => discount.id !== id
    );

    updateContent({
      discountSection: {
        ...content.discountSection,
        discounts: updatedDiscounts,
      },
    });
  };

  const addNewDiscount = () => {
    const newDiscount: DiscountItem = {
      id: Date.now().toString(),
      title: 'Nuevo Descuento',
      description: 'Descripción del nuevo descuento',
      code: `DESC${Math.floor(Math.random() * 10000)}`,
      discountPercentage: 10,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true, // Por defecto está activo
      order: (content.discountSection.discounts.length || 0) + 1,
    };

    updateContent({
      discountSection: {
        ...content.discountSection,
        discounts: [...content.discountSection.discounts, newDiscount],
      },
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveContent();
      
      // Una vez guardado exitosamente, refrescar los datos
      // Esto ayuda a mantener los datos sincronizados entre componentes
      setTimeout(() => {
        initializeContent();
      }, 500);
      
      toast({
        title: "Cambios guardados",
        description: "Los descuentos han sido actualizados con éxito."
      });
    } catch (error) {
      console.error('Error al guardar los descuentos:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para actualizar la imagen del descuento
  const handleImageUpload = (id: string, base64Image: string) => {
    handleDiscountChange(id, 'imageSrc', base64Image);
  };

  // Convertir fecha string a objeto Date para el DatePicker
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  // Ordenar descuentos por el campo 'order'
  const sortedDiscounts = [...content.discountSection.discounts].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Cargando configuración de descuentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestión de Descuentos</CardTitle>
        <CardDescription>
          Administra los descuentos y ofertas que se mostrarán en la página principal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sección de configuración general */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sectionTitle">Título de la Sección</Label>
              <Input
                id="sectionTitle"
                value={content.discountSection.sectionTitle}
                onChange={(e) => handleSectionTextChange(e, 'sectionTitle')}
              />
            </div>
            <div>
              <Label htmlFor="sectionSubtitle">Subtítulo de la Sección</Label>
              <Input
                id="sectionSubtitle"
                value={content.discountSection.sectionSubtitle}
                onChange={(e) => handleSectionTextChange(e, 'sectionSubtitle')}
              />
            </div>
            <div>
              <Label htmlFor="badgeText">Texto de la Insignia</Label>
              <Input
                id="badgeText"
                value={content.discountSection.badgeText}
                onChange={(e) => handleSectionTextChange(e, 'badgeText')}
              />
            </div>
            <div>
              <Label htmlFor="viewAllButtonText">Texto del Botón "Ver Todo"</Label>
              <Input
                id="viewAllButtonText"
                value={content.discountSection.viewAllButtonText}
                onChange={(e) => handleSectionTextChange(e, 'viewAllButtonText')}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Lista de descuentos con arrastrar y soltar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Descuentos Disponibles</h3>
            <Button onClick={addNewDiscount} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Descuento
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="discounts">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {sortedDiscounts.map((discount, index) => (
                    <Draggable
                      key={discount.id}
                      draggableId={discount.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border border-gray-200"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move p-1"
                                >
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                <CardTitle className="text-lg">{discount.title}</CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`discount-active-${index}`}
                                    checked={discount.active !== false} // Si active es undefined, considerarlo como true
                                    onCheckedChange={(checked) =>
                                      handleDiscountChange(discount.id, 'active', checked)
                                    }
                                  />
                                  <Label htmlFor={`discount-active-${index}`} className="text-sm">
                                    Activo
                                  </Label>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteDiscount(discount.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`title-${discount.id}`}>Título</Label>
                                <Input
                                  id={`title-${discount.id}`}
                                  value={discount.title}
                                  onChange={(e) =>
                                    handleDiscountChange(discount.id, 'title', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`code-${discount.id}`}>Código de Descuento</Label>
                                <Input
                                  id={`code-${discount.id}`}
                                  value={discount.code}
                                  onChange={(e) =>
                                    handleDiscountChange(discount.id, 'code', e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`percentage-${discount.id}`}>Porcentaje (%)</Label>
                                <Input
                                  id={`percentage-${discount.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={discount.discountPercentage}
                                  onChange={(e) =>
                                    handleDiscountChange(
                                      discount.id,
                                      'discountPercentage',
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`validUntil-${discount.id}`}>Válido hasta</Label>
                                <div className="flex w-full">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {discount.validUntil
                                          ? format(parseDate(discount.validUntil), 'dd/MM/yyyy', { locale: es })
                                          : 'Seleccionar fecha'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarComponent
                                        mode="single"
                                        selected={parseDate(discount.validUntil)}
                                        onSelect={(date) =>
                                          handleDiscountChange(
                                            discount.id,
                                            'validUntil',
                                            date ? date.toISOString().split('T')[0] : ''
                                          )
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                <Label htmlFor={`description-${discount.id}`}>Descripción</Label>
                                <Textarea
                                  id={`description-${discount.id}`}
                                  value={discount.description}
                                  onChange={(e) =>
                                    handleDiscountChange(discount.id, 'description', e.target.value)
                                  }
                                  rows={2}
                                />
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                <Label htmlFor={`image-${discount.id}`}>Imagen del Descuento</Label>
                                <div className="mt-2">
                                  <DiscountImageUploader
                                    initialImage={discount.imageSrc}
                                    onImageUploaded={(base64) => handleImageUpload(discount.id, base64)}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
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
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => initializeContent()}
          disabled={!hasUnsavedChanges}
        >
          Cancelar Cambios
        </Button>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
}
