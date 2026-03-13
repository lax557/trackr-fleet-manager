
-- 1) Add DELETE policy for maintenance_orders (manager/admin only)
CREATE POLICY "Company maintenance delete"
ON public.maintenance_orders
FOR DELETE
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND get_user_role(auth.uid()) IN ('admin', 'manager')
);

-- 2) Drop and re-add FK on maintenance_items with CASCADE
ALTER TABLE public.maintenance_items
  DROP CONSTRAINT IF EXISTS maintenance_items_maintenance_order_id_fkey;
ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_maintenance_order_id_fkey
  FOREIGN KEY (maintenance_order_id) REFERENCES public.maintenance_orders(id) ON DELETE CASCADE;

-- 3) Drop and re-add FK on maintenance_executed_items with CASCADE
ALTER TABLE public.maintenance_executed_items
  DROP CONSTRAINT IF EXISTS maintenance_executed_items_maintenance_order_id_fkey;
ALTER TABLE public.maintenance_executed_items
  ADD CONSTRAINT maintenance_executed_items_maintenance_order_id_fkey
  FOREIGN KEY (maintenance_order_id) REFERENCES public.maintenance_orders(id) ON DELETE CASCADE;
