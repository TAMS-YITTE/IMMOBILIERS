"use client"

import React, { useState } from 'react';
import { Calculator, AlertTriangle, ArrowRight, Home, Banknote, HelpCircle } from 'lucide-react';
import VatLeadModal from './VatLeadModal';

export default function VatBuyerCapacity() {
  // Inputs
  const [epargne, setEpargne] = useState<number>(60000);
  const [revenus, setRevenus] = useState<number>(4000);
  const [duree, setDuree] = useState<number>(15);
  const [tauxEndettementMax, setTauxEndettementMax] = useState<number>(35);
  const [leadOpen, setLeadOpen] = useState(false);

  const n = duree * 12;
  const mensualiteMax = revenus * (tauxEndettementMax / 100);

  // La formule du prix accessible en VAT :
  // Prix Accessible = (Epargne + Mensualite_Max * n) / 1.075
  // (Où 1.075 représente le prix + 7.5% de frais de notaire)
  const prixAccessible = (epargne + mensualiteMax * n) / 1.075;
  
  const fraisNotaire = prixAccessible * 0.075;
  const bouquet = epargne - fraisNotaire;
  const capitalRestant = prixAccessible - bouquet; // ou mensualiteMax * n

  // Amortissement simplifié par paliers de 5 ans
  const amortissement = [];
  for (let annee = 0; annee <= duree; annee += 5) {
    const paye = bouquet + (mensualiteMax * (annee * 12));
    amortissement.push({
      annee,
      capitalRestant: Math.max(0, prixAccessible - paye),
      payeTot: paye
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Capacité d'achat "Sans Banque"</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Découvrez le prix du bien que vous pouvez vous offrir en Vente à Terme, sans faire appel au crédit bancaire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : INPUTS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calculator size={20} className="text-indigo-600" />
            Vos finances
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Épargne disponible (€)</label>
              <input 
                type="number" 
                value={epargne} 
                onChange={(e) => setEpargne(Number(e.target.value))}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Durée souhaitée (années)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((y) => (
                  <button
                    key={y}
                    onClick={() => setDuree(y)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${duree === y ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {y} ans
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Taux d'endettement visé</span>
                <span className="text-indigo-600">{tauxEndettementMax}%</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="45" 
                value={tauxEndettementMax}
                onChange={(e) => setTauxEndettementMax(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : RESULTATS */}
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-md text-white text-center">
            <p className="text-indigo-200 text-sm mb-1 uppercase tracking-wider font-semibold">Budget Maximum Estimé</p>
            <h3 className="text-5xl font-extrabold mb-4">
              {Math.round(prixAccessible).toLocaleString('fr-FR')} €
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-indigo-500/50 pt-4">
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-wider mb-1">Bouquet au vendeur</p>
                <p className="text-xl font-bold">{Math.round(bouquet).toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-wider mb-1">Mensualité (0% int.)</p>
                <p className="text-xl font-bold">{Math.round(mensualiteMax).toLocaleString('fr-FR')} €</p>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Banknote size={18} className="text-emerald-500" />
              Répartition de l'épargne
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Épargne totale disponible</span>
                <span className="font-semibold text-slate-800">{Math.round(epargne).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center text-orange-700 bg-orange-50 px-2 py-1 rounded">
                <span className="flex items-center gap-1"><AlertTriangle size={14} /> Frais de notaire (~7.5%)</span>
                <span>- {Math.round(fraisNotaire).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-medium">
                <span>Reste pour le Bouquet vendeur</span>
                <span className="text-emerald-600">{Math.round(bouquet).toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <Home size={24} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900">Restez informé des opportunités</h4>
              <p className="text-emerald-700/80 text-sm mt-1">
                Laissez-nous votre email : nous vous préviendrons dès qu&apos;un bien en Vente à Terme compatible avec ce budget se présente près de chez vous.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLeadOpen(true)}
            className="whitespace-nowrap px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            Être alerté des opportunités
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <VatLeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        role="acheteur"
        source="capacite-achat"
        context={{ budget: Math.round(prixAccessible), bouquet: Math.round(bouquet), renteMensuelle: Math.round(mensualiteMax), duree }}
      />
      
      <p className="text-center text-xs text-slate-400 mt-6 max-w-3xl mx-auto flex items-center justify-center gap-1">
        <HelpCircle size={12} />
        Les frais de notaire (environ 7,5%) sont exigibles immédiatement et calculés sur la valeur totale du bien. À confirmer avec un notaire.
      </p>
    </div>
  );
}
