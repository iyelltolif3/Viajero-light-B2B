import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Users, ArrowRight, Globe, Shield, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import DestinationSelector from './DestinationSelector';
import DateSelector from './DateSelector';
import TravelerSelector from './TravelerSelector';
import { QuoteFormData } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useSettingsStore } from '@/store/settingsStore';

interface HeroSectionProps {
  className?: string;
}

// Función para obtener un color más oscuro a partir de un hex
const getDarkerColor = (hex: string): string => {
  // Validar formato hex
  if (!hex || !hex.startsWith('#') || hex.length !== 7) {
    return '#b91c1c'; // Fallback a un rojo oscuro
  }

  try {
    // Convertir hex a RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Oscurecer los valores (multiplicar por 0.8 para obtener un 20% más oscuro)
    const darkerR = Math.floor(r * 0.8);
    const darkerG = Math.floor(g * 0.8);
    const darkerB = Math.floor(b * 0.8);
    
    // Convertir de nuevo a hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    return '#b91c1c'; // Fallback a un rojo oscuro en caso de error
  }
};

export function HeroSection({ className }: HeroSectionProps) {
  // State for form data
  const [formData, setFormData] = useState<QuoteFormData>({
    origin: 'Chile',
    destination: null,
    dates: {
      departureDate: undefined,
      returnDate: undefined,
    },
    travelers: [{ age: 35 }]
  });

  const navigate = useNavigate();
  
  // Obtener la configuración de colores del store
  const { settings } = useSettingsStore();
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar datos necesarios
    if (!formData.destination || !formData.dates.departureDate || !formData.dates.returnDate) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos necesarios.",
        variant: "destructive"
      });
      return;
    }

    // Preparar los datos de la cotización
    const quotationData = {
      startDate: formData.dates.departureDate.toISOString().split('T')[0],
      endDate: formData.dates.returnDate.toISOString().split('T')[0],
      travelers: formData.travelers.map(traveler => ({
        name: '',
        age: traveler.age.toString(),
        passport: '',
        nationality: ''
      }))
    };

    // Redirigir a la página de planes con los datos de la cotización
    navigate('/planes', { 
      state: { 
        quotationData 
      } 
    });
  }

  // Obtener los colores para el gradiente
  const primaryColor = useMemo(() => {
    return settings?.branding?.primaryColor || '#ef4444';
  }, [settings?.branding?.primaryColor]);
  
  const darkerPrimaryColor = useMemo(() => {
    return getDarkerColor(primaryColor);
  }, [primaryColor]);

  return (
    <section className={cn("flex flex-col", className)}>
      {/* Hero Header con gradiente dinámico basado en color de marca */}
      <div 
        className="bg-gradient-to-r relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${darkerPrimaryColor})`
        }}
      >
        {/* Círculos decorativos con colores dinámicos */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}></div>
        <div className="absolute -left-20 bottom-0 w-40 h-40 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}></div>
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Texto principal */}
            <div className="lg:col-span-2 text-white space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                  TU PLAN ES VIAJAR
                </h1>
                <p className="text-xl md:text-2xl font-bold mt-2">EL NUESTRO, CUIDARTE</p>
              </div>
              
              <div className="rounded-lg p-4 inline-block" style={{ backgroundColor: `${darkerPrimaryColor}40` }}>
                <div className="text-2xl md:text-3xl font-bold mb-1">35% OFF</div>
                <div className="text-lg">12 Cuotas sin interés</div>
              </div>
            </div>

            {/* Formulario de cotización */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Cotiza tu asistencia al viajero</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* País de origen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-red-600" />
                        </div>
                        <Input 
                          value={formData.origin}
                          readOnly 
                          className="w-full pl-10 h-12 bg-gray-50 border border-gray-200 rounded-md text-gray-900"
                        />
                      </div>
                    </div>

                    {/* País de destino */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País de destino</label>
                      <DestinationSelector
                        label="¿A dónde viajas?"
                        placeholder="¿A dónde viajas?"
                        onSelect={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                        value={formData.destination}
                        className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                      />
                    </div>
                    
                    {/* Fechas de viaje */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <DateSelector
                          onDatesChange={(dates) => setFormData(prev => ({ ...prev, dates }))}
                          className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                        />
                      </div>
                    </div>

                    {/* Viajeros */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Viajeros</label>
                      <TravelerSelector
                        onTravelersChange={(travelers) => setFormData(prev => ({ ...prev, travelers }))}
                        className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                      />
                    </div>

                    {/* Botón de cotizar */}
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md border-0 flex items-center justify-center gap-2"
                      >
                        Cotizar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de beneficios */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">Asistencia al viajero, ¿qué es y por qué la necesitas?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cobertura médica</h3>
              <p className="text-gray-600">Gastos médicos por enfermedad o accidente durante tu viaje, incluyendo atención hospitalaria y medicamentos.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Asistencia global</h3>
              <p className="text-gray-600">Servicio de asistencia disponible las 24 horas, los 7 días de la semana en más de 100 países del mundo.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Emergencias 24/7</h3>
              <p className="text-gray-600">Asistencia telefónica y por videollamada ante cualquier emergencia durante tu viaje, en tu idioma.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner promocional */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl py-6 px-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-white text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold">¿Por qué elegir nuestra asistencia?</h3>
              <p className="text-white/90">Más de 1 millón de viajeros nos han elegido para proteger sus viajes</p>
            </div>
            <Button 
              onClick={() => navigate('/planes')} 
              className="bg-white text-red-600 hover:bg-gray-100 font-medium rounded-md border-0">
              Ver todos los planes
            </Button>
          </div>
        </div>
      </div>


    </section>
  );
}

export default HeroSection;
