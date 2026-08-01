"use client"

import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, ArrowRight, Layers, Sliders, DollarSign, Info, Calendar, FileText } from 'lucide-react';
import { simulateVenteATerme } from '@/lib/calculator';
import VatLeadModal from './VatLeadModal';

export default function VatInvestorSimulator() {
  // Inputs
  const [prixMarche, setPrixMarche] = useState<number>(300000);
  const [surface, setSurface] = useState<number>(70);
  const [loyerM2, setLoyerM2] = useState<number>(15);
  const [taxeFonciere, setTaxeFonciere] = useState<number>(1200);
  const [bouquetPct, setBouquetPct] = useState<number>(0.20); // 20% par défaut
  const [dureeTerme, setDureeTerme] = useState<number>(10); // 10 ans par défaut
  const [dureeDetention, setDureeDetention] = useState<number>(10); // 10 ans par défaut
  const [leadOpen, setLeadOpen] = useState(false);

  // Calcul du scénario courant (Vente à Terme Libre - Sans prêt bancaire)
  const resCurrent = simulateVenteATerme({
    prix_marche: prixMarche,
    surface,
    loyer_m2: loyerM2,
    taxe_fonciere_annuelle: taxeFonciere,
    bouquet_pct: bouquetPct,
    duree_terme_annees: dureeTerme,
    duree_detention_annees: dureeDetention,
  });

  // Génération des scénarios comparatifs pour différentes durées de paiement du terme
  const scenariosTerme = [5, 10, 15, 20].map((terme) => {
    const res = simulateVenteATerme({
      prix_marche: prixMarche,
      surface,
      loyer_m2: loyerM2,
      taxe_fonciere_annuelle: taxeFonciere,
      bouquet_pct: bouquetPct,
      duree_terme_annees: terme,
      duree_detention_annees: dureeDetention,
    });
    return { terme, res };
  });

  const fraisNotaireActuels = Math.round(prixMarche * 0.08);
  const apportInitialMois0 = resCurrent.bouquet + fraisNotaireActuels;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex justify-center items-center gap-2">
          <TrendingUp className="text-emerald-600" size={32} />
          Simulateur Vente à Terme Libre (Investisseur)
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm">
          Simulez un investissement immobilier <strong>sans banque ni prêt bancaire</strong>. Achetez avec un bouquet comptant et payez le solde au vendeur sous forme de rente mensuelle fixe à 0 % d'intérêt tout en encaissant les loyers dès le jour 1.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUTS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit space-y-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-200">
            <Sliders size={20} className="text-emerald-600" />
            Paramètres du bien & de la VAT
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Prix de marché du bien (€)</label>
              <input 
                type="number" 
                value={prixMarche} 
                onChange={(e) => setPrixMarche(Math.max(10000, Number(e.target.value)))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Surface (m²)</label>
                <input 
                  type="number" 
                  value={surface} 
                  onChange={(e) => setSurface(Math.max(10, Number(e.target.value)))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Loyer (€/m²)</label>
                <input 
                  type="number" 
                  value={loyerM2} 
                  onChange={(e) => setLoyerM2(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Taxe foncière annuelle (€)</label>
              <input 
                type="number" 
                value={taxeFonciere} 
                onChange={(e) => setTaxeFonciere(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Bouquet au vendeur</label>
                <span className="text-sm font-bold text-emerald-700">{Math.round(bouquetPct * 100)}% ({(resCurrent.bouquet).toLocaleString('fr-FR')} €)</span>
              </div>
              <input 
                type="range" 
                min="0.10" 
                max="0.50" 
                step="0.05"
                value={bouquetPct} 
                onChange={(e) => setBouquetPct(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Durée du paiement (Terme)</label>
                <span className="text-sm font-bold text-emerald-700">{dureeTerme} ans</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="25" 
                step="1"
                value={dureeTerme} 
                onChange={(e) => setDureeTerme(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-slate-500 mt-1">Rente mensuelle fixe : <strong>{resCurrent.rente_mensuelle.toLocaleString('fr-FR')} € / mois</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Horizon de revente (projection)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 15, 20].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDureeDetention(h)}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                      dureeDetention === h
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {h} ans
                  </button>
                ))}
              </div>
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
                Sur {dureeDetention} ans (Rente déduite, net d'impôt et de frais)
              </p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl text-white text-center shadow-lg">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Gain Net Total (Revente à {dureeDetention} ans)
              </span>
              <h3 className="text-4xl font-extrabold text-emerald-400 mb-2">
                {resCurrent.gain_net.toLocaleString('fr-FR')} €
              </h3>
              <p className="text-xs font-medium text-emerald-300">
                Soit environ +{resCurrent.gain_net_annuel.toLocaleString('fr-FR')} € / an
              </p>
            </div>
          </div>

          {/* DETAIL DE LA STRUCTURATION VAT */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <DollarSign size={18} className="text-emerald-600" />
              Détail des Flux Financiers de la Vente à Terme
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block mb-1">Apport Initial Requis (Mois 0)</span>
                <span className="text-lg font-bold text-slate-900 block">{apportInitialMois0.toLocaleString('fr-FR')} €</span>
                <span className="text-xs text-slate-500">
                  Bouquet ({resCurrent.bouquet.toLocaleString('fr-FR')} €) + Notaire 8% ({fraisNotaireActuels.toLocaleString('fr-FR')} €)
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block mb-1">Rente Vendeur à 0% d'Intérêt</span>
                <span className="text-lg font-bold text-emerald-700 block">{resCurrent.rente_mensuelle.toLocaleString('fr-FR')} € / mois</span>
                <span className="text-xs text-slate-500">Pendant {dureeTerme} ans (sans aucun frais bancaire)</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block mb-1">Loyer Net Encaissé Dès J1</span>
                <span className="text-lg font-bold text-slate-900 block">{Math.round(loyerM2 * surface * 0.93).toLocaleString('fr-FR')} € / mois</span>
                <span className="text-xs text-slate-500">Revenu locatif net de gestion (0,93 brut)</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block mb-1">Impact fiscal & frais à la revente</span>
                <span className="text-lg font-bold text-amber-700 block">{(resCurrent.impot_plus_value + resCurrent.frais_agence_revente).toLocaleString('fr-FR')} €</span>
                <span className="text-xs text-slate-500">
                  Impôt PV ({resCurrent.impot_plus_value.toLocaleString('fr-FR')} €) + Agence 5% ({resCurrent.frais_agence_revente.toLocaleString('fr-FR')} €)
                </span>
              </div>
            </div>
          </div>

          {/* TABLEAU COMPARATIF SELON LA DUREE DU TERME */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
              <Layers size={18} className="text-emerald-600" />
              Impact de la Durée de Rente sur la Rentabilité
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-3">Durée du Terme</th>
                    <th className="pb-3 text-center">Rente Mensuelle</th>
                    <th className="pb-3 text-center">TRI ({dureeDetention} ans)</th>
                    <th className="pb-3 text-right">Gain Net Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scenariosTerme.map((sc) => {
                    const isSelected = dureeTerme === sc.terme;
                    return (
                      <tr 
                        key={sc.terme} 
                        onClick={() => setDureeTerme(sc.terme)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-100/60 font-bold text-emerald-950' : 'hover:bg-slate-100 text-slate-700'}`}
                      >
                        <td className="py-3 font-semibold">{sc.terme} ans</td>
                        <td className="py-3 text-center font-medium">{sc.res.rente_mensuelle.toLocaleString('fr-FR')} € / mois</td>
                        <td className="py-3 text-center text-emerald-600 font-extrabold">{sc.res.tri_annualise_pct}%</td>
                        <td className="py-3 text-right font-bold">{sc.res.gain_net.toLocaleString('fr-FR')} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              * Cliquez sur une ligne pour sélectionner cette durée de rente.
            </p>
          </div>

          {/* DISCLAIMER DE TRANSPARENCE ET LEGAL */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-950">
              <Info size={14} className="shrink-0 text-amber-700" />
              Information financière et fiscale importante :
            </div>
            <p>
              Modélisation estimative basée sur un financement sans banque (Vente à Terme Libre). Les frais de notaire sont calculés à 8 % sur la valeur totale du bien. La revente prend en compte des frais d'agence de 5 % et l'impôt sur la plus-value immobilière des particuliers (CGI Art. 150 U avec abattements pour durée de détention). Ces résultats sont donnés à titre indicatif et ne constituent pas une promesse ni une garantie de rendement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
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
        context={{ 
          budget: Math.round(prixMarche), 
          bouquet: Math.round(resCurrent.bouquet), 
          renteMensuelle: Math.round(resCurrent.rente_mensuelle), 
          duree: dureeTerme 
        }}
      />
    </div>
  );
}

