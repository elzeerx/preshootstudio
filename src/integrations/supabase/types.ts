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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          target_entity_id: string | null
          target_entity_type: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_token_usage: {
        Row: {
          completion_tokens: number
          created_at: string
          error_message: string | null
          estimated_cost_usd: number | null
          function_name: string
          id: string
          model_used: string
          project_id: string | null
          prompt_tokens: number
          request_status: string
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          function_name: string
          id?: string
          model_used: string
          project_id?: string | null
          prompt_tokens?: number
          request_status: string
          total_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          function_name?: string
          id?: string
          model_used?: string
          project_id?: string | null
          prompt_tokens?: number
          request_status?: string
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_token_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_invitations: {
        Row: {
          accepted_at: string | null
          clicked_count: number | null
          created_at: string
          email_opened_at: string | null
          expires_at: string
          id: string
          link_clicked_at: string | null
          opened_count: number | null
          signup_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          clicked_count?: number | null
          created_at?: string
          email_opened_at?: string | null
          expires_at: string
          id?: string
          link_clicked_at?: string | null
          opened_count?: number | null
          signup_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          clicked_count?: number | null
          created_at?: string
          email_opened_at?: string | null
          expires_at?: string
          id?: string
          link_clicked_at?: string | null
          opened_count?: number | null
          signup_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_invitations_signup_id_fkey"
            columns: ["signup_id"]
            isOneToOne: false
            referencedRelation: "beta_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_signups: {
        Row: {
          account_created_at: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          id: string
          invited_at: string | null
          name: string
          notes: string | null
          preferred_language: string | null
          status: string | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          account_created_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          name: string
          notes?: string | null
          preferred_language?: string | null
          status?: string | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          account_created_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          name?: string
          notes?: string | null
          preferred_language?: string | null
          status?: string | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          language: string
          subject: string
          template_name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          language?: string
          subject: string
          template_name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          language?: string
          subject?: string
          template_name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          billing_period: string | null
          created_at: string | null
          currency: string | null
          id: string
          paypal_event_id: string | null
          paypal_event_type: string | null
          paypal_subscription_id: string | null
          paypal_transaction_id: string
          plan_name: string | null
          plan_slug: string | null
          raw_payload: Json | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_period?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paypal_event_id?: string | null
          paypal_event_type?: string | null
          paypal_subscription_id?: string | null
          paypal_transaction_id: string
          plan_name?: string | null
          plan_slug?: string | null
          raw_payload?: Json | null
          status: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_period?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paypal_event_id?: string | null
          paypal_event_type?: string | null
          paypal_subscription_id?: string | null
          paypal_transaction_id?: string
          plan_name?: string | null
          plan_slug?: string | null
          raw_payload?: Json | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          alert_threshold_percentage: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          limit_notifications_enabled: boolean | null
          monthly_token_limit: number | null
          subscription_tier: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string | null
          alert_threshold_percentage?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          limit_notifications_enabled?: boolean | null
          monthly_token_limit?: number | null
          subscription_tier?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string | null
          alert_threshold_percentage?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          limit_notifications_enabled?: boolean | null
          monthly_token_limit?: number | null
          subscription_tier?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_moderation: {
        Row: {
          content_flags: string[] | null
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          notes: string | null
          project_id: string
          quality_rating: number | null
          training_eligible: boolean | null
          training_tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          content_flags?: string[] | null
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          notes?: string | null
          project_id: string
          quality_rating?: number | null
          training_eligible?: boolean | null
          training_tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content_flags?: string[] | null
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          notes?: string | null
          project_id?: string
          quality_rating?: number | null
          training_eligible?: boolean | null
          training_tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_moderation_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          article_data: Json | null
          article_last_run_at: string | null
          article_run_count: number | null
          article_status: string | null
          broll_data: Json | null
          broll_last_run_at: string | null
          broll_run_count: number | null
          broll_status: string | null
          content_type: string | null
          created_at: string
          creative_data: Json | null
          id: string
          metadata: Json | null
          notes: string | null
          prompts_data: Json | null
          prompts_last_run_at: string | null
          prompts_run_count: number | null
          prompts_status: string | null
          research_data: Json | null
          research_last_run_at: string | null
          research_manual_edits: Json | null
          research_quality_metrics: Json | null
          research_quality_score: number | null
          research_run_count: number | null
          research_status: string | null
          research_summary: string | null
          scripts_data: Json | null
          scripts_last_run_at: string | null
          scripts_run_count: number | null
          scripts_status: string | null
          simplify_data: Json | null
          simplify_last_run_at: string | null
          simplify_run_count: number | null
          simplify_status: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_data?: Json | null
          article_last_run_at?: string | null
          article_run_count?: number | null
          article_status?: string | null
          broll_data?: Json | null
          broll_last_run_at?: string | null
          broll_run_count?: number | null
          broll_status?: string | null
          content_type?: string | null
          created_at?: string
          creative_data?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          prompts_data?: Json | null
          prompts_last_run_at?: string | null
          prompts_run_count?: number | null
          prompts_status?: string | null
          research_data?: Json | null
          research_last_run_at?: string | null
          research_manual_edits?: Json | null
          research_quality_metrics?: Json | null
          research_quality_score?: number | null
          research_run_count?: number | null
          research_status?: string | null
          research_summary?: string | null
          scripts_data?: Json | null
          scripts_last_run_at?: string | null
          scripts_run_count?: number | null
          scripts_status?: string | null
          simplify_data?: Json | null
          simplify_last_run_at?: string | null
          simplify_run_count?: number | null
          simplify_status?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_data?: Json | null
          article_last_run_at?: string | null
          article_run_count?: number | null
          article_status?: string | null
          broll_data?: Json | null
          broll_last_run_at?: string | null
          broll_run_count?: number | null
          broll_status?: string | null
          content_type?: string | null
          created_at?: string
          creative_data?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          prompts_data?: Json | null
          prompts_last_run_at?: string | null
          prompts_run_count?: number | null
          prompts_status?: string | null
          research_data?: Json | null
          research_last_run_at?: string | null
          research_manual_edits?: Json | null
          research_quality_metrics?: Json | null
          research_quality_score?: number | null
          research_run_count?: number | null
          research_status?: string | null
          research_summary?: string | null
          scripts_data?: Json | null
          scripts_last_run_at?: string | null
          scripts_run_count?: number | null
          scripts_status?: string | null
          simplify_data?: Json | null
          simplify_last_run_at?: string | null
          simplify_run_count?: number | null
          simplify_status?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      research_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          quality_metrics: Json | null
          quality_score: number | null
          research_data: Json
          research_summary: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          quality_metrics?: Json | null
          quality_score?: number | null
          research_data: Json
          research_summary?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          quality_metrics?: Json | null
          quality_score?: number | null
          research_data?: Json
          research_summary?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "research_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          api_access: boolean | null
          created_at: string | null
          export_enabled: boolean | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          paypal_plan_id_monthly: string | null
          paypal_plan_id_yearly: string | null
          paypal_product_id: string | null
          price_monthly_usd: number
          price_yearly_usd: number | null
          priority_support: boolean | null
          project_limit_monthly: number | null
          redo_limit_per_tab: number
          slug: string
          sort_order: number | null
          token_limit_monthly: number
          updated_at: string | null
        }
        Insert: {
          api_access?: boolean | null
          created_at?: string | null
          export_enabled?: boolean | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          paypal_plan_id_monthly?: string | null
          paypal_plan_id_yearly?: string | null
          paypal_product_id?: string | null
          price_monthly_usd?: number
          price_yearly_usd?: number | null
          priority_support?: boolean | null
          project_limit_monthly?: number | null
          redo_limit_per_tab?: number
          slug: string
          sort_order?: number | null
          token_limit_monthly: number
          updated_at?: string | null
        }
        Update: {
          api_access?: boolean | null
          created_at?: string | null
          export_enabled?: boolean | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          paypal_plan_id_monthly?: string | null
          paypal_plan_id_yearly?: string | null
          paypal_product_id?: string | null
          price_monthly_usd?: number
          price_yearly_usd?: number | null
          priority_support?: boolean | null
          project_limit_monthly?: number | null
          redo_limit_per_tab?: number
          slug?: string
          sort_order?: number | null
          token_limit_monthly?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_period: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          dunning_count: number | null
          grace_period_end: string | null
          id: string
          last_dunning_email: string | null
          last_payment_attempt: string | null
          payment_retry_count: number | null
          paypal_email: string | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          plan_id: string
          projects_used_this_period: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_period?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          dunning_count?: number | null
          grace_period_end?: string | null
          id?: string
          last_dunning_email?: string | null
          last_payment_attempt?: string | null
          payment_retry_count?: number | null
          paypal_email?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id: string
          projects_used_this_period?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_period?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          dunning_count?: number | null
          grace_period_end?: string | null
          id?: string
          last_dunning_email?: string | null
          last_payment_attempt?: string | null
          payment_retry_count?: number | null
          paypal_email?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: string
          projects_used_this_period?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tavily_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          query_hash: string
          query_text: string
          search_results: Json
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          query_hash: string
          query_text: string
          search_results: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          query_hash?: string
          query_text?: string
          search_results?: Json
        }
        Relationships: []
      }
      token_limit_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          token_limit: number
          token_usage: number
          usage_percentage: number
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          token_limit: number
          token_usage: number
          usage_percentage: number
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          token_limit?: number
          token_usage?: number
          usage_percentage?: number
          user_id?: string
        }
        Relationships: []
      }
      training_data_exports: {
        Row: {
          created_at: string | null
          export_type: string
          exported_by: string
          file_format: string | null
          filters_applied: Json | null
          id: string
          project_count: number | null
          storage_path: string | null
          total_tokens: number | null
        }
        Insert: {
          created_at?: string | null
          export_type: string
          exported_by: string
          file_format?: string | null
          filters_applied?: Json | null
          id?: string
          project_count?: number | null
          storage_path?: string | null
          total_tokens?: number | null
        }
        Update: {
          created_at?: string | null
          export_type?: string
          exported_by?: string
          file_format?: string | null
          filters_applied?: Json | null
          id?: string
          project_count?: number | null
          storage_path?: string | null
          total_tokens?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ai_usage_stats: {
        Row: {
          failed_requests: number | null
          function_name: string | null
          model_used: string | null
          rate_limited_requests: number | null
          request_count: number | null
          successful_requests: number | null
          total_completion_tokens: number | null
          total_cost_usd: number | null
          total_prompt_tokens: number | null
          total_tokens: number | null
          usage_date: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_cache: { Args: never; Returns: undefined }
      get_all_users_token_usage: {
        Args: never
        Returns: {
          alert_threshold_percentage: number
          email: string
          full_name: string
          limit_notifications_enabled: boolean
          monthly_token_limit: number
          request_count: number
          total_cost: number
          total_tokens: number
          user_id: string
        }[]
      }
      get_user_monthly_token_usage: {
        Args: { user_id_param: string }
        Returns: {
          alert_threshold: number
          limit_amount: number
          notifications_enabled: boolean
          request_count: number
          total_cost: number
          total_tokens: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
