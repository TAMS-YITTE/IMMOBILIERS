-- Demandes de démo B2B (page /pro). Simple formulaire de contact : on capture
-- le nom du site et l'email professionnel pour recontacter le prospect.
CREATE TABLE IF NOT EXISTS public.pro_leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_name text,
  email text NOT NULL,
  statut text DEFAULT 'nouveau',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pro_leads ENABLE ROW LEVEL SECURITY;

-- Formulaire de contact public : l'insertion anonyme est volontaire (comme la
-- table leads). Aucune policy SELECT publique : les demandes ne sont lisibles
-- que via la cle service_role (dashboard admin).
CREATE POLICY "Anyone can submit a pro demo request"
ON public.pro_leads FOR INSERT
WITH CHECK (true);
