"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { simulateBuyVsRent } from '@/lib/calculator';
import { Info, MapPin, ArrowRight } from 'lucide-react';

interface CommuneData {
  code_insee: string;
  nom_commune: string | null;
  prix_m2_appart_moyen: number | null;
  loyer_m2_appart_moyen: number | null;
  taxe_fonciere_moyenne: number | null;
  ratio_dpe_fg: number | null;
  codes_postaux: string[] | null;
}

const REF_SCENARIO = {
  surface: 50,
  apport: 25000,
  tauxPret: 0.035,
  dureePret: 25,
};

export default function CarteClient({ initialCommunes }: { initialCommunes: CommuneData[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const processedCities = useMemo(() => {
    return initialCommunes.map((c) => {
      const prixM2 = c.prix_m2_appart_moyen || 0;
      const loyerM2 = c.loyer_m2_appart_moyen || 0;

      const sim = simulateBuyVsRent({
        prix_m2: prixM2,
        loyer_m2: loyerM2,
        taxe_fonciere_annuelle: c.taxe_fonciere_moyenne || 0,
        ratio_dpe_fg: c.ratio_dpe_fg || 0,
        surface: REF_SCENARIO.surface,
        apport: REF_SCENARIO.apport,
        taux_pret: REF_SCENARIO.tauxPret,
        duree_pret_annees: REF_SCENARIO.dureePret,
      });

      const bascule = sim.bascule_annee !== null ? Number(sim.bascule_annee) : null;

      let colorClass = 'bg-red-500/20 border-red-500/40 text-red-400';
      let category = 'Rentable tard / Jamais';
      if (bascule !== null && bascule <= 8) {
        colorClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
        category = 'Très rentable (< 8 ans)';
      } else if (bascule !== null && bascule <= 15) {
        colorClass = 'bg-amber-500/20 border-amber-500/40 text-amber-400';
        category = 'Moyennement rentable (8-15 ans)';
      }

      return {
        code: c.code_insee,
        codePostal: c.codes_postaux && c.codes_postaux.length > 0 ? c.codes_postaux[0] : null,
        codesPostaux: c.codes_postaux || [],
        nom: c.nom_commune || c.code_insee,
        prixM2,
        loyerM2,
        bascule,
        category,
        colorClass,
      };
    });
  }, [initialCommunes]);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return processedCities.slice(0, 48);
    const q = searchTerm.toLowerCase();
    return processedCities
      .filter((c) =>
        c.nom.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.codesPostaux.some((cp) => cp.includes(q))
      )
      .slice(0, 48);
  }, [processedCities, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Légende du Scénario de Référence */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-lg">
            <Info size={20} />
            Scénario de référence fixe (Légende)
          </div>
          <p className="text-sm text-slate-400">
            Calcul basé sur un **appartement de 50 m²**, **25 000 € d&apos;apport** (20%), un prêt de **25 ans** à **3,5 %**.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Rentable en &lt; 8 ans
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-amber-400">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            Rentable en 8-15 ans
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            &gt; 15 ans / Location
          </div>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une ville ou un code postal..."
          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xl"
        />
      </div>

      {/* Grille Thermique des Communes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCities.map((c) => (
          <Link
            key={c.code}
            href={`/acheter-ou-louer/${c.code}`}
            className={`p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between group ${c.colorClass}`}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                  {c.nom}
                </h3>
                <MapPin size={16} className="text-slate-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 font-mono mb-4">{c.codePostal || `INSEE: ${c.code}`}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-semibold">
                {c.bascule !== null ? `Bascule : ${c.bascule} ans` : 'Location gagne'}
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
