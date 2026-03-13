
-- 1) Catálogo de itens de manutenção
CREATE TABLE public.maintenance_catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

ALTER TABLE public.maintenance_catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company catalog select" ON public.maintenance_catalog_items
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company catalog insert" ON public.maintenance_catalog_items
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company catalog update" ON public.maintenance_catalog_items
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company catalog delete" ON public.maintenance_catalog_items
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

-- 2) Plano de manutenção por modelo
CREATE TABLE public.model_maintenance_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_model text NOT NULL,
  item_id uuid NOT NULL REFERENCES public.maintenance_catalog_items(id) ON DELETE CASCADE,
  interval_km integer,
  interval_days integer,
  alert_before_km integer DEFAULT 500,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, vehicle_model, item_id)
);

ALTER TABLE public.model_maintenance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company plans select" ON public.model_maintenance_plans
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company plans insert" ON public.model_maintenance_plans
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company plans update" ON public.model_maintenance_plans
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company plans delete" ON public.model_maintenance_plans
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

-- 3) Itens executados em uma manutenção
CREATE TABLE public.maintenance_executed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_order_id uuid NOT NULL REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.maintenance_catalog_items(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(maintenance_order_id, item_id)
);

ALTER TABLE public.maintenance_executed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company exec items select" ON public.maintenance_executed_items
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company exec items insert" ON public.maintenance_executed_items
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company exec items update" ON public.maintenance_executed_items
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company exec items delete" ON public.maintenance_executed_items
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));
