import { supabase } from "@/lib/supabaseClient";
import CarteClient from "@/components/CarteClient";

export const revalidate = 86400; // 24 hours ISR

export default async function CartePage() {
  const { data: communes } = await supabase
    .from("communes_metrics")
    .select("code_insee, nom_commune, prix_m2_appart_moyen, loyer_m2_appart_moyen, taxe_fonciere_moyenne, ratio_dpe_fg")
    .limit(1000);

  const initialMetrics = communes || [];

  return (
    <main className="max-w-7xl mx-auto p-6 py-12">
      <header className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Carte Thermique Immobilier : Acheter vs Louer
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Visualisez les zones où l&apos;achat devient rentable le plus rapidement en France.
        </p>
      </header>

      <CarteClient initialCommunes={initialMetrics} />
    </main>
  );
}
