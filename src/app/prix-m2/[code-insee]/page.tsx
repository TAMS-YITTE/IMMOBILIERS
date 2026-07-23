import { supabase } from "@/lib/supabaseClient";
import CityPageNav from "@/components/CityPageNav";
import Link from "next/link";
import { Metadata } from "next";
import { TrendingUp, ArrowRight } from "lucide-react";

export const revalidate = 86400;

type Props = {
  params: Promise<{ "code-insee": string }>;
};

// Pre-render at build time the 1000 communes with the most complete/reliable data
// (proxy for active markets, faute de donnee de population) ; les autres restent en ISR.
export async function generateStaticParams() {
  const { data } = await supabase
    .from('communes_metrics')
    .select('code_insee')
    .not('prix_m2_appart_moyen', 'is', null)
    .order('fiabilite_score', { ascending: false })
    .limit(1000);
  return data?.map((commune) => ({ "code-insee": commune.code_insee })) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];
  const { data } = await supabase.from('communes_metrics').select('nom_commune').eq('code_insee', insee).single();
  const cityName = data?.nom_commune || "cette ville";

  return {
    title: `Prix immobilier au m² à ${cityName} | Données réelles`,
    description: `Quel est le prix moyen au m² pour un appartement ou une maison à ${cityName} (${insee}) ? Données issues des transactions réelles (DVF).`,
  };
}

export default async function PrixM2Page({ params }: Props) {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];

  const { data, error } = await supabase.from('communes_metrics').select('*').eq('code_insee', insee).single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ville Introuvable</h1>
          <p className="text-slate-500">Nous n&apos;avons pas encore de données pour le code INSEE {insee}.</p>
        </div>
      </main>
    );
  }

  const cityName = data.nom_commune || `Commune ${insee}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Prix au m² à {cityName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Prix médian calculé à partir des transactions immobilières réelles (DVF), code INSEE {insee}.
          </p>
        </header>

        <CityPageNav codeInsee={insee} current="prix-m2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Appartement
            </div>
            <div className="text-4xl font-extrabold text-slate-900">
              {data.prix_m2_appart_moyen ? `${Math.round(data.prix_m2_appart_moyen).toLocaleString()} €` : "N/D"}
              <span className="text-sm text-slate-500 font-medium"> / m²</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Maison
            </div>
            <div className="text-4xl font-extrabold text-slate-900">
              {data.prix_m2_maison_moyen ? `${Math.round(data.prix_m2_maison_moyen).toLocaleString()} €` : "N/D"}
              <span className="text-sm text-slate-500 font-medium"> / m²</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500 mb-4">
            À ce prix, à partir de combien d&apos;années l&apos;achat devient-il plus rentable que la location à {cityName} ?
          </p>
          <Link
            href={`/acheter-ou-louer/${insee}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-full px-6 py-3 transition-all duration-150"
          >
            Lancer la simulation complète
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto">
          Prix médian calculé sur les transactions DVF (Demandes de Valeurs Foncières, DGFiP), à titre indicatif. Ne remplace pas une estimation par un professionnel.
        </p>
      </div>
    </main>
  );
}
