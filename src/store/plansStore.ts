import { create } from 'zustand';
import type { Plan } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { transformObjectToSnakeCase, transformObjectToCamelCase } from '@/lib/utils';

interface PlansStore {
  plans: Plan[];
  local_plans: Plan[];
  is_loading: boolean;
  error: string | null;
  has_unsaved_changes: boolean;
  fetchPlans: () => Promise<void>;
  setPlan: (plan: Plan) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  deletePlan: (planId: string) => void;
  addPlan: (plan: Plan) => void;
}

export const usePlansStore = create<PlansStore>((set, get) => ({
  plans: [],
  local_plans: [],
  is_loading: false,
  error: null,
  has_unsaved_changes: false,

  fetchPlans: async () => {
    try {
      set({ is_loading: true, error: null });

      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('created_at');

      if (plansError) throw plansError;

      const transformedPlans = plansData?.map(plan => transformObjectToCamelCase(plan)) || [];

      set({
        plans: transformedPlans,
        local_plans: transformedPlans,
        is_loading: false,
        error: null,
        has_unsaved_changes: false,
      });

    } catch (error) {
      console.error('Error fetching plans:', error);
      set({
        is_loading: false,
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
      set({ is_loading: true, error: null });

      // Convertir de camelCase a snake_case para la base de datos
      const updatesToSend = transformObjectToSnakeCase(updates);
      console.log('Updating plan with data:', updatesToSend);
      
      const { error: updateError } = await supabase
        .from('plans')
        .update(updatesToSend)
        .eq('id', planId);

      if (updateError) throw updateError;

      // Recargar los planes para obtener los datos actualizados
      await get().fetchPlans();

      toast({
        title: "Éxito",
        description: "Cambios guardados correctamente",
      });

    } catch (error) {
      console.error('Error saving plans:', error);
      set({ is_loading: false, error: 'Error al guardar los planes' });
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  },

  deletePlan: async (planId) => {
    try {
      set({ is_loading: true, error: null });

      const { error: deleteError } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (deleteError) throw deleteError;

      set((state) => ({
        plans: state.plans.filter((plan) => plan.id !== planId),
        is_loading: false,
        error: null,
      }));

      toast({
        title: "Éxito",
        description: "Plan eliminado correctamente",
      });

    } catch (error) {
      console.error('Error deleting plan:', error);
      set({ is_loading: false, error: 'Error al eliminar el plan' });
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan",
        variant: "destructive",
      });
    }
  },

  addPlan: async (plan) => {
    try {
      set({ is_loading: true, error: null });

      // Convertir de camelCase a snake_case para la base de datos
      const planToInsert = transformObjectToSnakeCase(plan);
      console.log('Inserting plan with data:', planToInsert);
      
      const { error: addError } = await supabase
        .from('plans')
        .insert(planToInsert);

      if (addError) throw addError;

      // Recargar los planes para obtener los datos actualizados
      await get().fetchPlans();

      toast({
        title: "Éxito",
        description: "Plan agregado correctamente",
      });

    } catch (error) {
      console.error('Error adding plan:', error);
      set({ is_loading: false, error: 'Error al agregar el plan' });
      toast({
        title: "Error",
        description: "No se pudo agregar el plan",
        variant: "destructive",
      });
    }
  },
}));