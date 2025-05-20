import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
  variant?: 'fullscreen' | 'contained';
}

// Mensajes informativos sobre coberturas y ofertas
const infoMessages = [
  '¿Sabías que nuestra asistencia al viajero cubre emergencias médicas?',
  'Contamos con cobertura 24/7 en más de 150 países',
  'Ofrecemos asistencia telefónica en tu idioma en cualquier parte del mundo',
  'Nuestros planes incluyen cobertura por pérdida de equipaje',
  'Aprovecha nuestros descuentos por compra anticipada',
  'Viaja tranquilo con nuestra protección total',
  'Servicios médicos inmediatos con cobertura completa',
  'Soporte constante con personal especializado disponible a toda hora',
  'Planes familiares con tarifas especiales',
  'Garantía de satisfacción en todos nuestros servicios'
];

// Etapas de carga con sus mensajes correspondientes
const loadingStages = [
  { threshold: 0, message: 'Iniciando carga...' },
  { threshold: 10, message: 'Conectando con el servidor...' },
  { threshold: 25, message: 'Cargando configuraciones...' },
  { threshold: 40, message: 'Preparando planes de viaje...' },
  { threshold: 60, message: 'Verificando coberturas disponibles...' },
  { threshold: 85, message: 'Casi listo...' },
  { threshold: 95, message: 'Finalizando...' },
];

export function LoadingScreen({ 
  message = 'Preparando tu viaje...', 
  className, 
  variant = 'fullscreen' 
}: LoadingScreenProps) {
  const { settings } = useSettingsStore();
  const primaryColor = settings?.branding?.primaryColor || "#e53935"; // Rojo por defecto
  
  // Referencias para calcular el tiempo real de carga
  const startTimeRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando carga...');
  const [infoIndex, setInfoIndex] = useState(0);
  
  // Calcular progreso basado en tiempo transcurrido (más realista)
  useEffect(() => {
    const expectedLoadTime = 5000; // 5 segundos esperados de carga
    
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const calculatedProgress = Math.min((elapsedTime / expectedLoadTime) * 100, 99.5);
      setProgress(calculatedProgress);
      
      // Actualizar mensaje según el progreso
      for (let i = loadingStages.length - 1; i >= 0; i--) {
        if (calculatedProgress >= loadingStages[i].threshold) {
          setLoadingMessage(loadingStages[i].message);
          break;
        }
      }
      
      if (calculatedProgress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    return () => {};
  }, []);
  
  // Rotar los mensajes informativos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setInfoIndex(prev => (prev + 1) % infoMessages.length);
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, []);
  
  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    variant === 'fullscreen' ? 'min-h-screen' : 'min-h-[200px]',
    className
  );
  
  // Calcular la altura de llenado de la maleta basada en el progreso
  const fillHeight = `${progress}%`;
  
  return (
    <div className={containerClasses} style={{ '--primary': primaryColor } as React.CSSProperties}>
      <div className="flex flex-col items-center justify-center space-y-8 max-w-md px-4">
        {/* Maleta en proceso de llenado */}
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 120 120" width="100%" height="100%">
              {/* Asa de la maleta */}
              <path d="M45,20 Q60,10 75,20 L75,25 Q60,15 45,25 Z" fill="#aaaaaa" stroke="#666666" strokeWidth="2" />
              
              {/* Contorno externo de la maleta */}
              <rect x="30" y="25" width="60" height="80" rx="5" fill="white" stroke="#cc0000" strokeWidth="3" />
              
              {/* Contenido que se va llenando */}
              <clipPath id="fillClip">
                <rect x="30" y="25" width="60" height="80" rx="5" />
              </clipPath>
              
              <g clipPath="url(#fillClip)">
                {/* Fondo blanco base */}
                <rect x="30" y="25" width="60" height="80" fill="white" />
                
                {/* Área de llenado que cambia con el progreso - se llena de abajo hacia arriba */}
                <rect 
                  x="30" 
                  y={`${105 - progress * 0.8}`} 
                  width="60" 
                  height="80" 
                  fill="#cc0000" 
                />
              </g>
              
              {/* No etiqueta */}
              
              {/* Ruedas de la maleta */}
              <circle cx="40" cy="110" r="5" fill="#333" />
              <circle cx="80" cy="110" r="5" fill="#333" />
            </svg>
          </div>
        </div>
        
        {/* Indicador de progreso textual */}
        <div className="w-64 text-center">
          <div className="flex justify-center text-sm font-medium text-gray-700 mb-1">
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-base font-medium text-gray-800">{loadingMessage}</p>
        </div>
        
        {/* Mensajes informativos rotativos */}
        <div className="min-h-20 flex items-center justify-center">
          <p 
            key={infoIndex} 
            className="text-base md:text-lg font-medium text-gray-700 transition-all duration-500 ease-in-out max-w-xs text-center"
          >
            {infoMessages[infoIndex]}
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mt-4">
          {settings?.branding?.companyName || "Viajero"} - Tu compañero de viaje
        </p>
      </div>
    </div>
  );
}

export function AuthenticationLoadingScreen({ message = 'Verificando credenciales...' }) {
  return <LoadingScreen message={message} />;
}

export function PageLoadingScreen({ message = 'Cargando página...' }) {
  return <LoadingScreen message={message} />;
}

export function DataLoadingScreen({ message = 'Cargando datos...' }) {
  return <LoadingScreen message={message} variant="contained" />;
} 