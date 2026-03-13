
-- Add odometer tracking columns to vehicles
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS odometer_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS odometer_source text;

-- Create function to update vehicle odometer from maintenance orders
CREATE OR REPLACE FUNCTION public.update_vehicle_odometer_from_maintenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only update if odometer_at_open is provided and greater than current
  IF NEW.odometer_at_open IS NOT NULL THEN
    UPDATE public.vehicles
    SET odometer = NEW.odometer_at_open,
        odometer_updated_at = now(),
        odometer_source = 'maintenance'
    WHERE id = NEW.vehicle_id
      AND (odometer IS NULL OR odometer < NEW.odometer_at_open);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for insert and update on maintenance_orders
CREATE TRIGGER trg_update_vehicle_odometer
  AFTER INSERT OR UPDATE OF odometer_at_open ON public.maintenance_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vehicle_odometer_from_maintenance();

-- Create function to recalculate vehicle odometer from max maintenance
CREATE OR REPLACE FUNCTION public.recalculate_vehicle_odometer(p_vehicle_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_odo integer;
BEGIN
  SELECT COALESCE(MAX(odometer_at_open), 0) INTO max_odo
  FROM public.maintenance_orders
  WHERE vehicle_id = p_vehicle_id;

  UPDATE public.vehicles
  SET odometer = max_odo,
      odometer_updated_at = now(),
      odometer_source = 'recalculated'
  WHERE id = p_vehicle_id;

  RETURN max_odo;
END;
$$;
