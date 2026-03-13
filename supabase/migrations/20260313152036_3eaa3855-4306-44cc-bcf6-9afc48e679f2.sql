
-- Create suppliers table
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  name text NOT NULL,
  document text,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company suppliers select" ON public.suppliers
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company suppliers insert" ON public.suppliers
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company suppliers update" ON public.suppliers
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company suppliers delete" ON public.suppliers
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

-- Add supplier_id to maintenance_orders (keep supplier_name for backward compat)
ALTER TABLE public.maintenance_orders ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id);
