
-- 1) Add phone and theme columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'system';

-- 2) Add delivered_at to vehicles
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

-- 3) Add plate length validation trigger
CREATE OR REPLACE FUNCTION public.validate_vehicle_plate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plate IS NOT NULL AND length(NEW.plate) <> 7 THEN
    RAISE EXCEPTION 'Plate must be exactly 7 characters, got %', length(NEW.plate);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_plate_trigger
BEFORE INSERT OR UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION validate_vehicle_plate();

-- 4) Update vehicle_code format from TRK-XXX to TRG-XXXX
CREATE OR REPLACE FUNCTION public.generate_vehicle_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_code integer;
BEGIN
  INSERT INTO public.vehicle_code_sequences (company_id, next_val)
  VALUES (NEW.company_id, 1)
  ON CONFLICT (company_id) DO NOTHING;

  UPDATE public.vehicle_code_sequences
  SET next_val = next_val + 1
  WHERE company_id = NEW.company_id
  RETURNING next_val - 1 INTO next_code;

  NEW.vehicle_code := 'TRG-' || LPAD(next_code::text, 4, '0');
  RETURN NEW;
END;
$$;

-- 5) RLS policy for admin to update roles in profiles
CREATE POLICY "Admins can update profiles in company" ON public.profiles
FOR UPDATE TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND get_user_role(auth.uid()) = 'admin'
);
