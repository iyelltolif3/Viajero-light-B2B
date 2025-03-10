import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Assistance {
  id: string;
  planName: string;
  status: 'active' | 'expired' | 'future';
  startDate: string;
  endDate: string;
  travelers: {
    name: string;
    age: number;
    passport: string;
    nationality: string;
  }[];
  totalPrice: number;
  planDetails: {
    coverageDetails: {
      medicalCoverage: number;
      luggageCoverage: number;
      cancellationCoverage: number;
      covidCoverage: boolean;
      preExistingConditions: boolean;
      adventureSports: boolean;
    };
    features: string[];
  };
  destination: {
    name: string;
    region: string;
  };
}

interface AssistancesStore {
  assistances: Assistance[];
  addAssistance: (assistance: Assistance) => void;
  updateAssistance: (id: string, updates: Partial<Assistance>) => void;
  deleteAssistance: (id: string) => void;
}

export const useAssistancesStore = create<AssistancesStore>()(
  persist(
    (set) => ({
      assistances: [],
      addAssistance: (assistance) =>
        set((state) => ({
          assistances: [...state.assistances, assistance],
        })),
      updateAssistance: (id, updates) =>
        set((state) => ({
          assistances: state.assistances.map((assistance) =>
            assistance.id === id ? { ...assistance, ...updates } : assistance
          ),
        })),
      deleteAssistance: (id) =>
        set((state) => ({
          assistances: state.assistances.filter((assistance) => assistance.id !== id),
        })),
    }),
    {
      name: 'assistances-storage',
    }
  )
); 