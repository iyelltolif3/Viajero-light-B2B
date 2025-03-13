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
  updateLocalPlan: (planId: string, updates: Partial<Plan>) => void;
  savePlans: () => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  addLocalPlan: (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => string;
  discardChanges: () => void;
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

  updateLocalPlan: (planId, updates) => {
    set(state => {
      const updatedPlans = state.local_plans.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      );
      return {
        local_plans: updatedPlans,
        has_unsaved_changes: true
      };
    });
  },

  savePlans: async () => {
    try {
      const { local_plans, plans } = get();
      set({ is_loading: true, error: null });

      // Find plans to update
      const plansToUpdate = local_plans.filter(localPlan => 
        plans.some(plan => plan.id === localPlan.id)
      );

      // Find new plans to insert
      const plansToInsert = local_plans.filter(localPlan => 
        !plans.some(plan => plan.id === localPlan.id)
      );

      // Transform to snake_case for database
      const transformedUpdates = plansToUpdate.map(plan => ({
        ...transformObjectToSnakeCase(plan),
        updated_at: new Date().toISOString()
      }));

      const transformedInserts = plansToInsert.map(plan => ({
        ...transformObjectToSnakeCase(plan),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Update existing plans
      if (transformedUpdates.length > 0) {
        const { error: updateError } = await supabase
          .from('plans')
          .upsert(transformedUpdates);

        if (updateError) throw updateError;
      }

      // Insert new plans
      if (transformedInserts.length > 0) {
        const { error: insertError, data } = await supabase
          .from('plans')
          .insert(transformedInserts)
          .select();

        if (insertError) throw insertError;
        if (!data) throw new Error('No data returned from insert');

        const newPlanIds = data.map(plan => plan.id);

        set(state => ({
          local_plans: state.local_plans.map(plan => {
            if (newPlanIds.includes(plan.id)) {
              return { ...plan, id: plan.id };
            }
            return plan;
          }),
        }));
      }

      // Refresh plans from database
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

      set(state => ({
        plans: state.plans.filter(plan => plan.id !== planId),
        local_plans: state.local_plans.filter(plan => plan.id !== planId),
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

  addLocalPlan: (plan) => {
    const id = crypto.randomUUID();
    const newPlan = {
      ...plan,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Plan;

    set(state => ({
      local_plans: [...state.local_plans, newPlan],
      has_unsaved_changes: true
    }));

    return id;
  },

  discardChanges: () => {
    set(state => ({
      local_plans: state.plans,
      has_unsaved_changes: false
    }));
  },
}));