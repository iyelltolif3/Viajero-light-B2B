import { create } from 'zustand';
import type { Plan } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

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

      // Usamos los datos tal cual vienen de la base de datos
      set({
        plans: plansData || [],
        local_plans: plansData || [],
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

      // Creamos un objeto con solo las propiedades que existen en la tabla
      const updatesToSend = {} as any;
      
      // Solo incluimos propiedades que existen en la tabla
      if ('name' in updates) updatesToSend.name = updates.name;
      if ('description' in updates) updatesToSend.description = updates.description;
      if ('price' in updates) updatesToSend.price = updates.price;
      if ('basePrice' in updates) updatesToSend.basePrice = updates.basePrice;
      if ('priceMultiplier' in updates) updatesToSend.priceMultiplier = updates.priceMultiplier;
      if ('priceDetail' in updates) updatesToSend.priceDetail = updates.priceDetail;
      if ('features' in updates) updatesToSend.features = updates.features;
      if ('badge' in updates) updatesToSend.badge = updates.badge;
      if ('maxDays' in updates) updatesToSend.maxDays = updates.maxDays;
      if ('coverageDetails' in updates) updatesToSend.coverageDetails = updates.coverageDetails;
      
      // Si hay una fecha de actualización, la convertimos al formato correcto
      if ('updatedAt' in updates) {
        updatesToSend.updated_at = updates.updatedAt;
      } else {
        // Siempre incluimos la fecha de actualización
        updatesToSend.updated_at = new Date().toISOString();
      }
      
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

      // Adaptamos el formato para coincidir con la base de datos
      // Las propiedades createdAt, updatedAt deben ser created_at, updated_at
      // Filtramos solo las propiedades que existen en la tabla de la base de datos
      const planToInsert = {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        basePrice: plan.basePrice,
        priceMultiplier: plan.priceMultiplier,
        priceDetail: plan.priceDetail,
        features: plan.features,
        badge: plan.badge,
        maxDays: plan.maxDays,
        coverageDetails: plan.coverageDetails,
        created_at: plan.createdAt || (plan as any).created_at || new Date().toISOString(),
        updated_at: plan.updatedAt || (plan as any).updated_at || new Date().toISOString(),
      } as any; // Usamos type assertion para evitar errores de TypeScript
      
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