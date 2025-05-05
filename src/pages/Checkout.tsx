import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ArrowLeft, Calculator } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
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

interface TravellerBirthDate {
  day: string;
  month: string;
  year: string;
}

interface CheckoutFormData {
  destination: Destination | null;
  dates: {
    departureDate: Date | null;
    returnDate: Date | null;
  };
  travelers: {
    age: number;
    birthDate?: TravellerBirthDate;
    gender?: string;
    firstName?: string;
    lastName?: string;
    documentType?: string;
    documentNumber?: string;
    ageCalculated?: boolean;
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
  // Propiedades adicionales para manejar la inicialización del formulario
  destination?: Destination;
  departureDate?: Date;
  returnDate?: Date;
  travelers?: {
    age: number;
  }[];
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPlan, quotationData } = (location.state as LocationState) || {};
  const { addAssistance } = useAssistancesStore();
  
  // Estado para tracking de validación de campos
  const [validationState, setValidationState] = useState<{
    [travelerId: number]: {
      firstName: boolean;
      lastName: boolean;
      documentNumber: boolean;
      documentType: boolean;
      gender: boolean;
      birthDate: boolean;
    };
  }>({});
  
  // Mensajes de validación
  const [validationMessages, setValidationMessages] = useState<{
    [travelerId: number]: {
      [field: string]: string;
    };
  }>({});

  // Funciones de validación
  const validateName = useCallback((name: string): boolean => {
    return name.trim().length >= 2;
  }, []);

  const validateDocumentNumber = useCallback((docType: string, number: string): boolean => {
    if (!docType || !number) return false;
    
    // RUT chileno: 12345678-9
    if (docType === 'RUT') {
      return /^\d{7,8}-?\d{1}$/.test(number);
    }
    // DNI: alfanumérico, al menos 5 caracteres
    else if (docType === 'DNI') {
      return /^[A-Za-z0-9]{5,}$/.test(number);
    }
    // Pasaporte: alfanumérico, al menos 6 caracteres
    else if (docType === 'PASSPORT') {
      return /^[A-Za-z0-9]{6,}$/.test(number);
    }
    return false;
  }, []);

  const validateBirthDate = useCallback((birthDate?: TravellerBirthDate): boolean => {
    if (!birthDate) return false;
    const { day, month, year } = birthDate;
    
    if (!day || !month || !year) return false;
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return false;
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    
    // Validar fecha completa
    const date = new Date(`${year}-${month}-${day}`);
    return !isNaN(date.getTime());
  }, []);

  // Función para actualizar el estado de validación
  const updateValidation = useCallback((travelerId: number, field: string, isValid: boolean, message?: string) => {
    setValidationState(prev => ({
      ...prev,
      [travelerId]: {
        ...prev[travelerId],
        [field]: isValid
      }
    }));
    
    if (message) {
      setValidationMessages(prev => ({
        ...prev,
        [travelerId]: {
          ...prev[travelerId],
          [field]: message
        }
      }));
    }
  }, []);

  const initValidationState = useCallback((travelers: any[]) => {
    const initialState: any = {};
    travelers.forEach((_, index) => {
      initialState[index] = {
        firstName: false,
        lastName: false,
        documentNumber: false,
        documentType: false,
        gender: false,
        birthDate: false
      };
    });
    setValidationState(initialState);
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    destination: null,
    dates: {
      departureDate: null,
      returnDate: null,
    },
    travelers: [],
    contactInfo: {
      phone: "",
      email: "",
    },
  });
  
  // Inicializar el estado de validación cuando se carguen o cambien los viajeros
  useEffect(() => {
    if (formData.travelers.length > 0) {
      initValidationState(formData.travelers);
    }
  }, [formData.travelers.length, initValidationState]);

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (travelerIndex: number, birthDate: TravellerBirthDate) => {
    const { day, month, year } = birthDate;
    
    // Validar que todos los campos estén completos y sean válidos
    if (!day || !month || !year || day === '' || month === '' || year === '') {
      return;
    }
    
    if (parseInt(day) < 1 || parseInt(day) > 31 || parseInt(month) < 1 || parseInt(month) > 12 || year.length !== 4) {
      return;
    }
    
    const birthDateObj = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    
    // Verificar que la fecha sea válida
    if (isNaN(birthDateObj.getTime())) {
      return;
    }
    
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    // Ajustar la edad si aún no ha cumplido años en este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    // Actualizar el estado con la edad calculada
    const updatedTravelers = [...formData.travelers];
    updatedTravelers[travelerIndex].age = age;
    updatedTravelers[travelerIndex].ageCalculated = true;
    
    // Después de un tiempo, quitar el indicador visual
    setTimeout(() => {
      const resetHighlight = [...formData.travelers];
      if (resetHighlight[travelerIndex]) {
        resetHighlight[travelerIndex].ageCalculated = false;
        setFormData(prev => ({ ...prev, travelers: resetHighlight }));
      }
    }, 2000);
    
    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
  };

  const [confirmEmail, setConfirmEmail] = useState(user?.email || "");
  const [emailsMatch, setEmailsMatch] = useState(true);

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
    if (quote) {
      // Preparar travelers con la estructura correcta para el formulario
      const initializedTravelers = (quote.travelers || []).map(traveler => ({
        ...traveler,
        birthDate: { day: '', month: '', year: '' },
        gender: '',
        firstName: '',
        lastName: '',
        documentType: '',
        documentNumber: '',
        ageCalculated: false
      }));
      
      // Setup form data from quote
      setFormData({
        destination: quote.destination || null,
        dates: {
          departureDate: quote.departureDate || null,
          returnDate: quote.returnDate || null,
        },
        travelers: initializedTravelers.length > 0 ? initializedTravelers : [],
        contactInfo: {
          phone: user?.phone || "+56",
          email: user?.email || "",
        },
      });
      
      setConfirmEmail(user?.email || "");
    }
  }, [quote, user]);

  useEffect(() => {
    if (quotationData) {
      setFormData({
        destination: quotationData.destination || null,
        dates: {
          departureDate: quotationData.startDate ? new Date(quotationData.startDate) : null,
          returnDate: quotationData.endDate ? new Date(quotationData.endDate) : null
        },
        travelers: quotationData.travelers.map(t => ({
          age: parseInt(t.age),
          birthDate: { day: '', month: '', year: '' },
          gender: '',
          firstName: '',
          lastName: '',
          documentType: '',
          documentNumber: '',
          ageCalculated: false
        })),
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
        travelers: quotationData.travelers.map(t => ({
          age: parseInt(t.age),
          birthDate: { day: '', month: '', year: '' },
          gender: '',
          firstName: '',
          lastName: '',
          documentType: '',
          documentNumber: '',
          ageCalculated: false
        })),
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
        description: 'Por favor ingresa un email válido'
      });
      return false;
    }

    if (formData.contactInfo.email !== confirmEmail) {
      toast.error('Los emails no coinciden', {
        description: 'Por favor verifica que los emails ingresados sean iguales'
      });
      setEmailsMatch(false);
      return false;
    }

    if (!phoneRegex.test(formData.contactInfo.phone)) {
      toast.error('Teléfono inválido', {
        description: 'Por favor ingresa un número de celular válido (9 dígitos)'
      });
      return false;
    }
    
    // Si todo es válido
    return true;
  };
  
  // Función para manejar el cambio en el email de confirmación
  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value;
    setConfirmEmail(confirmValue);
    setEmailsMatch(formData.contactInfo.email === confirmValue);
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
                {/* Tarjeta con resumen de información del viaje */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Detalles del Viaje</CardTitle>
                    <CardDescription>
                      Esta es la información de su viaje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Destino</h4>
                        <p>{quoteData.destination?.name || 'No seleccionado'}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Fecha de salida</h4>
                        <p>
                          {quoteData.dates.departureDate
                            ? new Date(quoteData.dates.departureDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'No seleccionada'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Fecha de regreso</h4>
                        <p>
                          {quoteData.dates.returnDate
                            ? new Date(quoteData.dates.returnDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'No seleccionada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <h4 className="text-sm font-medium">{formData.travelers.length} {formData.travelers.length === 1 ? 'viajero' : 'viajeros'}</h4>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Mostrar la sección de recotización
                          document.getElementById('recotizar-section')?.classList.toggle('hidden');
                        }}
                        type="button"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Recotizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sección de Recotización (oculta por defecto) */}
                <Card className="border-dashed hidden" id="recotizar-section">
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

                {/* Información de viajeros - ahora con más campos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de los Pasajeros</CardTitle>
                    <CardDescription>
                      Ingresa los datos de cada uno de los pasajeros
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.travelers.map((traveler, index) => (
                      <div key={index} className="relative space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Pasajero {index + 1}</h3>
                          {formData.travelers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0"
                              onClick={() => handleRemoveTraveler(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Nombre/s completo/s</Label>
                            <div className="relative">
                              <Input
                                id={`name-${index}`}
                                placeholder="Tu/s nombre/s completo/s"
                                value={formData.travelers[index]?.firstName || ''}
                                className={`${validationState[index]?.firstName ? 'pr-10 border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                                onChange={(e) => {
                                  const firstName = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].firstName = firstName;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  // Validar el nombre
                                  const isValid = validateName(firstName);
                                  updateValidation(index, 'firstName', isValid);
                                }}
                              />
                              {validationState[index]?.firstName && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                  <Check size={18} />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`surname-${index}`}>Apellido/s</Label>
                            <div className="relative">
                              <Input
                                id={`surname-${index}`}
                                placeholder="Tu/s apellido/s completo/s"
                                value={formData.travelers[index]?.lastName || ''}
                                className={`${validationState[index]?.lastName ? 'pr-10 border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                                onChange={(e) => {
                                  const lastName = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].lastName = lastName;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  // Validar el apellido
                                  const isValid = validateName(lastName);
                                  updateValidation(index, 'lastName', isValid);
                                }}
                              />
                              {validationState[index]?.lastName && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                  <Check size={18} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`document-${index}`}>Documento</Label>
                            <div className="flex gap-2 relative">
                              <select 
                                className={`flex h-10 w-[100px] rounded-md border ${validationState[index]?.documentType ? 'border-green-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background`}
                                value={formData.travelers[index]?.documentType || ''}
                                onChange={(e) => {
                                  const documentType = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].documentType = documentType;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  // Validar si hay un tipo de documento seleccionado
                                  updateValidation(index, 'documentType', !!documentType);
                                  
                                  // Re-validar el número de documento con el nuevo tipo
                                  if (updatedTravelers[index].documentNumber) {
                                    const isDocValid = validateDocumentNumber(
                                      documentType, 
                                      updatedTravelers[index].documentNumber || ''
                                    );
                                    updateValidation(index, 'documentNumber', isDocValid);
                                  }
                                }}
                              >
                                <option value="">Tipo</option>
                                <option value="RUT">RUT</option>
                                <option value="DNI">DNI</option>
                                <option value="PASSPORT">Pasaporte</option>
                              </select>
                              <div className="relative flex-1">
                                <Input
                                  id={`document-number-${index}`}
                                  placeholder="00000000A"
                                  className={`flex-1 ${validationState[index]?.documentNumber ? 'pr-10 border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                                  value={formData.travelers[index]?.documentNumber || ''}
                                  onChange={(e) => {
                                    const documentNumber = e.target.value;
                                    const updatedTravelers = [...formData.travelers];
                                    updatedTravelers[index].documentNumber = documentNumber;
                                    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                    
                                    // Validar el número de documento según el tipo
                                    const isValid = validateDocumentNumber(
                                      updatedTravelers[index].documentType || '', 
                                      documentNumber
                                    );
                                    updateValidation(index, 'documentNumber', isValid);
                                  }}
                                />
                                {validationState[index]?.documentNumber && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                    <Check size={18} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`age-${index}`}>Edad</Label>
                            <Input
                              id={`age-${index}`}
                              value={traveler.age.toString()}
                              className={cn(traveler.ageCalculated ? "bg-green-50 text-green-900 border-green-500" : "")}
                              readOnly
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor={`birth-day-${index}`}>Fecha de nacimiento</Label>
                            <div className="flex gap-2 relative">
                              <Input
                                id={`birth-day-${index}`}
                                placeholder="DD"
                                className={`w-[80px] ${validationState[index]?.birthDate ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                                value={formData.travelers[index]?.birthDate?.day || ''}
                                onChange={(e) => {
                                  const day = e.target.value;
                                  // Validar que solo sean números y máximo 2 dígitos
                                  if (/^\d{0,2}$/.test(day)) {
                                    const updatedTravelers = [...formData.travelers];
                                    if (!updatedTravelers[index].birthDate) {
                                      updatedTravelers[index].birthDate = { day, month: '', year: '' };
                                    } else {
                                      updatedTravelers[index].birthDate.day = day;
                                    }
                                    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                    
                                    // Validar la fecha de nacimiento completa
                                    const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                    updateValidation(index, 'birthDate', isValid);
                                    
                                    // Calcular edad si todos los campos están completos
                                    if (day && updatedTravelers[index].birthDate?.month && updatedTravelers[index].birthDate?.year) {
                                      calculateAge(index, updatedTravelers[index].birthDate);
                                    }
                                  }
                                }}
                              />
                              <select 
                                className={`flex h-10 w-[80px] rounded-md border ${validationState[index]?.birthDate ? 'border-green-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background`}
                                value={formData.travelers[index]?.birthDate?.month || ''}
                                onChange={(e) => {
                                  const month = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  if (!updatedTravelers[index].birthDate) {
                                    updatedTravelers[index].birthDate = { day: '', month, year: '' };
                                  } else {
                                    updatedTravelers[index].birthDate.month = month;
                                  }
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  // Validar la fecha de nacimiento completa
                                  const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                  updateValidation(index, 'birthDate', isValid);
                                  
                                  // Calcular edad si todos los campos están completos
                                  if (updatedTravelers[index].birthDate?.day && month && updatedTravelers[index].birthDate?.year) {
                                    calculateAge(index, updatedTravelers[index].birthDate);
                                  }
                                }}
                              >
                                <option value="">Mes</option>
                                <option value="01">01</option>
                                <option value="02">02</option>
                                <option value="03">03</option>
                                <option value="04">04</option>
                                <option value="05">05</option>
                                <option value="06">06</option>
                                <option value="07">07</option>
                                <option value="08">08</option>
                                <option value="09">09</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                              </select>
                              <div className="relative flex-1">
                                <Input
                                  id={`birth-year-${index}`}
                                  placeholder="AAAA"
                                  className={`flex-1 ${validationState[index]?.birthDate ? 'pr-10 border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                                  value={formData.travelers[index]?.birthDate?.year || ''}
                                  onChange={(e) => {
                                    const year = e.target.value;
                                    // Validar que solo sean números y máximo 4 dígitos
                                    if (/^\d{0,4}$/.test(year)) {
                                      const updatedTravelers = [...formData.travelers];
                                      if (!updatedTravelers[index].birthDate) {
                                        updatedTravelers[index].birthDate = { day: '', month: '', year };
                                      } else {
                                        updatedTravelers[index].birthDate.year = year;
                                      }
                                      setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                      
                                      // Validar la fecha de nacimiento completa
                                      const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                      updateValidation(index, 'birthDate', isValid);
                                      
                                      // Calcular edad si todos los campos están completos
                                      if (updatedTravelers[index].birthDate?.day && updatedTravelers[index].birthDate?.month && year) {
                                        calculateAge(index, updatedTravelers[index].birthDate);
                                      }
                                    }
                                  }}
                                />
                                {validationState[index]?.birthDate && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                    <Check size={18} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Campo de edad calculada automáticamente */}
                          <div className="space-y-2">
                            <Label htmlFor={`calculated-age-${index}`}>Edad</Label>
                            <div className={`flex items-center h-10 px-3 rounded-md border border-input ${formData.travelers[index]?.ageCalculated ? 'bg-primary/10' : 'bg-background'} transition-colors duration-500`}>
                              <span className="text-sm">
                                {formData.travelers[index]?.age !== undefined ? `${formData.travelers[index].age} años` : '-'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`gender-${index}`}>Sexo / género</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={formData.travelers[index]?.gender || ''}
                              onChange={(e) => {
                                const gender = e.target.value;
                                const updatedTravelers = [...formData.travelers];
                                updatedTravelers[index].gender = gender;
                                setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                              }}
                            >
                              <option value="">Seleccionar</option>
                              <option value="Femenino">Femenino</option>
                              <option value="Masculino">Masculino</option>
                              <option value="No binario">No binario</option>
                              <option value="Prefiero no decir">Prefiero no decir</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Contact Information Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>¿A quién enviamos los datos de la asistencia?</CardTitle>
                    <CardDescription>
                      Esta persona recibirá toda la información y documentación del viaje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email (donde recibirás la documentación)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => handleContactChange('email', e.target.value)}
                            placeholder="Tu dirección de email"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email-confirm">Confirma tu email</Label>
                          <div className="relative">
                            <Input
                              id="email-confirm"
                              type="email"
                              value={confirmEmail}
                              onChange={handleConfirmEmailChange}
                              placeholder="Tu dirección de email"
                              className={!emailsMatch && confirmEmail ? 'border-red-500 pr-10' : ''}
                            />
                            {!emailsMatch && confirmEmail && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {!emailsMatch && confirmEmail && (
                            <p className="text-xs text-red-500 mt-1">
                              Los correos electrónicos no coinciden
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="block mb-2">Tipo</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            defaultValue="Celular"
                          >
                            <option value="Celular">Celular</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <div className="flex gap-2">
                            <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                              +56
                            </div>
                            <Input
                              id="phone"
                              value={formData.contactInfo.phone.startsWith('+56') 
                                ? formData.contactInfo.phone.substring(3) 
                                : formData.contactInfo.phone}
                              onChange={(e) => {
                                const phoneValue = e.target.value;
                                // Validar que solo contenga números
                                if (/^\d*$/.test(phoneValue)) {
                                  handleContactChange('phone', `+56${phoneValue}`);
                                }
                              }}
                              placeholder="912345678"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ingresa tu número de celular sin el prefijo (9 dígitos)
                          </p>
                        </div>
                      </div>
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