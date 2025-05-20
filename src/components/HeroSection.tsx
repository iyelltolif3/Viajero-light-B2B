import { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, MapPin, Calendar, Users, ArrowRight, Globe, Shield, Phone, HeartPulse, Clock } from 'lucide-react';
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

// Función para obtener un color más claro (para fondos de iconos)
const getLighterColor = (hex: string): string => {
  // Validar formato hex
  if (!hex || !hex.startsWith('#') || hex.length !== 7) {
    return '#fee2e2'; // Fallback a un rojo claro
  }

  try {
    // Convertir hex a RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Aclarar los valores (añadir un 80% de blanco)
    const lighterR = Math.min(255, r + (255 - r) * 0.85);
    const lighterG = Math.min(255, g + (255 - g) * 0.85);
    const lighterB = Math.min(255, b + (255 - b) * 0.85);
    
    // Convertir de nuevo a hex
    return `#${Math.floor(lighterR).toString(16).padStart(2, '0')}${Math.floor(lighterG).toString(16).padStart(2, '0')}${Math.floor(lighterB).toString(16).padStart(2, '0')}`;
  } catch (error) {
    return '#fee2e2'; // Fallback a un rojo claro en caso de error
  }
};

export function HeroSection({ className }: HeroSectionProps) {
  // State for form data
  const [formData, setFormData] = useState<QuoteFormData>({
    origin: 'Chile',
    destination: null,
    dates: {
      departure_date: undefined,
      return_date: undefined,
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
    if (!formData.destination || !formData.dates.departure_date || !formData.dates.return_date) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos necesarios.",
        variant: "destructive"
      });
      return;
    }

    // Preparar los datos de la cotización
    const quotationData = {
      startDate: formData.dates.departure_date.toISOString().split('T')[0],
      endDate: formData.dates.return_date.toISOString().split('T')[0],
      destination: formData.destination, // Incluir el destino seleccionado
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

  // Obtener los colores para el gradiente y elementos dinámicos
  const primaryColor = useMemo(() => {
    return settings?.branding?.primaryColor || '#ef4444';
  }, [settings?.branding?.primaryColor]);
  
  const darkerPrimaryColor = useMemo(() => {
    return getDarkerColor(primaryColor);
  }, [primaryColor]);
  
  const lighterPrimaryColor = useMemo(() => {
    return getLighterColor(primaryColor);
  }, [primaryColor]);

  // Referencias para los elementos que queremos animar
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const discountBlockRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const circle1Ref = useRef<HTMLDivElement>(null);
  const circle2Ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  
  // Referencias para las tarjetas de servicios
  const serviceCardsRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  
  // Efecto para las animaciones iniciales y de scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animaciones básicas sin dependencia de scroll
      gsap.from(circle1Ref.current, { 
        opacity: 0, 
        scale: 0.7, 
        duration: 1,
      });
      
      gsap.from(circle2Ref.current, { 
        opacity: 0, 
        scale: 0.7, 
        duration: 1,
        delay: 0.2
      });
      
      // Animación simple para el título
      gsap.from(headingRef.current, { 
        opacity: 0, 
        y: 20, 
        duration: 0.7,
        delay: 0.3
      });
      
      // Animación simple para el subtítulo
      gsap.from(subheadingRef.current, { 
        opacity: 0, 
        y: 15, 
        duration: 0.7,
        delay: 0.5
      });
      
      // Animación para el destacado
      if (highlightRef.current) {
        gsap.from(highlightRef.current, {
          opacity: 0, 
          scale: 0.9,
          duration: 0.7,
          delay: 0.6
        });
      }
      
      // Animación simple para el bloque de descuento
      gsap.from(discountBlockRef.current, { 
        opacity: 0, 
        duration: 0.7,
        delay: 0.7
      });
      
      // Animación simple para el formulario
      gsap.from(formRef.current, { 
        opacity: 0, 
        y: 20, 
        duration: 0.8,
        delay: 0.6
      });
      
      // Animación para los campos del formulario
      gsap.from(".form-field", { 
        opacity: 0, 
        y: 15, 
        stagger: 0.1, 
        duration: 0.5,
        delay: 0.8
      });

      // Mantener el efecto hover para elementos interactivos
      document.querySelectorAll('.interactive-hover').forEach(element => {
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            y: -3,
            scale: 1.01,
            duration: 0.2
          });
        });
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.2
          });
        });
      });
      
      // Configuramos animaciones para las tarjetas de servicio al hacer scroll
      const serviceCards = [card1Ref.current, card2Ref.current, card3Ref.current];
      
      // Animación al hacer scroll para las tarjetas
      if (serviceCardsRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // Animación escalonada de las tarjetas cuando aparecen en el viewport
                gsap.to(serviceCards, {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.2,
                  ease: "power2.out",
                });
                
                // Desconectar el observer una vez que se ha ejecutado la animación
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 } // Ejecutar cuando al menos el 20% de las tarjetas estén visibles
        );
        
        observer.observe(serviceCardsRef.current);
      }
      
      // Configurar animaciones de hover para cada tarjeta
      serviceCards.forEach((card, index) => {
        if (!card) return;
        
        // Seleccionar elementos dentro de la tarjeta
        const image = card.querySelector('img');
        const iconCircle = card.querySelector('.icon-circle');
        const button = card.querySelector('button');
        
        // Configurar animaciones para hover
        card.addEventListener('mouseenter', () => {
          // Animar imagen y escala de la tarjeta
          gsap.to(image, { scale: 1.1, duration: 0.5 });
          gsap.to(card, { y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", duration: 0.3 });
          
          // Animar círculo de icono
          if (iconCircle) {
            gsap.to(iconCircle, { backgroundColor: "rgba(255, 255, 255, 0.5)", scale: 1.1, duration: 0.3 });
          }
          
          // Animar botón
          if (button) {
            gsap.to(button, { scale: 1.05, duration: 0.3 });
          }
        });
        
        // Restaurar al estado normal cuando el mouse sale
        card.addEventListener('mouseleave', () => {
          gsap.to(image, { scale: 1, duration: 0.5 });
          gsap.to(card, { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", duration: 0.3 });
          
          if (iconCircle) {
            gsap.to(iconCircle, { backgroundColor: "rgba(255, 255, 255, 0.3)", scale: 1, duration: 0.3 });
          }
          
          if (button) {
            gsap.to(button, { scale: 1, duration: 0.3 });
          }
        });
      });
      
      // Inicializar tarjetas con opacidad 0 y desplazadas hacia abajo
      gsap.set(serviceCards, { y: 50, opacity: 0 });
      
      // No es necesario retornar una función de limpieza aquí ya que ya tenemos un return al final del useEffect
    }, heroSectionRef);
    
    // Esta es la única función de limpieza que necesitamos
    return () => ctx.revert();
  }, []);
  
  return (
    <section className={cn("flex flex-col", className)} ref={heroSectionRef}>
      {/* Hero Header con gradiente dinámico basado en color de marca */}
      <div 
        className="bg-gradient-to-r relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${darkerPrimaryColor})`
        }}
      >
        {/* Círculos decorativos con colores dinámicos */}
        <div ref={circle1Ref} className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}></div>
        <div ref={circle2Ref} className="absolute -left-20 bottom-0 w-40 h-40 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}></div>
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Texto principal */}
            <div className="lg:col-span-2 text-white space-y-6">
              <div>
                <h1 ref={headingRef} className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                  TU PLAN ES <span ref={highlightRef} className="relative inline-block">
                    <span className="relative z-10">VIAJAR</span>
                    <span className="absolute inset-0 bg-white opacity-20 rounded-lg transform rotate-1"></span>
                  </span>
                </h1>
                <p ref={subheadingRef} className="text-xl md:text-2xl font-bold mt-2">EL NUESTRO, CUIDARTE</p>
              </div>
              
              <div ref={discountBlockRef} className="rounded-lg p-4 inline-block relative overflow-hidden" style={{ backgroundColor: `${darkerPrimaryColor}40` }}>
                <div className="absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8" style={{ backgroundColor: `${primaryColor}80` }}></div>
                <div className="text-2xl md:text-3xl font-bold mb-1 relative z-10">35% OFF</div>
                <div className="text-lg relative z-10">12 Cuotas sin interés</div>
              </div>
            </div>

            {/* Formulario de cotización */}
            <div className="lg:col-span-3">
              <div ref={formRef} className="bg-white rounded-xl shadow-xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Cotiza tu asistencia al viajero</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* País de origen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
                      <div className="relative form-field">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                        </div>
                        <Input 
                          value={formData.origin}
                          readOnly 
                          className="w-full pl-10 h-12 bg-gray-50 border border-gray-200 rounded-md text-gray-900"
                        />
                      </div>
                    </div>

                    {/* País de destino */}
                    <div className="form-field">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zona de destino</label>
                      <DestinationSelector
                        label="¿A dónde viajas?"
                        placeholder="¿A dónde viajas?"
                        onSelect={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                        value={formData.destination}
                        className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                      />
                    </div>
                    
                    {/* Fechas de viaje */}
                    <div className="md:col-span-2 form-field">
                      <div className="relative">
                        <DateSelector
                          onDatesChange={(dates) => setFormData(prev => ({ ...prev, dates }))}
                          className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                        />
                      </div>
                    </div>

                    {/* Viajeros */}
                    <div className="md:col-span-2 form-field">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Viajeros</label>
                        <TravelerSelector
                          onTravelersChange={(travelers) => setFormData(prev => ({ ...prev, travelers }))}
                          className="w-full [&_button]:h-12 [&_button]:border [&_button]:border-gray-200 [&_button]:rounded-md"
                        />
                      </div>
                    </div>

                    {/* Botón de cotizar */}
                    <div className="md:col-span-2 form-field">
                      <Button 
                        ref={buttonRef}
                        type="submit" 
                        className="w-full md:w-auto h-12 px-6 rounded-md text-white font-medium tracking-wide text-lg interactive-hover shadow-md hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Obtener Cotización <ArrowRight className="ml-2 h-5 w-5" />
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
        
        {/* Tarjetas con servicios destacados - inspiradas en el nuevo diseño */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={serviceCardsRef}>
          <div className="rounded-xl overflow-hidden shadow-md" ref={card1Ref}>
            <div className="relative h-[260px] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=1080" 
                alt="Protección Total" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 flex flex-col justify-end p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center icon-circle">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white text-center">Protección Total</h3>
                <p className="text-gray-200 mb-6 text-center">Asistencia completa para todos sus viajeros en cualquier destino mundial.</p>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Conocer Más
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-md" ref={card2Ref}>
            <div className="relative h-[260px] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1080" 
                alt="Servicios Médicos" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 flex flex-col justify-end p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center icon-circle">
                    <HeartPulse className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white text-center">Servicios Médicos</h3>
                <p className="text-gray-200 mb-6 text-center">Atención médica inmediata con cobertura completa para emergencias de salud.</p>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Conocer Más
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-md" ref={card3Ref}>
            <div className="relative h-[260px] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=1080" 
                alt="Asistencia 24/7" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 flex flex-col justify-end p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center icon-circle">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white text-center">Asistencia 24/7</h3>
                <p className="text-gray-200 mb-6 text-center">Soporte constante con personal especializado disponible a toda hora.</p>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Conocer Más
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Banner promocional */}
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div 
          className="rounded-xl py-6 px-8 flex flex-col md:flex-row items-center justify-between"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${darkerPrimaryColor})`
          }}
        >
          <div className="text-white text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-xl font-bold">¿Por qué elegir nuestra asistencia?</h3>
            <p className="text-white/90">Miles de viajeros nos han elegido para proteger sus viajes</p>
          </div>
          <Button 
            onClick={() => navigate('/planes')} 
            className="bg-white hover:bg-gray-100 font-medium rounded-md border-0"
            style={{ color: primaryColor }}
          >
            Ver todos los planes
          </Button>
        </div>
      </div>
    </div>

    {/* Sección de descuentos */}
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Ofertas y Descuentos Especiales</h2>
          
          {settings?.content?.discountSection?.discounts && settings.content.discountSection.discounts.length > 0 ? (
            <div className="grid grid-cols-12 gap-4">
              {/* Primer descuento: ocupa 5 columnas de ancho */}
              {settings.content.discountSection.discounts[0] && (
                <div className="col-span-12 md:col-span-5 rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <div className="relative h-64 md:h-full">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: settings.content.discountSection.discounts[0].imageSrc ? 
                        `url(${settings.content.discountSection.discounts[0].imageSrc})` : 
                        `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 z-10">
                      <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                        {settings.content.discountSection.discounts[0].discountPercentage}% OFF
                      </span>
                      <h3 className="text-xl font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[0].title}</h3>
                      <p className="text-white/80 text-sm mb-4">{settings.content.discountSection.discounts[0].description}</p>
                      <Button 
                        variant="outline" 
                        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full md:w-auto"
                      >
                        Ver oferta
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Columna con dos descuentos apilados verticalmente, cada uno de 7 columnas de ancho */}
              <div className="col-span-12 md:col-span-7 grid grid-cols-1 md:grid-rows-2 gap-4">
                {/* Segundo descuento */}
                {settings.content.discountSection.discounts[1] && (
                  <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                    <div className="relative h-44">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: settings.content.discountSection.discounts[1].imageSrc ? 
                          `url(${settings.content.discountSection.discounts[1].imageSrc})` : 
                          `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-6 z-10">
                        <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                          {settings.content.discountSection.discounts[1].discountPercentage}% OFF
                        </span>
                        <h3 className="text-xl font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[1].title}</h3>
                        <p className="text-white/80 text-sm hidden md:block mb-2">{settings.content.discountSection.discounts[1].description}</p>
                        <Button 
                          variant="outline" 
                          className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full md:w-auto"
                        >
                          Ver oferta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tercer descuento */}
                {settings.content.discountSection.discounts[2] && (
                  <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                    <div className="relative h-44">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: settings.content.discountSection.discounts[2].imageSrc ? 
                          `url(${settings.content.discountSection.discounts[2].imageSrc})` : 
                          `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-6 z-10">
                        <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                          {settings.content.discountSection.discounts[2].discountPercentage}% OFF
                        </span>
                        <h3 className="text-xl font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[2].title}</h3>
                        <p className="text-white/80 text-sm hidden md:block mb-2">{settings.content.discountSection.discounts[2].description}</p>
                        <Button 
                          variant="outline" 
                          className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full md:w-auto"
                        >
                          Ver oferta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fila inferior con tres descuentos, cada uno de 4 columnas de ancho */}
              <div className="col-span-12 md:col-span-4 rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                {settings.content.discountSection.discounts[3] && (
                  <div className="relative h-44">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: settings.content.discountSection.discounts[3].imageSrc ? 
                        `url(${settings.content.discountSection.discounts[3].imageSrc})` : 
                        `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 z-10">
                      <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                        {settings.content.discountSection.discounts[3].discountPercentage}% OFF
                      </span>
                      <h3 className="text-lg font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[3].title}</h3>
                      <Button 
                        variant="outline" 
                        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full mt-2"
                      >
                        Ver oferta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="col-span-12 md:col-span-4 rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                {settings.content.discountSection.discounts[4] && (
                  <div className="relative h-44">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: settings.content.discountSection.discounts[4].imageSrc ? 
                        `url(${settings.content.discountSection.discounts[4].imageSrc})` : 
                        `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 z-10">
                      <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                        {settings.content.discountSection.discounts[4].discountPercentage}% OFF
                      </span>
                      <h3 className="text-lg font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[4].title}</h3>
                      <Button 
                        variant="outline" 
                        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full mt-2"
                      >
                        Ver oferta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="col-span-12 md:col-span-4 rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                {settings.content.discountSection.discounts[5] && (
                  <div className="relative h-44">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: settings.content.discountSection.discounts[5].imageSrc ? 
                        `url(${settings.content.discountSection.discounts[5].imageSrc})` : 
                        `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}60)` 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 z-10">
                      <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                        {settings.content.discountSection.discounts[5].discountPercentage}% OFF
                      </span>
                      <h3 className="text-lg font-semibold text-white mt-2 mb-1">{settings.content.discountSection.discounts[5].title}</h3>
                      <Button 
                        variant="outline" 
                        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:text-white w-full mt-2"
                      >
                        Ver oferta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
              <p className="text-gray-600">No hay descuentos configurados. Agregue descuentos en el panel de administración.</p>
            </div>
          )}
          
          {/* Botón para ver todas las ofertas */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-100"
              style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
              onClick={() => navigate('/planes')}
            >
              Ver todas las ofertas y descuentos
            </Button>
          </div>
        </div>
      </div>


    </section>
  );
}

export default HeroSection;
