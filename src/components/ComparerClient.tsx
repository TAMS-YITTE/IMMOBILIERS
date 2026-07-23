/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { simulateBuyVsRent } from '@/lib/calculator';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, CheckCircle2, AlertTriangle, Plus, Trash2, Scale } from 'lucide-react';

interface CityOption {
  code: string;
  nom: string;
  codePostal: string | null;
}

interface CommuneMetric {
  nom: string;
  prix_m2_appart: number;
  prix_m2_maison: number;
  loyer_m2_appart: number;
  loyer_m2_maison: number;
  taxe_fonciere: number;
  ratio_dpe_fg: number;
  code_postal: string | null;
}

export default function ComparerClient({ initialCityOptions }: { initialCityOptions: CityOption[] }) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['75111', '69001']);
  const [metricsMap, setMetricsMap] = useState<Record<string, CommuneMetric>>({});
  
  // Shared scenario parameters
  const [typeBien, setTypeBien] = useState<'appart' | 'maison'>('appart');
  const [surface, setSurface] = useState(50);
  const [apport, setApport] = useState(30000);
  const [tauxPret, setTauxPret] = useState(3.5);
  const [dureePret, setDureePret] = useState(25);

  useEffect(() => {
    async function fetchSelectedCitiesData() {
      const missingCodes = selectedCodes.filter((code) => !metricsMap[code]);
      if (missingCodes.length === 0) return;

      const { data, error } = await supabase
        .from('communes_metrics')
        .select('*')
        .in('code_insee', missingCodes);

      if (error || !data) return;

      const newMetrics: Record<string, CommuneMetric> = {};
      data.forEach((r: any) => {
        newMetrics[r.code_insee] = {
          nom: r.nom_commune || `Commune ${r.code_insee}`,
          prix_m2_appart: r.prix_m2_appart_moyen || 0,
          prix_m2_maison: r.prix_m2_maison_moyen || 0,
          loyer_m2_appart: r.loyer_m2_appart_moyen || 0,
          loyer_m2_maison: r.loyer_m2_maison_moyen || 0,
          taxe_fonciere: r.taxe_fonciere_moyenne || 0,
          ratio_dpe_fg: r.ratio_dpe_fg || 0,
          code_postal: r.codes_postaux && r.codes_postaux.length > 0 ? r.codes_postaux[0] : null,
        };
      });

      setMetricsMap((prev) => ({ ...prev, ...newMetrics }));
    }
    fetchSelectedCitiesData();
  }, [selectedCodes, metricsMap]);

  const addCity = (code: string) => {
    if (selectedCodes.length >= 3 || selectedCodes.includes(code)) return;
    setSelectedCodes([...selectedCodes, code]);
  };

  const removeCity = (code: string) => {
    if (selectedCodes.length <= 1) return;
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  };

  const comparisons = useMemo(() => {
    return selectedCodes.map((code) => {
      const metrics = metricsMap[code];
      if (!metrics) return { code, metrics: null, sim: null };

      const prixM2 = typeBien === 'appart' ? metrics.prix_m2_appart : metrics.prix_m2_maison;
      const loyerM2 = typeBien === 'appart' ? metrics.loyer_m2_appart : metrics.loyer_m2_maison;

      const sim = simulateBuyVsRent({
        prix_m2: prixM2,
        loyer_m2: loyerM2,
        taxe_fonciere_annuelle: metrics.taxe_fonciere,
        ratio_dpe_fg: metrics.ratio_dpe_fg,
        surface,
        apport,
        taux_pret: tauxPret / 100,
        duree_pret_annees: dureePret,
      });

      return {
        code,
        metrics,
        prixM2,
        loyerM2,
        sim,
      };
    });
  }, [selectedCodes, metricsMap, typeBien, surface, apport, tauxPret, dureePret]);

  return (
    <div className="space-y-8">
      {/* Configuration du Scénario Commun */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Scale className="text-purple-600" />
          Scénario Commun de Simulation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Type de bien</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTypeBien('appart')}
                className={`py-2 text-xs rounded-full font-medium border transition-colors ${typeBien === 'appart' ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Appart.
              </button>
              <button
                type="button"
                onClick={() => setTypeBien('maison')}
                className={`py-2 text-xs rounded-full font-medium border transition-colors ${typeBien === 'maison' ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Maison
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Surface (m²): {surface}</label>
            <input type="range" min="10" max="200" value={surface} onChange={(e) => setSurface(Number(e.target.value))} className="w-full accent-purple-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Apport (€): {apport.toLocaleString()}</label>
            <input type="range" min="0" max="200000" step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="w-full accent-purple-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Taux du crédit (%): {tauxPret.toFixed(2)} %</label>
            <input type="range" min="1.0" max="7.0" step="0.1" value={tauxPret} onChange={(e) => setTauxPret(Number(e.target.value))} className="w-full accent-purple-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Durée (années): {dureePret}</label>
            <input type="range" min="5" max="30" step="1" value={dureePret} onChange={(e) => setDureePret(Number(e.target.value))} className="w-full accent-purple-600" />
          </div>
        </div>
      </div>

      {/* Selecteur pour ajouter une ville */}
      {selectedCodes.length < 3 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Plus size={16} className="text-purple-600" />
            Ajouter une ville à comparer ({selectedCodes.length}/3) :
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addCity(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          >
            <option value="">Sélectionner une ville...</option>
            {initialCityOptions
              .filter((c) => !selectedCodes.includes(c.code))
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.codePostal ? `${c.codePostal} - ${c.nom}` : c.nom}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Cartes Côte à Côte */}
      <div className={`grid grid-cols-1 ${selectedCodes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
        {comparisons.map((c) => {
          if (!c.metrics || !c.sim) {
            return (
              <div key={c.code} className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-500 shadow-sm">
                Chargement des données de la ville ({c.code})...
              </div>
            );
          }

          const { metrics, sim, prixM2, loyerM2 } = c;

          return (
            <div key={c.code} className="bg-white border border-slate-200 rounded-3xl p-6 relative flex flex-col justify-between shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-blue-500" />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{metrics.nom}</h3>
                    <span className="text-xs text-slate-500 font-mono">{metrics.code_postal || `Code INSEE: ${c.code}`}</span>
                  </div>
                  {selectedCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCity(c.code)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Retirer cette ville"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Badge Point de Bascule */}
                <div className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 ${
                  sim.bascule_annee ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {sim.bascule_annee ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertTriangle size={24} className="shrink-0" />}
                  <div>
                    <div className="font-bold text-sm">
                      {sim.bascule_annee ? `Achat rentable après ${sim.bascule_annee} ans` : 'Location toujours plus rentable'}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 opacity-80">Sur une projection de 25 ans</p>
                  </div>
                </div>

                {/* Statistiques Immobilières */}
                <div className="space-y-3 mb-6 divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Prix au m² ({typeBien})</span>
                    <span className="font-semibold text-slate-900">{Math.round(prixM2).toLocaleString()} €/m²</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Loyer au m²</span>
                    <span className="font-semibold text-slate-900">{loyerM2.toFixed(1)} €/m²</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Mensualité estimée</span>
                    <span className="font-bold text-purple-700">{sim.mensualite_banque_estimee.toLocaleString()} € / mois</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Taxe foncière annuelle</span>
                    <span className="font-semibold text-slate-700">{metrics.taxe_fonciere.toLocaleString()} € / an</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/acheter-ou-louer/${c.code}`}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-4"
              >
                Voir la simulation détaillée
                <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
