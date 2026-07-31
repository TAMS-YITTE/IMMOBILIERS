"use client"

import React, { useState } from 'react';
import { TrendingUp, Calculator, ShieldCheck, ArrowRight, Layers, Sliders, DollarSign } from 'lucide-react';
import { simulateVenteATerme } from '@/lib/calculator';
import VatLeadModal from './VatLeadModal';

export default function VatInvestorSimulator() {
  // Inputs
  const [prixMarche, setPrixMarche] = useState<number>(300000);
  const [surface, setSurface] = useState<number>(70);
  const [loyerM2, setLoyerM2] = useState<number>(15);
  const [taxeFonciere, setTaxeFonciere] = useState<number>(1200);
  const [apport, setApport] = useState<number>(42000);
  const [dureeTerme, setDureeTerme] = useState<number>(0); // 0, 3, 10, 15
  const [leadOpen, setLeadOpen] = useState(false);

  // Table des décotes standards selon la durée d'occupation du vendeur
  const getDecotePct = (years: number) => {
    if (years === 0) return 0.30;  // VAT Libre
    if (years <= 3) return 0.20;   // Bail restant (3 ans)
    if (years <= 10) return 0.35;  // Occupé long (10 ans)
    return 0.40;                   // Occupé très long (15 ans)
  };

  const decoteCurrent = getDecotePct(dureeTerme);

  // Calcul du scénario courant
  const resCurrent = simulateVenteATerme({
    prix_marche: prixMarche,
    surface,
    loyer_m2: loyerM2,
    taxe_fonciere_annuelle: taxeFonciere,
    duree_terme_annees: dureeTerme,
    decote_pct: decoteCurrent,
    apport,
    taux_pret: 0.035,
    duree_pret_annees: 25,
    duree_detention_annees: 20,
  });

  // Génération des 4 scénarios pour la table comparative
  const scenarios = [
    { label: 'Libre', duree: 0, decote: 0.30 },
    { label: 'Bail restant', duree: 3, decote: 0.20 },
    { label: 'Occupé long', duree: 10, decote: 0.35 },
    { label: 'Occupé très long', duree: 15, decote: 0.40 },
  ].map((sc) => {
    const res = simulateVenteATerme({
      prix_marche: prixMarche,
      surface,
      loyer_m2: loyerM2,
      taxe_fonciere_annuelle: taxeFonciere,
      duree_terme_annees: sc.duree,
      decote_pct: sc.decote,
      apport,
      taux_pret: 0.035,
      duree_pret_annees: 25,
      duree_detention_annees: 20,
    });
    return { ...sc, res };
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex justify-center items-center gap-2">
          <TrendingUp className="text-emerald-600" size={32} />
          Simulateur Investisseur VAT (Occupée vs Libre)
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Évaluez la rentabilité financière (TRI & Gain Net) d'un investissement en Vente à Terme selon la durée d'occupation réservée au vendeur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUTS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit space-y-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sliders size={20} className="text-emerald-600" />
            Paramètres de l'Investissement
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix de marché du bien (€)</label>
              <input 
                type="number" 
                value={prixMarche} 
                onChange={(e) => setPrixMarche(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Surface (m²)</label>
                <input 
                  type="number" 
                  value={surface} 
                  onChange={(e) => setSurface(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loyer (€/m²)</label>
                <input 
                  type="number" 
                  value={loyerM2} 
                  onChange={(e) => setLoyerM2(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apport personnel (€)</label>
              <input 
                type="number" 
                value={apport} 
                onChange={(e) => setApport(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Durée d'occupation du terme : <strong className="text-emerald-600">{dureeTerme} ans</strong>
              </label>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="1"
                value={dureeTerme} 
                onChange={(e) => setDureeTerme(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-slate-500 mt-1">
                Décote d'occupation appliquée : <strong>{(decoteCurrent * 100).toFixed(0)}%</strong>
              </p>
            </div>
          </div>
        </div>

        {/* RESULTATS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl text-white text-center shadow-lg">
              <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider block mb-1">
                Taux de Rendement Interne (TRI)
              </span>
              <h3 className="text-5xl font-extrabold mb-2">
                {resCurrent.tri_annualise_pct}%
              </h3>
              <p className="text-xs text-emerald-200">
                Basé sur l'effet de levier et la décote d'entrée
              </p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl text-white text-center shadow-lg">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Gain Net Total Estimé
              </span>
              <h3 className="text-4xl font-extrabold text-emerald-400 mb-2">
                {resCurrent.gain_net.toLocaleString('fr-FR')} €
              </h3>
              <p className="text-xs text-slate-400">
                Prix d'achat déduit : {resCurrent.prix_achat.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>

          {/* TABLEAU DES 4 SCÉNARIOS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              Comparatif des 4 Scénarios d'Occupation
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-3">Scénario</th>
                    <th className="pb-3 text-center">Durée occup.</th>
                    <th className="pb-3 text-center">Décote</th>
                    <th className="pb-3 text-center">TRI</th>
                    <th className="pb-3 text-right">Gain Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scenarios.map((sc) => {
                    const isSelected = dureeTerme === sc.duree;
                    return (
                      <tr 
                        key={sc.label} 
                        onClick={() => setDureeTerme(sc.duree)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-100/60 font-bold text-emerald-950' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <td className="py-3 font-semibold">{sc.label}</td>
                        <td className="py-3 text-center">{sc.duree} an{sc.duree > 1 ? 's' : ''}</td>
                        <td className="py-3 text-center">{(sc.decote * 100).toFixed(0)}%</td>
                        <td className="py-3 text-center text-emerald-600 font-extrabold">{sc.res.tri_annualise_pct}%</td>
                        <td className="py-3 text-right font-bold">{sc.res.gain_net.toLocaleString('fr-FR')} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              * Cliquez sur n'importe quel scénario pour ajuster la simulation instantanément.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setLeadOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg"
            >
              Recevoir les opportunités investisseur VAT
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </div>

      <VatLeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        role="acheteur"
        source="investisseur"
        context={{ budget: Math.round(prixMarche), bouquet: Math.round(apport), renteMensuelle: Math.round(resCurrent.gain_net / 180), duree: dureeTerme }}
      />
    </div>
  );
}
