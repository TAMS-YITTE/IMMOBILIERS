"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, FileText, CheckCircle2, TrendingUp, Wallet, Loader2, X, ShieldCheck, Landmark, Leaf, KeyRound, ChevronDown, Sliders } from 'lucide-react';
import { simulateBuyVsRent } from '@/lib/calculator';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import CityPageNav from '@/components/CityPageNav';
import SocialShareWidget from '@/components/SocialShareWidget';
import AuthModal from '@/components/AuthModal';

interface CommuneMetric {
  nom: string;
  prix_m2_appart: number;
  prix_m2_maison: number;
  loyer_m2_appart: number;
  loyer_m2_maison: number;
  taxe_fonciere: number;
  ratio_dpe_fg: number;
  code_postal: string | null;
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
  codes_postaux: string[] | null;
}

interface CityIndexEntry {
  code_insee: string;
  nom: string;
  code_postal: string | null;
}

interface SimulatorClientProps {
  initialInsee?: string;
  initialCommuneMetrics?: Record<string, CommuneMetric>;
}

export default function SimulatorClient({ initialInsee, initialCommuneMetrics }: SimulatorClientProps) {
  const [communeMetrics, setCommuneMetrics] = useState<Record<string, CommuneMetric>>(initialCommuneMetrics || {});
  const [loading, setLoading] = useState(!initialCommuneMetrics);
  const [fetchingCity, setFetchingCity] = useState(false);

  const [insee, setInsee] = useState(initialInsee || '75111');
  const [typeBien, setTypeBien] = useState<'appart'|'maison'>('appart');
  const [surface, setSurface] = useState(50);
  const [apport, setApport] = useState(30000);
  const [tauxPret, setTauxPret] = useState(3.5); // Taux en pourcentage
  const [dureePret, setDureePret] = useState(25); // Durée en années

  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tauxAssurance, setTauxAssurance] = useState(0.3); // %
  const [fraisAgence, setFraisAgence] = useState(0); // %
  const [chargesCopro, setChargesCopro] = useState(25); // €/m²/an
  const [customProvisionReno, setCustomProvisionReno] = useState<number | null>(null);

  // Initialize from URL if resuming a saved simulation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('surface')) setSurface(Number(params.get('surface')));
      if (params.has('apport')) setApport(Number(params.get('apport')));
      if (params.has('taux')) setTauxPret(Number(params.get('taux')));
      if (params.has('duree')) setDureePret(Number(params.get('duree')));
    }
  }, []);

  // City Search State (index leger : code + nom uniquement, pas toutes les colonnes)
  const [cityIndex, setCityIndex] = useState<CityIndexEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lead Generation State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadHoneypot, setLeadHoneypot] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadConsent, setLeadConsent] = useState(false);

  // Auth & Save State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Index leger pour la recherche (code + nom + codes postaux, pas les 6 colonnes de mesures) :
  // telecharger les 32 800 lignes completes juste pour peupler une barre de recherche etait
  // inutilement lourd. Se charge en tache de fond, y compris sur les pages SSR par ville, sinon
  // la recherche ne peut jamais trouver une AUTRE ville que celle deja affichee (verifie en
  // direct : sur la page Paris, chercher "Lyon" ne renvoyait rien).
  // Une entree par (commune, code postal) : les utilisateurs tapent naturellement leur code
  // postal (77500), pas le code INSEE (77108) qui leur est invisible.
  useEffect(() => {
    async function fetchCityIndex() {
      try {
        const PAGE_SIZE = 1000;
        const allRows: CityIndexEntry[] = [];
        let from = 0;
        while (true) {
          const { data: page, error } = await supabase
            .from('communes_metrics')
            .select('code_insee, nom_commune, codes_postaux')
            .range(from, from + PAGE_SIZE - 1);
          if (error || !page || page.length === 0) break;
          for (const r of page as { code_insee: string; nom_commune: string | null; codes_postaux: string[] | null }[]) {
            const nom = r.nom_commune || `Commune ${r.code_insee}`;
            const postaux = r.codes_postaux && r.codes_postaux.length > 0 ? r.codes_postaux : [null];
            for (const code_postal of postaux) {
              allRows.push({ code_insee: r.code_insee, nom, code_postal });
            }
          }
          if (page.length < PAGE_SIZE) break;
          from += PAGE_SIZE;
        }
        setCityIndex(allRows);
      } catch (err) {
        console.error("City index fetch error:", err);
      }
    }
    fetchCityIndex();
  }, []);

  // Recupere les donnees completes d'UNE commune a la demande (ville courante au premier
  // rendu si non fournie par le SSR, ou nouvelle ville selectionnee dans la recherche).
  async function fetchCityMetrics(code: string): Promise<CommuneMetric | null> {
    const { data, error } = await supabase
      .from('communes_metrics')
      .select('*')
      .eq('code_insee', code)
      .single();
    if (error || !data) return null;
    const row = data as CommuneRow;
    return {
      nom: row.nom_commune || `Commune ${code}`,
      prix_m2_appart: row.prix_m2_appart_moyen || 0,
      prix_m2_maison: row.prix_m2_maison_moyen || 0,
      loyer_m2_appart: row.loyer_m2_appart_moyen || 0,
      loyer_m2_maison: row.loyer_m2_maison_moyen || 0,
      taxe_fonciere: row.taxe_fonciere_moyenne || 0,
      ratio_dpe_fg: row.ratio_dpe_fg || 0,
      code_postal: row.codes_postaux && row.codes_postaux.length > 0 ? row.codes_postaux[0] : null,
    };
  }

  useEffect(() => {
    // Deja en cache (SSR, ou ville deja visitee) : rien a charger. "loading" est deja a
    // false dans ce cas (il ne vaut true qu'au tout premier montage sans donnee initiale).
    if (communeMetrics[insee]) {
      return;
    }
    let cancelled = false;
    (async () => {
      setFetchingCity(true);
      const metrics = await fetchCityMetrics(insee);
      if (cancelled) return;
      if (metrics) {
        setCommuneMetrics((prev) => ({ ...prev, [insee]: metrics }));
      } else {
        console.warn(`Aucune donnee trouvee pour la commune ${insee}`);
      }
      setFetchingCity(false);
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insee]);

  // Derived display value for the city input field
  const currentCity = communeMetrics[insee];
  const displayValue = searchQuery !== null
    ? searchQuery
    : (currentCity ? `${currentCity.nom} (${currentCity.code_postal || insee})` : insee);

  // Click outside to close dropdown and reset query back to current city display
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCommunes = useMemo(() => {
    if (searchQuery === null || searchQuery.trim() === '') {
      return cityIndex.slice(0, 30);
    }

    const q = searchQuery.trim().toLowerCase();
    return cityIndex
      .filter((c) =>
        c.nom.toLowerCase().includes(q) ||
        c.code_insee.includes(q) ||
        (c.code_postal !== null && c.code_postal.includes(q))
      )
      .slice(0, 30);
  }, [cityIndex, searchQuery]);

  const simulationResult = useMemo(() => {
    const metrics = communeMetrics[insee];
    if (!metrics) return null;

    const defaultProvisionReno = metrics.ratio_dpe_fg > 0.3 ? 30 : 15;
    const actualProvisionReno = customProvisionReno !== null ? customProvisionReno : defaultProvisionReno;

    return simulateBuyVsRent({
      prix_m2: typeBien === 'appart' ? metrics.prix_m2_appart : metrics.prix_m2_maison,
      loyer_m2: typeBien === 'appart' ? metrics.loyer_m2_appart : metrics.loyer_m2_maison,
      taxe_fonciere_annuelle: metrics.taxe_fonciere,
      ratio_dpe_fg: metrics.ratio_dpe_fg,
      surface,
      apport,
      taux_pret: tauxPret / 100, // Conversion en décimal
      duree_pret_annees: dureePret,
      taux_assurance: tauxAssurance / 100,
      frais_agence_taux: fraisAgence / 100,
      charges_copro_m2_an: chargesCopro,
      provision_renovation_m2_an: actualProvisionReno,
    });
  }, [insee, typeBien, surface, apport, tauxPret, dureePret, tauxAssurance, fraisAgence, chargesCopro, customProvisionReno, communeMetrics]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadConsent) return;
    if (leadHoneypot.trim() !== '') {
      // Silent rejection for spam bots
      setLeadSuccess(true);
      return;
    }
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
        taux_pret: tauxPret,
        duree_pret: dureePret,
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

  const handleSaveSimulation = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setIsSaving(true);
    try {
      const metrics = communeMetrics[insee];
      const { error } = await supabase.from('saved_simulations').insert({
        user_id: user.id,
        code_insee: insee,
        commune_name: metrics?.nom || 'Inconnu',
        type_bien: typeBien,
        surface,
        apport,
        taux_pret: tauxPret,
        duree_pret: dureePret,
        taux_assurance: tauxAssurance,
        frais_agence: fraisAgence,
        charges_copro: chargesCopro,
        provision_reno: customProvisionReno !== null ? customProvisionReno : (metrics?.ratio_dpe_fg > 0.3 ? 30 : 15)
      });
      if (error) throw error;
      alert("Simulation sauvegardée avec succès ! Retrouvez-la dans votre espace personnel.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
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
          dureePret,
          tauxAssurance,
          fraisAgence,
          chargesCopro,
          provisionReno: customProvisionReno !== null ? customProvisionReno : (metrics?.ratio_dpe_fg && metrics.ratio_dpe_fg > 0.3 ? 30 : 15)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-purple-600">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  const currentCityName = communeMetrics[insee]?.nom || "Inconnu";

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 p-6 font-jakarta selection:bg-purple-200 overflow-hidden">
      {/* Halos ambiants : profondeur en fond, purement decoratif (pilote de refonte visuelle) */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-[600px] bg-purple-300/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-full lg:w-1/2 h-[500px] bg-blue-300/25 blur-[120px] pointer-events-none" />

      {/* Top right auth navigation */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
        {user ? (
          <>
            <a href="/dashboard" className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:text-purple-600 transition-colors">Mon Compte</a>
            <button onClick={() => supabase.auth.signOut()} className="bg-white border border-slate-200 p-2 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors" title="Se déconnecter">
              <X size={16} />
            </button>
          </>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 shadow-sm transition-colors text-slate-700">Se connecter</button>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">

        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Acheter ou Louer à {currentCityName} ?
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Découvrez exactement quand l&apos;achat devient plus rentable que la location, basé sur des données publiques et réelles.
          </p>
        </header>

        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 text-center">
              4 sources de données publiques officielles, pas une estimation
            </h2>
          </div>
          <p className="text-sm text-slate-600 text-center max-w-2xl mx-auto mb-6">
            Contrairement aux simulateurs qui appliquent une moyenne nationale ou un forfait générique, chaque chiffre affiché ici vient directement d&apos;une base de données institutionnelle française, recalculée commune par commune.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-semibold text-slate-900">Prix de vente réels</span>
              <span className="text-xs text-slate-600">DVF — DGFiP</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Leaf className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-900">Diagnostics énergétiques</span>
              <span className="text-xs text-slate-600">DPE — ADEME</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Landmark className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Fiscalité locale réelle</span>
              <span className="text-xs text-slate-600">Taxe foncière — DGFiP</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <KeyRound className="w-6 h-6 text-amber-600" />
              <span className="text-sm font-semibold text-slate-900">Loyers du marché</span>
              <span className="text-xs text-slate-600">ANIL — Min. du Logement</span>
            </div>
          </div>
        </div>

        <CityPageNav codeInsee={insee} current="acheter-ou-louer" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
                <Home className="text-purple-600" />
                Votre Projet
              </h2>

              <div className="space-y-5">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                    Ville ciblée
                    {fetchingCity && <Loader2 className="w-3 h-3 animate-spin text-purple-600" />}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayValue}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      placeholder="Rechercher une ville ou un code postal..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder-slate-400 pr-10"
                    />
                    {isDropdownOpen && displayValue ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsDropdownOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">
                        ▼
                      </div>
                    )}
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                      {filteredCommunes.length > 0 ? (
                        filteredCommunes.map((c) => (
                          <button
                            key={`${c.code_insee}-${c.code_postal ?? 'none'}`}
                            type="button"
                            onClick={() => {
                              setInsee(c.code_insee);
                              setSearchQuery(null);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center justify-between text-sm ${
                              c.code_insee === insee ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-700'
                            }`}
                          >
                            <span>{c.nom}</span>
                            <span className="text-xs text-slate-500 font-mono">{c.code_postal || c.code_insee}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 italic">
                          Aucune commune trouvée
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTypeBien('appart')}
                    className={`rounded-xl py-3 font-medium transition-colors ${typeBien === 'appart' ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Appartement
                  </button>
                  <button
                    onClick={() => setTypeBien('maison')}
                    className={`rounded-xl py-3 font-medium transition-colors ${typeBien === 'maison' ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Maison
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Surface (m²): {surface}</label>
                  <input type="range" min="10" max="200" value={surface} onChange={(e) => setSurface(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Apport personnel (€): {apport.toLocaleString()}</label>
                  <input type="range" min="0" max="200000" step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Taux du crédit (%): {tauxPret.toFixed(2)} %</label>
                  <input type="range" min="1.0" max="7.0" step="0.1" value={tauxPret} onChange={(e) => setTauxPret(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Durée du prêt (années): {dureePret}</label>
                  <input type="range" min="5" max="30" step="1" value={dureePret} onChange={(e) => setDureePret(Number(e.target.value))} className="w-full accent-purple-600" />
                </div>

                {/* Section Options Avancées */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between py-2 text-sm font-medium text-purple-700 hover:text-purple-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders size={16} />
                      Options avancées
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Taux d&apos;assurance emprunteur (%): {tauxAssurance.toFixed(2)} %
                        </label>
                        <input type="range" min="0.0" max="1.0" step="0.05" value={tauxAssurance} onChange={(e) => setTauxAssurance(Number(e.target.value))} className="w-full accent-purple-600" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Frais d&apos;agence (%): {fraisAgence.toFixed(1)} %
                        </label>
                        <input type="range" min="0.0" max="8.0" step="0.5" value={fraisAgence} onChange={(e) => setFraisAgence(Number(e.target.value))} className="w-full accent-purple-600" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Charges de copropriété (€/m²/an): {chargesCopro} €
                        </label>
                        <input type="range" min="0" max="60" step="1" value={chargesCopro} onChange={(e) => setChargesCopro(Number(e.target.value))} className="w-full accent-purple-600" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Coût travaux / rénovation (€/m²/an): {customProvisionReno !== null ? customProvisionReno : (communeMetrics[insee]?.ratio_dpe_fg > 0.3 ? 30 : 15)} €
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={customProvisionReno !== null ? customProvisionReno : (communeMetrics[insee]?.ratio_dpe_fg > 0.3 ? 30 : 15)}
                          onChange={(e) => setCustomProvisionReno(Number(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 pointer-events-none" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
                <div>
                  <h3 className="text-xl font-medium text-slate-700">Évolution du Patrimoine Net</h3>
                  <p className="text-sm text-slate-500 mt-1">Comparaison sur 25 ans (avec inflation)</p>
                </div>
                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                  <button
                    onClick={handleSaveSimulation}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-full font-medium transition-colors text-sm shadow-sm w-full md:w-auto"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {user ? "Sauvegarder la simulation" : "Sauvegarder (Gratuit)"}
                  </button>
                  {simulationResult && (
                    <div className={`border px-4 py-2 rounded-full font-medium flex items-center justify-center gap-2 text-sm w-full md:w-auto ${simulationResult.bascule_annee ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'}`}>
                      <TrendingUp size={16} />
                      {simulationResult.bascule_annee
                        ? `Achat rentable après ${simulationResult.bascule_annee} ans`
                        : `La location reste plus rentable`}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[400px] w-full relative z-10">
                {simulationResult && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationResult.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                        itemStyle={{ color: '#0f172a' }}
                        formatter={(value: unknown) => typeof value === 'number' ? [`${value.toLocaleString()} €`, undefined] : [String(value), undefined]}
                      />
                      <Legend />
                      <Line type="monotone" name="Acheteur (Patrimoine immo - Dette)" dataKey="achat" stroke="#9333ea" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                      <Line type="monotone" name="Locataire (Épargne cumulée)" dataKey="location" stroke="#2563eb" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors" />
                <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Wallet className="text-purple-600" />
                  Passez à l&apos;action
                </h4>
                <p className="text-sm text-slate-600 mb-6">
                  Vos mensualités estimées sont de <strong className="text-purple-700">{simulationResult?.mensualite_banque_estimee?.toLocaleString() || 0} €</strong>. Obtenez le meilleur taux.
                </p>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <CheckCircle2 className="text-purple-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-slate-600 leading-tight">
                      Mise en relation gratuite et sans engagement avec les meilleurs courtiers de votre région.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLeadModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-full py-3 transition-all duration-150"
                  >
                    Trouver mon financement
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Rapport Détaillé
                </h4>
                <p className="text-sm text-slate-600 mb-6">
                  Analysez les chiffres en profondeur sans être démarché. Téléchargez notre rapport PDF.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600"/> Comparaison de 3 scénarios</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600"/> Tableaux d&apos;amortissement complets</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600"/> 100% anonyme, aucun appel</li>
                </ul>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_theme(colors.cyan.400/50%)] text-white font-medium rounded-full py-3 transition-all duration-150 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? <Loader2 className="animate-spin" size={20} /> : "Acheter le rapport (4,99 €)"}
                </button>
              </div>

            </div>

            <div className="bg-gradient-to-r from-purple-100 to-fuchsia-100 border border-purple-200 rounded-3xl p-6 relative shadow-sm mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Partagez cette analyse 🚀</h4>
                <p className="text-sm text-slate-600">
                  Générez une infographie avec les vrais chiffres de {currentCityName} à partager sur LinkedIn, Instagram ou avec vos proches.
                </p>
              </div>
              <div className="w-full md:w-1/3 shrink-0">
                <SocialShareWidget 
                  cityName={currentCityName}
                  prixM2={typeBien === 'appart' ? communeMetrics[insee]?.prix_m2_appart : communeMetrics[insee]?.prix_m2_maison}
                  loyerM2={typeBien === 'appart' ? communeMetrics[insee]?.loyer_m2_appart : communeMetrics[insee]?.loyer_m2_maison}
                  taxeFonciere={communeMetrics[insee]?.taxe_fonciere}
                  basculeAnnee={simulationResult?.bascule_annee || null}
                  surface={surface}
                  apport={apport}
                  dureePret={dureePret}
                  typeBien={typeBien}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modale de Contact B2B */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X size={24} />
            </button>

            {leadSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée !</h3>
                <p className="text-slate-600">
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
                  className="mt-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-2 rounded-xl transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Étude de financement</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  Laissez vos coordonnées pour qu&apos;un expert vous aide à obtenir votre prêt de {simulationResult?.mensualite_banque_estimee?.toLocaleString()} € / mois.
                </p>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {/* Honeypot field for bot protection */}
                  <input
                    type="text"
                    name="website_confirm"
                    tabIndex={-1}
                    autoComplete="off"
                    value={leadHoneypot}
                    onChange={(e) => setLeadHoneypot(e.target.value)}
                    className="opacity-0 absolute -z-10 h-0 w-0 pointer-events-none"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={e => setLeadEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="vous@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="lead-consent"
                      checked={leadConsent}
                      onChange={(e) => setLeadConsent(e.target.checked)}
                      className="mt-1 accent-purple-600 w-4 h-4"
                    />
                    <label htmlFor="lead-consent" className="text-xs text-slate-600 leading-tight">
                      J&apos;accepte d&apos;être recontacté(e) gratuitement par un courtier partenaire pour une étude personnalisée de mon financement.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={leadSubmitting || !leadConsent}
                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.fuchsia.400/50%)] text-white font-medium rounded-full py-3 mt-4 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {leadSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Être recontacté gratuitement"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </main>
  );
}
