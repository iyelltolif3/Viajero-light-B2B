import { supabase } from '@/lib/supabase';
import type {
  TravelAssistance,
  AssistanceEvent,
  AssistanceDocument,
  AssistanceAnalytics,
  Customer,
  AssistanceEventType,
  DocumentType,
} from '@/types/assistance';
import QRCode from 'qrcode';

export class AssistanceService {
  // Customer Management
  static async getCustomer(userId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Travel Assistance Management
  static async createAssistance(assistance: Omit<TravelAssistance, 'id' | 'created_at' | 'updated_at' | 'qr_code_url'>): Promise<TravelAssistance> {
    // Generate QR code
    const qrData = JSON.stringify({
      voucher_code: assistance.voucher_code,
      passenger_name: assistance.passenger_name,
      assistance_plan: assistance.assistance_plan,
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const { data, error } = await supabase
      .from('travel_assistance')
      .insert({
        ...assistance,
        qr_code_url: qrCodeUrl,
      })
      .select()
      .single();

    if (error) throw error;

    // Create voucher document
    await this.createVoucherDocument(data.id, data.voucher_code);

    // Log event
    await this.logEvent(data.id, 'voucher_generated');

    return data;
  }

  static async getAssistance(id: string): Promise<TravelAssistance | null> {
    const { data, error } = await supabase
      .from('travel_assistance')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getCustomerAssistances(customerId: string): Promise<TravelAssistance[]> {
    const { data, error } = await supabase
      .from('travel_assistance')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateAssistanceStatus(id: string, status: TravelAssistance['status']): Promise<void> {
    const { error } = await supabase
      .from('travel_assistance')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    // Log event
    await this.logEvent(id, `assistance_${status}` as AssistanceEventType);
  }

  // Document Management
  static async createVoucherDocument(assistanceId: string, voucherCode: string): Promise<AssistanceDocument> {
    // Generate voucher PDF (implement your PDF generation logic here)
    const pdfUrl = `https://your-domain.com/vouchers/${voucherCode}.pdf`;
    const fileName = `voucher_${voucherCode}.pdf`;

    const { data, error } = await supabase
      .from('assistance_documents')
      .insert({
        assistance_id: assistanceId,
        document_type: 'voucher',
        file_name: fileName,
        file_url: pdfUrl,
        file_size: 0, // Update with actual file size
        mime_type: 'application/pdf',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDocument(assistanceId: string, documentType: DocumentType): Promise<AssistanceDocument | null> {
    const { data, error } = await supabase
      .from('assistance_documents')
      .select('*')
      .eq('assistance_id', assistanceId)
      .eq('document_type', documentType)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  static async downloadDocument(documentId: string): Promise<void> {
    const { data: document } = await supabase
      .from('assistance_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (!document) throw new Error('Document not found');

    // Log download event if it's a voucher
    if (document.document_type === 'voucher') {
      await this.logEvent(document.assistance_id, 'voucher_downloaded');
    }

    // Implement actual download logic here
    window.open(document.file_url, '_blank');
  }

  // Event Logging
  static async logEvent(
    assistanceId: string,
    eventType: AssistanceEventType,
    eventData?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.from('assistance_events').insert({
      assistance_id: assistanceId,
      event_type: eventType,
      event_data: eventData,
      ip_address: '', // Implement IP address capture
      user_agent: navigator.userAgent,
    });

    if (error) throw error;
  }

  // Analytics
  static async getAnalytics(customerId: string, startDate: string, endDate: string): Promise<AssistanceAnalytics[]> {
    const { data, error } = await supabase
      .from('assistance_analytics')
      .select('*')
      .eq('customer_id', customerId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility Methods
  static async checkVoucherValidity(voucherCode: string): Promise<{
    isValid: boolean;
    assistance?: TravelAssistance;
  }> {
    const { data, error } = await supabase
      .from('travel_assistance')
      .select('*')
      .eq('voucher_code', voucherCode)
      .single();

    if (error || !data) {
      return { isValid: false };
    }

    const isValid =
      data.status === 'active' &&
      new Date(data.start_date) <= new Date() &&
      new Date(data.end_date) >= new Date();

    return {
      isValid,
      assistance: data,
    };
  }

  static async getActiveAssistancesCount(customerId: string): Promise<number> {
    const { count, error } = await supabase
      .from('travel_assistance')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'active');

    if (error) throw error;
    return count || 0;
  }

  static async getExpiredAssistancesCount(customerId: string): Promise<number> {
    const { count, error } = await supabase
      .from('travel_assistance')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'expired');

    if (error) throw error;
    return count || 0;
  }
}
