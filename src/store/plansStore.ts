import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plan } from '@/types';

interface PlansStore {
  plans: Plan[];
  setPlan: (plan: Plan) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  deletePlan: (planId: string) => void;
  addPlan: (plan: Plan) => void;
}

export const usePlansStore = create<PlansStore>()(
  persist(
    (set) => ({
      plans: [
        {
          id: '1',
          name: 'Plan Básico',
          description: 'Cobertura esencial para viajes cortos',
          price: 4.99,
          basePrice: 4.99,
          priceMultiplier: 1,
          priceDetail: 'por día / por persona',
          features: [
            'Asistencia médica hasta USD 60.000',
            'Gastos por COVID-19',
            'Medicamentos ambulatorios',
            'Odontología de urgencia',
            'Traslados sanitarios',
          ],
          badge: '',
          maxDays: 30,
          coverageDetails: {
            medicalCoverage: 60000,
            luggageCoverage: 1000,
            cancellationCoverage: 500,
            covidCoverage: true,
            preExistingConditions: false,
            adventureSports: false,
          },
        },
      ],
      setPlan: (plan) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
        })),
      updatePlan: (planId, updates) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, ...updates } : plan
          ),
        })),
      deletePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== planId),
        })),
      addPlan: (plan) =>
        set((state) => ({
          plans: [...state.plans, plan],
        })),
    }),
    {
      name: 'plans-storage',
    }
  )
); 