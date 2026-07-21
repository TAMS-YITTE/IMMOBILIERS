import { supabase } from "@/lib/supabaseClient";
import CityPageNav from "@/components/CityPageNav";
import Link from "next/link";
import { Metadata } from "next";
import { Leaf, ArrowRight, AlertTriangle, Hammer } from "lucide-react";

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
    title: `Passoires thermiques et rénovation énergétique à ${cityName}`,
    description: `Quelle part des logements est classée F ou G (passoire thermique) à ${cityName} (${insee}) ? Données DPE (ADEME) et impact sur votre budget travaux.`,
  };
}

export default async function RenovationEnergetiquePage({ params }: Props) {
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
  const ratioFG = typeof data.ratio_dpe_fg === 'number' ? Math.round(data.ratio_dpe_fg * 100) : null;
  const provisionM2An = ratioFG !== null && data.ratio_dpe_fg > 0.3 ? 30 : 15;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Rénovation énergétique à {cityName}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Part des passoires thermiques (DPE F et G), code INSEE {insee}.
          </p>
        </header>

        <CityPageNav codeInsee={insee} current="renovation-energetique" />

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 text-sm">
            <Leaf className="w-4 h-4" />
            Part de passoires thermiques (F/G)
          </div>
          <div className="text-5xl font-extrabold text-white">
            {ratioFG !== null ? `${ratioFG} %` : "N/D"}
          </div>
          <p className="text-sm text-slate-500 mt-2">des logements diagnostiqués depuis juillet 2021</p>
        </div>

        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-slate-300 max-w-2xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Depuis la Loi Climat et Résilience, la location des logements classés <strong>G</strong> est interdite depuis 2025, et les <strong>F</strong> le seront à partir de 2028. Si vous achetez un bien mal classé à {cityName}, prévoyez un budget travaux dans votre plan de financement.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <Hammer className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-slate-300">
            Notre simulateur provisionne automatiquement <strong className="text-white">{provisionM2An} €/m²/an</strong> de travaux de rénovation énergétique à {cityName}, calculé à partir de la part de passoires thermiques de la zone.
          </p>
        </div>

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Intégrez ce budget travaux dans votre comparaison achat vs location à {cityName}.
          </p>
          <Link
            href={`/acheter-ou-louer/${insee}`}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-6 py-3 transition-colors"
          >
            Lancer la simulation complète
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-slate-600 mt-4">
            Bientôt : mise en relation avec des diagnostiqueurs et artisans RGE certifiés près de {cityName}.
          </p>
        </div>

        <p className="text-xs text-slate-600 text-center max-w-xl mx-auto">
          Données DPE (Diagnostics de Performance Énergétique) issues de l&apos;ADEME, limitées aux diagnostics postérieurs à la réforme de juillet 2021, à titre indicatif.
        </p>
      </div>
    </main>
  );
}
