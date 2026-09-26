export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adjustments: {
        Row: {
          counted_qty: number
          created_at: string
          created_by: string | null
          difference: number
          id: string
          location_id: string
          product_id: string
          reason: string
          recorded_qty: number
          reference: string
          status: Database["public"]["Enums"]["doc_status"]
          validated_at: string | null
        }
        Insert: {
          counted_qty?: number
          created_at?: string
          created_by?: string | null
          difference?: number
          id?: string
          location_id: string
          product_id: string
          reason?: string
          recorded_qty?: number
          reference: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Update: {
          counted_qty?: number
          created_at?: string
          created_by?: string | null
          difference?: number
          id?: string
          location_id?: string
          product_id?: string
          reason?: string
          recorded_qty?: number
          reference?: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name: string
          phone?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          note: string
          reference: string
          scheduled_date: string
          source_location_id: string
          status: Database["public"]["Enums"]["doc_status"]
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          note?: string
          reference: string
          scheduled_date?: string
          source_location_id: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          note?: string
          reference?: string
          scheduled_date?: string
          source_location_id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          delivery_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          delivery_id: string
          id?: string
          product_id: string
          quantity: number
        }
        Update: {
          delivery_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          type: string
          warehouse_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          type?: string
          warehouse_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          default_location_id: string | null
          id: string
          initial_stock: number
          min_stock: number
          name: string
          sku: string
          unit_cost: number
          uom: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_location_id?: string | null
          id?: string
          initial_stock?: number
          min_stock?: number
          name: string
          sku: string
          unit_cost?: number
          uom?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_location_id?: string | null
          id?: string
          initial_stock?: number
          min_stock?: number
          name?: string
          sku?: string
          unit_cost?: number
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_default_location_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          receipt_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          receipt_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          receipt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          created_by: string | null
          destination_location_id: string
          id: string
          note: string
          reference: string
          scheduled_date: string
          status: Database["public"]["Enums"]["doc_status"]
          supplier_id: string | null
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_location_id: string
          id?: string
          note?: string
          reference: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_location_id?: string
          id?: string
          note?: string
          reference?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          id: string
          location_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          location_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          after_qty: number
          before_qty: number
          destination_location_id: string | null
          id: string
          occurred_at: string
          operation_type: Database["public"]["Enums"]["move_type"]
          product_id: string
          quantity: number
          reference: string
          source_location_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          user_id: string | null
        }
        Insert: {
          after_qty?: number
          before_qty?: number
          destination_location_id?: string | null
          id?: string
          occurred_at?: string
          operation_type: Database["public"]["Enums"]["move_type"]
          product_id: string
          quantity: number
          reference: string
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          user_id?: string | null
        }
        Update: {
          after_qty?: number
          before_qty?: number
          destination_location_id?: string | null
          id?: string
          occurred_at?: string
          operation_type?: Database["public"]["Enums"]["move_type"]
          product_id?: string
          quantity?: number
          reference?: string
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name: string
          phone?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      transfer_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          created_by: string | null
          destination_location_id: string
          id: string
          note: string
          reference: string
          scheduled_date: string
          source_location_id: string
          status: Database["public"]["Enums"]["doc_status"]
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_location_id: string
          id?: string
          note?: string
          reference: string
          scheduled_date?: string
          source_location_id: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_location_id?: string
          id?: string
          note?: string
          reference?: string
          scheduled_date?: string
          source_location_id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_move: {
        Args: {
          p_allow_negative?: boolean
          p_delta: number
          p_dest: string
          p_location: string
          p_product: string
          p_reference: string
          p_source: string
          p_type: Database["public"]["Enums"]["move_type"]
        }
        Returns: undefined
      }
      next_reference: { Args: { p_kind: string }; Returns: string }
      validate_adjustment: { Args: { p_id: string }; Returns: undefined }
      validate_delivery: { Args: { p_id: string }; Returns: undefined }
      validate_receipt: { Args: { p_id: string }; Returns: undefined }
      validate_transfer: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      doc_status: "draft" | "waiting" | "ready" | "done" | "canceled"
      move_type: "receipt" | "delivery" | "transfer" | "adjustment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      doc_status: ["draft", "waiting", "ready", "done", "canceled"],
      move_type: ["receipt", "delivery", "transfer", "adjustment"],
    },
  },
} as const
