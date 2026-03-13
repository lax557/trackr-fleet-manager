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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounting_periods: {
        Row: {
          closed_at: string | null
          company_id: string
          created_at: string
          id: string
          month: number
          status: Database["public"]["Enums"]["accounting_period_status"]
          year: number
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          created_at?: string
          id?: string
          month: number
          status?: Database["public"]["Enums"]["accounting_period_status"]
          year: number
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          created_at?: string
          id?: string
          month?: number
          status?: Database["public"]["Enums"]["accounting_period_status"]
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounting_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
          is_contra: boolean
          name: string
          parent_id: string | null
          type: Database["public"]["Enums"]["account_type"]
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          id?: string
          is_contra?: boolean
          name: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["account_type"]
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          is_contra?: boolean
          name?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["account_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          allow_edit_before_send: boolean | null
          body: string
          company_id: string
          contract_type: string | null
          created_at: string
          default_duration_months: number | null
          id: string
          is_active: boolean
          name: string
          version: string | null
        }
        Insert: {
          allow_edit_before_send?: boolean | null
          body?: string
          company_id: string
          contract_type?: string | null
          created_at?: string
          default_duration_months?: number | null
          id?: string
          is_active?: boolean
          name: string
          version?: string | null
        }
        Update: {
          allow_edit_before_send?: boolean | null
          body?: string
          company_id?: string
          contract_type?: string | null
          created_at?: string
          default_duration_months?: number | null
          id?: string
          is_active?: boolean
          name?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_id: string
          cpf_cnpj: string | null
          created_at: string
          driver_id: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          company_id: string
          cpf_cnpj?: string | null
          created_at?: string
          driver_id?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          company_id?: string
          cpf_cnpj?: string | null
          created_at?: string
          driver_id?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciation_lines: {
        Row: {
          amount: number
          asset_id: string
          company_id: string
          created_at: string
          id: string
          run_id: string
        }
        Insert: {
          amount: number
          asset_id: string
          company_id: string
          created_at?: string
          id?: string
          run_id: string
        }
        Update: {
          amount?: number
          asset_id?: string
          company_id?: string
          created_at?: string
          id?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_lines_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "fixed_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_lines_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "depreciation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciation_runs: {
        Row: {
          company_id: string
          created_at: string
          id: string
          period_id: string | null
          run_date: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          period_id?: string | null
          run_date: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          period_id?: string | null
          run_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_runs_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      dimension_values: {
        Row: {
          code: string
          company_id: string
          created_at: string
          dimension_id: string
          id: string
          name: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          dimension_id: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          dimension_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dimension_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dimension_values_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      dimensions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dimensions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address_full: string | null
          birth_date: string | null
          cnh: string | null
          company_id: string
          cpf: string | null
          created_at: string
          deleted_at: string | null
          driver_app: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address_full?: string | null
          birth_date?: string | null
          cnh?: string | null
          company_id: string
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          driver_app?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address_full?: string | null
          birth_date?: string | null
          cnh?: string | null
          company_id?: string
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          driver_app?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fines: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          driver_id: string | null
          due_date: string | null
          id: string
          infraction: string | null
          infraction_code: string | null
          notes: string | null
          occurred_at: string
          paid_at: string | null
          payment_reference: string | null
          points: number | null
          rental_id: string | null
          severity: string | null
          status: Database["public"]["Enums"]["fine_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          driver_id?: string | null
          due_date?: string | null
          id?: string
          infraction?: string | null
          infraction_code?: string | null
          notes?: string | null
          occurred_at: string
          paid_at?: string | null
          payment_reference?: string | null
          points?: number | null
          rental_id?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          driver_id?: string | null
          due_date?: string | null
          id?: string
          infraction?: string | null
          infraction_code?: string | null
          notes?: string | null
          occurred_at?: string
          paid_at?: string | null
          payment_reference?: string | null
          points?: number | null
          rental_id?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_assets: {
        Row: {
          acquisition_cost: number
          acquisition_date: string
          company_id: string
          created_at: string
          depreciation_method: Database["public"]["Enums"]["depreciation_method"]
          id: string
          name: string
          salvage_value: number | null
          useful_life_months: number
          vehicle_id: string | null
        }
        Insert: {
          acquisition_cost: number
          acquisition_date: string
          company_id: string
          created_at?: string
          depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          id?: string
          name: string
          salvage_value?: number | null
          useful_life_months?: number
          vehicle_id?: string | null
        }
        Update: {
          acquisition_cost?: number
          acquisition_date?: string
          company_id?: string
          created_at?: string
          depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          id?: string
          name?: string
          salvage_value?: number | null
          useful_life_months?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixed_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_assets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          company_id: string
          created_at: string
          entry_date: string
          id: string
          memo: string | null
          posting_period_id: string | null
          source: Database["public"]["Enums"]["journal_source"]
          source_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          entry_date: string
          id?: string
          memo?: string | null
          posting_period_id?: string | null
          source?: Database["public"]["Enums"]["journal_source"]
          source_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          entry_date?: string
          id?: string
          memo?: string | null
          posting_period_id?: string | null
          source?: Database["public"]["Enums"]["journal_source"]
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_posting_period_id_fkey"
            columns: ["posting_period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          company_id: string
          cost_center_id: string | null
          created_at: string
          credit: number
          debit: number
          description: string | null
          dimension_value_id: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          company_id: string
          cost_center_id?: string | null
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          dimension_value_id?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          dimension_value_id?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_dimension_value_id_fkey"
            columns: ["dimension_value_id"]
            isOneToOne: false
            referencedRelation: "dimension_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_catalog_items: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_catalog_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_executed_items: {
        Row: {
          company_id: string
          created_at: string
          id: string
          item_id: string
          maintenance_order_id: string
          notes: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          item_id: string
          maintenance_order_id: string
          notes?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          item_id?: string
          maintenance_order_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_executed_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_executed_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_executed_items_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          maintenance_order_id: string
          qty: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          maintenance_order_id: string
          qty?: number
          total_cost?: number
          unit_cost?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          maintenance_order_id?: string
          qty?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_items_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_orders: {
        Row: {
          closed_at: string | null
          company_id: string
          created_at: string
          id: string
          labor_cost: number | null
          notes: string | null
          odometer_at_open: number | null
          opened_at: string
          parts_cost: number | null
          service_area: Database["public"]["Enums"]["service_area"]
          status: Database["public"]["Enums"]["maintenance_order_status"]
          supplier_id: string | null
          supplier_name: string | null
          total_cost: number | null
          type: Database["public"]["Enums"]["maintenance_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          created_at?: string
          id?: string
          labor_cost?: number | null
          notes?: string | null
          odometer_at_open?: number | null
          opened_at?: string
          parts_cost?: number | null
          service_area?: Database["public"]["Enums"]["service_area"]
          status?: Database["public"]["Enums"]["maintenance_order_status"]
          supplier_id?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          created_at?: string
          id?: string
          labor_cost?: number | null
          notes?: string | null
          odometer_at_open?: number | null
          opened_at?: string
          parts_cost?: number | null
          service_area?: Database["public"]["Enums"]["service_area"]
          status?: Database["public"]["Enums"]["maintenance_order_status"]
          supplier_id?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_maintenance_plans: {
        Row: {
          active: boolean
          alert_before_km: number | null
          company_id: string
          created_at: string
          id: string
          interval_days: number | null
          interval_km: number | null
          item_id: string
          vehicle_model: string
        }
        Insert: {
          active?: boolean
          alert_before_km?: number | null
          company_id: string
          created_at?: string
          id?: string
          interval_days?: number | null
          interval_km?: number | null
          item_id: string
          vehicle_model: string
        }
        Update: {
          active?: boolean
          alert_before_km?: number | null
          company_id?: string
          created_at?: string
          id?: string
          interval_days?: number | null
          interval_km?: number | null
          item_id?: string
          vehicle_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_maintenance_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_maintenance_plans_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      payable_payments: {
        Row: {
          amount: number
          bill_id: string
          company_id: string
          created_at: string
          external_id: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
        }
        Insert: {
          amount: number
          bill_id: string
          company_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at: string
        }
        Update: {
          amount?: number
          bill_id?: string
          company_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payable_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "payables_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payables_bills: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          issue_date: string
          status: Database["public"]["Enums"]["bill_status"]
          total_amount: number
          vendor_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          issue_date: string
          status?: Database["public"]["Enums"]["bill_status"]
          total_amount: number
          vendor_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["bill_status"]
          total_amount?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payables_bills_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          active: boolean
          category: string
          company_id: string
          created_at: string
          deposit_amount: number
          id: string
          weekly_rate: number
        }
        Insert: {
          active?: boolean
          category: string
          company_id: string
          created_at?: string
          deposit_amount: number
          id?: string
          weekly_rate: number
        }
        Update: {
          active?: boolean
          category?: string
          company_id?: string
          created_at?: string
          deposit_amount?: number
          id?: string
          weekly_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          theme: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          theme?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          theme?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      receivable_payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          external_id: string | null
          external_provider: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "receivables_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables_invoices: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string | null
          description: string | null
          due_date: string
          id: string
          issue_date: string
          rental_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date: string
          id?: string
          issue_date: string
          rental_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string
          id?: string
          issue_date?: string
          rental_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "receivables_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_invoices_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_contracts: {
        Row: {
          company_id: string
          created_at: string
          driver_id: string
          id: string
          rendered_body: string
          rental_id: string
          status: Database["public"]["Enums"]["rental_contract_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          driver_id: string
          id?: string
          rendered_body?: string
          rental_id: string
          status?: Database["public"]["Enums"]["rental_contract_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          driver_id?: string
          id?: string
          rendered_body?: string
          rental_id?: string
          status?: Database["public"]["Enums"]["rental_contract_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_events: {
        Row: {
          company_id: string
          created_at: string
          id: string
          payload: Json | null
          rental_id: string
          type: Database["public"]["Enums"]["rental_event_type"]
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          rental_id: string
          type: Database["public"]["Enums"]["rental_event_type"]
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          rental_id?: string
          type?: Database["public"]["Enums"]["rental_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rental_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_events_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          company_id: string
          created_at: string
          delivered_at: string | null
          delivery_scheduled_at: string | null
          deposit: number | null
          driver_id: string
          end_date: string | null
          id: string
          notes: string | null
          return_scheduled_at: string | null
          returned_at: string | null
          start_date: string
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
          vehicle_id: string
          weekly_rate: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_scheduled_at?: string | null
          deposit?: number | null
          driver_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          return_scheduled_at?: string | null
          returned_at?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id: string
          weekly_rate?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_scheduled_at?: string | null
          deposit?: number | null
          driver_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          return_scheduled_at?: string | null
          returned_at?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id?: string
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rentals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_code_sequences: {
        Row: {
          company_id: string
          next_val: number
        }
        Insert: {
          company_id: string
          next_val?: number
        }
        Update: {
          company_id?: string
          next_val?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_code_sequences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_owners: {
        Row: {
          company_id: string
          created_at: string
          document: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          document?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          company_id?: string
          created_at?: string
          document?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_owners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          acquisition_stage: string | null
          brand: string
          category: string
          color: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          delivered_at: string | null
          id: string
          model: string
          odometer: number | null
          owner_document: string | null
          owner_id: string | null
          owner_name: string | null
          owner_type: string | null
          plate: string | null
          renavam: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          status_since: string
          updated_at: string
          vehicle_code: string | null
          version: string | null
          vin: string | null
          year_mfg: number | null
          year_model: number | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_stage?: string | null
          brand: string
          category?: string
          color?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          model: string
          odometer?: number | null
          owner_document?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_type?: string | null
          plate?: string | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_since?: string
          updated_at?: string
          vehicle_code?: string | null
          version?: string | null
          vin?: string | null
          year_mfg?: number | null
          year_model?: number | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_stage?: string | null
          brand?: string
          category?: string
          color?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          model?: string
          odometer?: number | null
          owner_document?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_type?: string | null
          plate?: string | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_since?: string
          updated_at?: string
          vehicle_code?: string | null
          version?: string | null
          vin?: string | null
          year_mfg?: number | null
          year_model?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          company_id: string
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          company_id: string
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          company_id?: string
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      accounting_period_status: "open" | "closed"
      app_role: "operator" | "manager" | "executive" | "admin"
      bill_status: "open" | "paid" | "overdue" | "cancelled"
      depreciation_method: "straight_line"
      fine_status:
        | "open"
        | "nearing_due"
        | "overdue"
        | "paid"
        | "disputed"
        | "cancelled"
      invoice_status: "open" | "paid" | "overdue" | "cancelled" | "refunded"
      journal_source:
        | "manual"
        | "rental"
        | "fine"
        | "maintenance"
        | "payable"
        | "receivable"
        | "import"
      maintenance_order_status: "open" | "in_progress" | "done" | "cancelled"
      maintenance_type: "preventive" | "corrective"
      payment_method: "pix" | "boleto" | "card" | "transfer" | "cash" | "other"
      rental_contract_status:
        | "draft"
        | "generated"
        | "sent"
        | "signed"
        | "cancelled"
      rental_event_type:
        | "created"
        | "status_changed"
        | "delivered"
        | "returned"
        | "note"
      rental_status:
        | "draft"
        | "awaiting_signature"
        | "active"
        | "ended"
        | "cancelled"
      service_area:
        | "mechanical"
        | "electrical"
        | "bodyshop"
        | "tires"
        | "inspection"
        | "other"
      vehicle_status:
        | "available"
        | "rented"
        | "maintenance"
        | "incident"
        | "for_sale"
        | "backlog"
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
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      accounting_period_status: ["open", "closed"],
      app_role: ["operator", "manager", "executive", "admin"],
      bill_status: ["open", "paid", "overdue", "cancelled"],
      depreciation_method: ["straight_line"],
      fine_status: [
        "open",
        "nearing_due",
        "overdue",
        "paid",
        "disputed",
        "cancelled",
      ],
      invoice_status: ["open", "paid", "overdue", "cancelled", "refunded"],
      journal_source: [
        "manual",
        "rental",
        "fine",
        "maintenance",
        "payable",
        "receivable",
        "import",
      ],
      maintenance_order_status: ["open", "in_progress", "done", "cancelled"],
      maintenance_type: ["preventive", "corrective"],
      payment_method: ["pix", "boleto", "card", "transfer", "cash", "other"],
      rental_contract_status: [
        "draft",
        "generated",
        "sent",
        "signed",
        "cancelled",
      ],
      rental_event_type: [
        "created",
        "status_changed",
        "delivered",
        "returned",
        "note",
      ],
      rental_status: [
        "draft",
        "awaiting_signature",
        "active",
        "ended",
        "cancelled",
      ],
      service_area: [
        "mechanical",
        "electrical",
        "bodyshop",
        "tires",
        "inspection",
        "other",
      ],
      vehicle_status: [
        "available",
        "rented",
        "maintenance",
        "incident",
        "for_sale",
        "backlog",
      ],
    },
  },
} as const
