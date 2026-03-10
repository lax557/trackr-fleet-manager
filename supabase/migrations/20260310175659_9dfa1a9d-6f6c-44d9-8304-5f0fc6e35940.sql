
-- 1) Create pricing_rules table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  category text NOT NULL,
  weekly_rate numeric NOT NULL,
  deposit_amount numeric NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, category)
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company pricing select" ON public.pricing_rules
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company pricing manage" ON public.pricing_rules
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- 2) Create contract_templates table
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  name text NOT NULL,
  body text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company templates select" ON public.contract_templates
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company templates manage" ON public.contract_templates
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- 3) Create rental_contract_status enum
DO $$ BEGIN
  CREATE TYPE public.rental_contract_status AS ENUM ('draft','generated','sent','signed','cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 4) Create rental_contracts table
CREATE TABLE IF NOT EXISTS public.rental_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  rental_id uuid NOT NULL REFERENCES public.rentals(id),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  template_id uuid REFERENCES public.contract_templates(id),
  status rental_contract_status NOT NULL DEFAULT 'draft',
  rendered_body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company contracts select" ON public.rental_contracts
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company contracts manage" ON public.rental_contracts
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- 5) Backfill delivered_at for rented/available vehicles missing it
UPDATE public.vehicles
SET delivered_at = created_at
WHERE delivered_at IS NULL
  AND status IN ('rented', 'available');
