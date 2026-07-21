import { supabase } from "@/lib/supabaseClient";
import SimulatorClient from "@/components/SimulatorClient";
import CityPageNav from "@/components/CityPageNav";
import { Metadata } from "next";

// Using ISR to cache these pages on CDN, refreshing them every 24 hours
export const revalidate = 86400; 

type Props = {
  params: Promise<{ "code-insee": string }>;
};

// Pre-render at build time the 1000 communes with the most complete/reliable data
// (proxy for active markets, faute de donnee de population) ; les ~31 800 autres restent
// servies en ISR a la demande au premier acces, pas de generation statique de masse.
export async function generateStaticParams() {
  const { data } = await supabase
    .from('communes_metrics')
    .select('code_insee')
    .not('prix_m2_appart_moyen', 'is', null)
    .order('fiabilite_score', { ascending: false })
    .limit(1000);
  return data?.map((commune) => ({
    "code-insee": commune.code_insee,
  })) || [];
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];
  const { data } = await supabase
    .from('communes_metrics')
    .select('nom_commune')
    .eq('code_insee', insee)
    .single();

  const cityName = data?.nom_commune || "cette ville";

  return {
    title: `Faut-il acheter ou louer à ${cityName} en 2024 ? | Simulateur`,
    description: `Découvrez si l'achat immobilier est plus rentable que la location à ${cityName} (${insee}). Calcul ultra-précis basé sur les vraies données du marché et impôts locaux.`,
  };
}

export default async function CitySimulatorPage({ params }: Props) {
  const resolvedParams = await params;
  const insee = resolvedParams["code-insee"];
  
  // Fetch data on the server side
  const { data, error } = await supabase
    .from('communes_metrics')
    .select('*')
    .eq('code_insee', insee)
    .single();

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

  // Format data for the client component
  const initialMetrics = {
    [insee]: {
      nom: data.nom_commune || `Commune ${insee}`,
      prix_m2_appart: data.prix_m2_appart_moyen || 0,
      prix_m2_maison: data.prix_m2_maison_moyen || 0,
      loyer_m2_appart: data.loyer_m2_appart_moyen || 0,
      loyer_m2_maison: data.loyer_m2_maison_moyen || 0,
      taxe_fonciere: data.taxe_fonciere_moyenne || 0,
      ratio_dpe_fg: data.ratio_dpe_fg || 0
    }
  };

  return (
    <>
      <div className="bg-slate-950 pt-8">
        <CityPageNav codeInsee={insee} current="acheter-ou-louer" />
      </div>
      <SimulatorClient initialInsee={insee} initialCommuneMetrics={initialMetrics} />
    </>
  );
}
