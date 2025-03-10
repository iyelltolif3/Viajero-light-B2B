import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Settings } from '@/types';

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Settings) => void;
  updateBranding: (branding: Settings['branding']) => void;
  updateZones: (zones: Settings['zones']) => void;
  updateAgeRanges: (ageRanges: Settings['ageRanges']) => void;
  updateEmergencyContacts: (contacts: Settings['emergencyContacts']) => void;
  updateNotifications: (notifications: Settings['notifications']) => void;
  updatePaymentSettings: (paymentSettings: Settings['paymentSettings']) => void;
}

// Valores por defecto que se usarán en caso de que falte algún dato
const defaultBranding = {
  primaryColor: '#E11D48',
  secondaryColor: '#1E293B',
  logo: '/logo.png',
  companyName: 'Viajero',
  contactEmail: 'contacto@viajero.com',
  supportPhone: '+56 2 2123 4567',
};

// Configuración inicial
const initialSettings: Settings = {
  zones: [
    {
      id: '1',
      name: 'América Latina',
      priceMultiplier: 1,
      countries: ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Perú', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay'],
      riskLevel: 'low',
    },
    {
      id: '2',
      name: 'Europa',
      priceMultiplier: 1.4,
      countries: ['España', 'Francia', 'Italia', 'Alemania', 'Reino Unido', 'Portugal', 'Suiza', 'Austria', 'Bélgica', 'Holanda'],
      riskLevel: 'low',
    },
    {
      id: '3',
      name: 'Norteamérica',
      priceMultiplier: 1.3,
      countries: ['Estados Unidos', 'Canadá'],
      riskLevel: 'low',
    },
    {
      id: '4',
      name: 'Caribe-México',
      priceMultiplier: 1.2,
      countries: ['México', 'Cuba', 'República Dominicana', 'Jamaica', 'Puerto Rico', 'Bahamas', 'Aruba', 'Curaçao'],
      riskLevel: 'low',
    },
    {
      id: '5',
      name: 'Sudamérica',
      priceMultiplier: 1.1,
      countries: ['Brasil', 'Argentina', 'Chile', 'Colombia', 'Perú', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay'],
      riskLevel: 'low',
    },
    {
      id: '6',
      name: 'África',
      priceMultiplier: 1.5,
      countries: ['Sudáfrica', 'Egipto', 'Marruecos', 'Túnez', 'Kenia', 'Tanzania', 'Nigeria', 'Ghana'],
      riskLevel: 'medium',
    },
    {
      id: '7',
      name: 'Asia',
      priceMultiplier: 1.5,
      countries: ['Japón', 'China', 'Corea del Sur', 'Tailandia', 'Vietnam', 'Indonesia', 'India', 'Emiratos Árabes Unidos'],
      riskLevel: 'medium',
    },
    {
      id: '8',
      name: 'Oceanía',
      priceMultiplier: 1.6,
      countries: ['Australia', 'Nueva Zelanda', 'Fiyi', 'Samoa', 'Tonga', 'Vanuatu'],
      riskLevel: 'low',
    }
  ],
  ageRanges: [
    { min: 0, max: 17, priceMultiplier: 0.5 },
    { min: 18, max: 65, priceMultiplier: 1 },
    { min: 66, max: 75, priceMultiplier: 1.5 },
    { min: 76, max: 85, priceMultiplier: 2 },
  ],
  emergencyContacts: [
    {
      id: '1',
      country: 'Chile',
      phone: '+56 2 2123 4567',
      email: 'emergencias.cl@viajero.com',
      address: 'Av. Providencia 1234, Santiago',
    },
    {
      id: '2',
      country: 'México',
      phone: '+52 55 1234 5678',
      email: 'emergencias.mx@viajero.com',
      address: 'Av. Reforma 123, Ciudad de México',
    },
    {
      id: '3',
      country: 'España',
      phone: '+34 91 123 4567',
      email: 'emergencias.es@viajero.com',
      address: 'Calle Gran Vía 25, Madrid',
    },
  ],
  notifications: {
    beforeExpiration: [7, 3, 1],
    reminderEmails: true,
    smsNotifications: true,
    whatsappNotifications: false,
  },
  paymentSettings: {
    currency: 'USD',
    acceptedMethods: ['credit_card', 'debit_card', 'paypal'],
    taxRate: 19,
    commissionRate: 10,
  },
  branding: defaultBranding,
};

// Asegura que los datos tienen la estructura correcta
const validateSettings = (settings: Settings): Settings => {
  if (!settings) return initialSettings;
  
  // Validación básica de estructura y agregación de valores predeterminados si faltan
  return {
    zones: Array.isArray(settings.zones) && settings.zones.length > 0 
      ? settings.zones 
      : initialSettings.zones,
    ageRanges: Array.isArray(settings.ageRanges) && settings.ageRanges.length > 0 
      ? settings.ageRanges 
      : initialSettings.ageRanges,
    emergencyContacts: Array.isArray(settings.emergencyContacts) 
      ? settings.emergencyContacts 
      : initialSettings.emergencyContacts,
    notifications: settings.notifications || initialSettings.notifications,
    paymentSettings: settings.paymentSettings || initialSettings.paymentSettings,
    branding: {
      primaryColor: settings.branding?.primaryColor || defaultBranding.primaryColor,
      secondaryColor: settings.branding?.secondaryColor || defaultBranding.secondaryColor,
      logo: settings.branding?.logo || defaultBranding.logo,
      companyName: settings.branding?.companyName || defaultBranding.companyName,
      contactEmail: settings.branding?.contactEmail || defaultBranding.contactEmail,
      supportPhone: settings.branding?.supportPhone || defaultBranding.supportPhone,
    },
  };
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: initialSettings,
      updateSettings: (settings) => set({ settings: validateSettings(settings) }),
      updateBranding: (branding) =>
        set((state) => ({
          settings: { 
            ...state.settings, 
            branding: {
              primaryColor: branding?.primaryColor || defaultBranding.primaryColor,
              secondaryColor: branding?.secondaryColor || defaultBranding.secondaryColor,
              logo: branding?.logo || defaultBranding.logo,
              companyName: branding?.companyName || defaultBranding.companyName,
              contactEmail: branding?.contactEmail || defaultBranding.contactEmail,
              supportPhone: branding?.supportPhone || defaultBranding.supportPhone,
            }
          },
        })),
      updateZones: (zones) =>
        set((state) => ({
          settings: { ...state.settings, zones: zones.length > 0 ? zones : initialSettings.zones },
        })),
      updateAgeRanges: (ageRanges) =>
        set((state) => ({
          settings: { ...state.settings, ageRanges: ageRanges.length > 0 ? ageRanges : initialSettings.ageRanges },
        })),
      updateEmergencyContacts: (contacts) =>
        set((state) => ({
          settings: { ...state.settings, emergencyContacts: contacts },
        })),
      updateNotifications: (notifications) =>
        set((state) => ({
          settings: { ...state.settings, notifications },
        })),
      updatePaymentSettings: (paymentSettings) =>
        set((state) => ({
          settings: { ...state.settings, paymentSettings },
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Validar y arreglar los datos cuando se cargan del almacenamiento
            state.settings = validateSettings(state.settings);
          }
        };
      },
    }
  )
); 