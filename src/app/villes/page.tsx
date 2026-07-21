import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {villes?.map((ville) => (
          <Link
            key={ville.code_insee}
            href={`/acheter-ou-louer/${ville.code_insee}`}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <h2 className="text-lg font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
              {ville.nom_commune}
            </h2>
            <span className="text-xs text-slate-500">Code INSEE: {ville.code_insee}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
