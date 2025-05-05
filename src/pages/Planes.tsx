import { Check, ShieldCheck, Ambulance, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlansStore } from '@/store/plansStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

export default function Planes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { plans } = usePlansStore();
  const { settings } = useSettingsStore();

  // Obtener colores de la configuración
  const primaryColor = settings?.branding?.primaryColor || '#0f172a';
  const secondaryColor = settings?.branding?.secondaryColor || '#64748b';

  return (
    <div className="py-12 px-4 md:px-12 lg:px-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Planes de Asistencia en Viaje
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades y viaja con la tranquilidad de estar protegido
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto">
        {plans.map((plan) => {
          // Determinar el color del badge según si es popular o no
          const badgeColor = plan.badge?.toLowerCase().includes('popular') ? primaryColor : secondaryColor;
          // Valores de cobertura médica para mostrar
          const medicalCoverage = plan.coverageDetails?.medicalCoverage ? 
            `USD ${(plan.coverageDetails.medicalCoverage/1000).toLocaleString()}K` : 'No incluido';

          return (
            <Card key={plan.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[580px]">
              {/* Banner superior con badge */}
              {plan.badge && (
                <div 
                  className="w-full py-3 px-4 flex justify-center items-center font-bold text-white uppercase tracking-wide"
                  style={{ backgroundColor: badgeColor }}
                >
                  {plan.badge}
                </div>
              )}
              
              {/* Título del plan */}
              <div className="text-center pt-8 pb-4 px-6">
                <h3 className="text-3xl font-bold tracking-tight mb-1">{plan.name}</h3>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </div>
              
              {/* Monto de cobertura */}
              <div className="text-center pb-4 mt-2">
                <p className="text-xl font-medium">USD {medicalCoverage}</p>
              </div>
              
              {/* Precio destacado */}
              <div className="text-center py-6 my-2">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold flex items-end">
                    <span className="text-2xl">$</span>
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">{plan.priceDetail}</span>
                </div>
              </div>
              
              {/* Características principales */}
              <CardContent className="flex-1 pt-6 px-8">
                <ul className="space-y-6">
                  {plan.features.slice(0, 3).map((feature, index) => {
                    // Elegir un icono diferente por característica
                    let Icon = Check;
                    if (index === 0) Icon = ShieldCheck;
                    if (index === 1) Icon = Ambulance;
                    if (index === 2) Icon = Clock;
                    
                    return (
                      <li key={feature} className="flex items-center mb-3">
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center mr-3 shrink-0"
                          style={{ backgroundColor: `${primaryColor}20` }} // Color primario con 20% de opacidad
                        >
                          <Icon style={{ color: primaryColor }} className="h-3.5 w-3.5 shrink-0" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    );
                  })}
                  
                  {/* Mostrar cantidad si hay más características */}
                  {plan.features.length > 3 && (
                    <li className="text-xs text-muted-foreground text-center mt-2">
                      + {plan.features.length - 3} más características
                    </li>
                  )}
                </ul>
              </CardContent>
              
              {/* Botón de acción */}
              <CardFooter className="px-6 pb-8 pt-6">
                <Button 
                  className="w-full py-6 text-base font-medium tracking-wide" 
                  style={{ 
                    backgroundColor: plan.badge ? badgeColor : undefined,
                    borderColor: plan.badge ? badgeColor : undefined
                  }}
                  variant={plan.badge ? 'default' : 'outline'}
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
                      quotationData: state?.quotationData
                    } 
                  })}
                >
                  COMPRAR
                </Button>
              </CardFooter>
              
              {/* Fondo decorativo inferior - similar a la ola del diseño de referencia */}
              <div className="relative h-12 w-full overflow-hidden bg-slate-100">
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-white"
                  style={{ 
                    borderTopLeftRadius: '50%', 
                    borderTopRightRadius: '50%',
                    marginLeft: '-10%',
                    marginRight: '-10%',
                    width: '120%'
                  }}>
                </div>
              </div>
            </Card>
          );
        })}
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