import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 86400; // Cache for 24h

export const metadata: Metadata = {
  title: "Annuaire des villes | Kalcul.app",
  description: "Parcourez notre annuaire pour découvrir si l'achat ou la location est le plus rentable dans votre ville.",
};

export default async function VillesDirectory() {
  // Fetch top 3000 cities by reliability/size to avoid an overly massive page
  // We can group them by department
  const { data } = await supabase
    .from('communes_metrics')
    .select('code_insee, nom_commune')
    .not('prix_m2_appart_moyen', 'is', null)
    .order('fiabilite_score', { ascending: false })
    .limit(2000);

  const communes = data || [];

  // Group by department (first 2 chars of INSEE code)
  const byDept: Record<string, typeof communes> = {};
  communes.forEach(c => {
    const dept = c.code_insee.substring(0, 2);
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(c);
  });

  // Sort departments
  const sortedDepts = Object.keys(byDept).sort();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Annuaire des Villes</h1>
        <p className="text-slate-600 mb-12">
          Découvrez notre analyse d'achat vs location pour les principales communes de France.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedDepts.map(dept => {
            // Sort communes alphabetically within the department
            const deptCommunes = byDept[dept].sort((a, b) => 
              (a.nom_commune || '').localeCompare(b.nom_commune || '')
            );

            return (
              <div key={dept} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 border-b border-purple-100 pb-2">
                  Département {dept}
                </h2>
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {deptCommunes.map(c => (
                    <li key={c.code_insee}>
                      <Link 
                        href={`/acheter-ou-louer/${c.code_insee}`}
                        className="text-slate-600 hover:text-purple-600 hover:underline transition-colors block truncate"
                      >
                        {c.nom_commune}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
