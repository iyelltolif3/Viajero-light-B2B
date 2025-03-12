export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  tax_id?: string;
  country: string;
  city?: string;
  address?: string;
}

export type AssistanceStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface TravelAssistance {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  status: AssistanceStatus;
  voucher_code: string;
  qr_code_url: string;
  start_date: string;
  end_date: string;
  destination_country: string;
  origin_country: string;
  passenger_name: string;
  passenger_email?: string;
  passenger_phone?: string;
  passenger_document_type: string;
  passenger_document_number: string;
  passenger_birthdate: string;
  assistance_plan: string;
  price: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
}

export type AssistanceEventType =
  | 'voucher_generated'
  | 'voucher_downloaded'
  | 'voucher_viewed'
  | 'assistance_activated'
  | 'assistance_expired'
  | 'assistance_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'refund_processed'
  | 'customer_support_contacted';

export interface AssistanceEvent {
  id: string;
  created_at: string;
  assistance_id: string;
  event_type: AssistanceEventType;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface AssistanceAnalytics {
  id: string;
  date: string;
  customer_id: string;
  total_active_assistances: number;
  total_expired_assistances: number;
  total_cancelled_assistances: number;
  total_sales: number;
  total_refunds: number;
  most_common_destination?: string;
  avg_assistance_duration?: number;
}

export type DocumentType = 'voucher' | 'receipt' | 'terms' | 'claim';

export interface AssistanceDocument {
  id: string;
  created_at: string;
  assistance_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_active: boolean;
}
