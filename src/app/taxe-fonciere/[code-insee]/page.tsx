import { supabase } from "@/lib/supabaseClient";
import CityPageNav from "@/components/CityPageNav";
import Link from "next/link";
import { Metadata } from "next";
import { Landmark, ArrowRight, Info } from "lucide-react";

export const revalidate = 86400;

type Props = {
  params: Promise<{ "code-insee": string }>;
};

export async function generateStaticParams() {
  const { data } = await supabase.from('communes_metrics').select('code_insee');
  return data?.map((commune) => ({ "code-insee": commune.code_insee })) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];
  const { data } = await supabase.from('communes_metrics').select('nom_commune').eq('code_insee', insee).single();
  const cityName = data?.nom_commune || "cette ville";

  return {
    title: `Taxe foncière à ${cityName} | Montant moyen`,
    description: `Quel est le montant moyen de la taxe foncière à ${cityName} (${insee}) ? Estimation basée sur les données DGFiP.`,
  };
}

export default async function TaxeFoncierePage({ params }: Props) {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];

  const { data, error } = await supabase.from('communes_metrics').select('*').eq('code_insee', insee).single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ville Introuvable</h1>
          <p className="text-slate-400">Nous n&apos;avons pas encore de données pour le code INSEE {insee}.</p>
        </div>
      </main>
    );
  }

  const cityName = data.nom_commune || `Commune ${insee}`;
  const fiabiliteFaible = typeof data.fiabilite_score === 'number' && data.fiabilite_score < 8;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Taxe foncière à {cityName}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Montant moyen constaté, code INSEE {insee}.
          </p>
        </header>

        <CityPageNav codeInsee={insee} current="taxe-fonciere" />

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 text-sm">
            <Landmark className="w-4 h-4" />
            Taxe foncière moyenne
          </div>
          <div className="text-5xl font-extrabold text-white">
            {data.taxe_fonciere_moyenne ? `${Math.round(data.taxe_fonciere_moyenne).toLocaleString()} €` : "N/D"}
            <span className="text-lg text-slate-400 font-medium"> / an</span>
          </div>
        </div>

        {fiabiliteFaible && (
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-slate-300 max-w-2xl mx-auto">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Cette commune a un score de fiabilité des données plus faible que la moyenne — le montant peut être une estimation basée sur la moyenne départementale plutôt qu&apos;une donnée directe.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-center">
          <p className="text-sm text-slate-400 mb-4">
            La taxe foncière n&apos;est qu&apos;une partie du coût réel de la propriété à {cityName}. Voyez l&apos;impact complet sur 25 ans.
          </p>
          <Link
            href={`/acheter-ou-louer/${insee}`}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-6 py-3 transition-colors"
          >
            Lancer la simulation complète
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-xs text-slate-600 text-center max-w-xl mx-auto">
          Montant moyen basé sur les données de fiscalité locale (DGFiP), à titre indicatif. Le montant réel dépend de la valeur locative cadastrale du bien.
        </p>
      </div>
    </main>
  );
}
