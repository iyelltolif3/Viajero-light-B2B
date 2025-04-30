import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlansStore } from '@/store/plansStore';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';

export default function Planes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { plans } = usePlansStore();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Función para proceder al checkout
  const proceedToCheckout = () => {
    navigate('/checkout', { 
      state: { 
        selectedPlan: selectedPlan,
        quotationData: state?.quotationData
      } 
    });
  };

  return (
    <>
      <div className="py-12 px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Planes de Asistencia en Viaje
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y viaja con la tranquilidad de estar protegido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  {plan.badge && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.priceDetail}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-primary shrink-0 mr-3" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.badge === 'Popular' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedPlan({
                      ...plan,
                      coverageDetails: {
                        ...plan.coverageDetails,
                        medicalCoverage: plan.coverageDetails.medicalCoverage,
                        luggageCoverage: plan.coverageDetails.luggageCoverage,
                        cancellationCoverage: plan.coverageDetails.cancellationCoverage,
                        covidCoverage: plan.coverageDetails.covidCoverage,
                        preExistingConditions: plan.coverageDetails.preExistingConditions,
                        adventureSports: plan.coverageDetails.adventureSports,
                      }
                    });
                    setShowDialog(true);
                  }}
                >
                  Seleccionar Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Todos nuestros planes incluyen asistencia 24/7 y cobertura COVID-19
          </p>
          <Button variant="link" onClick={() => navigate('/contacto')}>
            ¿Necesitas ayuda para elegir? Contáctanos
          </Button>
        </div>
      </div>

      {selectedPlan && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Detalles del Plan {selectedPlan.name}</DialogTitle>
              <DialogDescription>
                Revisa los detalles del plan antes de proceder
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Precio:</span>
                  <span>${selectedPlan.price} {selectedPlan.priceDetail}</span>
                </div>
                
                <h4 className="font-semibold mt-2">Coberturas:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span>Cobertura Médica:</span>
                    <span>${selectedPlan.coverageDetails.medicalCoverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cobertura Equipaje:</span>
                    <span>${selectedPlan.coverageDetails.luggageCoverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelación:</span>
                    <span>${selectedPlan.coverageDetails.cancellationCoverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cobertura COVID:</span>
                    <span>{selectedPlan.coverageDetails.covidCoverage ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condiciones preexistentes:</span>
                    <span>{selectedPlan.coverageDetails.preExistingConditions ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deportes de aventura:</span>
                    <span>{selectedPlan.coverageDetails.adventureSports ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <DialogClose asChild>
                <Button variant="outline" className="sm:w-auto w-full">
                  Cancelar
                </Button>
              </DialogClose>
              
              {user ? (
                <Button onClick={proceedToCheckout} className="sm:w-auto w-full">
                  Continuar con la compra
                </Button>
              ) : (
                <Button onClick={() => navigate('/login', { 
                  state: { 
                    returnTo: '/checkout',
                    selectedPlan: selectedPlan,
                    quotationData: state?.quotationData 
                  }
                })} className="sm:w-auto w-full">
                  Continuar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}