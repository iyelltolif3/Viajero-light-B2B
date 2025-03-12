import HeroSection from '@/components/HeroSection';
import DiscountSection from '@/components/DiscountSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Discount Section */}
      <DiscountSection />

      {/* Footer */}
      <footer className="bg-primary/95 text-primary-foreground py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Asistencia en Viajes</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Tu socio de confianza para experiencias de viaje seguras en todo el mundo. Protección y tranquilidad donde sea que vayas.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li>
                <a href="/planes" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Planes de Asistencia
                </a>
              </li>
              <li>
                <a href="/mis-asistencias" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Mis Asistencias
                </a>
              </li>
              <li>
                <a href="/ayuda" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Asistencia</h4>
            <ul className="space-y-2">
              <li>
                <a href="/emergencias" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Emergencias 24/7
                </a>
              </li>
              <li>
                <a href="/preguntas-frecuentes" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="/coberturas" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Coberturas
                </a>
              </li>
              <li>
                <a href="/como-usar" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Cómo Usar tu Asistencia
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terminos" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="/privacidad" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">
                  Política de Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            {new Date().getFullYear()} Asistencia en Viajes. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
