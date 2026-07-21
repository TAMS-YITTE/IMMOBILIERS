# Projet Acheter ou Louer - Front-End

## Stack Technique
- Framework : Next.js 16 (App Router)
- UI : React 19, TailwindCSS 4, Lucide React
- Graphiques : Recharts

## Objectif
Le projet est un simulateur immobilier (Acheter vs Louer) visant à générer des leads qualifiés pour des courtiers, ainsi qu'à vendre des rapports détaillés en PDF.

## Notes
- Moteur de calcul et données : Le pipeline Python (`src/`) pousse les données dans Supabase.
- Base de données : L'interface web ne lit que `communes_metrics` (public), insère dans `leads` (via RLS), et lance des webhooks Stripe pour `rapports_pdf` (table cachée).
- Référence : Voir `CLAUDE.md` (si existant) pour les commandes principales.
