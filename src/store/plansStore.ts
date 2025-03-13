import { create } from 'zustand';
import type { Plan } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface PlansStore {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  setPlan: (plan: Plan) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  deletePlan: (planId: string) => void;
  addPlan: (plan: Plan) => void;
}

export const usePlansStore = create<PlansStore>((set, get) => ({
  plans: [],
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('price');

      if (plansError) throw plansError;

      set({
        plans: plansData || [],
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching plans:', error);
      set({
        isLoading: false,
        error: 'Error al cargar los planes',
      });
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      });
    }
  },

  setPlan: (plan) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
    })),

  updatePlan: async (planId, updates) => {
    try {
      set({ isLoading: true, error: null });

      const { error: updateError } = await supabase
        .from('plans')
        .update(updates)
        .eq('id', planId);

      if (updateError) throw updateError;

      // Recargar los planes para obtener los datos actualizados
      await get().fetchPlans();

      toast({
        title: "Éxito",
        description: "Plan actualizado correctamente",
      });

    } catch (error) {
      console.error('Error updating plan:', error);
      set({ isLoading: false, error: 'Error al actualizar el plan' });
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    }
  },

  deletePlan: async (planId) => {
    try {
      set({ isLoading: true, error: null });

      const { error: deleteError } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (deleteError) throw deleteError;

      set((state) => ({
        plans: state.plans.filter((plan) => plan.id !== planId),
        isLoading: false,
        error: null,
      }));

      toast({
        title: "Éxito",
        description: "Plan eliminado correctamente",
      });

    } catch (error) {
      console.error('Error deleting plan:', error);
      set({ isLoading: false, error: 'Error al eliminar el plan' });
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan",
        variant: "destructive",
      });
    }
  },

  addPlan: async (plan) => {
    try {
      set({ isLoading: true, error: null });

      const { error: addError } = await supabase
        .from('plans')
        .insert(plan);

      if (addError) throw addError;

      // Recargar los planes para obtener los datos actualizados
      await get().fetchPlans();

      toast({
        title: "Éxito",
        description: "Plan agregado correctamente",
      });

    } catch (error) {
      console.error('Error adding plan:', error);
      set({ isLoading: false, error: 'Error al agregar el plan' });
      toast({
        title: "Error",
        description: "No se pudo agregar el plan",
        variant: "destructive",
      });
    }
  },
}));