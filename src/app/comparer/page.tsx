import { supabase } from "@/lib/supabaseClient";
import ComparerClient from "@/components/ComparerClient";

export const revalidate = 3600;

export default async function ComparerPage() {
  const { data: communes } = await supabase
    .from("communes_metrics")
    .select("code_insee, nom_commune")
    .order("nom_commune", { ascending: true })
    .limit(1000);

  const initialCities = communes
    ? communes.map((c) => ({ code: c.code_insee, nom: c.nom_commune || c.code_insee }))
    : [];

  return (
    <main className="max-w-7xl mx-auto p-6 py-12">
      <header className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Comparateur de Villes : Acheter ou Louer ?
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Comparez 2 à 3 villes côte à côte avec le même scénario financier pour trouver la meilleure opportunité.
        </p>
      </header>

      <ComparerClient initialCityOptions={initialCities} />
    </main>
  );
}
