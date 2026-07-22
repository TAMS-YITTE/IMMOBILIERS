"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, RefreshCw, FileText } from 'lucide-react';

interface Rapport {
  id: string;
  email: string;
  code_insee: string;
  montant_paye: number;
  stripe_session_id: string;
  statut: string | null;
  created_at: string;
}

export default function AdminRapportsPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRapports = async (pwd: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/rapports', {
        headers: {
          Authorization: `Bearer ${pwd}`,
        },
      });

      if (res.status === 401) {
        setErrorMsg('Mot de passe incorrect');
        setAuthenticated(false);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setRapports(data.rapports || []);
        setAuthenticated(true);
      }
    } catch {
      setErrorMsg('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRapports(password);
  };

  const totalRevenu = rapports.reduce((sum, r) => sum + (r.montant_paye || 0), 0);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Espace Admin - Ventes</h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            Entrez le mot de passe d&apos;administration pour accéder au suivi des rapports PDF vendus.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 py-12 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Ventes de Rapports PDF
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {rapports.length} vente(s) — {totalRevenu.toFixed(2)} € de revenu cumulé
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs text-slate-300 px-4 py-2 rounded-xl transition-colors"
          >
            Voir les Leads
          </Link>
          <button
            onClick={() => fetchRapports(password)}
            className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs text-slate-300 px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 border-b border-white/10 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Ville (INSEE)</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Session Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rapports.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{r.email}</td>
                  <td className="px-6 py-4 font-mono">{r.code_insee}</td>
                  <td className="px-6 py-4 font-semibold text-purple-300">
                    {(r.montant_paye || 0).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.statut === 'paye'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {r.statut || 'inconnu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[160px]">
                    {r.stripe_session_id}
                  </td>
                </tr>
              ))}

              {rapports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Aucun rapport vendu pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
