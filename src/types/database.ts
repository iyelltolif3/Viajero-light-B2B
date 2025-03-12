export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      content_sections: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          title: string
          subtitle: string | null
          badge_text: string | null
          button_text: string | null
          active: boolean
          type: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          title: string
          subtitle?: string | null
          badge_text?: string | null
          button_text?: string | null
          active?: boolean
          type: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          title?: string
          subtitle?: string | null
          badge_text?: string | null
          button_text?: string | null
          active?: boolean
          type?: string
        }
      }
      discount_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          section_id: string
          title: string
          description: string
          discount: string
          expiry_date: string
          image_url: string
          active: boolean
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          section_id: string
          title: string
          description: string
          discount: string
          expiry_date: string
          image_url: string
          active?: boolean
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          section_id?: string
          title?: string
          description?: string
          discount?: string
          expiry_date?: string
          image_url?: string
          active?: boolean
          order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
