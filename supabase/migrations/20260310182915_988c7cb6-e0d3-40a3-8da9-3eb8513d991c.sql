
-- Drop existing ALL policy that allows any authenticated user to manage templates
DROP POLICY IF EXISTS "Company templates manage" ON public.contract_templates;

-- Add granular policies: only admin/manager can insert/update/delete
CREATE POLICY "Company templates insert"
ON public.contract_templates
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND get_user_role(auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY "Company templates update"
ON public.contract_templates
FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND get_user_role(auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY "Company templates delete"
ON public.contract_templates
FOR DELETE
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND get_user_role(auth.uid()) IN ('admin', 'manager')
);
