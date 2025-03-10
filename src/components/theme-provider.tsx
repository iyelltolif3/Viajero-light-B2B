import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

// Contexto para el tema
const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

// Función para convertir colores HEX a RGB
function hexToRgb(hex: string) {
  // Asegurarse de que el valor es un color HEX válido
  if (!hex || typeof hex !== 'string') {
    return { r: 0, g: 0, b: 0 };
  }

  // Eliminar # si está presente
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Manejar formato corto #ABC
  const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = cleanHex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  
  // Analizar el valor
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  if (!result) {
    console.warn(`Color inválido: ${hex}, usando color predeterminado`);
    return { r: 0, g: 0, b: 0 };
  }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

// Función para validar colores HEX
function isValidHexColor(color: string) {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Función para aplicar colores del tema
function applyThemeColors(primaryColor: string, secondaryColor: string) {
  // Colores predeterminados
  const defaultPrimary = "#E11D48";
  const defaultSecondary = "#1E293B";
  
  // Validar y normalizar colores
  const primary = isValidHexColor(primaryColor) ? primaryColor : defaultPrimary;
  const secondary = isValidHexColor(secondaryColor) ? secondaryColor : defaultSecondary;
  
  // Convertir a RGB
  const primaryRgb = hexToRgb(primary);
  const secondaryRgb = hexToRgb(secondary);
  
  // Obtener el elemento raíz
  const root = document.documentElement;
  const style = root.style;
  
  // Aplicar colores primarios
  style.setProperty('--primary', primary);
  style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
  style.setProperty('--primary-foreground', '#ffffff');
  style.setProperty('--primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
  style.setProperty('--primary-25', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
  
  // Aplicar colores secundarios
  style.setProperty('--secondary', secondary);
  style.setProperty('--secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
  style.setProperty('--secondary-foreground', '#ffffff');
  style.setProperty('--secondary-50', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.5)`);
  style.setProperty('--secondary-25', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.25)`);
  
  // Aplicar variables hsl para compatibilidad con tailwind
  style.setProperty('--primary-hsl', `${primaryRgb.r} ${primaryRgb.g}% ${primaryRgb.b}%`);
  style.setProperty('--secondary-hsl', `${secondaryRgb.r} ${secondaryRgb.g}% ${secondaryRgb.b}%`);
  
  // Colores de acento y bordes
  style.setProperty('--ring', primary);
  style.setProperty('--accent', secondary);
  
  // Actualizar paleta global para el tema actual
  const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
  
  if (currentTheme === 'dark') {
    style.setProperty('--sidebar-primary', primary);
    style.setProperty('--sidebar-secondary', secondary);
  } else {
    style.setProperty('--sidebar-primary', primary);
    style.setProperty('--sidebar-secondary', secondary);
  }
}

// Componente ThemeProvider
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const { settings } = useSettingsStore();

  // Aplicar clase de tema
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Aplicar colores de branding
  useEffect(() => {
    // Verificar si tenemos configuraciones de branding
    if (settings?.branding) {
      try {
        applyThemeColors(
          settings.branding.primaryColor || "#E11D48",
          settings.branding.secondaryColor || "#1E293B"
        );
      } catch (error) {
        console.error("Error al aplicar colores de branding:", error);
        // Usar colores por defecto en caso de error
        applyThemeColors("#E11D48", "#1E293B");
      }
    }
  }, [settings?.branding, theme]);

  // Aplicar colores por defecto al montar el componente
  useEffect(() => {
    // Si no hay settings, aplicar colores por defecto
    if (!settings?.branding) {
      applyThemeColors("#E11D48", "#1E293B");
    }
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook useTheme
function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}

export { ThemeProvider, useTheme };
