"use client";

import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export interface ScenarioCarte {
  typeBien: 'appartement' | 'maison';
  surface: number;
  apport: number;
  tauxPret: number;      // décimal (0.035 = 3,5 %)
  dureePret: number;     // années
}

export const SCENARIO_REFERENCE: ScenarioCarte = {
  typeBien: 'appartement',
  surface: 50,
  apport: 25000,
  tauxPret: 0.035,
  dureePret: 25,
};

interface CurseurProps {
  label: string;
  valeur: number;
  min: number;
  max: number;
  pas: number;
  affichage: string;
  onChange: (v: number) => void;
}

function Curseur({ label, valeur, min, max, pas, affichage, onChange }: CurseurProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-sm font-bold text-slate-900 tabular-nums">{affichage}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-purple-600"
      />
    </div>
  );
}

export default function CarteReglages({
  scenario,
  onChange,
}: {
  scenario: ScenarioCarte;
  onChange: (s: ScenarioCarte) => void;
}) {
  const estPersonnalise =
    scenario.typeBien !== SCENARIO_REFERENCE.typeBien ||
    scenario.surface !== SCENARIO_REFERENCE.surface ||
    scenario.apport !== SCENARIO_REFERENCE.apport ||
    scenario.tauxPret !== SCENARIO_REFERENCE.tauxPret ||
    scenario.dureePret !== SCENARIO_REFERENCE.dureePret;

  const set = (patch: Partial<ScenarioCarte>) => onChange({ ...scenario, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <SlidersHorizontal size={18} className="text-purple-600" />
          Ajustez le scénario
          {estPersonnalise && (
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              personnalisé
            </span>
          )}
        </div>
        {estPersonnalise && (
          <button
            type="button"
            onClick={() => onChange(SCENARIO_REFERENCE)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors"
          >
            <RotateCcw size={13} />
            Revenir au scénario de référence
          </button>
        )}
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <Link
          href="?bien=appartement"
          replace={true}
          scroll={false}
          onClick={() => set({ typeBien: 'appartement' })}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${scenario.typeBien === 'appartement' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Appartement
        </Link>
        <Link
          href="?bien=maison"
          replace={true}
          scroll={false}
          onClick={() => set({ typeBien: 'maison' })}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${scenario.typeBien === 'maison' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Maison
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <Curseur
          label="Surface"
          valeur={scenario.surface}
          min={20}
          max={150}
          pas={5}
          affichage={`${scenario.surface} m²`}
          onChange={(v) => set({ surface: v })}
        />
        <Curseur
          label="Apport"
          valeur={scenario.apport}
          min={0}
          max={200000}
          pas={5000}
          affichage={`${scenario.apport.toLocaleString('fr-FR')} €`}
          onChange={(v) => set({ apport: v })}
        />
        <Curseur
          label="Taux du prêt"
          valeur={Math.round(scenario.tauxPret * 1000)}
          min={10}
          max={70}
          pas={1}
          affichage={`${(scenario.tauxPret * 100).toFixed(1).replace('.', ',')} %`}
          onChange={(v) => set({ tauxPret: v / 1000 })}
        />
        <Curseur
          label="Durée du prêt"
          valeur={scenario.dureePret}
          min={10}
          max={30}
          pas={1}
          affichage={`${scenario.dureePret} ans`}
          onChange={(v) => set({ dureePret: v })}
        />
      </div>
    </div>
  );
}
