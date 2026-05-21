export type Category = "hobby" | "sport" | "libre" | "adulte";
export type PaymentStatus = "pending" | "paid" | "refunded" | "cancelled";
export type PaymentMethod = "card" | "twint" | "transfer" | "mock";
export type UserRole = "participant" | "admin";
export type AssignmentMode = "auto" | "manual";
export type VolunteerStatus = "pending" | "assigned" | "confirmed";

export interface Database {
  public: {
    Tables: {
      editions: {
        Row: {
          id: string;
          year: number;
          name: string;
          event_date: string;
          registration_opens_at: string;
          registration_closes_at: string;
          max_pilots: number;
          price_chf: number;
          is_active: boolean;
          is_registration_open: boolean | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["editions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["editions"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          birth_date: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          role?: UserRole;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          edition_id: string;
          category: Category;
          vehicle_name: string;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod;
          stripe_payment_intent_id: string | null;
          dossard_number: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          edition_id: string;
          category: Category;
          vehicle_name: string;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod;
          stripe_payment_intent_id?: string | null;
          dossard_number?: number | null;
          notes?: string | null;
        };
        Update: {
          category?: Category;
          vehicle_name?: string;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod;
          stripe_payment_intent_id?: string | null;
          dossard_number?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      volunteer_posts: {
        Row: {
          id: string;
          edition_id: string;
          name: string;
          description: string | null;
          start_time: string;
          end_time: string;
          capacity: number;
          display_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["volunteer_posts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["volunteer_posts"]["Insert"]>;
        Relationships: [];
      };
      volunteer_tasks: {
        Row: {
          id: string;
          edition_id: string;
          label: string;
          display_order: number;
        };
        Insert: {
          edition_id: string;
          label: string;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["volunteer_tasks"]["Insert"]>;
        Relationships: [];
      };
      volunteer_registrations: {
        Row: {
          id: string;
          user_id: string | null;
          edition_id: string;
          preferred_post_id: string | null;
          assigned_post_id: string | null;
          assignment_mode: AssignmentMode;
          status: VolunteerStatus;
          notes: string | null;
          guest_first_name: string | null;
          guest_last_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          age_group: string | null;
          wants_membership: boolean | null;
          task_interests: Record<string, string> | null;
          assigned_post_ids: string[] | null;
          created_at: string;
        };
        Insert: {
          edition_id: string;
          preferred_post_id?: string | null;
          assigned_post_id?: string | null;
          assignment_mode?: AssignmentMode;
          status?: VolunteerStatus;
          notes?: string | null;
          user_id?: string | null;
          guest_first_name?: string | null;
          guest_last_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          age_group?: string | null;
          wants_membership?: boolean | null;
          task_interests?: Record<string, string> | null;
          assigned_post_ids?: string[] | null;
        };
        Update: Partial<Database["public"]["Tables"]["volunteer_registrations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
