import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import CarteClient from "@/components/CarteClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Acheter ou louer : la carte de France",
  description: "Découvrez département par département où l'achat immobilier devient plus rentable que la location, et en combien d'années. Carte interactive fondée sur les prix de vente et les loyers réels.",
  alternates: { canonical: "/carte" },
};

export const revalidate = 86400; // 24 hours ISR

export default async function CartePage() {
  const PAGE_SIZE = 1000;
  
  interface CommuneData {
    code_insee: string;
    nom_commune: string | null;
    prix_m2_appart_moyen: number | null;
    prix_m2_maison_moyen: number | null;
    loyer_m2_appart_moyen: number | null;
    loyer_m2_maison_moyen: number | null;
    taxe_fonciere_moyenne: number | null;
    ratio_dpe_fg: number | null;
    codes_postaux: string[] | null;
  }
  
  const allCommunes: CommuneData[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("communes_metrics")
      .select("code_insee, nom_commune, prix_m2_appart_moyen, prix_m2_maison_moyen, loyer_m2_appart_moyen, loyer_m2_maison_moyen, taxe_fonciere_moyenne, ratio_dpe_fg, codes_postaux")
      .or("prix_m2_appart_moyen.not.is.null,prix_m2_maison_moyen.not.is.null")
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    
    allCommunes.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const initialMetrics = allCommunes;

  return (
    <main className="max-w-7xl mx-auto p-6 py-12">
      <header className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Où l&apos;achat devient-il plus rentable que la location&nbsp;?
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          La réponse département par département, à partir des prix de vente et des loyers réels.
          Ajustez le scénario pour qu&apos;il corresponde à votre projet.
        </p>
      </header>

      <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-slate-500">Chargement de la carte...</div>}>
        <CarteClient initialCommunes={initialMetrics} />
      </Suspense>
    </main>
  );
}
