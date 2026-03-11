
ALTER TABLE public.contract_templates
  ADD COLUMN IF NOT EXISTS version text DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS contract_type text DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS default_duration_months integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_edit_before_send boolean DEFAULT true;

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS address_full text;
