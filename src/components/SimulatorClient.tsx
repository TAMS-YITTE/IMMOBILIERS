"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, FileText, CheckCircle2, TrendingUp, Wallet, Loader2, X, ShieldCheck, Landmark, Leaf, KeyRound } from 'lucide-react';
import { simulateBuyVsRent } from '@/lib/calculator';
import { supabase } from '@/lib/supabaseClient';
import CityPageNav from '@/components/CityPageNav';

interface CommuneMetric {
  nom: string;
  prix_m2_appart: number;
  prix_m2_maison: number;
  loyer_m2_appart: number;
  loyer_m2_maison: number;
  taxe_fonciere: number;
  ratio_dpe_fg: number;
}

interface CommuneRow {
  code_insee: string;
  nom_commune: string | null;
  prix_m2_appart_moyen: number | null;
  prix_m2_maison_moyen: number | null;
  loyer_m2_appart_moyen: number | null;
  loyer_m2_maison_moyen: number | null;
  taxe_fonciere_moyenne: number | null;
  ratio_dpe_fg: number | null;
}

const MOCK_COMMUNE_METRICS: Record<string, CommuneMetric> = {
  '75111': { nom: "Paris 11e (Mock)", prix_m2_appart: 10500, prix_m2_maison: 12000, loyer_m2_appart: 30, loyer_m2_maison: 28, taxe_fonciere: 800, ratio_dpe_fg: 0.25 },
};

interface SimulatorClientProps {
  initialInsee?: string;
  initialCommuneMetrics?: Record<string, CommuneMetric>;
}

export default function SimulatorClient({ initialInsee, initialCommuneMetrics }: SimulatorClientProps) {
  const [communeMetrics, setCommuneMetrics] = useState<Record<string, CommuneMetric>>(initialCommuneMetrics || MOCK_COMMUNE_METRICS);
  const [loading, setLoading] = useState(!initialCommuneMetrics);
  
  const [insee, setInsee] = useState(initialInsee || '75111');
  const [typeBien, setTypeBien] = useState<'appart'|'maison'>('appart');
  const [surface, setSurface] = useState(50);
  const [apport, setApport] = useState(30000);

  // Lead Generation State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadConsent, setLeadConsent] = useState(false);

  useEffect(() => {
    // If we already have initial data (from SSR SEO page), don't fetch all
    if (initialCommuneMetrics) {
      return;
    }
    async function fetchSupabaseData() {
      try {
        const { data, error } = await supabase.from('communes_metrics').select('*');
        if (error) {
          console.warn("Supabase fetch failed. Using mock.", error);
        } else if (data && data.length > 0) {
          const formattedData: Record<string, CommuneMetric> = {};
          (data as CommuneRow[]).forEach((c) => {
            formattedData[c.code_insee] = {
              nom: c.nom_commune || `Commune ${c.code_insee}`,
              prix_m2_appart: c.prix_m2_appart_moyen || 0,
              prix_m2_maison: c.prix_m2_maison_moyen || 0,
              loyer_m2_appart: c.loyer_m2_appart_moyen || 0,
              loyer_m2_maison: c.loyer_m2_maison_moyen || 0,
              taxe_fonciere: c.taxe_fonciere_moyenne || 0,
              ratio_dpe_fg: c.ratio_dpe_fg || 0
            };
          });
          setCommuneMetrics(formattedData);
          setInsee(data[0].code_insee);
        }
      } catch (err) {
        console.error("Supabase connection error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupabaseData();
  }, [initialCommuneMetrics]);

  const simulationResult = useMemo(() => {
    const metrics = communeMetrics[insee] || communeMetrics[Object.keys(communeMetrics)[0]];
    if (!metrics) return null;
    
    return simulateBuyVsRent({
      prix_m2: typeBien === 'appart' ? metrics.prix_m2_appart : metrics.prix_m2_maison,
      loyer_m2: typeBien === 'appart' ? metrics.loyer_m2_appart : metrics.loyer_m2_maison,
      taxe_fonciere_annuelle: metrics.taxe_fonciere,
      ratio_dpe_fg: metrics.ratio_dpe_fg,
      surface,
      apport
    });
  }, [insee, typeBien, surface, apport, communeMetrics]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadConsent) return;
    setLeadSubmitting(true);

    try {
      const metrics = communeMetrics[insee];
      const { error } = await supabase.from('leads').insert({
        email: leadEmail,
        telephone: leadPhone,
        code_insee_recherche: insee,
        type_bien: typeBien,
        surface: surface,
        apport: apport,
        montant_projet: metrics ? (typeBien === 'appart' ? metrics.prix_m2_appart : metrics.prix_m2_maison) * surface : 0,
        mensualite_estimee: simulationResult?.mensualite_banque_estimee || 0,
        consentement_contact_courtier: leadConsent,
      });

      if (error) throw error;
      setLeadSuccess(true);
    } catch (err) {
      console.error("Error submitting lead:", err);
      alert("Une erreur est survenue. Veuillez vérifier votre connexion.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const metrics = communeMetrics[insee];
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codeInsee: insee,
          communeName: metrics?.nom || 'Votre ville',
          surface,
          apport,
          typeBien,
          tauxPret,
          dureePret
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de l'initialisation du paiement.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion.");
    } finally {
      setCheckoutLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-500">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  const currentCityName = communeMetrics[insee]?.nom || "Inconnu";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Acheter ou Louer à {currentCityName} ?
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Découvrez exactement quand l&apos;achat devient plus rentable que la location, basé sur des données publiques et réelles.
          </p>
        </header>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg md:text-xl font-semibold text-white text-center">
              4 sources de données publiques officielles, pas une estimation
            </h2>
          </div>
          <p className="text-sm text-slate-400 text-center max-w-2xl mx-auto mb-6">
            Contrairement aux simulateurs qui appliquent une moyenne nationale ou un forfait générique, chaque chiffre affiché ici vient directement d&apos;une base de données institutionnelle française, recalculée commune par commune.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-semibold text-white">Prix de vente réels</span>
              <span className="text-xs text-slate-500">DVF — DGFiP</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
              <Leaf className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Diagnostics énergétiques</span>
              <span className="text-xs text-slate-500">DPE — ADEME</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
              <Landmark className="w-6 h-6 text-blue-400" />
              <span className="text-sm font-semibold text-white">Fiscalité locale réelle</span>
              <span className="text-xs text-slate-500">Taxe foncière — DGFiP</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
              <KeyRound className="w-6 h-6 text-amber-400" />
              <span className="text-sm font-semibold text-white">Loyers du marché</span>
              <span className="text-xs text-slate-500">ANIL — Min. du Logement</span>
            </div>
          </div>
        </div>

        <CityPageNav codeInsee={insee} current="acheter-ou-louer" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Home className="text-purple-400" />
                Votre Projet
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Ville ciblée</label>
                  <select 
                    value={insee} 
                    onChange={(e) => setInsee(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    {Object.entries(communeMetrics).map(([code, data]) => (
                      <option key={code} value={code}>{data.nom} ({code})</option>
                    ))}
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

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-medium text-slate-300">Évolution du Patrimoine Net</h3>
                  <p className="text-sm text-slate-500 mt-1">Comparaison sur 25 ans (avec inflation)</p>
                </div>
                {simulationResult && (
                  <div className={`mt-4 md:mt-0 border px-4 py-2 rounded-full font-medium flex items-center gap-2 ${simulationResult.bascule_annee ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                    <TrendingUp size={18} />
                    {simulationResult.bascule_annee 
                      ? `Achat rentable après ${simulationResult.bascule_annee} ans` 
                      : `La location reste plus rentable`}
                  </div>
                )}
              </div>

              <div className="h-[400px] w-full relative z-10">
                {simulationResult && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationResult.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                      <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value: unknown) => typeof value === 'number' ? [`${value.toLocaleString()} €`, undefined] : [String(value), undefined]}
                      />
                      <Legend />
                      <Line type="monotone" name="Acheteur (Patrimoine immo - Dette)" dataKey="achat" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                      <Line type="monotone" name="Locataire (Épargne cumulée)" dataKey="location" stroke="#3b82f6" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Wallet className="text-purple-400" />
                  Passez à l&apos;action
                </h4>
                <p className="text-sm text-slate-400 mb-6">
                  Vos mensualités estimées sont de <strong className="text-purple-300">{simulationResult?.mensualite_banque_estimee?.toLocaleString() || 0} €</strong>. Obtenez le meilleur taux.
                </p>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-slate-400 leading-tight">
                      Mise en relation gratuite et sans engagement avec les meilleurs courtiers de votre région.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowLeadModal(true)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 transition-colors"
                  >
                    Trouver mon financement
                  </button>
                </div>
              </div>

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
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Tableaux d&apos;amortissement complets</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 100% anonyme, aucun appel</li>
                </ul>
                <button 
                  type="button" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl py-3 transition-colors relative z-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? <Loader2 className="animate-spin" size={20} /> : "Acheter le rapport (4,99 €)"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modale de Contact B2B */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            {leadSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h3>
                <p className="text-slate-400">
                  Un de nos courtiers partenaires spécialisés sur {currentCityName} va vous recontacter très vite pour votre projet.
                </p>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setLeadSuccess(false);
                    setLeadConsent(false);
                    setLeadEmail('');
                    setLeadPhone('');
                  }}
                  className="mt-8 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-xl transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-2">Étude de financement</h3>
                <p className="text-slate-400 mb-6 text-sm">
                  Laissez vos coordonnées pour qu&apos;un expert vous aide à obtenir votre prêt de {simulationResult?.mensualite_banque_estimee?.toLocaleString()} € / mois.
                </p>
                
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={leadEmail}
                      onChange={e => setLeadEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="vous@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
                    <input 
                      type="tel" 
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="lead-consent"
                      checked={leadConsent}
                      onChange={(e) => setLeadConsent(e.target.checked)}
                      className="mt-1 accent-purple-500 w-4 h-4"
                    />
                    <label htmlFor="lead-consent" className="text-xs text-slate-400 leading-tight">
                      J&apos;accepte d&apos;être recontacté(e) gratuitement par un courtier partenaire pour une étude personnalisée de mon financement.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={leadSubmitting || !leadConsent}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {leadSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Être recontacté gratuitement"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
