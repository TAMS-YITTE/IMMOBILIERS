"use client"

import React, { useState } from 'react';
import { Briefcase, Code2, Gauge, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const TIERS = [
  {
    nom: "Starter",
    prix: "49€",
    description: "Pour un site local ou un blog immobilier régional.",
    features: ["1 widget (indicateur au choix)", "1 000 requêtes / mois", "Mise à jour des données 2x/an"],
  },
  {
    nom: "Pro",
    prix: "99€",
    description: "Pour une agence ou un annuaire avec plusieurs pages.",
    features: ["Tous les widgets (prix, loyers, taxe foncière, DPE)", "20 000 requêtes / mois", "Support prioritaire par email"],
    recommande: true,
  },
  {
    nom: "Enterprise",
    prix: "Sur devis",
    description: "Pour un réseau de sites ou un comparateur national.",
    features: ["Volume de requêtes personnalisé", "Marque blanche complète (CSS custom)", "Accès API dédié"],
  },
];

export default function ProPage() {
  const [siteName, setSiteName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') { setSuccess(true); return; } // rejet silencieux des bots
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('pro_leads').insert({
        site_name: siteName,
        email,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Erreur envoi demande pro:', err);
      setErrorMsg("Une erreur est survenue. Réessayez ou écrivez à contact@kalcul.app.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-16 py-12">

        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm text-slate-600 mb-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            Espace Professionnels
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Intégrez nos données immobilières sur votre site
          </h1>
          <p className="text-slate-500 text-lg">
            Un widget embarquable (prix au m², loyers moyens, taxe foncière, DPE) basé sur des données publiques réelles, mis à jour automatiquement — sans construire votre propre pipeline de données.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <Code2 className="w-8 h-8 text-purple-600 mx-auto" />
            <h3 className="font-semibold text-slate-900">Intégration en 5 minutes</h3>
            <p className="text-sm text-slate-500">Un script à coller (`widget.js`), aucun backend à maintenir de votre côté.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <Gauge className="w-8 h-8 text-purple-600 mx-auto" />
            <h3 className="font-semibold text-slate-900">Données à jour</h3>
            <p className="text-sm text-slate-500">DVF, DPE, taxe foncière et loyers actualisés à chaque cycle de publication officiel.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-purple-600 mx-auto" />
            <h3 className="font-semibold text-slate-900">Facturation simple</h3>
            <p className="text-sm text-slate-500">Un abonnement mensuel fixe par site, sans surprise sur le volume normal d&apos;usage.</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">Tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.nom}
                className={`rounded-3xl p-8 border relative ${tier.recommande ? 'bg-gradient-to-b from-purple-50 to-white border-purple-300 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                {tier.recommande && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-1">{tier.nom}</h3>
                <div className="text-3xl font-extrabold text-slate-900 mb-1">
                  {tier.prix}{tier.prix !== "Sur devis" && <span className="text-sm text-slate-500 font-medium">/mois</span>}
                </div>
                <p className="text-sm text-slate-500 mb-6">{tier.description}</p>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Demande enregistrée !</h3>
              <p className="text-sm text-slate-500">
                Merci, nous vous recontacterons à <strong>{email}</strong> pour une démo adaptée à votre site.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Intéressé(e) ?</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Laissez-nous vos coordonnées, nous vous recontactons pour une démo du widget adaptée à votre site.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Honeypot anti-bot */}
                <input
                  type="text"
                  name="company_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="opacity-0 absolute -z-10 h-0 w-0 pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Nom du site / de l'agence"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email professionnel"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400"
                />
                {errorMsg && <p className="text-red-600 text-xs text-center">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={submitting || !email || !siteName}
                  className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-full py-3 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "Demander une démo"}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
