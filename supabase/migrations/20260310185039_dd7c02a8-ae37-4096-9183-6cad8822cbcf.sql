
-- Add missing columns to fines table
ALTER TABLE public.fines
  ADD COLUMN IF NOT EXISTS rental_id uuid REFERENCES public.rentals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS severity text,
  ADD COLUMN IF NOT EXISTS points integer,
  ADD COLUMN IF NOT EXISTS infraction_code text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_reference text;

-- Add 'cancelled' to fine_status enum
ALTER TYPE public.fine_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Rename existing column 'infraction' to 'description' for clarity (keep as is since it already exists)
-- The column 'infraction' will serve as 'description'

-- Update updated_at trigger
CREATE OR REPLACE TRIGGER update_fines_updated_at
  BEFORE UPDATE ON public.fines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
