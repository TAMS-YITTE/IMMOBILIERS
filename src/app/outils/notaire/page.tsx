"use client"

import React, { useState, useMemo } from 'react';
import { FileText, Building2 } from 'lucide-react';

type TypeBien = 'ancien' | 'neuf';

const TAUX_FRAIS: Record<TypeBien, number> = {
  ancien: 0.08,
  neuf: 0.025,
};

export default function NotairePage() {
  const [typeBien, setTypeBien] = useState<TypeBien>('ancien');
  const [prixBien, setPrixBien] = useState(250000);

  const resultat = useMemo(() => {
    const taux = TAUX_FRAIS[typeBien];
    const frais = prixBien * taux;
    return {
      frais,
      total: prixBien + frais,
      taux,
    };
  }, [typeBien, prixBien]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Frais de Notaire
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Estimez les frais d&apos;acquisition (droits d&apos;enregistrement, émoluments, débours) pour un bien ancien ou neuf.
          </p>
        </header>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTypeBien('ancien')}
              className={`rounded-xl py-4 font-medium transition-colors flex flex-col items-center gap-1 ${typeBien === 'ancien' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-white/5'}`}
            >
              <Building2 className="w-5 h-5" />
              Ancien (~8%)
            </button>
            <button
              onClick={() => setTypeBien('neuf')}
              className={`rounded-xl py-4 font-medium transition-colors flex flex-col items-center gap-1 ${typeBien === 'neuf' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-white/5'}`}
            >
              <Building2 className="w-5 h-5" />
              Neuf (~2,5%)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Prix du bien (€): {prixBien.toLocaleString()}
            </label>
            <input type="range" min="50000" max="1000000" step="5000" value={prixBien}
              onChange={(e) => setPrixBien(Number(e.target.value))}
              className="w-full accent-purple-500" />
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 text-sm">
                <FileText className="w-4 h-4" />
                Frais de notaire estimés
              </div>
              <div className="text-3xl font-extrabold text-white">
                {Math.round(resultat.frais).toLocaleString()} €
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 text-sm">
                <FileText className="w-4 h-4" />
                Coût total (bien + frais)
              </div>
              <div className="text-3xl font-extrabold text-white">
                {Math.round(resultat.total).toLocaleString()} €
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center max-w-xl mx-auto">
          Barème indicatif (~8% dans l&apos;ancien, ~2,5% dans le neuf), les frais réels varient selon le département et les émoluments du notaire. Ne remplace pas un devis notarié.
        </p>
      </div>
    </main>
  );
}
