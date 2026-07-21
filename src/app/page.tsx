"use client"

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, FileText, CheckCircle2, TrendingUp, Wallet } from 'lucide-react';

const mockChartData = Array.from({ length: 25 }, (_, i) => ({
  year: i + 1,
  achat: 50000 + (i * 12000), // Simplified curve for mockup
  location: 50000 + (i * 8000) * (i > 8 ? 0.9 : 1.1),
}));

export default function SimulatorPage() {
  const [surface, setSurface] = useState(50);
  const [apport, setApport] = useState(30000);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Acheter ou Louer ?
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Découvrez exactement quand l'achat devient plus rentable que la location dans votre ville, basé sur 100% de données publiques réelles.
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">Ville (Code INSEE ou Postal)</label>
                  <input type="text" placeholder="ex: Paris 11e (75111)" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-xl py-3 font-medium transition-colors hover:bg-purple-500/30">Appartement</button>
                  <button className="bg-slate-800/50 border border-white/5 text-slate-400 rounded-xl py-3 font-medium hover:bg-white/5 transition-colors">Maison</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Surface (m²): {surface}</label>
                  <input type="range" min="10" max="200" value={surface} onChange={(e) => setSurface(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Apport personnel (€): {apport.toLocaleString()}</label>
                  <input type="range" min="0" max="200000" step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl py-4 shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02]">
                  Lancer la simulation
                </button>
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
                  <p className="text-sm text-slate-500 mt-1">Comparaison sur 25 ans</p>
                </div>
                <div className="mt-4 md:mt-0 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                  <TrendingUp size={18} />
                  Achat rentable après 8 ans
                </div>
              </div>

              <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                    <Line type="monotone" name="Patrimoine Achat" dataKey="achat" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                    <Line type="monotone" name="Patrimoine Location" dataKey="location" stroke="#3b82f6" strokeWidth={3} dot={false} />
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
                  Vos mensualités estimées sont de <strong className="text-purple-300">1 450 €</strong>. Obtenez le meilleur taux pour sécuriser ce projet.
                </p>
                
                <form className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" id="consent" className="mt-1 accent-purple-500 w-4 h-4" />
                    <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
                      J'accepte d'être recontacté(e) gratuitement par un courtier partenaire pour une étude personnalisée de mon financement.
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
                  Vous voulez analyser les chiffres en profondeur sans être démarché ? Téléchargez notre rapport complet (PDF).
                </p>
                
                <ul className="space-y-2 mb-6 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Comparaison de 3 scénarios (taux, krach)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Tableaux d'amortissement complets</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 100% anonyme, aucun appel commercial</li>
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
