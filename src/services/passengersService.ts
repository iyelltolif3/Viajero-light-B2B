import { supabase } from '@/lib/supabase';
import { 
  Passenger, 
  ExtendedAssistance, 
  AssistanceDetail, 
  AssistancePassenger, 
  CheckoutPassengerForm
} from '@/types/passengers';

/**
 * Servicio para gestionar pasajeros y asistencias
 */
export const passengersService = {
  /**
   * Crea un nuevo pasajero en la base de datos
   */
  async createPassenger(passengerData: Omit<Passenger, 'id' | 'created_at' | 'updated_at'>): Promise<Passenger | null> {
    try {
      const { data, error } = await supabase
        .from('passengers')
        .insert(passengerData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating passenger:', error);
        throw error;
      }

      return data as Passenger;
    } catch (error) {
      console.error('Error in createPassenger:', error);
      return null;
    }
  },

  /**
   * Busca un pasajero por su tipo y número de documento
   */
  async findPassengerByDocument(documentType: string, documentNumber: string): Promise<Passenger | null> {
    try {
      const { data, error } = await supabase
        .from('passengers')
        .select('*')
        .eq('document_type', documentType)
        .eq('document_number', documentNumber)
        .single();

      if (error && error.code !== 'PGRST116') { // No error if not found
        console.error('Error finding passenger:', error);
        throw error;
      }

      return data as Passenger || null;
    } catch (error) {
      console.error('Error in findPassengerByDocument:', error);
      return null;
    }
  },

  /**
   * Crea una nueva asistencia en la base de datos
   */
  async createAssistance(
    assistanceData: Omit<ExtendedAssistance, 'id' | 'created_at' | 'updated_at' | 'passengers' | 'plan_details'>,
    planDetails: Omit<AssistanceDetail, 'id' | 'assistance_id' | 'created_at' | 'updated_at'>
  ): Promise<string | null> {
    try {
      // 1. Crear la asistencia
      const { data: assistance, error: assistanceError } = await supabase
        .from('assistances')
        .insert({
          ...assistanceData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();

      if (assistanceError) {
        console.error('Error creating assistance:', assistanceError);
        throw assistanceError;
      }

      const assistanceId = assistance.id;

      // 2. Crear los detalles del plan
      const { error: detailsError } = await supabase
        .from('assistance_plan_details')
        .insert({
          ...planDetails,
          assistance_id: assistanceId,
          features: planDetails.features
        });

      if (detailsError) {
        console.error('Error creating plan details:', detailsError);
        throw detailsError;
      }

      return assistanceId;
    } catch (error) {
      console.error('Error in createAssistance:', error);
      return null;
    }
  },

  /**
   * Asocia un pasajero con una asistencia
   */
  async linkPassengerToAssistance(
    assistanceId: string, 
    passengerId: string, 
    ageAtPurchase: number,
    isPrimary: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assistance_passengers')
        .insert({
          assistance_id: assistanceId,
          passenger_id: passengerId,
          age_at_purchase: ageAtPurchase,
          is_primary: isPrimary
        });

      if (error) {
        console.error('Error linking passenger to assistance:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in linkPassengerToAssistance:', error);
      return false;
    }
  },

  /**
   * Procesa los datos del formulario de checkout para crear pasajeros y asistencia
   */
  async processCheckoutForm(
    checkoutData: {
      passengers: CheckoutPassengerForm[];
      contactInfo: { email: string; phone: string; };
      destination: { name: string; region: string; };
      planDetails: {
        name: string;
        coverage: {
          medicalCoverage: number;
          luggageCoverage: number;
          cancellationCoverage: number;
          covidCoverage: boolean;
          preExistingConditions: boolean;
          adventureSports: boolean;
        };
        features: string[];
      };
      dates: { startDate: Date; endDate: Date; };
      totalPrice: number;
    }
  ): Promise<{ success: boolean; assistanceId?: string; error?: string }> {
    try {
      // 1. Crear la asistencia principal
      const assistanceId = await this.createAssistance(
        {
          plan_name: checkoutData.planDetails.name,
          status: 'future',
          start_date: checkoutData.dates.startDate,
          end_date: checkoutData.dates.endDate,
          destination_name: checkoutData.destination.name,
          destination_region: checkoutData.destination.region,
          total_price: checkoutData.totalPrice,
          contact_email: checkoutData.contactInfo.email,
          contact_phone: checkoutData.contactInfo.phone
        },
        {
          medical_coverage: checkoutData.planDetails.coverage.medicalCoverage,
          luggage_coverage: checkoutData.planDetails.coverage.luggageCoverage,
          cancellation_coverage: checkoutData.planDetails.coverage.cancellationCoverage,
          covid_coverage: checkoutData.planDetails.coverage.covidCoverage,
          pre_existing_conditions: checkoutData.planDetails.coverage.preExistingConditions,
          adventure_sports: checkoutData.planDetails.coverage.adventureSports,
          features: checkoutData.planDetails.features
        }
      );

      if (!assistanceId) {
        throw new Error('No se pudo crear la asistencia');
      }

      // 2. Procesar cada pasajero
      for (let i = 0; i < checkoutData.passengers.length; i++) {
        const passengerForm = checkoutData.passengers[i];
        const isPrimary = i === 0; // El primer pasajero es el principal
        
        // Formato de fecha de nacimiento
        const birthDate = new Date(
          parseInt(passengerForm.birthDate.year),
          parseInt(passengerForm.birthDate.month) - 1,
          parseInt(passengerForm.birthDate.day)
        ).toISOString();

        // Buscar si el pasajero ya existe
        let passengerId = null;
        const existingPassenger = await this.findPassengerByDocument(
          passengerForm.documentType,
          passengerForm.documentNumber
        );

        if (existingPassenger) {
          passengerId = existingPassenger.id;
        } else {
          // Crear nuevo pasajero
          const passengerData: Omit<Passenger, 'id' | 'created_at' | 'updated_at'> = {
            first_name: passengerForm.firstName,
            last_name: passengerForm.lastName,
            document_type: passengerForm.documentType,
            document_number: passengerForm.documentNumber,
            birth_date: birthDate,
            gender: passengerForm.gender,
            // Si es el pasajero principal, usar la info de contacto
            email: isPrimary ? checkoutData.contactInfo.email : undefined,
            phone: isPrimary ? checkoutData.contactInfo.phone : undefined
          };

          const newPassenger = await this.createPassenger(passengerData);
          if (!newPassenger) {
            throw new Error(`No se pudo crear el pasajero ${passengerForm.firstName}`);
          }
          passengerId = newPassenger.id;
        }

        // Vincular pasajero con la asistencia
        if (passengerId) {
          await this.linkPassengerToAssistance(
            assistanceId, 
            passengerId, 
            passengerForm.age,
            isPrimary
          );
        }
      }

      return { success: true, assistanceId };

    } catch (error) {
      console.error('Error processing checkout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al procesar el checkout' 
      };
    }
  },

  /**
   * Obtiene una asistencia por su ID, incluyendo pasajeros y detalles
   */
  async getAssistanceById(assistanceId: string): Promise<ExtendedAssistance | null> {
    try {
      // 1. Obtener la asistencia principal
      const { data: assistance, error: assistanceError } = await supabase
        .from('assistances')
        .select('*')
        .eq('id', assistanceId)
        .single();

      if (assistanceError) {
        console.error('Error fetching assistance:', assistanceError);
        throw assistanceError;
      }

      // 2. Obtener los detalles del plan
      const { data: planDetails, error: detailsError } = await supabase
        .from('assistance_plan_details')
        .select('*')
        .eq('assistance_id', assistanceId)
        .single();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching plan details:', detailsError);
        throw detailsError;
      }

      // 3. Obtener la relación con pasajeros
      const { data: assistancePassengers, error: passengersRelError } = await supabase
        .from('assistance_passengers')
        .select('*')
        .eq('assistance_id', assistanceId);

      if (passengersRelError) {
        console.error('Error fetching passenger relations:', passengersRelError);
        throw passengersRelError;
      }

      // 4. Obtener los datos de los pasajeros
      const passengerIds = assistancePassengers.map(ap => ap.passenger_id);
      let passengers: Passenger[] = [];
      
      if (passengerIds.length > 0) {
        const { data: passengersData, error: passengersError } = await supabase
          .from('passengers')
          .select('*')
          .in('id', passengerIds);

        if (passengersError) {
          console.error('Error fetching passengers:', passengersError);
          throw passengersError;
        }

        passengers = passengersData;
      }

      // Combinar todo en un objeto extendido
      return {
        ...assistance,
        plan_details: planDetails || undefined,
        passengers: passengers
      } as ExtendedAssistance;

    } catch (error) {
      console.error('Error in getAssistanceById:', error);
      return null;
    }
  },

  /**
   * Obtiene todas las asistencias del usuario actual
   */
  async getUserAssistances(): Promise<ExtendedAssistance[]> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const { data: assistances, error } = await supabase
        .from('assistances')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user assistances:', error);
        throw error;
      }

      return assistances as ExtendedAssistance[];
    } catch (error) {
      console.error('Error in getUserAssistances:', error);
      return [];
    }
  }
};

export default passengersService;
