import { supabase } from "@/lib/supabaseClient";
import VillesClient from "./VillesClient";

// Using Next.js ISR (revalidate every hour)
export const revalidate = 3600;

export default async function VillesPage() {
  const { data: villes, error } = await supabase
    .from("communes_metrics")
    .select("code_insee, nom_commune")
    .order("nom_commune", { ascending: true });

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
