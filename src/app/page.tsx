"use client"

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, FileText, CheckCircle2, TrendingUp, Wallet } from 'lucide-react';
import { simulateBuyVsRent } from '../lib/calculator';

// Mock DB metrics for demonstration
const COMMUNE_METRICS: Record<string, any> = {
  '75111': { nom: "Paris 11e", prix_m2_appart: 10500, prix_m2_maison: 12000, loyer_m2_appart: 30, loyer_m2_maison: 28, taxe_fonciere: 800, ratio_dpe_fg: 0.25 },
  '69123': { nom: "Lyon 3e", prix_m2_appart: 5200, prix_m2_maison: 6000, loyer_m2_appart: 16, loyer_m2_maison: 15, taxe_fonciere: 900, ratio_dpe_fg: 0.15 },
  '87085': { nom: "Limoges", prix_m2_appart: 1800, prix_m2_maison: 1900, loyer_m2_appart: 10, loyer_m2_maison: 9, taxe_fonciere: 1200, ratio_dpe_fg: 0.40 },
};

export default function SimulatorPage() {
  const [insee, setInsee] = useState('75111');
  const [typeBien, setTypeBien] = useState<'appart'|'maison'>('appart');
  const [surface, setSurface] = useState(50);
  const [apport, setApport] = useState(30000);

  // Dynamic Calculation
  const simulationResult = useMemo(() => {
    const metrics = COMMUNE_METRICS[insee] || COMMUNE_METRICS['75111'];
    
    return simulateBuyVsRent({
      prix_m2: typeBien === 'appart' ? metrics.prix_m2_appart : metrics.prix_m2_maison,
      loyer_m2: typeBien === 'appart' ? metrics.loyer_m2_appart : metrics.loyer_m2_maison,
      taxe_fonciere_annuelle: metrics.taxe_fonciere,
      ratio_dpe_fg: metrics.ratio_dpe_fg,
      surface,
      apport
    });
  }, [insee, typeBien, surface, apport]);

  const currentCityName = COMMUNE_METRICS[insee]?.nom || "Inconnu";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Acheter ou Louer à {currentCityName} ?
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Découvrez exactement quand l'achat devient plus rentable que la location, basé sur 100% de données publiques réelles.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Home className="text-purple-400" />
                Votre Projet
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Ville (Test)</label>
                  <select 
                    value={insee} 
                    onChange={(e) => setInsee(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="75111">Paris 11e (75111)</option>
                    <option value="69123">Lyon 3e (69123)</option>
                    <option value="87085">Limoges (87085)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTypeBien('appart')}
                    className={`rounded-xl py-3 font-medium transition-colors ${typeBien === 'appart' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-white/5'}`}
                  >
                    Appartement
                  </button>
                  <button 
                    onClick={() => setTypeBien('maison')}
                    className={`rounded-xl py-3 font-medium transition-colors ${typeBien === 'maison' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-white/5'}`}
                  >
                    Maison
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Surface (m²): {surface}</label>
                  <input type="range" min="10" max="200" value={surface} onChange={(e) => setSurface(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Apport personnel (€): {apport.toLocaleString()}</label>
                  <input type="range" min="0" max="200000" step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Graph */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Graph Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-medium text-slate-300">Évolution du Patrimoine Net</h3>
                  <p className="text-sm text-slate-500 mt-1">Comparaison sur 25 ans (avec inflation)</p>
                </div>
                <div className={`mt-4 md:mt-0 border px-4 py-2 rounded-full font-medium flex items-center gap-2 ${simulationResult.bascule_annee ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                  <TrendingUp size={18} />
                  {simulationResult.bascule_annee 
                    ? `Achat rentable après ${simulationResult.bascule_annee} ans` 
                    : `La location reste plus rentable`}
                </div>
              </div>

              <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationResult.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: any) => typeof value === 'number' ? [`${value.toLocaleString()} €`, undefined] : [String(value), undefined]}
                    />
                    <Legend />
                    <Line type="monotone" name="Acheteur (Patrimoine immo - Dette)" dataKey="achat" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                    <Line type="monotone" name="Locataire (Épargne cumulée)" dataKey="location" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monetization Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Lead Gen Card */}
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Wallet className="text-purple-400" />
                  Passez à l'action
                </h4>
                <p className="text-sm text-slate-400 mb-6">
                  Vos mensualités estimées sont de <strong className="text-purple-300">{simulationResult.mensualite_banque_estimee.toLocaleString()} €</strong>. Obtenez le meilleur taux.
                </p>
                
                <form className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" id="consent" className="mt-1 accent-purple-500 w-4 h-4" />
                    <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
                      J'accepte d'être recontacté(e) gratuitement par un courtier pour une étude de financement.
                    </label>
                  </div>
                  <button type="button" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 transition-colors">
                    Trouver mon financement
                  </button>
                </form>
              </div>

              {/* PDF Card */}
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="text-blue-400" />
                  Rapport Détaillé
                </h4>
                <p className="text-sm text-slate-400 mb-6">
                  Analysez les chiffres en profondeur sans être démarché. Téléchargez notre rapport PDF.
                </p>
                
                <ul className="space-y-2 mb-6 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Comparaison de 3 scénarios</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Tableaux d'amortissement complets</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 100% anonyme, aucun appel</li>
                </ul>

                <button type="button" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl py-3 transition-colors relative z-10">
                  Acheter le rapport (4,99 €)
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
