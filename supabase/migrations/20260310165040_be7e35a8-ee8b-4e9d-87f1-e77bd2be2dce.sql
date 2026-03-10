
-- 1) Fix handle_new_user: first user = admin, subsequent = operator
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _company_id UUID;
  _has_admin BOOLEAN;
  _role app_role;
BEGIN
  SELECT id INTO _company_id FROM public.companies WHERE name = 'Targa' LIMIT 1;
  IF _company_id IS NULL THEN
    INSERT INTO public.companies (name) VALUES ('Targa') RETURNING id INTO _company_id;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE company_id = _company_id AND role = 'admin'
  ) INTO _has_admin;

  IF _has_admin THEN
    _role := 'operator';
  ELSE
    _role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, company_id, full_name, role)
  VALUES (NEW.id, _company_id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), _role);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;

-- 2) Comprehensive vehicle validation (plate + renavam + vin)
CREATE OR REPLACE FUNCTION public.validate_vehicle_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plate IS NOT NULL AND length(NEW.plate) <> 7 THEN
    RAISE EXCEPTION 'Placa deve ter exatamente 7 caracteres';
  END IF;
  IF NEW.renavam IS NOT NULL AND NEW.renavam !~ '^\d{11}$' THEN
    RAISE EXCEPTION 'RENAVAM deve ter exatamente 11 dígitos numéricos';
  END IF;
  IF NEW.vin IS NOT NULL AND NEW.vin !~ '^[A-Za-z0-9]{17}$' THEN
    RAISE EXCEPTION 'Chassi (VIN) deve ter exatamente 17 caracteres alfanuméricos';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_vehicle_plate_trigger ON public.vehicles;
DROP TRIGGER IF EXISTS validate_vehicle_fields_trigger ON public.vehicles;
CREATE TRIGGER validate_vehicle_fields_trigger
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_vehicle_fields();

-- 3) Backfill delivered_at
UPDATE public.vehicles
SET delivered_at = created_at
WHERE delivered_at IS NULL AND status IN ('available', 'rented');
