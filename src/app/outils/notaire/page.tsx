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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Frais de Notaire
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Estimez les frais d&apos;acquisition (droits d&apos;enregistrement, émoluments, débours) pour un bien ancien ou neuf.
          </p>
        </header>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTypeBien('ancien')}
              className={`rounded-xl py-4 font-medium transition-colors flex flex-col items-center gap-1 ${typeBien === 'ancien' ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200'}`}
            >
              <Building2 className="w-5 h-5" />
              Ancien (~8%)
            </button>
            <button
              onClick={() => setTypeBien('neuf')}
              className={`rounded-xl py-4 font-medium transition-colors flex flex-col items-center gap-1 ${typeBien === 'neuf' ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200'}`}
            >
              <Building2 className="w-5 h-5" />
              Neuf (~2,5%)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Prix du bien (€): {prixBien.toLocaleString()}
            </label>
            <input type="range" min="50000" max="1000000" step="5000" value={prixBien}
              onChange={(e) => setPrixBien(Number(e.target.value))}
              className="w-full accent-purple-600" />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-slate-200 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
                <FileText className="w-4 h-4" />
                Frais de notaire estimés
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {Math.round(resultat.frais).toLocaleString()} €
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 text-sm">
                <FileText className="w-4 h-4" />
                Coût total (bien + frais)
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {Math.round(resultat.total).toLocaleString()} €
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto">
          Barème indicatif (~8% dans l&apos;ancien, ~2,5% dans le neuf), les frais réels varient selon le département et les émoluments du notaire. Ne remplace pas un devis notarié.
        </p>
      </div>
    </main>
  );
}
