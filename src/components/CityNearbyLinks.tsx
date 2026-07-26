import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Maillage interne : chaque page ville liste quelques communes du meme departement.
// Objectif SEO : donner a Googlebot des chemins de crawl entre les ~25 000 pages
// (sinon quasi orphelines), et offrir une navigation naturelle a l'utilisateur.
// Rendu cote serveur (liens dans le HTML initial) pour etre suivis des le crawl.
export default async function CityNearbyLinks({
  codeInsee,
  cityName,
}: {
  codeInsee: string;
  cityName: string;
}) {
  const dept = codeInsee.substring(0, 2);

  const { data } = await supabase
    .from('communes_metrics')
    .select('code_insee, nom_commune')
    .not('prix_m2_appart_moyen', 'is', null)
    .like('code_insee', `${dept}%`)
    .neq('code_insee', codeInsee)
    .order('fiabilite_score', { ascending: false })
    .limit(12);

  const voisines = (data || []).filter((c) => c.nom_commune);
  if (voisines.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-2">
          <MapPin size={20} className="text-purple-600" />
          Comparer avec les villes proches de {cityName}
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Acheter ou louer dans le département {dept} : lancez la même analyse pour une commune voisine.
        </p>
        <div className="flex flex-wrap gap-2">
          {voisines.map((c) => (
            <Link
              key={c.code_insee}
              href={`/acheter-ou-louer/${c.code_insee}`}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              {c.nom_commune}
            </Link>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <Link
            href="/villes"
            className="text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            Voir toutes les villes →
          </Link>
        </div>
      </div>
    </section>
  );
}
