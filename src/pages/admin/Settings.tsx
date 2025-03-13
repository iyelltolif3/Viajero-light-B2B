import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AdminSettings as AdminSettingsType, Plan, EmergencyContact, Zone, AgeRange } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { usePlansStore } from '@/store/plansStore';
import { useSettingsStore } from '@/store/settingsStore';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { LogoUploader } from '@/components/ui/logo-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlanForm } from '@/components/admin/PlanForm';

export default function AdminSettings() {
  const { plans, addLocalPlan, updateLocalPlan, deletePlan } = usePlansStore();
  const { 
    settings, 
    localSettings,
    updateLocalSettings,
    saveSettings,
    hasUnsavedChanges,
    error: settingsError 
  } = useSettingsStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formData, setFormData] = useState<AdminSettingsType | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (plans && plans.length > 0) {
      setSelectedPlanId(plans[0]?.id || '');
    }
  }, [plans]);

  // Prevent accidental navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: keyof AdminSettingsType, value: any) => {
    updateLocalSettings({ [field]: value });
  };

  const handleSave = async () => {
    try {
      await saveSettings();
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados exitosamente.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  // Si hay un error al cargar los datos, mostrar una alerta
  if (settingsError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {settingsError}. Por favor, intenta recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no hay configuración, mostrar opción para inicializar
  if (!settings) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración Inicial</CardTitle>
            <CardDescription>
              No se encontró ninguna configuración. Es necesario inicializar el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                const defaultContent = {
                  discountSection: {
                    sectionTitle: "Ofertas y Descuentos",
                    sectionSubtitle: "Descubre nuestras mejores ofertas y descuentos especiales",
                    badgeText: "Descuentos Especiales",
                    viewAllButtonText: "Ver todas las ofertas",
                    discounts: []
                  }
                };

                updateLocalSettings({
                  brandName: 'Mi Empresa',
                  brandLogo: '',
                  primaryColor: '#0f172a',
                  secondaryColor: '#64748b',
                  tertiaryColor: '#e2e8f0',
                  notificationSettings: {
                    emailEnabled: true,
                    smsEnabled: false,
                    pushEnabled: false
                  },
                  paymentSettings: {
                    currency: 'USD',
                    paymentMethods: ['card', 'transfer'],
                    taxRate: 0
                  },
                  notifications: [
                    {
                      id: '1',
                      type: 'expiration',
                      message: 'Tu póliza está por vencer',
                      active: true
                    }
                  ],
                  branding: {
                    logo: '',
                    favicon: '',
                    colors: {
                      primary: '#0f172a',
                      secondary: '#64748b',
                      accent: '#e2e8f0'
                    }
                  },
                  content: defaultContent,
                  zones: [],
                  ageRanges: [],
                  emergencyContacts: []
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Inicializar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddPlan = () => {
    const newPlan = {
      name: 'Nuevo Plan',
      description: 'Descripción del nuevo plan',
      price: 0,
      base_price: 0,
      price_multiplier: 1,
      price_detail: 'por día / por persona',
      features: [],
      badge: '',
      max_days: 30,
      coverage_details: {
        medical_coverage: 0,
        luggage_coverage: 0,
        cancellation_coverage: 0,
        covid_coverage: false,
        pre_existing_conditions: false,
        adventure_sports: false,
      },
      is_active: true
    };
    
    // Add the plan and get its ID
    const id = addLocalPlan(newPlan);
    // Automatically select the new plan
    setSelectedPlanId(id);
    toast({
      title: "Plan creado",
      description: "El plan ha sido creado. Realiza los cambios necesarios y guarda para confirmar.",
    });
  };

  const handleSavePlan = () => {
    if (selectedPlan) {
      updateLocalPlan(selectedPlan.id, selectedPlan);
      toast({
        title: "Plan guardado",
        description: "Los cambios han sido aplicados exitosamente.",
      });
    }
  };

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  const handleUpdateZone = (zone: Zone, field: keyof Zone, value: any) => {
    const updatedZones = localSettings.zones.map((z) =>
      z.id === zone.id ? { ...z, [field]: value } : z
    );
    handleInputChange('zones', updatedZones);
  };

  const handleAddZone = () => {
    const newZone: Zone = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price_multiplier: 1,
      risk_level: 'low',
      countries: [],
      is_active: true,
      order: localSettings.zones.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    handleInputChange('zones', [...localSettings.zones, newZone]);
  };

  const handleUpdateAgeRange = (range: AgeRange, field: keyof AgeRange, value: any) => {
    const updatedRanges = localSettings.ageRanges.map((r) =>
      r.id === range.id ? { ...r, [field]: value } : r
    );
    handleInputChange('ageRanges', updatedRanges);
  };

  const handleAddAgeRange = () => {
    const newRange: AgeRange = {
      id: Date.now().toString(),
      minAge: 0,
      maxAge: 0,
      price_multiplier: 1,
      description: '',
      is_active: true,
      order: localSettings.ageRanges.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    handleInputChange('ageRanges', [...localSettings.ageRanges, newRange]);
  };

  const handleUpdateEmergencyContact = (contact: EmergencyContact, field: keyof EmergencyContact, value: any) => {
    const updatedContacts = localSettings.emergencyContacts.map((c) =>
      c.id === contact.id ? { ...c, [field]: value } : c
    );
    handleInputChange('emergencyContacts', updatedContacts);
  };

  const handleAddEmergencyContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      priority: localSettings.emergencyContacts.length + 1,
      is_active: true,
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    handleInputChange('emergencyContacts', [...localSettings.emergencyContacts, newContact]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hay cambios sin guardar</AlertTitle>
              <AlertDescription>
                Por favor, guarda los cambios antes de salir.
              </AlertDescription>
            </Alert>
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={!plans?.length ? "branding" : "plans"} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="plans">Planes</TabsTrigger>
          <TabsTrigger value="zones">Zonas</TabsTrigger>
          <TabsTrigger value="age-ranges">Rangos de Edad</TabsTrigger>
          <TabsTrigger value="emergency">Contactos de Emergencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="branding">Marca</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Planes</CardTitle>
                  {!plans?.length ? (
                    <div className="mt-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No hay planes configurados</AlertTitle>
                        <AlertDescription>
                          Para comenzar, crea tu primer plan usando el botón "Nuevo Plan"
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <CardDescription>
                      Gestiona los planes de asistencia disponibles
                    </CardDescription>
                  )}
                </div>
                <Button onClick={handleAddPlan}>
                  Nuevo Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans?.map((plan) => (
                <PlanForm
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlanId === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id === selectedPlanId ? null : plan.id)}
                  onChange={(updates) => updateLocalPlan(plan.id, updates)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Zonas</CardTitle>
              <CardDescription>
                Configura las zonas y sus multiplicadores de precio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localSettings.zones.map((zone) => (
                  <div key={zone.id} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Input
                        value={zone.name}
                        onChange={(e) => handleUpdateZone(zone, 'name', e.target.value)}
                        placeholder="Nombre de la zona"
                      />
                      <Input
                        type="number"
                        value={zone.price_multiplier}
                        onChange={(e) => handleUpdateZone(zone, 'price_multiplier', parseFloat(e.target.value))}
                        placeholder="Multiplicador"
                      />
                      <Select
                        value={zone.risk_level}
                        onValueChange={(value) => handleUpdateZone(zone, 'risk_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de riesgo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Bajo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={zone.is_active}
                        onCheckedChange={(checked) => handleUpdateZone(zone, 'is_active', checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddZone}>Agregar Zona</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="age-ranges">
          <Card>
            <CardHeader>
              <CardTitle>Rangos de Edad</CardTitle>
              <CardDescription>
                Configura los rangos de edad y sus multiplicadores de precio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localSettings.ageRanges.map((range) => (
                  <div key={range.id} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={range.minAge}
                        onChange={(e) => handleUpdateAgeRange(range, 'minAge', parseInt(e.target.value))}
                        placeholder="Edad mínima"
                      />
                      <Input
                        type="number"
                        value={range.maxAge}
                        onChange={(e) => handleUpdateAgeRange(range, 'maxAge', parseInt(e.target.value))}
                        placeholder="Edad máxima"
                      />
                      <Input
                        type="number"
                        value={range.price_multiplier}
                        onChange={(e) => handleUpdateAgeRange(range, 'price_multiplier', parseFloat(e.target.value))}
                        placeholder="Multiplicador"
                      />
                      <Switch
                        checked={range.is_active}
                        onCheckedChange={(checked) => handleUpdateAgeRange(range, 'is_active', checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddAgeRange}>Agregar Rango</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Contactos de Emergencia</CardTitle>
              <CardDescription>
                Configura los contactos de emergencia del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localSettings.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Input
                        value={contact.name}
                        onChange={(e) => handleUpdateEmergencyContact(contact, 'name', e.target.value)}
                        placeholder="Nombre"
                      />
                      <Input
                        value={contact.phone}
                        onChange={(e) => handleUpdateEmergencyContact(contact, 'phone', e.target.value)}
                        placeholder="Teléfono"
                      />
                      <Input
                        value={contact.email}
                        onChange={(e) => handleUpdateEmergencyContact(contact, 'email', e.target.value)}
                        placeholder="Email"
                      />
                      <Switch
                        checked={contact.is_active}
                        onCheckedChange={(checked) => handleUpdateEmergencyContact(contact, 'is_active', checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddEmergencyContact}>Agregar Contacto</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura las notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Email</Label>
                    <Switch
                      checked={localSettings.notificationSettings.emailEnabled}
                      onCheckedChange={(checked) =>
                        handleInputChange('notificationSettings', {
                          ...localSettings.notificationSettings,
                          emailEnabled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label>SMS</Label>
                    <Switch
                      checked={localSettings.notificationSettings.smsEnabled}
                      onCheckedChange={(checked) =>
                        handleInputChange('notificationSettings', {
                          ...localSettings.notificationSettings,
                          smsEnabled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Push</Label>
                    <Switch
                      checked={localSettings.notificationSettings.pushEnabled}
                      onCheckedChange={(checked) =>
                        handleInputChange('notificationSettings', {
                          ...localSettings.notificationSettings,
                          pushEnabled: checked,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notificaciones Activas</Label>
                  {localSettings.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center gap-4">
                      <Input
                        value={notification.message}
                        onChange={(e) => {
                          const updatedNotifications = localSettings.notifications.map((n) =>
                            n.id === notification.id ? { ...n, message: e.target.value } : n
                          );
                          handleInputChange('notifications', updatedNotifications);
                        }}
                        placeholder="Mensaje"
                      />
                      <Switch
                        checked={notification.active}
                        onCheckedChange={(checked) => {
                          const updatedNotifications = localSettings.notifications.map((n) =>
                            n.id === notification.id ? { ...n, active: checked } : n
                          );
                          handleInputChange('notifications', updatedNotifications);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
              <CardDescription>
                Configura los métodos de pago y tasas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Moneda</Label>
                  <Select
                    value={localSettings.paymentSettings.currency}
                    onValueChange={(value) =>
                      handleInputChange('paymentSettings', {
                        ...localSettings.paymentSettings,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tasa de Impuesto (%)</Label>
                  <Input
                    type="number"
                    value={localSettings.paymentSettings.taxRate}
                    onChange={(e) =>
                      handleInputChange('paymentSettings', {
                        ...localSettings.paymentSettings,
                        taxRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Métodos de Pago</Label>
                  <div className="flex gap-4">
                    {['card', 'transfer'].map((method) => (
                      <div key={method} className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.paymentSettings.paymentMethods.includes(method)}
                          onCheckedChange={(checked) => {
                            const methods = checked
                              ? [...localSettings.paymentSettings.paymentMethods, method]
                              : localSettings.paymentSettings.paymentMethods.filter((m) => m !== method);
                            handleInputChange('paymentSettings', {
                              ...localSettings.paymentSettings,
                              paymentMethods: methods,
                            });
                          }}
                        />
                        <Label>{method === 'card' ? 'Tarjeta' : 'Transferencia'}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Marca</CardTitle>
              <CardDescription>
                Configura la apariencia de tu marca
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Logo</Label>
                  <Input
                    value={localSettings.branding.logo}
                    onChange={(e) =>
                      handleInputChange('branding', {
                        ...localSettings.branding,
                        logo: e.target.value,
                      })
                    }
                    placeholder="URL del logo"
                  />
                </div>
                <div>
                  <Label>Favicon</Label>
                  <Input
                    value={localSettings.branding.favicon}
                    onChange={(e) =>
                      handleInputChange('branding', {
                        ...localSettings.branding,
                        favicon: e.target.value,
                      })
                    }
                    placeholder="URL del favicon"
                  />
                </div>
                <div>
                  <Label>Color Primario</Label>
                  <Input
                    type="color"
                    value={localSettings.branding.colors.primary}
                    onChange={(e) =>
                      handleInputChange('branding', {
                        ...localSettings.branding,
                        colors: {
                          ...localSettings.branding.colors,
                          primary: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Color Secundario</Label>
                  <Input
                    type="color"
                    value={localSettings.branding.colors.secondary}
                    onChange={(e) =>
                      handleInputChange('branding', {
                        ...localSettings.branding,
                        colors: {
                          ...localSettings.branding.colors,
                          secondary: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Color de Acento</Label>
                  <Input
                    type="color"
                    value={localSettings.branding.colors.accent}
                    onChange={(e) =>
                      handleInputChange('branding', {
                        ...localSettings.branding,
                        colors: {
                          ...localSettings.branding.colors,
                          accent: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 