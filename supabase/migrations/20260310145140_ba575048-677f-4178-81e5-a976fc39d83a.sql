
-- ============================================================
-- TRACKR (TARGA) — Full Database Schema
-- ============================================================

-- Utility function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ENUMS
CREATE TYPE public.app_role AS ENUM ('operator', 'manager', 'executive', 'admin');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'rented', 'maintenance', 'incident', 'for_sale', 'backlog');
CREATE TYPE public.rental_status AS ENUM ('draft', 'awaiting_signature', 'active', 'ended', 'cancelled');
CREATE TYPE public.fine_status AS ENUM ('open', 'nearing_due', 'overdue', 'paid', 'disputed');
CREATE TYPE public.maintenance_order_status AS ENUM ('open', 'in_progress', 'done', 'cancelled');
CREATE TYPE public.maintenance_type AS ENUM ('preventive', 'corrective');
CREATE TYPE public.account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE public.accounting_period_status AS ENUM ('open', 'closed');
CREATE TYPE public.journal_source AS ENUM ('manual', 'rental', 'fine', 'maintenance', 'payable', 'receivable', 'import');
CREATE TYPE public.invoice_status AS ENUM ('open', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE public.bill_status AS ENUM ('open', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('pix', 'boleto', 'card', 'transfer', 'cash', 'other');
CREATE TYPE public.depreciation_method AS ENUM ('straight_line');

-- CORE: Companies + Profiles
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RBAC: user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- OPERATIONAL: Vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate TEXT,
  renavam TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT,
  year_mfg INTEGER,
  year_model INTEGER,
  category TEXT NOT NULL DEFAULT 'B',
  vin TEXT,
  color TEXT,
  status vehicle_status NOT NULL DEFAULT 'available',
  status_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  odometer INTEGER DEFAULT 0,
  acquisition_date DATE,
  acquisition_cost NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_vehicles_plate ON public.vehicles(plate) WHERE plate IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_vehicles_company ON public.vehicles(company_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OPERATIONAL: Drivers
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  cnh TEXT,
  birth_date DATE,
  driver_app TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_drivers_company ON public.drivers(company_id);
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OPERATIONAL: Rentals
CREATE TABLE public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  status rental_status NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE,
  weekly_rate NUMERIC(10,2),
  deposit NUMERIC(10,2),
  delivery_scheduled_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  return_scheduled_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rentals_company ON public.rentals(company_id);
CREATE INDEX idx_rentals_vehicle ON public.rentals(vehicle_id);
CREATE INDEX idx_rentals_driver ON public.rentals(driver_id);
CREATE INDEX idx_rentals_status ON public.rentals(status);
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OPERATIONAL: Fines
CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(id),
  occurred_at DATE NOT NULL,
  due_date DATE,
  amount NUMERIC(10,2) NOT NULL,
  infraction TEXT,
  status fine_status NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fines_company ON public.fines(company_id);
CREATE TRIGGER update_fines_updated_at BEFORE UPDATE ON public.fines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OPERATIONAL: Maintenance
CREATE TABLE public.maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  type maintenance_type NOT NULL DEFAULT 'corrective',
  status maintenance_order_status NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  odometer_at_open INTEGER,
  supplier_name TEXT,
  total_cost NUMERIC(12,2) DEFAULT 0,
  labor_cost NUMERIC(12,2) DEFAULT 0,
  parts_cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_company ON public.maintenance_orders(company_id);
CREATE INDEX idx_maintenance_vehicle ON public.maintenance_orders(vehicle_id);
CREATE TRIGGER update_maintenance_orders_updated_at BEFORE UPDATE ON public.maintenance_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.maintenance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  maintenance_order_id UUID NOT NULL REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FINANCIAL: Chart of Accounts
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  is_contra BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

CREATE INDEX idx_coa_company ON public.chart_of_accounts(company_id);

-- FINANCIAL: Cost Centers
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- FINANCIAL: Dimensions
CREATE TABLE public.dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dimension_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES public.dimensions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FINANCIAL: Accounting Periods
CREATE TABLE public.accounting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  status accounting_period_status NOT NULL DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, year, month)
);

-- FINANCIAL: Journal Entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  posting_period_id UUID REFERENCES public.accounting_periods(id),
  memo TEXT,
  source journal_source NOT NULL DEFAULT 'manual',
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_company ON public.journal_entries(company_id);
CREATE INDEX idx_journal_date ON public.journal_entries(entry_date);

CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  dimension_value_id UUID REFERENCES public.dimension_values(id),
  debit NUMERIC(14,2) NOT NULL DEFAULT 0,
  credit NUMERIC(14,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_lines_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_lines(account_id);

-- FINANCIAL: Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  phone TEXT,
  driver_id UUID REFERENCES public.drivers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FINANCIAL: Receivables
CREATE TABLE public.receivables_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  rental_id UUID REFERENCES public.rentals(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'open',
  total_amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_receivables_company ON public.receivables_invoices(company_id);
CREATE INDEX idx_receivables_due ON public.receivables_invoices(due_date);

CREATE TABLE public.receivable_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.receivables_invoices(id) ON DELETE CASCADE,
  paid_at TIMESTAMPTZ NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'pix',
  external_provider TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FINANCIAL: Vendors + Payables
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payables_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status bill_status NOT NULL DEFAULT 'open',
  total_amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payables_company ON public.payables_bills(company_id);
CREATE INDEX idx_payables_due ON public.payables_bills(due_date);

CREATE TABLE public.payable_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public.payables_bills(id) ON DELETE CASCADE,
  paid_at TIMESTAMPTZ NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'pix',
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FINANCIAL: Fixed Assets + Depreciation
CREATE TABLE public.fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  name TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  acquisition_cost NUMERIC(12,2) NOT NULL,
  useful_life_months INTEGER NOT NULL DEFAULT 60,
  salvage_value NUMERIC(12,2) DEFAULT 0,
  depreciation_method depreciation_method NOT NULL DEFAULT 'straight_line',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.depreciation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.accounting_periods(id),
  run_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.depreciation_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES public.depreciation_runs(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.fixed_assets(id),
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _company_id UUID;
BEGIN
  SELECT id INTO _company_id FROM public.companies WHERE name = 'Targa' LIMIT 1;
  IF _company_id IS NULL THEN
    INSERT INTO public.companies (name) VALUES ('Targa') RETURNING id INTO _company_id;
  END IF;
  INSERT INTO public.profiles (user_id, company_id, full_name, role)
  VALUES (NEW.id, _company_id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'admin');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company" ON public.companies FOR SELECT TO authenticated USING (id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view profiles in their company" ON public.profiles FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company vehicles select" ON public.vehicles FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company vehicles insert" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company vehicles update" ON public.vehicles FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company drivers select" ON public.drivers FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company drivers insert" ON public.drivers FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company drivers update" ON public.drivers FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company rentals select" ON public.rentals FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company rentals insert" ON public.rentals FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company rentals update" ON public.rentals FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company fines select" ON public.fines FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company fines insert" ON public.fines FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company fines update" ON public.fines FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company maintenance select" ON public.maintenance_orders FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company maintenance insert" ON public.maintenance_orders FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company maintenance update" ON public.maintenance_orders FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.maintenance_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company maintenance_items select" ON public.maintenance_items FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company maintenance_items insert" ON public.maintenance_items FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company coa select" ON public.chart_of_accounts FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company coa manage" ON public.chart_of_accounts FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company cc select" ON public.cost_centers FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company cc manage" ON public.cost_centers FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company dimensions select" ON public.dimensions FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.dimension_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company dimension_values select" ON public.dimension_values FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.accounting_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company periods select" ON public.accounting_periods FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company periods manage" ON public.accounting_periods FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company je select" ON public.journal_entries FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company je manage" ON public.journal_entries FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company jl select" ON public.journal_lines FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company jl manage" ON public.journal_lines FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company customers select" ON public.customers FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company customers manage" ON public.customers FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.receivables_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company ri select" ON public.receivables_invoices FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company ri manage" ON public.receivables_invoices FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.receivable_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company rp select" ON public.receivable_payments FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company rp manage" ON public.receivable_payments FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company vendors select" ON public.vendors FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company vendors manage" ON public.vendors FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.payables_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company pb select" ON public.payables_bills FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company pb manage" ON public.payables_bills FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.payable_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company pp select" ON public.payable_payments FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company pp manage" ON public.payable_payments FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company fa select" ON public.fixed_assets FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company fa manage" ON public.fixed_assets FOR ALL TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.depreciation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company dr select" ON public.depreciation_runs FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.depreciation_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company dl select" ON public.depreciation_lines FOR SELECT TO authenticated USING (company_id = public.get_user_company_id(auth.uid()));
