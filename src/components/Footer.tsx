import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function Footer() {
  const { settings } = useSettingsStore();
  const companyName = settings?.branding?.companyName || "Viajero";
  const contactEmail = settings?.branding?.contactEmail || "contacto@viajero.com";
  const supportPhone = settings?.branding?.supportPhone || "+1234567890";
  
  const primaryColor = settings?.primaryColor || "#0066FF";
  const secondaryColor = settings?.secondaryColor || "#FF6B00";

  const footerStyle = {
    backgroundColor: `${primaryColor}05`, // Reducir opacidad a 5%
  };

  const sections = [
    {
      title: "Asistencia al Viajero",
      links: [
        { text: "Planes", href: "/planes" },
        { text: "Cobertura", href: "/cobertura" },
        { text: "Preguntas Frecuentes", href: "/faq" },
        { text: "Términos y Condiciones", href: "/terminos" },
      ]
    },
    {
      title: "Empresa",
      links: [
        { text: "Sobre Nosotros", href: "/sobre-nosotros" },
        { text: "Blog", href: "/blog" },
        { text: "Trabaja con Nosotros", href: "/careers" },
        { text: "Contacto", href: "/contacto" },
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Política de Privacidad", href: "/privacidad" },
        { text: "Política de Cookies", href: "/cookies" },
        { text: "Aviso Legal", href: "/aviso-legal" },
        { text: "Política de Reembolso", href: "/reembolso" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const contactInfo = [
    { icon: Mail, value: contactEmail, href: `mailto:${contactEmail}`, label: "Email" },
    { icon: Phone, value: supportPhone, href: `tel:${supportPhone}`, label: "Teléfono" },
    { icon: MapPin, value: "Buenos Aires, Argentina", href: null, label: "Ubicación" },
  ];

  return (
    <footer style={footerStyle} className="mt-auto">
      {/* Sección principal del footer */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Columna de información de la empresa */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              {settings?.brandLogo ? (
                <img 
                  src={settings.brandLogo} 
                  alt={companyName} 
                  className="h-8 w-auto" 
                />
              ) : (
                <span 
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  {companyName}
                </span>
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Brindando tranquilidad y seguridad a nuestros viajeros en todo el mundo. 
              Más de 10 años de experiencia en asistencia al viajero.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="hover:scale-110 transition-transform"
                  style={{ color: primaryColor }}
                  asChild
                >
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Columnas de enlaces */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 
                className="font-semibold text-base"
                style={{ color: secondaryColor }}
              >
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center group"
                      style={{ '--tw-text-opacity': 1, '--tw-text-primary': primaryColor } as any}
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" style={{ color: primaryColor }} />
                      <span>{link.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Separador con gradiente */}
      <div 
        className="h-px w-full" 
        style={{ 
          background: `linear-gradient(to right, transparent, ${primaryColor}20, transparent)` 
        }} 
      />

      {/* Sección inferior del footer */}
      <div className="container mx-auto py-8 px-4">
        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactInfo.map((info) => (
            <div key={info.label} className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full" 
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <info.icon 
                  className="h-4 w-4" 
                  style={{ color: primaryColor }} 
                />
              </div>
              {info.href ? (
                <a 
                  href={info.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  style={{ '--tw-text-primary': primaryColor } as any}
                >
                  {info.value}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {info.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {companyName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
