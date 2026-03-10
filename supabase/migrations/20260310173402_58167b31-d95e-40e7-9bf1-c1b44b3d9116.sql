
-- Create rental_event_type enum
CREATE TYPE public.rental_event_type AS ENUM ('created', 'status_changed', 'delivered', 'returned', 'note');

-- Create rental_events table
CREATE TABLE public.rental_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  rental_id uuid NOT NULL REFERENCES public.rentals(id),
  type rental_event_type NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for rental_events
CREATE POLICY "Company rental_events select" ON public.rental_events
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company rental_events insert" ON public.rental_events
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
