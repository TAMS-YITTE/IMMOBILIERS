import { supabase } from "@/lib/supabaseClient";
import CityPageNav from "@/components/CityPageNav";
import Link from "next/link";
import { Metadata } from "next";
import { Leaf, ArrowRight, AlertTriangle, Hammer } from "lucide-react";

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
    title: `Passoires thermiques et rénovation énergétique à ${cityName}`,
    description: `Quelle part des logements est classée F ou G (passoire thermique) à ${cityName} (${insee}) ? Données DPE (ADEME) et impact sur votre budget travaux.`,
    alternates: { canonical: `/renovation-energetique/${insee}` },
    openGraph: {
      title: `Passoires thermiques et rénovation énergétique à ${cityName}`,
      description: `Quelle part des logements est classée F ou G (passoire thermique) à ${cityName} (${insee}) ? Données DPE (ADEME) et impact sur votre budget travaux.`,
      url: `/renovation-energetique/${insee}`,
    },
  };
}

export default async function RenovationEnergetiquePage({ params }: Props) {
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
  const ratioFG = typeof data.ratio_dpe_fg === 'number' ? Math.round(data.ratio_dpe_fg * 100) : null;
  const provisionM2An = ratioFG !== null && data.ratio_dpe_fg > 0.3 ? 30 : 15;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Rénovation énergétique à ${cityName}`,
    "description": `Quelle part des logements est classée F ou G (passoire thermique) à ${cityName} (${insee}) ?`,
    "url": `https://www.kalcul.app/renovation-energetique/${insee}`
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
            Rénovation énergétique à {cityName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Part des passoires thermiques (DPE F et G), code INSEE {insee}.
          </p>
        </header>

        <CityPageNav codeInsee={insee} current="renovation-energetique" />

        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
            <Leaf className="w-4 h-4" />
            Part de passoires thermiques (F/G)
          </div>
          <div className="text-5xl font-extrabold text-slate-900">
            {ratioFG !== null ? `${ratioFG} %` : "N/D"}
          </div>
          <p className="text-sm text-slate-500 mt-2">des logements diagnostiqués depuis juillet 2021</p>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700 max-w-2xl mx-auto shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Depuis la Loi Climat et Résilience, la location des logements classés <strong>G</strong> est interdite depuis 2025, et les <strong>F</strong> le seront à partir de 2028. Si vous achetez un bien mal classé à {cityName}, prévoyez un budget travaux dans votre plan de financement.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Hammer className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-slate-700">
            Notre simulateur provisionne automatiquement <strong className="text-slate-900">{provisionM2An} €/m²/an</strong> de travaux de rénovation énergétique à {cityName}, calculé à partir de la part de passoires thermiques de la zone.
          </p>
        </div>

        <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600 mb-4">
            Intégrez ce budget travaux dans votre comparaison achat vs location à {cityName}.
          </p>
          <Link
            href={`/acheter-ou-louer/${insee}`}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-6 py-3 transition-colors"
          >
            Lancer la simulation complète
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-slate-500 mt-4">
            Bientôt : mise en relation avec des diagnostiqueurs et artisans RGE certifiés près de {cityName}.
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center max-w-xl mx-auto">
          Données DPE (Diagnostics de Performance Énergétique) issues de l&apos;ADEME, limitées aux diagnostics postérieurs à la réforme de juillet 2021, à titre indicatif.
        </p>
      </div>
    </main>
  );
}
