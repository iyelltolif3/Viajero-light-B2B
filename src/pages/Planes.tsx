import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlansStore } from '@/store/plansStore';

export default function Planes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { plans } = usePlansStore();

  return (
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
                onClick={() => navigate('/checkout', { 
                  state: { 
                    selectedPlan: {
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
                    },
                    quotationData: state?.quotationData ? {
                      ...state.quotationData,
                      startDate: state.quotationData.startDate,
                      endDate: state.quotationData.endDate,
                      destination: state.quotationData.destination
                    } : undefined
                  } 
                })}
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
  );
} 