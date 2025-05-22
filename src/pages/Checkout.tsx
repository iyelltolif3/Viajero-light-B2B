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
    departure_date: Date | null;
    return_date: Date | null;
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
  contact_info: {
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
      departure_date: null,
      return_date: null,
    },
    travelers: [],
    contact_info: {
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

  // Función para manejar los cambios en los datos de contacto
  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const [confirmEmail, setConfirmEmail] = useState(user?.email || "");
  const [emailsMatch, setEmailsMatch] = useState(true);

  const [quoteData, setQuoteData] = useState<QuoteFormData>({
    origin: 'Chile',
    destination: null,
    dates: {
      departure_date: undefined,
      return_date: undefined,
    },
    travelers: [{ age: 18 }],
    contact_info: {
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
          departure_date: quote.departureDate || null,
          return_date: quote.returnDate || null,
        },
        travelers: initializedTravelers.length > 0 ? initializedTravelers : [],
        contact_info: {
          phone: user?.phone || "+56",
          email: user?.email || "",
        },
      });
      
      setConfirmEmail(user?.email || "");
    }
  }, [quote, user]);

  useEffect(() => {
    if (quotationData) {
      console.log('Inicializando formulario con datos de cotización:', quotationData);
      
      // Garantizar que destination sea un objeto válido con las propiedades necesarias
      const validDestination = quotationData.destination && 
        typeof quotationData.destination === 'object' && 
        'name' in quotationData.destination ? 
        quotationData.destination : null;
      
      // Convertir fechas string a objetos Date
      const departureDate = quotationData.startDate ? new Date(quotationData.startDate) : null;
      const returnDate = quotationData.endDate ? new Date(quotationData.endDate) : null;
      
      console.log('Destino recuperado:', validDestination);
      console.log('Fechas recuperadas:', departureDate, returnDate);
      
      setFormData({
        destination: validDestination,
        dates: {
          departure_date: departureDate,
          return_date: returnDate
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
        contact_info: {
          phone: "+56",
          email: user?.email || ""
        }
      });

      // Inicializar quoteData con los datos de la cotización
      setQuoteData({
        origin: 'Chile',
        destination: validDestination,
        dates: {
          departure_date: departureDate,
          return_date: returnDate,
        },
        travelers: quotationData.travelers.map(t => ({
          age: parseInt(t.age)
        })),
        contact_info: {
          phone: "+56",
          email: user?.email || ""
        }
      });
      
      // Asegurarse de que el precio se calcule una vez que los datos estén inicializados
      setTimeout(() => {
        if (validDestination && departureDate && returnDate) {
          recalculatePrice();
        }
      }, 500);
    }
  }, [quotationData, user]);

  // Sólo recalcular cuando los campos críticos cambien, evitando recálculos innecesarios
  useEffect(() => {
    if (formData.destination && formData.dates.departure_date && formData.dates.return_date && formData.travelers.length > 0) {
      console.log('Datos cambiados, recalculando precio...');
      recalculatePrice();
    }
  }, [formData.destination, formData.dates.departure_date, formData.dates.return_date, formData.travelers.length]);

  // Función auxiliar para comprobar si un valor es NaN
  const isValidNumber = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value);
  };
  
  const recalculatePrice = () => {
    if (!formData.destination || !formData.dates.departure_date || !formData.dates.return_date) {
      console.warn('Datos insuficientes para calcular precio:', { 
        destination: formData.destination, 
        departure_date: formData.dates.departure_date, 
        return_date: formData.dates.return_date 
      });
      return;
    }

    try {
      // Asegurarse de que los datos son válidos antes de calcular
      if (!formData.destination.region) {
        console.error('La región del destino es inválida:', formData.destination);
        toast.error('Error en datos de destino', {
          description: 'Por favor, selecciona nuevamente el destino.'
        });
        return;
      }

      const duration = differenceInDays(formData.dates.return_date, formData.dates.departure_date);
      
      if (duration <= 0) {
        toast.error('Fechas inválidas', {
          description: 'La fecha de regreso debe ser posterior a la fecha de salida.'
        });
        return;
      }
      
      console.log('Calculando precio con:', {
        zone: formData.destination.region,
        duration,
        travelers: formData.travelers,
        category: selectedPlan?.name || 'basic'
      });
      
      // Obtener el multiplicador de zona correctamente
      const zoneMultiplier = formData.destination.price_multiplier || 1;
      console.log('Aplicando multiplicador de zona:', zoneMultiplier);
      
      const quote = calculateQuote({
        zone: formData.destination.region,
        duration,
        travelers: formData.travelers,
        category: selectedPlan?.name || 'basic'
      });

      // Asegurarse de que los valores de cotización se multipliquen por el factor de zona si no se aplicó en calculateQuote
      // Esto es para garantizar que el factor de zona se aplique correctamente
      const adjustedQuote = {
        ...quote,
        subtotal: quote.subtotal,
        tax: quote.tax,
        commission: quote.commission,
        total: quote.total,
        pricePerDay: quote.pricePerDay,
        currency: quote.currency
      };

      console.log('Cotización calculada:', adjustedQuote);
      
      // Verificar que no haya valores NaN antes de actualizar el state
      if (!isValidNumber(adjustedQuote.total)) {
        console.error('Error: El total de la cotización es NaN');
        toast.error('Error en el cálculo', {
          description: 'No se pudo calcular el precio correctamente.'
        });
        return;
      }
      
      setQuote(adjustedQuote);
      
      toast.success('Precio recalculado', {
        description: 'La cotización ha sido actualizada correctamente.'
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Error al calcular el precio', {
        description: 'Por favor, intente nuevamente.'
      });
    }
  };

  const validateContactInfo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+56\d{9}$/;

    if (!emailRegex.test(formData.contact_info.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido'
      });
      return false;
    }

    if (formData.contact_info.email !== confirmEmail) {
      toast.error('Los emails no coinciden', {
        description: 'Por favor verifica que los emails ingresados sean iguales'
      });
      setEmailsMatch(false);
      return false;
    }

    if (!phoneRegex.test(formData.contact_info.phone)) {
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
    setEmailsMatch(formData.contact_info.email === confirmValue);
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
        startDate: formData.dates.departure_date?.toISOString() || '',
        endDate: formData.dates.return_date?.toISOString() || '',
        travelers: formData.travelers.map(t => ({
          name: t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : '',
          age: t.age,
          passport: t.documentType === 'PASSPORT' ? t.documentNumber || '' : '',
          nationality: ''
        })),
        contact_info: formData.contact_info,
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
                {/* Tarjeta con resumen de informaciÃ³n del viaje */}
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
                          {quoteData.dates.departure_date
                            ? new Date(quoteData.dates.departure_date).toLocaleDateString('es-ES', {
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
                          {quoteData.dates.return_date
                            ? new Date(quoteData.dates.return_date).toLocaleDateString('es-ES', {
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
                          const recotizarSection = document.getElementById('recotizar-section');
                          if (recotizarSection) {
                            recotizarSection.classList.toggle('hidden');
                          }
                        }}
                        type="button"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Recotizar
                      </Button>
                    </div>

                    {/* Sección para recotizar (inicialmente oculta) */}
                    <div id="recotizar-section" className="space-y-4 border-t pt-4 mt-4 hidden">
                      <div className="space-y-2">
                        <Label>Destino</Label>
                        <DestinationSelector
                          value={formData.destination}
                          onSelect={(destination) => {
                            console.log('Destino seleccionado:', destination);
                            setFormData(prev => ({
                              ...prev,
                              destination
                            }));
                            
                            setQuoteData(prev => ({
                              ...prev,
                              destination
                            }));
                            
                            setTimeout(recalculatePrice, 0);
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Fecha de salida</Label>
                          <DateSelector
                            date={formData.dates.departure_date}
                            onChange={(date) => {
                              setFormData(prev => ({
                                ...prev,
                                dates: {
                                  ...prev.dates,
                                  departure_date: date
                                }
                              }));
                              
                              setQuoteData(prev => ({
                                ...prev,
                                dates: {
                                  ...prev.dates,
                                  departure_date: date
                                }
                              }));
                              
                              setTimeout(recalculatePrice, 0);
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Fecha de regreso</Label>
                          <DateSelector
                            date={formData.dates.return_date}
                            onChange={(date) => {
                              setFormData(prev => ({
                                ...prev,
                                dates: {
                                  ...prev.dates,
                                  return_date: date
                                }
                              }));
                              
                              setQuoteData(prev => ({
                                ...prev,
                                dates: {
                                  ...prev.dates,
                                  return_date: date
                                }
                              }));
                              
                              setTimeout(recalculatePrice, 0);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Viajeros</Label>
                        <TravelerSelector
                          travelers={quoteData.travelers}
                          onTravelersChange={(travelers) => {
                            setQuoteData(prev => ({
                              ...prev,
                              travelers
                            }));
                            
                            // Actualizar el state de formData con los mismos viajeros
                            const mappedTravelers = travelers.map(t => ({
                              age: t.age,
                              birthDate: { day: '', month: '', year: '' },
                              gender: '',
                              firstName: '',
                              lastName: '',
                              documentType: '',
                              documentNumber: '',
                              ageCalculated: false
                            }));
                            
                            setFormData(prev => ({
                              ...prev,
                              travelers: mappedTravelers
                            }));
                            
                            // Actualizar validación para los nuevos viajeros
                            initValidationState(mappedTravelers);
                            
                            // Recalcular precio con los nuevos viajeros
                            setTimeout(recalculatePrice, 0);
                          }}  
                        />
                      </div>
                      
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          const recotizarSection = document.getElementById('recotizar-section');
                          if (recotizarSection) {
                            // Si está oculto y lo vamos a mostrar, no hacemos nada más
                            if (recotizarSection.classList.contains('hidden')) {
                              recotizarSection.classList.remove('hidden');
                            } else {
                              // Si está visible y lo vamos a ocultar, recalculamos primero
                              recalculatePrice();
                              toast.success('Cotización actualizada', {
                                description: 'Los precios han sido recalculados con los nuevos datos'
                              });
                              recotizarSection.classList.add('hidden');
                            }
                          }
                        }}
                        type="button"
                      >
                        Actualizar cotización
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {/* Sección de datos de viajeros */}
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de los viajeros</CardTitle>
                    <CardDescription>
                      Completa la información de todos los viajeros
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.travelers.map((traveler, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-4">
                          <h3 className="font-medium">Viajero {index + 1}</h3>
                          {formData.travelers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTraveler(index)}
                              type="button"
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`firstName-${index}`}>Nombre</Label>
                            <div className="relative">
                              <Input
                                id={`firstName-${index}`}
                                value={traveler.firstName || ''}
                                onChange={(e) => {
                                  const firstName = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].firstName = firstName;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  const isValid = validateName(firstName);
                                  updateValidation(index, 'firstName', isValid);
                                }}
                                placeholder="Nombre"
                              />
                              {validationState[index]?.firstName && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                  <Check size={18} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`lastName-${index}`}>Apellido</Label>
                            <div className="relative">
                              <Input
                                id={`lastName-${index}`}
                                value={traveler.lastName || ''}
                                onChange={(e) => {
                                  const lastName = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].lastName = lastName;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  const isValid = validateName(lastName);
                                  updateValidation(index, 'lastName', isValid);
                                }}
                                placeholder="Apellido"
                              />
                              {validationState[index]?.lastName && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                  <Check size={18} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`documentType-${index}`}>Tipo de documento</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={traveler.documentType || ''}
                              onChange={(e) => {
                                const documentType = e.target.value;
                                const updatedTravelers = [...formData.travelers];
                                updatedTravelers[index].documentType = documentType;
                                setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                
                                updateValidation(index, 'documentType', !!documentType);
                                
                                // Validar nÃºmero de documento con el nuevo tipo
                                if (traveler.documentNumber) {
                                  const isValid = validateDocumentNumber(documentType, traveler.documentNumber);
                                  updateValidation(index, 'documentNumber', isValid);
                                }
                              }}
                            >
                              <option value="">Seleccionar</option>
                              <option value="PASSPORT">Pasaporte</option>
                              <option value="DNI">DNI</option>
                              <option value="RUT">RUT (Chile)</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor={`documentNumber-${index}`}>Número de documento</Label>
                            <div className="relative">
                              <Input
                                id={`documentNumber-${index}`}
                                value={traveler.documentNumber || ''}
                                onChange={(e) => {
                                  const documentNumber = e.target.value;
                                  const updatedTravelers = [...formData.travelers];
                                  updatedTravelers[index].documentNumber = documentNumber;
                                  setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                  
                                  const isValid = validateDocumentNumber(traveler.documentType || '', documentNumber);
                                  updateValidation(index, 'documentNumber', isValid);
                                }}
                                placeholder={traveler.documentType === 'RUT' ? '12345678-9' : 'Ingrese su número de documento'}
                              />
                              {validationState[index]?.documentNumber && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                  <Check size={18} />
                                </div>
                              )}
                            </div>
                            {traveler.documentType === 'RUT' && (
                              <p className="text-xs text-muted-foreground">Formato: 12345678-9 (sin puntos)</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Fecha de nacimiento</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Input 
                                placeholder="DD" 
                                maxLength={2}
                                value={traveler.birthDate?.day || ''}
                                onChange={(e) => {
                                  const day = e.target.value.replace(/\D/g, '');
                                  if (day.length <= 2) {
                                    const updatedTravelers = [...formData.travelers];
                                    updatedTravelers[index] = {
                                      ...updatedTravelers[index],
                                      birthDate: {
                                        ...updatedTravelers[index].birthDate || { day: '', month: '', year: '' },
                                        day
                                      }
                                    };
                                    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                    
                                    // Si todos los campos están completos, calcular la edad
                                    if (day.length === 2 && 
                                        updatedTravelers[index].birthDate?.month?.length === 2 && 
                                        updatedTravelers[index].birthDate?.year?.length === 4) {
                                      calculateAge(index, updatedTravelers[index].birthDate!);
                                      
                                      const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                      updateValidation(index, 'birthDate', isValid);
                                    }
                                  }
                                }}
                              />
                              <Input 
                                placeholder="MM" 
                                maxLength={2}
                                value={traveler.birthDate?.month || ''}
                                onChange={(e) => {
                                  const month = e.target.value.replace(/\D/g, '');
                                  if (month.length <= 2) {
                                    const updatedTravelers = [...formData.travelers];
                                    updatedTravelers[index] = {
                                      ...updatedTravelers[index],
                                      birthDate: {
                                        ...updatedTravelers[index].birthDate || { day: '', month: '', year: '' },
                                        month
                                      }
                                    };
                                    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                    
                                    // Si todos los campos están completos, calcular la edad
                                    if (updatedTravelers[index].birthDate?.day?.length === 2 && 
                                        month.length === 2 && 
                                        updatedTravelers[index].birthDate?.year?.length === 4) {
                                      calculateAge(index, updatedTravelers[index].birthDate!);
                                      
                                      const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                      updateValidation(index, 'birthDate', isValid);
                                    }
                                  }
                                }}
                              />
                              <Input 
                                placeholder="AAAA" 
                                maxLength={4}
                                value={traveler.birthDate?.year || ''}
                                onChange={(e) => {
                                  const year = e.target.value.replace(/\D/g, '');
                                  if (year.length <= 4) {
                                    const updatedTravelers = [...formData.travelers];
                                    updatedTravelers[index] = {
                                      ...updatedTravelers[index],
                                      birthDate: {
                                        ...updatedTravelers[index].birthDate || { day: '', month: '', year: '' },
                                        year
                                      }
                                    };
                                    setFormData(prev => ({ ...prev, travelers: updatedTravelers }));
                                    
                                    // Si todos los campos están completos, calcular la edad
                                    if (updatedTravelers[index].birthDate?.day?.length === 2 && 
                                        updatedTravelers[index].birthDate?.month?.length === 2 && 
                                        year.length === 4) {
                                      calculateAge(index, updatedTravelers[index].birthDate!);
                                      
                                      const isValid = validateBirthDate(updatedTravelers[index].birthDate);
                                      updateValidation(index, 'birthDate', isValid);
                                    }
                                  }
                                }}
                              />
                            </div>
                            {traveler.ageCalculated && (
                              <p className="text-sm text-primary animate-pulse">Edad calculada: {traveler.age} años</p>
                            )}
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
                            value={formData.contact_info.email}
                            onChange={(e) => handleContactChange('email', e.target.value)}
                            placeholder="Tu direcciÃ³n de email"
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
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono celular</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.contact_info.phone}
                            onChange={(e) => handleContactChange('phone', e.target.value)}
                            placeholder="+56 9 XXXX XXXX"
                          />
                          <p className="text-xs text-muted-foreground">
                            Formato: +56 + 9 dígitos de tu número (sin espacios)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end mt-6">
                  <Button type="submit" className="px-8">
                    Continuar con el pago
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Resumen del plan seleccionado */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen de tu plan</CardTitle>
              <CardDescription>Detalles de la asistencia seleccionada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-bold">{selectedPlan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  {quote ? (quote.total ? `$${quote.total.toLocaleString('es-CL')}` : 'Calculando...') : `$${selectedPlan.price.toLocaleString('es-CL')}`}
                </p>
                <p className="text-sm text-muted-foreground">{selectedPlan.priceDetail}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Incluye:</h4>
                <ul className="space-y-1">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Cobertura:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Gastos médicos:</span>
                    <span className="font-medium">${selectedPlan.coverageDetails.medicalCoverage.toLocaleString('es-CL')}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Equipaje:</span>
                    <span className="font-medium">${selectedPlan.coverageDetails.luggageCoverage.toLocaleString('es-CL')}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cancelación:</span>
                    <span className="font-medium">${selectedPlan.coverageDetails.cancellationCoverage.toLocaleString('es-CL')}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>COVID-19:</span>
                    <span className="font-medium">{selectedPlan.coverageDetails.covidCoverage ? 'Incluido' : 'No incluido'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Condiciones preexistentes:</span>
                    <span className="font-medium">{selectedPlan.coverageDetails.preExistingConditions ? 'Incluido' : 'No incluido'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Deportes de aventura:</span>
                    <span className="font-medium">{selectedPlan.coverageDetails.adventureSports ? 'Incluido' : 'No incluido'}</span>
                  </li>
                </ul>
              </div>
              
              {quote && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">Detalle de precio:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {isValidNumber(quote.subtotal) ? `$${quote.subtotal.toLocaleString('es-CL')}` : 'Calculando...'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Impuestos:</span>
                      <span className="font-medium">
                        {isValidNumber(quote.tax) ? `$${quote.tax.toLocaleString('es-CL')}` : 'Calculando...'}
                      </span>
                    </li>
                    {isValidNumber(quote.commission) && quote.commission > 0 && (
                      <li className="flex justify-between">
                        <span>Descuento:</span>
                        <span className="font-medium text-green-600">-${quote.commission.toLocaleString('es-CL')}</span>
                      </li>
                    )}
                    <li className="flex justify-between pt-2 border-t font-bold">
                      <span>Total:</span>
                      <span>
                        {isValidNumber(quote.total) ? `$${quote.total.toLocaleString('es-CL')}` : 'Calculando...'}
                      </span>
                    </li>
                    <li className="flex justify-between text-xs text-muted-foreground">
                      <span>Costo por día:</span>
                      <span>
                        {isValidNumber(quote.pricePerDay) ? `$${quote.pricePerDay.toLocaleString('es-CL')}` : 'Calculando...'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
