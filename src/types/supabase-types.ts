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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audio_itinerary: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          image_file_id: string | null
          name: string
          total_duration: number
        }
        Insert: {
          company_id?: string
          created_at?: string
          description: string
          id?: string
          image_file_id?: string | null
          name: string
          total_duration?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          image_file_id?: string | null
          name?: string
          total_duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "audio_itinerary_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_itinerary_image_file_id_fkey"
            columns: ["image_file_id"]
            isOneToOne: false
            referencedRelation: "image_file"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_qr_token: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          itinerary_id: string
          name: string
          token: string
          valid_until: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          itinerary_id: string
          name: string
          token: string
          valid_until: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          itinerary_id?: string
          name?: string
          token?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_qr_token_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_qr_token_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "audio_itinerary"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_track: {
        Row: {
          audio_itinerary_id: string | null
          audio_itinerary_order: number
          audio_storage_key: string
          created_at: string
          description: string | null
          duration: number
          id: string
          image_file_id: string | null
          name: string | null
          track_object_id: string
        }
        Insert: {
          audio_itinerary_id?: string | null
          audio_itinerary_order?: number
          audio_storage_key: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          image_file_id?: string | null
          name?: string | null
          track_object_id: string
        }
        Update: {
          audio_itinerary_id?: string | null
          audio_itinerary_order?: number
          audio_storage_key?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          image_file_id?: string | null
          name?: string | null
          track_object_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_track_audio_itinerary_id_fkey"
            columns: ["audio_itinerary_id"]
            isOneToOne: false
            referencedRelation: "audio_itinerary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_track_image_file_id_fkey"
            columns: ["image_file_id"]
            isOneToOne: false
            referencedRelation: "image_file"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_track_poi: {
        Row: {
          audio_track_id: string
          created_at: string
          latitude: number
          location: unknown
          longitude: number
        }
        Insert: {
          audio_track_id?: string
          created_at?: string
          latitude: number
          location: unknown
          longitude: number
        }
        Update: {
          audio_track_id?: string
          created_at?: string
          latitude?: number
          location?: unknown
          longitude?: number
        }
        Relationships: [
          {
            foreignKeyName: "audio_track_poi_audio_track_id_fkey"
            columns: ["audio_track_id"]
            isOneToOne: true
            referencedRelation: "audio_track"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_file_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_file_id?: string | null
          name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_file_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_image_file_id_fkey"
            columns: ["image_file_id"]
            isOneToOne: false
            referencedRelation: "image_file"
            referencedColumns: ["id"]
          },
        ]
      }
      image_file: {
        Row: {
          created_at: string
          id: string
          image_storage_key: string
          image_type: Database["public"]["Enums"]["image_type"]
          object_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_storage_key: string
          image_type: Database["public"]["Enums"]["image_type"]
          object_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_storage_key?: string
          image_type?: Database["public"]["Enums"]["image_type"]
          object_id?: string
        }
        Relationships: []
      }
      user_company_role: {
        Row: {
          company_id: string
          created_at: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          role: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_role_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favourite: {
        Row: {
          created_at: string
          favourite_id: string
          id: number
          type: Database["public"]["Enums"]["user_favourite_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          favourite_id: string
          id?: number
          type: Database["public"]["Enums"]["user_favourite_type"]
          user_id?: string
        }
        Update: {
          created_at?: string
          favourite_id?: string
          id?: number
          type?: Database["public"]["Enums"]["user_favourite_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          address: Json | null
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["role"]
          surname: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["role"]
          surname: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["role"]
          surname?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_nearby_audio_itineraries: {
        Args: { radius_meters?: number; user_lat: number; user_lng: number }
        Returns: {
          avg_latitude: number
          avg_longitude: number
          company_id: string
          created_at: string
          description: string
          id: string
          image_file_id: string
          min_distance_meters: number
          name: string
          poi_count: number
          total_duration: number
          track_count: number
        }[]
      }
    }
    Enums: {
      company_role: "COMPANY-ADMIN"
      image_type: "COMPANY-PROFILE" | "ITINERARY" | "TRACK"
      role: "ADMIN" | "USER" | "COMPANY-USER"
      user_favourite_type: "FAVOURITE-TRACK" | "FAVOURITE-ITINERARY"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      company_role: ["COMPANY-ADMIN"],
      image_type: ["COMPANY-PROFILE", "ITINERARY", "TRACK"],
      role: ["ADMIN", "USER", "COMPANY-USER"],
      user_favourite_type: ["FAVOURITE-TRACK", "FAVOURITE-ITINERARY"],
    },
  },
} as const
