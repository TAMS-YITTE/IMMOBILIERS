"use client"

import React, { useState, useMemo } from 'react';
import { Wallet, Calculator, ArrowLeftRight } from 'lucide-react';
import { calculateMonthlyMortgage, calculateLoanCapacity } from '@/lib/calculator';

type Mode = 'depuis_budget' | 'depuis_montant';

export default function MensualitePage() {
  const [mode, setMode] = useState<Mode>('depuis_budget');
  const [tauxPret, setTauxPret] = useState(3.5);
  const [dureePret, setDureePret] = useState(25);

  const [budgetMensuel, setBudgetMensuel] = useState(1200);
  const [montantEmprunte, setMontantEmprunte] = useState(300000);

  const resultat = useMemo(() => {
    const taux = tauxPret / 100;
    if (mode === 'depuis_budget') {
      const capacite = calculateLoanCapacity(budgetMensuel, taux, dureePret);
      return { label: "Montant empruntable estimé", valeur: capacite };
    } else {
      const mensualite = calculateMonthlyMortgage(montantEmprunte, taux, dureePret);
      return { label: "Mensualité estimée", valeur: mensualite };
    }
  }, [mode, budgetMensuel, montantEmprunte, tauxPret, dureePret]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Mensualité &amp; Capacité d&apos;emprunt
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Un seul calcul, deux sens : partez de votre budget mensuel ou d&apos;un montant à emprunter.
          </p>
        </header>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-900/60 border border-white/10 rounded-full p-1">
              <button
                onClick={() => setMode('depuis_budget')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'depuis_budget' ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' : 'text-slate-400 hover:text-white'}`}
              >
                Je pars de mon budget
              </button>
              <ArrowLeftRight className="w-4 h-4 text-slate-600 self-center mx-1" />
              <button
                onClick={() => setMode('depuis_montant')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'depuis_montant' ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' : 'text-slate-400 hover:text-white'}`}
              >
                Je pars d&apos;un montant à emprunter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mode === 'depuis_budget' ? (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Mensualité maximum souhaitée (€): {budgetMensuel.toLocaleString()}
                </label>
                <input type="range" min="200" max="4000" step="50" value={budgetMensuel}
                  onChange={(e) => setBudgetMensuel(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Montant à emprunter (€): {montantEmprunte.toLocaleString()}
                </label>
                <input type="range" min="20000" max="800000" step="5000" value={montantEmprunte}
                  onChange={(e) => setMontantEmprunte(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Taux d&apos;intérêt annuel (%): {tauxPret.toFixed(2)}
              </label>
              <input type="range" min="1" max="7" step="0.05" value={tauxPret}
                onChange={(e) => setTauxPret(Number(e.target.value))}
                className="w-full accent-purple-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Durée du prêt (années): {dureePret}
              </label>
              <input type="range" min="5" max="30" step="1" value={dureePret}
                onChange={(e) => setDureePret(Number(e.target.value))}
                className="w-full accent-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
              <Calculator className="w-4 h-4" />
              <span className="text-sm">{resultat.label}</span>
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-white">
              {Math.round(resultat.valeur).toLocaleString()} €
              {mode === 'depuis_montant' && <span className="text-lg text-slate-400 font-medium"> / mois</span>}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Wallet className="text-purple-400" />
            Passez à l&apos;action
          </h4>
          <p className="text-sm text-slate-400 mb-6">
            Obtenez le meilleur taux du marché pour ce projet grâce à nos courtiers partenaires.
          </p>
          <form className="space-y-4 relative z-10">
            <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
              <input type="checkbox" id="consent" className="mt-1 accent-purple-500 w-4 h-4" />
              <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
                J&apos;accepte d&apos;être recontacté(e) gratuitement par un courtier pour une étude de financement.
              </label>
            </div>
            <button type="button" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 transition-colors">
              Trouver mon financement
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-600 text-center max-w-xl mx-auto">
          Simulation indicative basée sur un taux et une durée saisis par vos soins, hors assurance emprunteur et frais de dossier. Ne remplace pas une étude personnalisée par votre banque.
        </p>
      </div>
    </main>
  );
}
