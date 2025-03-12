import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ArrowLeft, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DateSelector from '@/components/DateSelector';
import DestinationSelector from '@/components/DestinationSelector';
import TravelerSelector from '@/components/TravelerSelector';
import { calculateQuote } from '@/lib/pricing';
import type { Destination, QuoteFormData, Assistance, QuoteCalculationParams } from '@/types';
import { useAssistancesStore } from '@/store/assistancesStore';
import { usePlansStore } from '@/store/plansStore';
import { differenceInDays } from 'date-fns';

interface LocationState {
  selectedPlan: {
    name: string;
    price: number;
    priceDetail: string;
    features: string[];
    maxDays: number;
    coverageDetails: {
      medicalCoverage: number;
      luggageCoverage: number;
      cancellationCoverage: number;
      covidCoverage: boolean;
      preExistingConditions: boolean;
      adventureSports: boolean;
    };
  };
  quotationData?: {
    startDate: string;
    endDate: string;
    destination?: Destination;
    travelers: {
      name: string;
      age: string;
      passport: string;
      nationality: string;
    }[];
  };
}

interface CheckoutFormData {
  destination: Destination | null;
  dates: {
    departureDate: Date | null;
    returnDate: Date | null;
  };
  travelers: {
    age: number;
  }[];
  contactInfo: {
    phone: string;
    email: string;
  };
}

interface QuoteResult {
  subtotal: number;
  tax: number;
  commission: number;
  total: number;
  pricePerDay: number;
  currency: string;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPlan, quotationData } = (location.state as LocationState) || {};
  const { addAssistance } = useAssistancesStore();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    destination: null,
    dates: {
      departureDate: null,
      returnDate: null
    },
    travelers: [],
    contactInfo: {
      phone: "+56",
      email: user?.email || ""
    }
  });

  const [quoteData, setQuoteData] = useState<QuoteFormData>({
    origin: 'Chile',
    destination: null,
    dates: {
      departureDate: undefined,
      returnDate: undefined,
    },
    travelers: [{ age: 18 }],
    contactInfo: {
      phone: "+56",
      email: user?.email || ""
    }
  });

  const [totalPrice, setTotalPrice] = useState(selectedPlan?.price || 0);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  useEffect(() => {
    if (quotationData) {
      setFormData({
        destination: quotationData.destination || null,
        dates: {
          departureDate: quotationData.startDate ? new Date(quotationData.startDate) : null,
          returnDate: quotationData.endDate ? new Date(quotationData.endDate) : null
        },
        travelers: quotationData.travelers.map(t => ({ age: parseInt(t.age) })),
        contactInfo: {
          phone: "+56",
          email: user?.email || ""
        }
      });

      // Inicializar quoteData con los datos de la cotización
      setQuoteData({
        origin: 'Chile',
        destination: quotationData.destination || null,
        dates: {
          departureDate: quotationData.startDate ? new Date(quotationData.startDate) : undefined,
          returnDate: quotationData.endDate ? new Date(quotationData.endDate) : undefined,
        },
        travelers: quotationData.travelers.map(t => ({ age: parseInt(t.age) })),
        contactInfo: {
          phone: "+56",
          email: user?.email || ""
        }
      });
    }
  }, [quotationData]);

  useEffect(() => {
    recalculatePrice();
  }, [formData]);

  const recalculatePrice = () => {
    if (!formData.destination || !formData.dates.departureDate || !formData.dates.returnDate) {
      return;
    }

    try {
      const duration = differenceInDays(formData.dates.returnDate, formData.dates.departureDate);
      const quote = calculateQuote({
        zone: formData.destination.region,
        duration,
        travelers: formData.travelers,
        category: selectedPlan?.name || 'basic'
      });

      setQuote(quote);
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Error al calcular el precio', {
        description: 'Por favor, intente nuevamente.'
      });
    }
  };

  if (!selectedPlan) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No hay plan seleccionado</h1>
          <p className="text-muted-foreground mb-6">
            Por favor, selecciona un plan de asistencia para continuar
          </p>
          <Button onClick={() => navigate('/planes')}>
            Ver Planes Disponibles
          </Button>
        </div>
      </div>
    );
  }

  const handleContactChange = (field: keyof CheckoutFormData['contactInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));

    setQuoteData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo!,
        [field]: value
      }
    }));
  };

  const validateContactInfo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+56\d{9}$/;

    if (!emailRegex.test(formData.contactInfo.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingrese un email válido'
      });
      return false;
    }

    if (!phoneRegex.test(formData.contactInfo.phone)) {
      toast.error('Teléfono inválido', {
        description: 'Por favor ingrese un número válido con formato +56XXXXXXXXX'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !selectedPlan || !quote) {
      toast.warning('Campos incompletos', {
        description: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    if (!validateContactInfo()) {
      return;
    }

    try {
      const assistance: Omit<Assistance, 'id'> = {
        planName: selectedPlan.name,
        status: 'future',
        startDate: formData.dates.departureDate?.toISOString() || '',
        endDate: formData.dates.returnDate?.toISOString() || '',
        travelers: formData.travelers.map(t => ({
          name: '',
          age: t.age,
          passport: '',
          nationality: ''
        })),
        contactInfo: formData.contactInfo,
        totalPrice: quote.total,
        planDetails: {
          coverageDetails: selectedPlan.coverageDetails,
          features: selectedPlan.features
        },
        destination: {
          name: formData.destination.name,
          region: formData.destination.region
        }
      };

      // Aquí iría la lógica para guardar la asistencia
      console.log('Asistencia a guardar:', assistance);
      toast.success('¡Éxito!', {
        description: 'La asistencia ha sido creada correctamente.'
      });
    } catch (error) {
      console.error('Error al crear la asistencia:', error);
      toast.error('Error', {
        description: 'Error al crear la asistencia. Por favor, intente nuevamente.'
      });
    }
  };

  const handleRemoveTraveler = (index: number) => {
    if (formData.travelers.length > 1) {
      const newFormTravelers = formData.travelers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, travelers: newFormTravelers }));

      const newQuoteTravelers = quoteData.travelers.filter((_, i) => i !== index);
      setQuoteData(prev => ({ ...prev, travelers: newQuoteTravelers }));
      
      // Recalcular precio después de eliminar viajero
      setTimeout(recalculatePrice, 0);
    } else {
      toast.warning('No se puede eliminar', {
        description: 'Debe haber al menos un viajero'
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de checkout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Viaje</CardTitle>
              <CardDescription>
                Complete los datos necesarios para su asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de Recotización */}
                <Card className="border-dashed">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Recotizar</CardTitle>
                        <CardDescription>
                          Modifica los detalles del viaje para actualizar el precio
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={recalculatePrice}
                        type="button"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Recalcular
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Destino</Label>
                      <DestinationSelector
                        label=""
                        value={quoteData.destination}
                        onSelect={(destination) => {
                          setQuoteData(prev => ({ ...prev, destination }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Fechas</Label>
                      <DateSelector
                        onDatesChange={(dates) => {
                          setQuoteData(prev => ({ ...prev, dates }));
                          setFormData(prev => ({
                            ...prev,
                            dates: {
                              departureDate: dates.departureDate,
                              returnDate: dates.returnDate
                            }
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Viajeros</Label>
                      <TravelerSelector
                        onTravelersChange={(travelers) => {
                          setQuoteData(prev => ({ ...prev, travelers }));
                          setFormData(prev => ({
                            ...prev,
                            travelers: travelers.map(t => ({ age: t.age }))
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Información de viajeros */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Información de Viajeros</h3>
                    <span className="text-sm text-muted-foreground">
                      {formData.travelers.length} {formData.travelers.length === 1 ? 'viajero' : 'viajeros'}
                    </span>
                  </div>
                  {formData.travelers.map((traveler, index) => (
                    <div key={index} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      {formData.travelers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                          onClick={() => handleRemoveTraveler(index)}
                        >
                          ×
                        </Button>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor={`age-${index}`}>Edad</Label>
                        <Input
                          id={`age-${index}`}
                          value={traveler.age.toString()}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                    <CardDescription>
                      Esta información será utilizada para todos los viajeros
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="+56912345678"
                        className="max-w-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        Ingrese un número de teléfono chileno válido
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="max-w-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full">
                  Proceder al Pago
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de la compra */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedPlan.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${totalPrice.toFixed(2)} {selectedPlan.priceDetail}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Incluye:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Detalles de Cobertura:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Cobertura Médica:</span>
                      <span>USD {selectedPlan.coverageDetails.medicalCoverage.toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cobertura de Equipaje:</span>
                      <span>USD {selectedPlan.coverageDetails.luggageCoverage.toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Cancelación de Viaje:</span>
                      <span>USD {selectedPlan.coverageDetails.cancellationCoverage.toLocaleString()}</span>
                    </li>
                    {selectedPlan.coverageDetails.covidCoverage && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
                        Cobertura COVID-19
                      </li>
                    )}
                    {selectedPlan.coverageDetails.preExistingConditions && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
                        Condiciones Preexistentes
                      </li>
                    )}
                    {selectedPlan.coverageDetails.adventureSports && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
                        Deportes de Aventura
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="w-full pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}