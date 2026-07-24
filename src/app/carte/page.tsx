import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import CarteClient from "@/components/CarteClient";

export const metadata: Metadata = {
  title: "Carte Thermique",
  description: "Visualisez les zones où l'achat immobilier devient rentable le plus rapidement en France sur notre carte interactive.",
};

export const revalidate = 86400; // 24 hours ISR

export default async function CartePage() {
  const PAGE_SIZE = 1000;
  
  interface CommuneData {
    code_insee: string;
    nom_commune: string | null;
    prix_m2_appart_moyen: number | null;
    loyer_m2_appart_moyen: number | null;
    taxe_fonciere_moyenne: number | null;
    ratio_dpe_fg: number | null;
    codes_postaux: string[] | null;
  }
  
  const allCommunes: CommuneData[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("communes_metrics")
      .select("code_insee, nom_commune, prix_m2_appart_moyen, loyer_m2_appart_moyen, taxe_fonciere_moyenne, ratio_dpe_fg, codes_postaux")
      .not("prix_m2_appart_moyen", "is", null)
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    
    allCommunes.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const initialMetrics = allCommunes;

  return (
    <main className="max-w-7xl mx-auto p-6 py-12">
      <header className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Carte Thermique Immobilier : Acheter vs Louer
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Visualisez les zones où l&apos;achat devient rentable le plus rapidement en France.
        </p>
      </header>

      <CarteClient initialCommunes={initialMetrics} />
    </main>
  );
}
