"use client"

import React, { useState } from 'react';
import { Home, Info, ArrowRight, ShieldAlert, KeyRound, TrendingUp, DollarSign } from 'lucide-react';
import VatLeadModal from './VatLeadModal';

export default function VatSellerSimulator() {
  // Inputs
  const [prixSouhaite, setPrixSouhaite] = useState<number>(300000);
  const [duree, setDuree] = useState<number>(15);
  const [bouquetPourcentage, setBouquetPourcentage] = useState<number>(20);
  const [primeDeTerme, setPrimeDeTerme] = useState<number>(5); // 0%, 5%, 10%
  const [leadOpen, setLeadOpen] = useState(false);

  // Hypothèses
  const DECOTE_CLASSIQUE = 0.08; // 8% de décote si vente rapide/classique difficile

  // Calculs VAT avec Prime de Terme
  const prixFinalVAT = prixSouhaite * (1 + primeDeTerme / 100);
  const bouquetVAT = prixFinalVAT * (bouquetPourcentage / 100);
  const capitalRenteVAT = prixFinalVAT - bouquetVAT;
  const renteMensuelleVAT = capitalRenteVAT / (duree * 12);
  const gainSurcote = prixFinalVAT - prixSouhaite;

  // Calculs Vente Classique Décotée
  const prixDecote = prixSouhaite * (1 - DECOTE_CLASSIQUE);
  const perteSeche = prixSouhaite - prixDecote;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Simulateur Vendeur : Vendez au prix fort</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Votre bien stagne sur le marché à cause de la hausse des taux ? Découvrez comment la Vente à Terme peut vous permettre d'en obtenir le vrai prix, tout en générant un revenu régulier sécurisé par acte notarié.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : INPUTS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit space-y-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Home size={20} className="text-amber-600" />
            Votre Bien
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix souhaité initial (€)</label>
              <input 
                type="number" 
                value={prixSouhaite} 
                onChange={(e) => setPrixSouhaite(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Durée du paiement (années)</label>
              <select 
                value={duree} 
                onChange={(e) => setDuree(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value={10}>10 ans</option>
                <option value={12}>12 ans</option>
                <option value={15}>15 ans</option>
                <option value={20}>20 ans</option>
              </select>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Bouquet demandé au départ</span>
                <span className="text-amber-600">{bouquetPourcentage}%</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="40" 
                step="5"
                value={bouquetPourcentage}
                onChange={(e) => setBouquetPourcentage(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-xs text-slate-500 mt-1">Soit {Math.round(bouquetVAT).toLocaleString('fr-FR')} € payés comptant par l'acheteur chez le notaire.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prime de terme (Surcote échelonnement)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 5, 10].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrimeDeTerme(p)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      primeDeTerme === p
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{p}% {p === 5 ? '(Conseillé)' : ''}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {primeDeTerme > 0
                  ? `Majorité de +${gainSurcote.toLocaleString('fr-FR')} € appliquée sur le prix.`
                  : "Prix du marché direct (0% de surcote)."}
              </p>
            </div>
          </div>
        </div>

        {/* COLONNES DROITE : RESULTATS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VENTE CLASSIQUE DÉCOTÉE */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white">
              <h4 className="text-lg font-bold text-slate-800 mb-1">Baisse de prix (Urgence)</h4>
              <p className="text-sm text-slate-500 mb-6">Pour vendre vite avec un crédit classique</p>

              <div className="flex flex-col gap-1 text-center mb-6">
                <span className="text-3xl font-bold text-slate-400 line-through decoration-red-500/50">
                  {Math.round(prixSouhaite).toLocaleString('fr-FR')} €
                </span>
                <span className="text-4xl font-extrabold text-slate-800">
                  {Math.round(prixDecote).toLocaleString('fr-FR')} €
                </span>
                <span className="text-sm font-medium text-red-600 mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="rotate-180" size={16} />
                  Perte sèche : {Math.round(perteSeche).toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>

            {/* VENTE A TERME (VAT) */}
            <div className="relative p-6 rounded-2xl border-2 border-amber-300 bg-amber-50/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md">
                {primeDeTerme > 0 ? `Prix valorisé (+${primeDeTerme}%)` : 'Votre prix préservé'}
              </div>

              <h4 className="text-lg font-bold text-amber-900 mb-1">Vente à Terme Libre</h4>
              <p className="text-sm text-amber-700/70 mb-6">En acceptant un paiement échelonné</p>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                  <span className="text-sm font-medium text-slate-600">Bouquet (Comptant)</span>
                  <span className="font-bold text-amber-700">{Math.round(bouquetVAT).toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                  <span className="text-sm font-medium text-slate-600">Rente Mensuelle (pendant {duree} ans)</span>
                  <span className="font-bold text-amber-700">{Math.round(renteMensuelleVAT).toLocaleString('fr-FR')} €</span>
                </div>
                <div className="mt-2 text-center pt-3 border-t border-amber-200/50">
                  <span className="text-xs uppercase tracking-wide text-amber-800/60 font-semibold block mb-1">Total perçu (échelonné)</span>
                  <span className="text-3xl font-extrabold text-amber-600">
                    {Math.round(prixFinalVAT).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* WARNINGS & ALERTS */}
          <div className="bg-slate-800 rounded-xl p-5 text-white flex gap-4">
            <div className="shrink-0 mt-1">
              <ShieldAlert className="text-amber-400" size={24} />
            </div>
            <div className="text-sm space-y-2">
              <p className="font-bold text-amber-400">Ce qu'il faut savoir (Mentions Légales)</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li><strong>Sécurité notariale</strong> : Le notaire inscrit un "Privilège de Vendeur" avec clause résolutoire. Si l'acheteur ne paie plus, vous pouvez récupérer le bien tout en conservant l'argent déjà versé (sous réserve de l'appréciation du juge).</li>
                <li><strong>Fiscalité (Plus-value)</strong> : Attention, si le bien n'est pas votre résidence principale, la taxe sur la plus-value immobilière est exigible **en totalité l'année de la vente**, même si vous n'avez perçu que le bouquet. Assurez-vous que le bouquet couvre au moins cet impôt.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-slate-100 pt-8">
        <button
          onClick={() => setLeadOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          Être accompagné pour ma vente
          <ArrowRight size={20} />
        </button>
      </div>

      <VatLeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        role="vendeur"
        source="vendeur"
        context={{ budget: Math.round(prixSouhaite), bouquet: Math.round(bouquetVAT), renteMensuelle: Math.round(renteMensuelleVAT), duree }}
      />
    </div>
  );
}
