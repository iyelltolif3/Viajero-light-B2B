import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminSettings() {
  const { plans, updatePlan, addPlan, deletePlan } = usePlansStore();
  const { settings, updateSettings, error: settingsError } = useSettingsStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    if (plans && plans.length > 0) {
      setSelectedPlanId(plans[0]?.id || '');
    }
  }, [plans]);

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
                  emergencyContacts: [],
                  notificationSettings: {
                    emailNotifications: true,
                    pushNotifications: false,
                    smsNotifications: false
                  },
                  paymentSettings: {
                    currency: 'USD',
                    acceptedMethods: ['card', 'transfer'],
                    taxRate: 0,
                    commissionRate: 0
                  },
                  zones: [],
                  ageRanges: [],
                  notifications: {
                    beforeExpiration: [1, 7, 30],
                    reminderEmails: true,
                    smsNotifications: false,
                    whatsappNotifications: false
                  },
                  branding: {
                    primaryColor: '#0f172a',
                    secondaryColor: '#64748b',
                    logo: '',
                    companyName: 'Mi Empresa',
                    contactEmail: '',
                    supportPhone: ''
                  }
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

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente.",
    });
  };

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
    };
    addPlan(newPlan);
    setSelectedPlanId(newPlan.id);
    toast({
      title: "Plan creado",
      description: "Se ha creado un nuevo plan. Personalízalo según tus necesidades.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Configuración del Sistema</h1>

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
                <CardTitle>Configuración de Planes</CardTitle>
                <Button onClick={handleAddPlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Plan
                </Button>
              </div>
              <CardDescription>
                {!plans?.length ? (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No hay planes configurados</AlertTitle>
                    <AlertDescription>
                      Para comenzar, crea tu primer plan usando el botón "Nuevo Plan"
                    </AlertDescription>
                  </Alert>
                ) : (
                  "Gestiona los planes de asistencia disponibles"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plans?.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label>Seleccionar Plan</Label>
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPlan && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre del Plan</Label>
                          <Input
                            value={selectedPlan.name}
                            onChange={(e) => updatePlan(selectedPlan.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Descripción</Label>
                          <Input
                            value={selectedPlan.description}
                            onChange={(e) => updatePlan(selectedPlan.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Precio Base</Label>
                          <Input
                            type="number"
                            value={selectedPlan.basePrice}
                            onChange={(e) => updatePlan(selectedPlan.id, { basePrice: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Multiplicador de Precio</Label>
                          <Input
                            type="number"
                            value={selectedPlan.priceMultiplier}
                            onChange={(e) => updatePlan(selectedPlan.id, { priceMultiplier: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Características</Label>
                        <div className="space-y-2">
                          {selectedPlan.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...selectedPlan.features];
                                  newFeatures[index] = e.target.value;
                                  updatePlan(selectedPlan.id, { features: newFeatures });
                                }}
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  const newFeatures = selectedPlan.features.filter((_, i) => i !== index);
                                  updatePlan(selectedPlan.id, { features: newFeatures });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newFeatures = [...selectedPlan.features, ''];
                              updatePlan(selectedPlan.id, { features: newFeatures });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Característica
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Cobertura Médica (USD)</Label>
                          <Input
                            type="number"
                            value={selectedPlan.coverageDetails.medicalCoverage}
                            onChange={(e) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                medicalCoverage: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Cobertura de Equipaje (USD)</Label>
                          <Input
                            type="number"
                            value={selectedPlan.coverageDetails.luggageCoverage}
                            onChange={(e) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                luggageCoverage: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Cobertura de Cancelación (USD)</Label>
                          <Input
                            type="number"
                            value={selectedPlan.coverageDetails.cancellationCoverage}
                            onChange={(e) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                cancellationCoverage: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="covid"
                            checked={selectedPlan.coverageDetails.covidCoverage}
                            onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                covidCoverage: checked
                              }
                            })}
                          />
                          <Label htmlFor="covid">Cobertura COVID-19</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="preexisting"
                            checked={selectedPlan.coverageDetails.preExistingConditions}
                            onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                preExistingConditions: checked
                              }
                            })}
                          />
                          <Label htmlFor="preexisting">Condiciones Preexistentes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="adventure"
                            checked={selectedPlan.coverageDetails.adventureSports}
                            onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                              coverageDetails: {
                                ...selectedPlan.coverageDetails,
                                adventureSports: checked
                              }
                            })}
                          />
                          <Label htmlFor="adventure">Deportes de Aventura</Label>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que deseas eliminar este plan?')) {
                              deletePlan(selectedPlan.id);
                              if (plans.length > 1) {
                                setSelectedPlanId(plans.find(p => p.id !== selectedPlan.id)?.id || '');
                              } else {
                                setSelectedPlanId('');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Plan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                Gestiona las zonas geográficas y sus multiplicadores de precio
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
          </Card>
        </TabsContent>

        <TabsContent value="age-ranges">
          <Card>
            <CardHeader>
              <CardTitle>Rangos de Edad</CardTitle>
              <CardDescription>
                Define los multiplicadores de precio por rango de edad
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
                Gestiona los contactos de emergencia por país
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
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Configura las notificaciones automáticas
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
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.notifications.reminderEmails}
                      onCheckedChange={(checked) => {
                        updateSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            reminderEmails: checked
                          }
                        });
                      }}
                    />
                    <Label>Enviar recordatorios por email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => {
                        updateSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            smsNotifications: checked
                          }
                        });
                      }}
                    />
                    <Label>Enviar notificaciones por SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.notifications.whatsappNotifications}
                      onCheckedChange={(checked) => {
                        updateSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            whatsappNotifications: checked
                          }
                        });
                      }}
                    />
                    <Label>Enviar notificaciones por WhatsApp</Label>
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
                Configura los métodos de pago y tarifas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="CLP">CLP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tasa de Impuestos (%)</Label>
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

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Marca</CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Nombre de la Empresa</Label>
                  <Input
                    value={settings.branding.companyName}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          companyName: e.target.value
                        }
                      });
                    }}
                  />
                </div>

                <LogoUploader
                  currentLogo={settings.branding.logo}
                  onLogoChange={(logo) => {
                    updateSettings({
                      ...settings,
                      branding: {
                        ...settings.branding,
                        logo
                      }
                    });
                  }}
                />

                <div>
                  <Label>Color Primario</Label>
                  <ColorPicker
                    color={settings.branding.primaryColor}
                    onChange={(color) => {
                      updateSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          primaryColor: color
                        }
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Color Secundario</Label>
                  <ColorPicker
                    color={settings.branding.secondaryColor}
                    onChange={(color) => {
                      updateSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          secondaryColor: color
                        }
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Email de Contacto</Label>
                  <Input
                    type="email"
                    value={settings.branding.contactEmail}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          contactEmail: e.target.value
                        }
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Teléfono de Soporte</Label>
                  <Input
                    value={settings.branding.supportPhone}
                    onChange={(e) => {
                      updateSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          supportPhone: e.target.value
                        }
                      });
                    }}
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