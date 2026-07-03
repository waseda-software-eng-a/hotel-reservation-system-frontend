export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null;
          code: string;
          created_at: string;
          display_order: number;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          code: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["amenities"]["Insert"]>;
        Relationships: [];
      };
      plan_room_types: {
        Row: {
          plan_id: string;
          room_type_id: string;
        };
        Insert: {
          plan_id: string;
          room_type_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["plan_room_types"]["Insert"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          adult_surcharge_yen: number;
          cancellation_policy: string;
          check_in_time: string;
          check_out_time: string;
          code: string;
          created_at: string;
          display_order: number;
          id: string;
          image_path: string | null;
          meal_type: Database["public"]["Enums"]["meal_type"];
          name: string;
          payment_methods: Database["public"]["Enums"]["payment_method"][];
          summary: string;
          tags: string[];
          updated_at: string;
        };
        Insert: {
          adult_surcharge_yen?: number;
          cancellation_policy: string;
          check_in_time: string;
          check_out_time: string;
          code: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          image_path?: string | null;
          meal_type: Database["public"]["Enums"]["meal_type"];
          name: string;
          payment_methods: Database["public"]["Enums"]["payment_method"][];
          summary?: string;
          tags?: string[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      reservation_guests: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          is_representative: boolean;
          reservation_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          is_representative?: boolean;
          reservation_id: string;
          sort_order: number;
        };
        Update: Partial<Database["public"]["Tables"]["reservation_guests"]["Insert"]>;
        Relationships: [];
      };
      reservations: {
        Row: {
          adults: number;
          booked_adult_surcharge_yen: number;
          booked_room_price_yen: number;
          cancellation_policy_snapshot: string;
          cancelled_at: string | null;
          check_in_date: string;
          check_out_date: string;
          children: number;
          confirmation_code: string;
          created_at: string;
          id: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          plan_id: string;
          representative_address: string | null;
          representative_email: string;
          representative_phone: string;
          representative_postal_code: string | null;
          room_count: number;
          room_type_id: string;
          status: Database["public"]["Enums"]["reservation_status"];
          terms_accepted_at: string;
          updated_at: string;
        };
        Insert: {
          adults: number;
          booked_adult_surcharge_yen?: number;
          booked_room_price_yen: number;
          cancellation_policy_snapshot: string;
          cancelled_at?: string | null;
          check_in_date: string;
          check_out_date: string;
          children?: number;
          confirmation_code: string;
          created_at?: string;
          id?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          plan_id: string;
          representative_address?: string | null;
          representative_email: string;
          representative_phone: string;
          representative_postal_code?: string | null;
          room_count: number;
          room_type_id: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          terms_accepted_at: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservations"]["Insert"]>;
        Relationships: [];
      };
      room_type_amenities: {
        Row: {
          amenity_id: string;
          room_type_id: string;
        };
        Insert: {
          amenity_id: string;
          room_type_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["room_type_amenities"]["Insert"]>;
        Relationships: [];
      };
      room_types: {
        Row: {
          base_price_yen: number;
          bed_kind: Database["public"]["Enums"]["bed_kind"];
          code: string;
          created_at: string;
          description: string;
          floor_label: string | null;
          id: string;
          image_path: string | null;
          max_occupancy: number;
          name: string;
          room_kind: Database["public"]["Enums"]["room_kind"];
          size_sqm: number | null;
          total_rooms: number;
          updated_at: string;
          wing: string | null;
        };
        Insert: {
          base_price_yen: number;
          bed_kind: Database["public"]["Enums"]["bed_kind"];
          code: string;
          created_at?: string;
          description?: string;
          floor_label?: string | null;
          id?: string;
          image_path?: string | null;
          max_occupancy: number;
          name: string;
          room_kind: Database["public"]["Enums"]["room_kind"];
          size_sqm?: number | null;
          total_rooms: number;
          updated_at?: string;
          wing?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["room_types"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_reservation: {
        Args: {
          p_adults: number;
          p_check_in_date: string;
          p_check_out_date: string;
          p_children: number;
          p_guest_names: string[];
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_plan_id: string;
          p_representative_address: string;
          p_representative_email: string;
          p_representative_phone: string;
          p_representative_postal_code: string;
          p_room_count: number;
          p_room_type_id: string;
        };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      update_reservation: {
        Args: {
          p_adults: number;
          p_check_in_date: string;
          p_check_out_date: string;
          p_children: number;
          p_confirmation_code: string;
          p_current_email: string;
          p_guest_names: string[];
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_plan_id: string;
          p_representative_address: string;
          p_representative_email: string;
          p_representative_phone: string;
          p_representative_postal_code: string;
          p_room_count: number;
          p_room_type_id: string;
        };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
      cancel_reservation: {
        Args: {
          p_confirmation_code: string;
          p_email: string;
        };
        Returns: Database["public"]["Tables"]["reservations"]["Row"];
      };
    };
    Enums: {
      bed_kind: "single" | "double" | "twin";
      meal_type: "room_only" | "breakfast" | "half_board";
      payment_method: "onsite" | "web";
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
      room_kind: "single" | "double" | "twin" | "suite";
    };
    CompositeTypes: Record<never, never>;
  };
};

export type TableRow<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];
