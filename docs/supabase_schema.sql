-- Activer l'extension uuid-ossp (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table saved_simulations
CREATE TABLE IF NOT EXISTS public.saved_simulations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code_insee text NOT NULL,
  commune_name text NOT NULL,
  type_bien text NOT NULL,
  surface numeric NOT NULL,
  apport numeric NOT NULL,
  taux_pret numeric NOT NULL,
  duree_pret numeric NOT NULL,
  taux_assurance numeric NOT NULL,
  frais_agence numeric NOT NULL,
  charges_copro numeric NOT NULL,
  provision_reno numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sécurité RLS (Row Level Security)
ALTER TABLE public.saved_simulations ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement leurs propres sauvegardes
CREATE POLICY "Users can view their own saved simulations" 
ON public.saved_simulations FOR SELECT 
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent insérer leurs propres sauvegardes
CREATE POLICY "Users can insert their own saved simulations" 
ON public.saved_simulations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres sauvegardes
CREATE POLICY "Users can delete their own saved simulations" 
ON public.saved_simulations FOR DELETE 
USING (auth.uid() = user_id);
