import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AdminSettings as AdminSettingsType, Plan } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { usePlansStore } from '@/store/plansStore';
import { useSettingsStore } from '@/store/settingsStore';
import { X, Plus, Trash2 } from 'lucide-react';
import { LogoUploader } from '@/components/ui/logo-uploader';

export default function AdminSettings() {
  const { plans, updatePlan, addPlan, deletePlan } = usePlansStore();
  const { settings, updateSettings } = useSettingsStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente.",
    });
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

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
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Configuración del Sistema</h1>

      <Tabs defaultValue="plans" className="space-y-6">
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
                Gestiona los planes de asistencia disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedPlan.coverageDetails.covidCoverage}
                          onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                            coverageDetails: {
                              ...selectedPlan.coverageDetails,
                              covidCoverage: checked
                            }
                          })}
                        />
                        <Label>Cobertura COVID-19</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedPlan.coverageDetails.preExistingConditions}
                          onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                            coverageDetails: {
                              ...selectedPlan.coverageDetails,
                              preExistingConditions: checked
                            }
                          })}
                        />
                        <Label>Condiciones Preexistentes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedPlan.coverageDetails.adventureSports}
                          onCheckedChange={(checked) => updatePlan(selectedPlan.id, {
                            coverageDetails: {
                              ...selectedPlan.coverageDetails,
                              adventureSports: checked
                            }
                          })}
                        />
                        <Label>Deportes de Aventura</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (plans.length > 1) {
                            deletePlan(selectedPlan.id);
                            setSelectedPlanId(plans[0].id);
                          } else {
                            toast({
                              title: "No se puede eliminar",
                              description: "Debe existir al menos un plan",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Plan
                      </Button>
                      <Button onClick={handleSave}>
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Zonas</CardTitle>
              <CardDescription>
                Define los multiplicadores de precio por zona geográfica y sus países
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.zones.map(zone => (
                  <div key={zone.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Nombre de la Zona</Label>
                      <Input 
                        value={zone.name}
                        onChange={(e) => {
                          updateSettings({
                            ...settings,
                            zones: settings.zones.map(z => 
                              z.id === zone.id ? { ...z, name: e.target.value } : z
                            )
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Multiplicador</Label>
                      <Input 
                        type="number"
                        value={zone.priceMultiplier}
                        onChange={(e) => {
                          updateSettings({
                            ...settings,
                            zones: settings.zones.map(z => 
                              z.id === zone.id ? { ...z, priceMultiplier: parseFloat(e.target.value) } : z
                            )
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Nivel de Riesgo</Label>
                      <Select
                        value={zone.riskLevel}
                        onValueChange={(value: 'low' | 'medium' | 'high') => {
                          updateSettings({
                            ...settings,
                            zones: settings.zones.map(z => 
                              z.id === zone.id ? { ...z, riskLevel: value } : z
                            )
                          });
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="age-ranges">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Rangos de Edad</CardTitle>
              <CardDescription>
                Define los multiplicadores de precio por rango de edad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.ageRanges.map((range, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Edad Mínima</Label>
                      <Input
                        type="number"
                        value={range.min}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index].min = parseInt(e.target.value);
                          updateSettings({ ...settings, ageRanges: newRanges });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Edad Máxima</Label>
                      <Input
                        type="number"
                        value={range.max}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index].max = parseInt(e.target.value);
                          updateSettings({ ...settings, ageRanges: newRanges });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Multiplicador</Label>
                      <Input
                        type="number"
                        value={range.priceMultiplier}
                        onChange={(e) => {
                          const newRanges = [...settings.ageRanges];
                          newRanges[index].priceMultiplier = parseFloat(e.target.value);
                          updateSettings({ ...settings, ageRanges: newRanges });
                        }}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const newRanges = settings.ageRanges.filter((_, i) => i !== index);
                        updateSettings({ ...settings, ageRanges: newRanges });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newRanges = [
                      ...settings.ageRanges,
                      { min: 0, max: 0, priceMultiplier: 1 }
                    ];
                    updateSettings({ ...settings, ageRanges: newRanges });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Rango de Edad
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Contactos de Emergencia</CardTitle>
              <CardDescription>
                Configura los contactos de emergencia por país
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.emergencyContacts.map(contact => (
                  <div key={contact.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>País</Label>
                      <Input 
                        value={contact.country}
                        onChange={(e) => {
                          updateSettings({
                            ...settings,
                            emergencyContacts: settings.emergencyContacts.map(c => 
                              c.id === contact.id ? { ...c, country: e.target.value } : c
                            )
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input 
                        value={contact.phone}
                        onChange={(e) => {
                          updateSettings({
                            ...settings,
                            emergencyContacts: settings.emergencyContacts.map(c => 
                              c.id === contact.id ? { ...c, phone: e.target.value } : c
                            )
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
                          updateSettings({
                            ...settings,
                            emergencyContacts: settings.emergencyContacts.map(c => 
                              c.id === contact.id ? { ...c, email: e.target.value } : c
                            )
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <Input 
                        value={contact.address}
                        onChange={(e) => {
                          updateSettings({
                            ...settings,
                            emergencyContacts: settings.emergencyContacts.map(c => 
                              c.id === contact.id ? { ...c, address: e.target.value } : c
                            )
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    updateSettings({
                      ...settings,
                      emergencyContacts: [
                        ...settings.emergencyContacts,
                        {
                          id: Date.now().toString(),
                          country: '',
                          phone: '',
                          email: '',
                          address: '',
                        }
                      ]
                    });
                  }}
                >
                  Agregar Contacto
                </Button>
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