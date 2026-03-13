
-- Create vehicle_owners table
CREATE TABLE public.vehicle_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  type text NOT NULL,
  name text NOT NULL,
  document text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, document)
);

-- Enable RLS
ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Company vehicle_owners select"
  ON public.vehicle_owners FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company vehicle_owners insert"
  ON public.vehicle_owners FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company vehicle_owners update"
  ON public.vehicle_owners FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Company vehicle_owners delete"
  ON public.vehicle_owners FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) IN ('admin', 'manager'));

-- Add owner_id FK to vehicles
ALTER TABLE public.vehicles ADD COLUMN owner_id uuid REFERENCES public.vehicle_owners(id);
