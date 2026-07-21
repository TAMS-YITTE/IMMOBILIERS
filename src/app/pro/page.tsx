"use client"

import React from 'react';
import { Briefcase, Code2, Gauge, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-16 py-12">

        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            Espace Professionnels
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Intégrez nos données immobilières sur votre site
          </h1>
          <p className="text-slate-400 text-lg">
            Un widget embarquable (prix au m², loyers moyens, taxe foncière, DPE) basé sur des données publiques réelles, mis à jour automatiquement — sans construire votre propre pipeline de données.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-2">
            <Code2 className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-semibold text-white">Intégration en 5 minutes</h3>
            <p className="text-sm text-slate-400">Un script à coller (`widget.js`), aucun backend à maintenir de votre côté.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-2">
            <Gauge className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-semibold text-white">Données à jour</h3>
            <p className="text-sm text-slate-400">DVF, DPE, taxe foncière et loyers actualisés à chaque cycle de publication officiel.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-semibold text-white">Facturation simple</h3>
            <p className="text-sm text-slate-400">Un abonnement mensuel fixe par site, sans surprise sur le volume normal d&apos;usage.</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-center mb-8 text-white">Tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.nom}
                className={`rounded-3xl p-8 border relative ${tier.recommande ? 'bg-gradient-to-b from-purple-500/10 to-slate-900 border-purple-500/50 shadow-2xl shadow-purple-500/10' : 'bg-white/5 border-white/10'}`}
              >
                {tier.recommande && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{tier.nom}</h3>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {tier.prix}{tier.prix !== "Sur devis" && <span className="text-sm text-slate-400 font-medium">/mois</span>}
                </div>
                <p className="text-sm text-slate-400 mb-6">{tier.description}</p>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-2 text-center">Intéressé(e) ?</h3>
          <p className="text-sm text-slate-400 mb-6 text-center">
            Laissez-nous vos coordonnées, nous vous recontactons pour une démo du widget adaptée à votre site.
          </p>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nom du site / de l'agence"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-slate-500"
            />
            <input
              type="email"
              placeholder="Email professionnel"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-slate-500"
            />
            <button type="button" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl py-3 transition-colors">
              Demander une démo
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
