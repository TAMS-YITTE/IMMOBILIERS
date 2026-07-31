"use client"

import React, { useState } from 'react';
import { Landmark, Handshake, AlertTriangle, CheckCircle2, TrendingDown, ArrowRight, Sliders } from 'lucide-react';
import VatLeadModal from './VatLeadModal';

export default function VatComparator() {
  // Inputs
  const [prix, setPrix] = useState<number>(250000);
  const [apport, setApport] = useState<number>(50000);
  const [revenus, setRevenus] = useState<number>(3500);
  const [duree, setDuree] = useState<number>(20);
  const [leadOpen, setLeadOpen] = useState(false);

  // Hypothèses Classiques
  const FRAIS_NOTAIRE_TAUX = 0.075;
  const TAUX_PRET = 0.035; // 3.5%
  const TAUX_ASSURANCE = 0.003; // 0.3%

  // Calculs communs
  const fraisNotaire = prix * FRAIS_NOTAIRE_TAUX;
  
  // ==========================================
  // SCÉNARIO 1 : ACHAT CLASSIQUE BANCAIRE
  // ==========================================
  const besoinFinancement = prix + fraisNotaire - apport;
  const t = TAUX_PRET / 12;
  const n = duree * 12;
  
  let mensualiteCredit = 0;
  if (besoinFinancement > 0) {
    mensualiteCredit = (besoinFinancement * t) / (1 - Math.pow(1 + t, -n));
  }
  const mensualiteAssurance = besoinFinancement > 0 ? (besoinFinancement * TAUX_ASSURANCE) / 12 : 0;
  const mensualiteBanqueTotale = besoinFinancement > 0 ? mensualiteCredit + mensualiteAssurance : 0;
  const coutTotalBanque = (mensualiteBanqueTotale * n) - besoinFinancement;
  
  const endettementBanque = revenus > 0 ? (mensualiteBanqueTotale / revenus) * 100 : 0;
  const resteAVivreBanque = revenus - mensualiteBanqueTotale;
  const isBanqueRefuse = endettementBanque > 35;

  // ==========================================
  // SCÉNARIO 2 : VENTE A TERME (VAT)
  // ==========================================
  // L'acheteur doit payer les frais de notaire comptant. Le reste de l'apport devient le bouquet.
  const bouquet = Math.max(0, apport - fraisNotaire);
  const capitalRestantVAT = prix - bouquet;
  const mensualiteVAT = capitalRestantVAT / n; // 0% d'intérêt
  
  const endettementVAT = revenus > 0 ? (mensualiteVAT / revenus) * 100 : 0;
  const resteAVivreVAT = revenus - mensualiteVAT;
  const apportInsuffisantVAT = apport < fraisNotaire;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Comparateur : Achat Classique vs Vente à Terme</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Découvrez si la Vente à Terme (achat direct au vendeur sans banque) est une alternative intéressante pour votre projet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : INPUTS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit space-y-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sliders size={20} className="text-indigo-600" />
            Votre Projet
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix du bien (€)</label>
              <input 
                type="number" 
                value={prix} 
                onChange={(e) => setPrix(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Épargne disponible (€)</label>
              <input 
                type="number" 
                value={apport} 
                onChange={(e) => setApport(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Revenus nets mensuels (€)</label>
              <input 
                type="number" 
                value={revenus} 
                onChange={(e) => setRevenus(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Durée souhaitée</label>
              <select 
                value={duree} 
                onChange={(e) => setDuree(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10 ans (120 mois)</option>
                <option value={15}>15 ans (180 mois)</option>
                <option value={20}>20 ans (240 mois)</option>
                <option value={25}>25 ans (300 mois)</option>
              </select>
            </div>
          </div>
        </div>

        {/* COLONNES DROITE : RESULTATS */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARTE BANQUE */}
          <div className={`relative p-6 rounded-2xl border-2 transition-all ${isBanqueRefuse ? 'border-red-100 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="text-slate-400" />
                  Prêt Bancaire
                </h4>
                <p className="text-sm text-slate-500 mt-1">Achat classique avec crédit</p>
              </div>
              {isBanqueRefuse ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <AlertTriangle size={14} /> Refus probable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 size={14} /> Accessible
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                <span className="text-slate-600">Mensualité</span>
                <span className={`text-2xl font-bold ${isBanqueRefuse ? 'text-red-600' : 'text-slate-800'}`}>
                  {Math.round(mensualiteBanqueTotale).toLocaleString('fr-FR')} €<span className="text-sm font-normal text-slate-500">/mois</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 text-sm">Taux d'endettement</span>
                <span className={`font-semibold ${isBanqueRefuse ? 'text-red-600' : 'text-slate-800'}`}>
                  {endettementBanque.toFixed(1)} %
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 text-sm">Reste à vivre</span>
                <span className="font-semibold text-slate-800">
                  {Math.round(resteAVivreBanque).toLocaleString('fr-FR')} €
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 text-sm">Coût du crédit (intérêts)</span>
                <span className="font-semibold text-slate-800">
                  {Math.round(coutTotalBanque).toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          </div>

          {/* CARTE VAT */}
          <div className={`relative p-6 rounded-2xl border-2 transition-all shadow-sm ${isBanqueRefuse ? 'border-emerald-500 bg-emerald-50/10' : 'border-indigo-100 bg-indigo-50/10'}`}>
            {isBanqueRefuse && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md">
                L'alternative idéale
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                  <Handshake className="text-emerald-500" />
                  Vente à Terme
                </h4>
                <p className="text-sm text-slate-500 mt-1">Achat direct au vendeur</p>
              </div>
            </div>

            {apportInsuffisantVAT ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                <p className="font-semibold mb-1">Épargne insuffisante</p>
                <p>En Vente à Terme, vous devez régler les frais de notaire ({Math.round(fraisNotaire).toLocaleString('fr-FR')} €) comptant dès le départ. Votre épargne actuelle ne le permet pas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-indigo-100 pb-3">
                  <span className="text-slate-600">Mensualité (0% int.)</span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {Math.round(mensualiteVAT).toLocaleString('fr-FR')} €<span className="text-sm font-normal text-emerald-600/70">/mois</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 text-sm">Bouquet versé au vendeur</span>
                  <span className="font-semibold text-slate-800">
                    {Math.round(bouquet).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 text-sm">Reste à vivre</span>
                  <span className="font-semibold text-emerald-700">
                    {Math.round(resteAVivreVAT).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 text-sm">Coût du crédit</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <TrendingDown size={16} /> 0 €
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-8 p-6 bg-slate-900 rounded-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-bold text-white mb-2">La Vente à Terme semble vous correspondre ?</h4>
          <p className="text-slate-400 text-sm max-w-2xl">
            Ne laissez pas un refus bancaire stopper votre projet. Laissez-nous votre email pour être informé en priorité des biens en Vente à Terme compatibles avec votre profil.
          </p>
        </div>
        <button
          onClick={() => setLeadOpen(true)}
          className="whitespace-nowrap px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 group"
        >
          Être tenu informé
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <VatLeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        role="acheteur"
        source="comparateur"
        context={{ budget: Math.round(prix), bouquet: Math.round(bouquet), renteMensuelle: Math.round(mensualiteVAT), duree }}
      />
      
      <p className="text-center text-xs text-slate-400 mt-4">
        * Estimations données à titre indicatif. Les frais de notaire sont calculés sur la valeur totale du bien. À valider avec un professionnel de l'immobilier ou un notaire.
      </p>
    </div>
  );
}
