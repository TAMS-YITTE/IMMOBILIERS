import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import VillesClient from "./VillesClient";

export const metadata: Metadata = {
  title: "Annuaire des Villes",
  description: "Explorez l'annuaire complet des communes françaises pour découvrir où l'achat immobilier est plus rentable que la location.",
};

// Using Next.js ISR (revalidate every hour)
export const revalidate = 3600;

async function fetchAllVilles() {
  // L'API Supabase plafonne chaque requête à 1000 lignes : avec ~32 800 communes,
  // il faut paginer pour récupérer la liste complète plutôt que les 1000 premières
  // (alphabétiquement), ce qui excluait silencieusement des villes comme Paris ou Lyon.
  const PAGE_SIZE = 1000;
  const all: { code_insee: string; nom_commune: string; codes_postaux: string[] | null }[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("communes_metrics")
      .select("code_insee, nom_commune, codes_postaux")
      .order("nom_commune", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: null, error };
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: all, error: null };
}

export default async function VillesPage() {
  const { data: villes, error } = await fetchAllVilles();

  if (error) {
    console.error("Error fetching cities:", error);
    return (
      <main className="max-w-7xl mx-auto p-6 py-12">
        <h1 className="text-4xl font-extrabold mb-4 text-white">Annuaire des Villes</h1>
        <p className="text-red-400">Impossible de charger les villes pour le moment.</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 py-12">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Faut-il acheter ou louer dans votre ville ?
      </h1>
      <p className="text-slate-400 mb-12 text-lg">
        Découvrez notre analyse financière précise, ville par ville, basée sur les données réelles du marché.
      </p>

      <VillesClient initialVilles={villes || []} />
    </main>
  );
}
