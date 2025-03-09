import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface LocationState {
  selectedPlan: {
    name: string;
    price: number;
    priceDetail: string;
    features: string[];
    maxDays: number;
  };
  quotationData?: {
    startDate: string;
    endDate: string;
    travelers: {
      name: string;
      age: string;
      passport: string;
      nationality: string;
    }[];
  };
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPlan, quotationData } = (location.state as LocationState) || {};
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    travelers: [{
      name: '',
      age: '',
      passport: '',
      nationality: ''
    }]
  });

  useEffect(() => {
    if (quotationData) {
      setFormData({
        startDate: quotationData.startDate || '',
        endDate: quotationData.endDate || '',
        travelers: quotationData.travelers || [{
          name: '',
          age: '',
          passport: '',
          nationality: ''
        }]
      });
    }
  }, [quotationData]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Procesando tu compra",
      description: "Estamos preparando tu asistencia de viaje...",
    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Información de viajeros */}
                <div className="space-y-4">
                  <h3 className="font-medium">Información de Viajeros</h3>
                  {formData.travelers.map((traveler, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Nombre completo</Label>
                        <Input
                          id={`name-${index}`}
                          value={traveler.name}
                          onChange={(e) => {
                            const newTravelers = [...formData.travelers];
                            newTravelers[index].name = e.target.value;
                            setFormData({...formData, travelers: newTravelers});
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`age-${index}`}>Edad</Label>
                        <Input
                          id={`age-${index}`}
                          type="number"
                          value={traveler.age}
                          onChange={(e) => {
                            const newTravelers = [...formData.travelers];
                            newTravelers[index].age = e.target.value;
                            setFormData({...formData, travelers: newTravelers});
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`passport-${index}`}>Pasaporte</Label>
                        <Input
                          id={`passport-${index}`}
                          value={traveler.passport}
                          onChange={(e) => {
                            const newTravelers = [...formData.travelers];
                            newTravelers[index].passport = e.target.value;
                            setFormData({...formData, travelers: newTravelers});
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`nationality-${index}`}>Nacionalidad</Label>
                        <Input
                          id={`nationality-${index}`}
                          value={traveler.nationality}
                          onChange={(e) => {
                            const newTravelers = [...formData.travelers];
                            newTravelers[index].nationality = e.target.value;
                            setFormData({...formData, travelers: newTravelers});
                          }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      ...formData,
                      travelers: [...formData.travelers, { name: '', age: '', passport: '', nationality: '' }]
                    })}
                  >
                    Agregar Viajero
                  </Button>
                </div>

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
                    ${selectedPlan.price} {selectedPlan.priceDetail}
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="w-full pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${selectedPlan.price}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 