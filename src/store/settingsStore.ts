import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminSettings } from '@/types';
import type { ContentSettings } from '@/types/content';
import { getDiscountSection, updateDiscountSection } from '@/services/contentService';

interface SettingsState {
  settings: AdminSettings;
  content: ContentSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  updateContent: (newContent: Partial<ContentSettings>) => void;
  initializeContent: () => Promise<void>;
  saveContent: () => Promise<void>;
}

const defaultContent: ContentSettings = {
  discountSection: {
    sectionTitle: "Descuentos exclusivos",
    sectionSubtitle: "Aprovecha nuestras promociones especiales y ahorre en su próxima aventura.",
    badgeText: "Ofertas por tiempo limitado",
    viewAllButtonText: "Ver todas las ofertas",
    discounts: []
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        brandName: 'Viajero',
        brandLogo: '',
        primaryColor: '#0066FF',
        secondaryColor: '#FF6B00',
        tertiaryColor: '#00CC88',
        emergencyContacts: [],
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
        },
        paymentSettings: {
          currency: 'USD',
          acceptedMethods: ['credit_card', 'debit_card'],
        },
      },
      content: defaultContent,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateContent: (newContent) =>
        set((state) => ({
          content: { ...state.content, ...newContent },
        })),
      initializeContent: async () => {
        try {
          const discountSection = await getDiscountSection();
          set((state) => ({
            content: {
              ...state.content,
              discountSection
            }
          }));
        } catch (error) {
          console.error('Error loading content:', error);
        }
      },
      saveContent: async () => {
        try {
          const { content } = get();
          await updateDiscountSection(content.discountSection);
        } catch (error) {
          console.error('Error saving content:', error);
          throw error;
        }
      }
    }),
    {
      name: 'viajero-settings',
    }
  )
);