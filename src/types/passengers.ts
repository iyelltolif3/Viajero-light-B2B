// Definición de tipos para pasajeros y asistencias

export interface Passenger {
  id?: string;
  first_name: string;
  last_name: string;
  document_type: 'RUT' | 'DNI' | 'PASSPORT';
  document_number: string;
  birth_date: Date | string;
  gender?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistanceDetail {
  id?: string;
  assistance_id?: string;
  medical_coverage: number;
  luggage_coverage: number;
  cancellation_coverage: number;
  covid_coverage: boolean;
  pre_existing_conditions: boolean;
  adventure_sports: boolean;
  features: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AssistancePassenger {
  id?: string;
  assistance_id: string;
  passenger_id: string;
  age_at_purchase: number;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExtendedAssistance {
  id?: string;
  user_id?: string;
  plan_name: string;
  status: 'active' | 'future' | 'expired' | 'cancelled';
  start_date: Date | string;
  end_date: Date | string;
  destination_name: string;
  destination_region: string;
  total_price: number;
  contact_email: string;
  contact_phone: string;
  voucher_code?: string;
  voucher_url?: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos extendidos
  passengers?: Passenger[];
  plan_details?: AssistanceDetail;
}

// Formulario para el checkout
export interface CheckoutPassengerForm {
  firstName: string;
  lastName: string;
  documentType: 'RUT' | 'DNI' | 'PASSPORT';
  documentNumber: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  gender?: string;
  age: number;
}

export interface CheckoutFormData {
  passengers: CheckoutPassengerForm[];
  contactInfo: {
    email: string;
    phone: string;
  };
}
