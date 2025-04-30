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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PlanForm } from '@/components/admin/PlanForm';
import { BrandingForm } from '@/components/admin/BrandingForm';

export default function AdminSettings() {
  const { plans, updatePlan, addPlan, deletePlan } = usePlansStore();
  const { settings, updateSettings, error: settingsError } = useSettingsStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    if (plans && plans.length > 0) {
      setSelectedPlanId(plans[0]?.id || '');
    }
  }, [plans]);

  // Estado local para controlar cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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

  // Copia local de la configuración
  const [localSettings, setLocalSettings] = useState<Partial<AdminSettingsType>>(settings || {
    id: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brandName: '',
    brandLogo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    tertiaryColor: '#f59e0b',
    zones: [],
    ageRanges: [],
    emergencyContacts: [],
    content: {
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      discountSection: {
        sectionTitle: 'Ofertas y Descuentos',
        sectionSubtitle: 'Descubre nuestras mejores ofertas y descuentos especiales',
        badgeText: 'Descuentos Especiales',
        viewAllButtonText: 'Ver todas las ofertas',
        discounts: []
      },
      heroSection: {
        title: 'Bienvenido a nuestra plataforma',
        subtitle: 'Encuentra los mejores servicios de asistencia en viaje',
        ctaText: 'Explorar planes',
        imageUrl: ''
      }
    },
    notificationSettings: {
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false
    },
    paymentSettings: {
      currency: 'USD',
      taxRate: 0,
      paymentMethods: [],
      commissionRate: 0
    },
    notifications: [],
    branding: {
      logo: '',
      companyName: '',
      contactEmail: '',
      supportPhone: '',
      favicon: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981'
    }
  });

  // Copia local de los planes
  const [localPlans, setLocalPlans] = useState<Plan[]>(plans || []);

  // Actualizar configuración local
  const updateLocalSettings = (updates: Partial<AdminSettingsType>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };
  
  // Actualizar un plan en el estado local
  const updateLocalPlan = (planId: string, updates: Partial<Plan>) => {
    setLocalPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
    setHasUnsavedChanges(true);
  };
  
  const handleInputChange = (field: keyof AdminSettingsType, value: any) => {
    updateLocalSettings({ [field]: value });
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasUnsavedChanges(false);
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
                updateSettings({
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
                  content: {
                    heroSection: {
                      title: 'Viaja seguro con nosotros',
                      subtitle: 'Ofrecemos la mejor asistencia en viajes'
                    },
                    discountSection: {
                      sectionTitle: 'Descuentos especiales',
                      sectionSubtitle: 'Aprovecha estas ofertas por tiempo limitado',
                      badgeText: 'Oferta',
                      viewAllButtonText: 'Ver todas las ofertas',
                      discounts: []
                    }
                  },
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

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  const handleAddPlan = () => {
    const newPlan = {
      id: Date.now().toString(),
      name: 'Nuevo Plan',
      description: 'Descripción del nuevo plan',
      price: 0,
      basePrice: 0,
      priceMultiplier: 1,
      priceDetail: 'por día / por persona',
      features: [],
      badge: '',
      maxDays: 30,
      coverageDetails: {
        medicalCoverage: 0,
        luggageCoverage: 0,
        cancellationCoverage: 0,
        covidCoverage: false,
        preExistingConditions: false,
        adventureSports: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    addPlan(newPlan);
    setSelectedPlanId(newPlan.id);
    toast({
      title: "Plan creado",
      description: "Se ha creado un nuevo plan. Personalízalo según tus necesidades.",
    });
  };

  const handleSavePlan = () => {
    if (selectedPlan) {
      updatePlan(selectedPlan.id, selectedPlan);
      toast({
        title: "Plan guardado",
        description: "Los cambios han sido aplicados exitosamente.",
      });
    }
  };

  const handleUpdateZone = (zone: Zone, field: keyof Zone, value: any) => {
    if (!localSettings.zones) return;
    const updatedZones = localSettings.zones.map((z) =>
      z.id === zone.id ? { ...z, [field]: value } : z
    );
    // Usar update directo en lugar de handleInputChange para evitar problemas de tipo
    setLocalSettings({...localSettings, zones: updatedZones});
    setHasUnsavedChanges(true);
  };

  const handleAddZone = () => {
    const newZone: Zone = {
      id: Date.now().toString(),
      name: '',
      description: '', // Esta propiedad puede no existir en tu tipo Zone, ajústala según necesites
      priceMultiplier: 1,
      riskLevel: 'low',
      countries: [],
      isActive: true,
      order: localSettings.zones?.length || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Usar update directo para evitar problemas de tipo
    setLocalSettings({
      ...localSettings, 
      zones: [...(localSettings.zones || []), newZone]
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateAgeRange = (range: AgeRange, field: keyof AgeRange, value: any) => {
    if (!localSettings.ageRanges) return;
    const updatedRanges = localSettings.ageRanges.map((r) =>
      r.id === range.id ? { ...r, [field]: value } : r
    );
    // Usar update directo
    setLocalSettings({...localSettings, ageRanges: updatedRanges});
    setHasUnsavedChanges(true);
  };

  const handleAddAgeRange = () => {
    const newAgeRange = {
      id: crypto.randomUUID(),
      settingsId: localSettings.id || '',
      minAge: 0,
      maxAge: 18,
      priceMultiplier: 1.0,
      description: '',
      isActive: true,
      order: (localSettings.ageRanges?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateLocalSettings({
      ageRanges: [...(localSettings.ageRanges || []), newAgeRange]
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateEmergencyContact = (contact: EmergencyContact, field: keyof EmergencyContact, value: any) => {
    if (!localSettings.emergencyContacts) return;
    const updatedContacts = localSettings.emergencyContacts.map((c) =>
      c.id === contact.id ? { ...c, [field]: value } : c
    );
    // Usar update directo
    setLocalSettings({...localSettings, emergencyContacts: updatedContacts});
    setHasUnsavedChanges(true);
  };

  const handleAddEmergencyContact = () => {
    const newEmergencyContact = {
      id: crypto.randomUUID(),
      settingsId: localSettings.id || '',
      name: '',
      phone: '',
      email: '',
      country: '',
      address: '',
      priority: (localSettings.emergencyContacts?.length || 0) + 1,
      isActive: true,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateLocalSettings({
      emergencyContacts: [...(localSettings.emergencyContacts || []), newEmergencyContact]
    });
    setHasUnsavedChanges(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Configuración del Sistema</h1>

      <Tabs defaultValue="plans">
        <TabsList className="grid w-full max-w-3xl grid-cols-7">
          <TabsTrigger value="plans">Planes</TabsTrigger>
          <TabsTrigger value="zones">Zonas</TabsTrigger>
          <TabsTrigger value="age">Rangos de Edad</TabsTrigger>
          <TabsTrigger value="emergency">Contactos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="brand">Marca</TabsTrigger>
          <TabsTrigger value="discounts">Descuentos</TabsTrigger>
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
              <div className="flex justify-between items-center">
                <CardTitle>Configuración de Zonas</CardTitle>
                <Button
                  onClick={() => {
                    const newZone: Zone = {
                      id: Date.now().toString(),
                      settingsId: settings.id,
                      name: 'Nueva Zona',
                      priceMultiplier: 1,
                      countries: [],
                      riskLevel: 'low',
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    updateSettings({
                      zones: [...settings.zones, newZone]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Zona
                </Button>
              </div>
              <CardDescription>
                Configura las zonas y sus multiplicadores de precio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings.zones.map((zone, index) => (
                  <div key={zone.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nombre de la Zona</Label>
                            <Input
                              value={zone.name}
                              onChange={(e) => {
                                const newZones = [...settings.zones];
                                newZones[index] = { ...zone, name: e.target.value };
                                updateSettings({ zones: newZones });
                              }}
                            />
                          </div>
                          <div>
                            <Label>Multiplicador de Precio</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={zone.priceMultiplier}
                              onChange={(e) => {
                                const newZones = [...settings.zones];
                                newZones[index] = { ...zone, priceMultiplier: parseFloat(e.target.value) };
                                updateSettings({ zones: newZones });
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Nivel de Riesgo</Label>
                          <Select
                            value={zone.riskLevel}
                            onValueChange={(value: 'low' | 'medium' | 'high') => {
                              const newZones = [...settings.zones];
                              newZones[index] = { ...zone, riskLevel: value };
                              updateSettings({ zones: newZones });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Bajo</SelectItem>
                              <SelectItem value="medium">Medio</SelectItem>
                              <SelectItem value="high">Alto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Países</Label>
                          <div className="space-y-2">
                            {zone.countries.map((country, countryIndex) => (
                              <div key={countryIndex} className="flex gap-2">
                                <Input
                                  value={country}
                                  onChange={(e) => {
                                    const newZones = [...settings.zones];
                                    const newCountries = [...zone.countries];
                                    newCountries[countryIndex] = e.target.value;
                                    newZones[index] = { ...zone, countries: newCountries };
                                    updateSettings({ zones: newZones });
                                  }}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newZones = [...settings.zones];
                                    const newCountries = zone.countries.filter((_, i) => i !== countryIndex);
                                    newZones[index] = { ...zone, countries: newCountries };
                                    updateSettings({ zones: newZones });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                const newZones = [...settings.zones];
                                newZones[index] = {
                                  ...zone,
                                  countries: [...zone.countries, '']
                                };
                                updateSettings({ zones: newZones });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar País
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newZones = settings.zones.filter((_, i) => i !== index);
                          updateSettings({ zones: newZones });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                {settings.ageRanges.map((range, index) => (
                  <div key={range.id} className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label>Edad Mínima</Label>
                      <Input
                        type="number"
                        value={range.minAge}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index] = {
                            ...range,
                            minAge: parseInt(e.target.value),
                          };
                          updateSettings({
                            ...settings,
                            ageRanges: newRanges,
                          });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Edad Máxima</Label>
                      <Input
                        type="number"
                        value={range.maxAge}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index] = {
                            ...range,
                            maxAge: parseInt(e.target.value),
                          };
                          updateSettings({
                            ...settings,
                            ageRanges: newRanges,
                          });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Multiplicador</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={range.priceMultiplier}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index] = {
                            ...range,
                            priceMultiplier: parseFloat(e.target.value),
                          };
                          updateSettings({
                            ...settings,
                            ageRanges: newRanges,
                          });
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newRanges = settings.ageRanges.filter(r => r.id !== range.id);
                        updateSettings({
                          ...settings,
                          ageRanges: newRanges,
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newAgeRange: AgeRange = {
                      id: Date.now().toString(),
                      settingsId: settings.id,
                      minAge: 0,
                      maxAge: 99,
                      priceMultiplier: 1,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    updateSettings({
                      ...settings,
                      ageRanges: [...settings.ageRanges, newAgeRange],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Rango
                </Button>
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
              <div className="flex justify-between items-center">
                <CardTitle>Contactos de Emergencia</CardTitle>
                <Button
                  onClick={() => {
                    const newContact: EmergencyContact = {
                      id: Date.now().toString(),
                      settingsId: settings.id,
                      name: '',
                      phone: '',
                      email: '',
                      country: '',
                      address: '',
                      priority: settings.emergencyContacts.length,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    updateSettings({
                      emergencyContacts: [...settings.emergencyContacts, newContact],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contacto
                </Button>
              </div>
              <CardDescription>
                Configura los contactos de emergencia del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.emergencyContacts.map((contact, index) => (
                  <div key={contact.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Contacto #{index + 1}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={contact.isActive}
                          onCheckedChange={(checked) => {
                            const newContacts = [...settings.emergencyContacts];
                            newContacts[index] = {
                              ...contact,
                              isActive: checked,
                            };
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newContacts = settings.emergencyContacts.filter(c => c.id !== contact.id);
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
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
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
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
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>País</Label>
                        <Input
                          value={contact.country}
                          onChange={(e) => {
                            const newContacts = [...settings.emergencyContacts];
                            newContacts[index] = {
                              ...contact,
                              country: e.target.value,
                            };
                            updateSettings({
                              emergencyContacts: newContacts,
                            });
                          }}
                        />
                      </div>
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
              <div className="space-y-6">
                <div>
                  <Label>Días antes de expiración para notificar</Label>
                  <div className="flex gap-2 mt-2">
                    {settings.notifications.beforeExpiration.map((days, index) => (
                      <Input 
                        key={index}
                        type="number"
                        value={days}
                        className="w-20"
                        onChange={(e) => {
                          const newDays = [...settings.notifications.beforeExpiration];
                          newDays[index] = parseInt(e.target.value);
                          updateSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              beforeExpiration: newDays
                            }
                          });
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reminder-emails"
                      checked={Array.isArray(settings?.notifications) && settings.notifications.some(n => n.type === 'reminder-email' && n.active)}
                      onCheckedChange={(checked) => {
                        // Buscar si existe una notificación de recordatorio por email o crear una nueva
                        const updatedNotifications = Array.isArray(settings?.notifications) ? [...settings.notifications] : [];
                        const reminderIndex = updatedNotifications.findIndex(n => n.type === 'reminder-email');
                        
                        if (reminderIndex >= 0) {
                          updatedNotifications[reminderIndex] = {
                            ...updatedNotifications[reminderIndex],
                            active: checked
                          };
                        } else {
                          updatedNotifications.push({
                            id: crypto.randomUUID(),
                            type: 'reminder-email',
                            message: 'Recordatorio por email',
                            active: checked
                          });
                        }
                        
                        updateSettings({
                          notifications: updatedNotifications
                        });
                      }}
                    />
                    <Label>Enviar notificaciones por email</Label>
                  </div>
                  <div className="flex-1">
                    <Label>Push</Label>
                    <Switch
                      checked={Array.isArray(settings?.notifications) && (settings.notifications || []).some(n => n.type === 'push' && n.active)}
                      onCheckedChange={(checked) => {
                        // Buscar si existe una notificación de push o crear una nueva
                        const updatedNotifications = Array.isArray(settings?.notifications) ? [...settings.notifications] : [];
                        const pushIndex = updatedNotifications.findIndex(n => n.type === 'push');
                        
                        if (pushIndex >= 0) {
                          updatedNotifications[pushIndex] = {
                            ...updatedNotifications[pushIndex],
                            active: checked
                          };
                        } else {
                          updatedNotifications.push({
                            id: crypto.randomUUID(),
                            type: 'push',
                            message: 'Notificación push',
                            active: checked
                          });
                        }
                        
                        updateSettings({
                          notifications: updatedNotifications
                        });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="before-expiration"
                      checked={Array.isArray(settings?.notifications) && (settings.notifications || []).some(n => n.type === 'expiration' && n.active)}
                      onCheckedChange={(checked) => {
                        // Buscar si existe una notificación de expiración o crear una nueva
                        const updatedNotifications = Array.isArray(settings?.notifications) ? [...settings.notifications] : [];
                        const expirationIndex = updatedNotifications.findIndex(n => n.type === 'expiration');
                        
                        if (expirationIndex >= 0) {
                          updatedNotifications[expirationIndex] = {
                            ...updatedNotifications[expirationIndex],
                            active: checked
                          };
                        } else {
                          updatedNotifications.push({
                            id: crypto.randomUUID(),
                            type: 'expiration',
                            message: 'Su plan está por expirar',
                            active: checked
                          });
                        }
                        
                        updateSettings({
                          notifications: updatedNotifications
                        });
                      }}
                    />
                    <Label>Enviar notificaciones por expiración</Label>
                  </div>
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
                    value={settings.paymentSettings.currency}
                    onValueChange={(value) => {
                      updateSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          currency: value
                        }
                      });
                    }}
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
                    value={settings.paymentSettings.taxRate}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          taxRate: parseFloat(e.target.value)
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Tasa de Comisión (%)</Label>
                  <Input 
                    type="number"
                    value={settings.paymentSettings.commissionRate}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          commissionRate: parseFloat(e.target.value)
                        }
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <BrandingForm settings={settings} updateSettings={updateSettings} />
        </TabsContent>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Descuentos</CardTitle>
              <CardDescription>Administra los descuentos y ofertas que se mostrarán en la página principal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sectionTitle">Título de la Sección</Label>
                  <Input
                    id="sectionTitle"
                    value={settings?.content?.discountSection?.sectionTitle || ''}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          discountSection: {
                            ...settings.content.discountSection,
                            sectionTitle: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="sectionSubtitle">Subtítulo de la Sección</Label>
                  <Input
                    id="sectionSubtitle"
                    value={settings?.content?.discountSection?.sectionSubtitle || ''}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          discountSection: {
                            ...settings.content.discountSection,
                            sectionSubtitle: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="badgeText">Texto de la Insignia</Label>
                  <Input
                    id="badgeText"
                    value={settings?.content?.discountSection?.badgeText || ''}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          discountSection: {
                            ...settings.content.discountSection,
                            badgeText: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="viewAllButtonText">Texto del Botón Ver Todos</Label>
                  <Input
                    id="viewAllButtonText"
                    value={settings?.content?.discountSection?.viewAllButtonText || ''}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        content: {
                          ...settings.content,
                          discountSection: {
                            ...settings.content.discountSection,
                            viewAllButtonText: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>

                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Descuentos Disponibles</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDiscount = {
                          id: Date.now().toString(),
                          title: 'Nuevo Descuento',
                          description: 'Descripción del descuento',
                          code: 'DESC' + Math.floor(Math.random() * 1000),
                          discountPercentage: 10,
                          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          imageSrc: '',
                          active: true
                        };
                        
                        updateSettings({
                          ...settings,
                          content: {
                            ...settings.content,
                            discountSection: {
                              ...settings.content.discountSection,
                              discounts: [...(settings?.content?.discountSection?.discounts || []), newDiscount]
                            }
                          }
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Descuento
                    </Button>
                  </div>
                  
                  {settings?.content?.discountSection?.discounts && settings.content.discountSection.discounts.length > 0 ? (
                    <div className="space-y-4">
                      {settings.content.discountSection.discounts.map((discount, index) => (
                        <Card key={discount.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{discount.title}</div>
                              <div className="text-sm text-muted-foreground">{discount.description}</div>
                              <div className="mt-2 text-sm">Código: <span className="font-mono bg-muted px-1 rounded">{discount.code}</span></div>
                              <div className="text-sm">Descuento: {discount.discountPercentage}%</div>
                              <div className="text-sm">Válido hasta: {discount.validUntil}</div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedDiscounts = [...settings.content.discountSection.discounts];
                                updatedDiscounts.splice(index, 1);
                                updateSettings({
                                  ...settings,
                                  content: {
                                    ...settings.content,
                                    discountSection: {
                                      ...settings.content.discountSection,
                                      discounts: updatedDiscounts
                                    }
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label htmlFor={`discount-title-${index}`}>Título</Label>
                              <Input
                                id={`discount-title-${index}`}
                                value={discount.title}
                                onChange={(e) => {
                                  const updatedDiscounts = [...settings.content.discountSection.discounts];
                                  updatedDiscounts[index] = {
                                    ...updatedDiscounts[index],
                                    title: e.target.value
                                  };
                                  updateSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      discountSection: {
                                        ...settings.content.discountSection,
                                        discounts: updatedDiscounts
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`discount-code-${index}`}>Código</Label>
                              <Input
                                id={`discount-code-${index}`}
                                value={discount.code}
                                onChange={(e) => {
                                  const updatedDiscounts = [...settings.content.discountSection.discounts];
                                  updatedDiscounts[index] = {
                                    ...updatedDiscounts[index],
                                    code: e.target.value
                                  };
                                  updateSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      discountSection: {
                                        ...settings.content.discountSection,
                                        discounts: updatedDiscounts
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`discount-percentage-${index}`}>Porcentaje</Label>
                              <Input
                                id={`discount-percentage-${index}`}
                                type="number"
                                value={discount.discountPercentage}
                                onChange={(e) => {
                                  const updatedDiscounts = [...settings.content.discountSection.discounts];
                                  updatedDiscounts[index] = {
                                    ...updatedDiscounts[index],
                                    discountPercentage: Number(e.target.value)
                                  };
                                  updateSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      discountSection: {
                                        ...settings.content.discountSection,
                                        discounts: updatedDiscounts
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`discount-validUntil-${index}`}>Válido hasta</Label>
                              <Input
                                id={`discount-validUntil-${index}`}
                                type="date"
                                value={discount.validUntil}
                                onChange={(e) => {
                                  const updatedDiscounts = [...settings.content.discountSection.discounts];
                                  updatedDiscounts[index] = {
                                    ...updatedDiscounts[index],
                                    validUntil: e.target.value
                                  };
                                  updateSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      discountSection: {
                                        ...settings.content.discountSection,
                                        discounts: updatedDiscounts
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`discount-description-${index}`}>Descripción</Label>
                              <Textarea
                                id={`discount-description-${index}`}
                                value={discount.description}
                                onChange={(e) => {
                                  const updatedDiscounts = [...settings.content.discountSection.discounts];
                                  updatedDiscounts[index] = {
                                    ...updatedDiscounts[index],
                                    description: e.target.value
                                  };
                                  updateSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      discountSection: {
                                        ...settings.content.discountSection,
                                        discounts: updatedDiscounts
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`discount-active-${index}`} className="flex items-center space-x-2 cursor-pointer">
                                <Switch
                                  id={`discount-active-${index}`}
                                  checked={discount.active}
                                  onCheckedChange={(checked) => {
                                    const updatedDiscounts = [...settings.content.discountSection.discounts];
                                    updatedDiscounts[index] = {
                                      ...updatedDiscounts[index],
                                      active: checked
                                    };
                                    updateSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        discountSection: {
                                          ...settings.content.discountSection,
                                          discounts: updatedDiscounts
                                        }
                                      }
                                    });
                                  }}
                                />
                                <span>Activo</span>
                              </Label>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <div className="text-muted-foreground">No hay descuentos configurados</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                toast({
                  title: "Cambios guardados",
                  description: "La configuración de descuentos ha sido actualizada."
                });
              }}>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 