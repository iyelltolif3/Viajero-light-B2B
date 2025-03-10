import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
  variant?: 'fullscreen' | 'contained';
}

export function LoadingScreen({ 
  message = 'Cargando...', 
  className, 
  variant = 'fullscreen' 
}: LoadingScreenProps) {
  const { settings } = useSettingsStore();
  const primaryColor = settings?.branding?.primaryColor || "#0f172a";
  
  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    variant === 'fullscreen' ? 'min-h-screen' : 'min-h-[200px]',
    className
  );
  
  return (
    <div className={containerClasses} style={{ '--primary': primaryColor } as React.CSSProperties}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-primary/20"></div>
          <Loader2 className="absolute top-0 left-0 h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary">{message}</p>
          <p className="text-xs text-muted-foreground">
            {settings?.branding?.companyName || "Viajero"}
          </p>
        </div>
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