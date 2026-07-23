"use client"

import React, { useState, useMemo } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

// Barème indicatif de taux annuel d'assurance emprunteur selon l'âge, en % du capital emprunté.
function tauxAssuranceParAge(age: number): number {
  if (age < 30) return 0.0015;
  if (age < 40) return 0.002;
  if (age < 50) return 0.003;
  if (age < 60) return 0.0045;
  return 0.006;
}

export default function AssuranceEmprunteurPage() {
  const [age, setAge] = useState(35);
  const [montantEmprunte, setMontantEmprunte] = useState(250000);
  const [dureePret, setDureePret] = useState(25);

  const resultat = useMemo(() => {
    const taux = tauxAssuranceParAge(age);
    const coutAnnuel = montantEmprunte * taux;
    const coutMensuel = coutAnnuel / 12;
    const coutTotal = coutAnnuel * dureePret;
    return { taux, coutAnnuel, coutMensuel, coutTotal };
  }, [age, montantEmprunte, dureePret]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Assurance Emprunteur
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Estimez le coût de votre assurance de prêt selon votre âge et votre capital emprunté.
          </p>
        </header>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Âge: {age} ans</label>
              <input type="range" min="18" max="70" value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-purple-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Montant emprunté (€): {montantEmprunte.toLocaleString()}
              </label>
              <input type="range" min="20000" max="800000" step="5000" value={montantEmprunte}
                onChange={(e) => setMontantEmprunte(Number(e.target.value))}
                className="w-full accent-purple-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Durée du prêt: {dureePret} ans</label>
              <input type="range" min="5" max="30" value={dureePret}
                onChange={(e) => setDureePret(Number(e.target.value))}
                className="w-full accent-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-slate-200 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-slate-500 mb-2">Taux estimé</div>
              <div className="text-2xl font-extrabold text-slate-900">{(resultat.taux * 100).toFixed(2)} %</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-2">Coût mensuel</div>
              <div className="text-2xl font-extrabold text-slate-900">{Math.round(resultat.coutMensuel).toLocaleString()} €</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-2">Coût total sur {dureePret} ans</div>
              <div className="text-2xl font-extrabold text-slate-900">{Math.round(resultat.coutTotal).toLocaleString()} €</div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-slate-600">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Depuis la <strong>Loi Lemoine</strong>, vous pouvez changer d&apos;assurance emprunteur à tout moment, sans frais ni pénalité — une délégation d&apos;assurance peut souvent diviser ce coût par deux ou trois par rapport au contrat groupe de votre banque.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors" />
          <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="text-purple-600" />
            Comparez et économisez
          </h4>
          <p className="text-sm text-slate-500 mb-6">
            Nos courtiers partenaires en assurance emprunteur peuvent comparer les offres du marché pour vous, gratuitement.
          </p>
          <form className="space-y-4 relative z-10">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <input type="checkbox" id="consent" className="mt-1 accent-purple-600 w-4 h-4" />
              <label htmlFor="consent" className="text-xs text-slate-500 leading-tight">
                J&apos;accepte d&apos;être recontacté(e) gratuitement par un courtier en assurance emprunteur.
              </label>
            </div>
            <button type="button" className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-full py-3 transition-all duration-150">
              Comparer les assurances
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto">
          Barème indicatif par tranche d&apos;âge, hors questionnaire de santé et garanties spécifiques (invalidité, perte d&apos;emploi). Ne remplace pas un devis personnalisé.
        </p>
      </div>
    </main>
  );
}
