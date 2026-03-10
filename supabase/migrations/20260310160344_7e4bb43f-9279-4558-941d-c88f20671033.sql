
-- Add vehicle_code column
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_code text;

-- Create sequence table for vehicle codes per company
CREATE TABLE IF NOT EXISTS public.vehicle_code_sequences (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id),
  next_val integer NOT NULL DEFAULT 1
);

-- Enable RLS on sequence table
ALTER TABLE public.vehicle_code_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company seq select" ON public.vehicle_code_sequences
FOR SELECT TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company seq manage" ON public.vehicle_code_sequences
FOR ALL TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- Create function to auto-generate vehicle_code
CREATE OR REPLACE FUNCTION public.generate_vehicle_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_code integer;
BEGIN
  -- Get or create sequence for company
  INSERT INTO public.vehicle_code_sequences (company_id, next_val)
  VALUES (NEW.company_id, 1)
  ON CONFLICT (company_id) DO NOTHING;

  -- Atomically get and increment
  UPDATE public.vehicle_code_sequences
  SET next_val = next_val + 1
  WHERE company_id = NEW.company_id
  RETURNING next_val - 1 INTO next_code;

  NEW.vehicle_code := 'TRK-' || LPAD(next_code::text, 3, '0');
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER vehicle_code_trigger
BEFORE INSERT ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION generate_vehicle_code();

-- Add unique constraint per company
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_company_code_unique ON public.vehicles (company_id, vehicle_code);
