-- Leads issus des simulateurs Vente à Terme (VAT). Capture email + contexte de la
-- simulation (rôle acheteur/vendeur, budget, bouquet, rente, durée) pour recontact.
CREATE TABLE IF NOT EXISTS public.vat_leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL,
  telephone text,
  role text,                    -- 'acheteur' | 'vendeur'
  source text,                  -- outil d'origine : capacite-achat | vendeur | comparateur
  budget numeric,               -- acheteur : prix accessible ; vendeur : prix souhaité
  bouquet numeric,
  rente_mensuelle numeric,
  duree integer,
  consentement boolean DEFAULT false,
  statut text DEFAULT 'nouveau',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vat_leads ENABLE ROW LEVEL SECURITY;

-- Formulaire public : insertion anonyme volontaire (comme la table leads).
-- Aucune policy SELECT publique : lecture uniquement via service_role (admin).
CREATE POLICY "Anyone can submit a VAT lead"
ON public.vat_leads FOR INSERT
WITH CHECK (true);
