import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CheckoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  isProcessing?: boolean;
  children: React.ReactNode;
}

/**
 * Componente de botón específico para la página de checkout,
 * con estilos directos para garantizar que los colores se apliquen correctamente.
 */
export function CheckoutButton({
  className,
  variant = 'default',
  isProcessing = false,
  disabled,
  children,
  ...props
}: CheckoutButtonProps) {
  // Definir estilos base con especificidad alta para sobrescribir cualquier otro estilo
  const baseStyles = {
    backgroundColor: variant === 'default' ? 'var(--primary)' : 'transparent',
    color: variant === 'default' ? 'white' : 'var(--primary)',
    borderColor: 'var(--primary)',
    borderWidth: variant === 'outline' ? '1px' : '0',
    opacity: disabled || isProcessing ? '0.7' : '1',
    cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    fontWeight: '500'
  };

  // Clase adicional para garantizar botones visibles
  const buttonClass = cn(
    variant === 'default' ? 'btn-primary' : 'btn-outline-primary',
    className
  );

  return (
    <Button
      style={baseStyles}
      className={buttonClass}
      disabled={disabled || isProcessing}
      {...props}
    >
      {isProcessing ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </>
      ) : (
        children
      )}
    </Button>
  );
} 