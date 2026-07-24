import { supabase } from "@/lib/supabaseClient";
import CityPageNav from "@/components/CityPageNav";
import Link from "next/link";
import { Metadata } from "next";
import { Landmark, ArrowRight, Info } from "lucide-react";

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
    title: `Taxe foncière à ${cityName} | Montant moyen`,
    description: `Quel est le montant moyen de la taxe foncière à ${cityName} (${insee}) ? Estimation basée sur les données DGFiP.`,
    alternates: { canonical: `/taxe-fonciere/${insee}` },
    openGraph: {
      title: `Taxe foncière à ${cityName} | Montant moyen`,
      description: `Quel est le montant moyen de la taxe foncière à ${cityName} (${insee}) ? Estimation basée sur les données DGFiP.`,
      url: `/taxe-fonciere/${insee}`,
    },
  };
}

export default async function TaxeFoncierePage({ params }: Props) {
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

  const fiabiliteFaible = typeof data.fiabilite_score === 'number' && data.fiabilite_score < 8;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Taxe foncière à ${cityName}`,
    "description": `Quel est le montant moyen de la taxe foncière à ${cityName} (${insee}) ?`,
    "url": `https://kalcul.app/taxe-fonciere/${insee}`
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Taxe foncière à {cityName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Montant moyen constaté, code INSEE {insee}.
          </p>
        </header>

        <CityPageNav codeInsee={insee} current="taxe-fonciere" />

        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
            <Landmark className="w-4 h-4" />
            Taxe foncière moyenne
          </div>
          <div className="text-5xl font-extrabold text-slate-900">
            {data.taxe_fonciere_moyenne ? `${Math.round(data.taxe_fonciere_moyenne).toLocaleString()} €` : "N/D"}
            <span className="text-lg text-slate-500 font-medium"> / an</span>
          </div>
        </div>

        {fiabiliteFaible && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-slate-700 max-w-2xl mx-auto">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Cette commune a un score de fiabilité des données plus faible que la moyenne — le montant peut être une estimation basée sur la moyenne départementale plutôt qu&apos;une donnée directe.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600 mb-4">
            La taxe foncière n&apos;est qu&apos;une partie du coût réel de la propriété à {cityName}. Voyez l&apos;impact complet sur 25 ans.
          </p>
          <Link
            href={`/acheter-ou-louer/${insee}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-full px-6 py-3 transition-all duration-150"
          >
            Lancer la simulation complète
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-xs text-slate-500 text-center max-w-xl mx-auto">
          Montant moyen basé sur les données de fiscalité locale (DGFiP), à titre indicatif. Le montant réel dépend de la valeur locative cadastrale du bien.
        </p>
      </div>
    </main>
  );
}
