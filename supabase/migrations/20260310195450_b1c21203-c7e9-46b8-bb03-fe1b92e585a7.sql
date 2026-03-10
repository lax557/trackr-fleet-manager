
-- 1) Create service_area enum
CREATE TYPE public.service_area AS ENUM ('mechanical', 'electrical', 'bodyshop', 'tires', 'inspection', 'other');

-- 2) Add service_area column to maintenance_orders
ALTER TABLE public.maintenance_orders ADD COLUMN service_area public.service_area NOT NULL DEFAULT 'mechanical';

-- 3) Add UPDATE/DELETE policies for maintenance_items
CREATE POLICY "Company maintenance_items update"
ON public.maintenance_items FOR UPDATE TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company maintenance_items delete"
ON public.maintenance_items FOR DELETE TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- 4) Create trigger to auto-update total_cost on maintenance_orders when items change
CREATE OR REPLACE FUNCTION public.recalc_maintenance_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _order_id uuid;
  _parts numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _order_id := OLD.maintenance_order_id;
  ELSE
    _order_id := NEW.maintenance_order_id;
  END IF;

  SELECT COALESCE(SUM(total_cost), 0) INTO _parts
  FROM public.maintenance_items
  WHERE maintenance_order_id = _order_id;

  UPDATE public.maintenance_orders
  SET parts_cost = _parts,
      total_cost = _parts + COALESCE(labor_cost, 0)
  WHERE id = _order_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalc_maintenance_total
AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_items
FOR EACH ROW EXECUTE FUNCTION public.recalc_maintenance_total();

-- 5) Create trigger to set closed_at when status changes to done
CREATE OR REPLACE FUNCTION public.maintenance_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' AND NEW.closed_at IS NULL THEN
    NEW.closed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_maintenance_status_change
BEFORE UPDATE ON public.maintenance_orders
FOR EACH ROW EXECUTE FUNCTION public.maintenance_status_change();

-- 6) updated_at trigger for maintenance_orders
CREATE TRIGGER trg_maintenance_orders_updated_at
BEFORE UPDATE ON public.maintenance_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
