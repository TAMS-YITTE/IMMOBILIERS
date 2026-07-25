-- Création de la table purchased_reports
CREATE TABLE IF NOT EXISTS public.purchased_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text UNIQUE NOT NULL,
  code_insee text NOT NULL,
  commune_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sécurité RLS (Row Level Security)
ALTER TABLE public.purchased_reports ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement leurs propres achats
CREATE POLICY "Users can view their own purchases" 
ON public.purchased_reports FOR SELECT 
USING (auth.uid() = user_id);

-- Politique : Le serveur (ou n'importe qui) peut insérer, mais seul l'utilisateur peut lire
-- Cela permet à notre route d'API sans token admin d'insérer l'achat
CREATE POLICY "Anyone can insert purchases" 
ON public.purchased_reports FOR INSERT 
WITH CHECK (true);
