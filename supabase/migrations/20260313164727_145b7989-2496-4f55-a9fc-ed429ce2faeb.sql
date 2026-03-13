
-- Add acquisition_stage to vehicles for pipeline tracking
ALTER TABLE public.vehicles ADD COLUMN acquisition_stage text DEFAULT 'EM_LIBERACAO';

-- Add owner fields
ALTER TABLE public.vehicles ADD COLUMN owner_type text;
ALTER TABLE public.vehicles ADD COLUMN owner_name text;
ALTER TABLE public.vehicles ADD COLUMN owner_document text;

-- Set acquisition_stage for existing backlog vehicles
UPDATE public.vehicles SET acquisition_stage = 'EM_LIBERACAO' WHERE status = 'backlog';
