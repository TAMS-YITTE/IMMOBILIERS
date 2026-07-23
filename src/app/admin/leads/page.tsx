"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  telephone: string | null;
  code_insee_recherche: string;
  montant_projet: number;
  statut: string | null;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLeads = async (pwd: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/leads', {
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
        setLeads(data.leads || []);
        setAuthenticated(true);
      }
    } catch {
      setErrorMsg('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: string, newStatut: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, statut: newStatut }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === id ? { ...l, statut: newStatut } : l)));
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(password);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-lg">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Espace Admin - Leads</h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Entrez le mot de passe d&apos;administration pour accéder au tableau de bord des courtiers.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errorMsg && <p className="text-red-600 text-xs text-center">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium py-3 rounded-full transition-all duration-150 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 py-12 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Tableau de Bord des Leads
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {leads.length} prospect(s) qualifié(s) enregistré(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/rapports"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            Voir les Ventes
          </Link>
          <button
            onClick={() => fetchLeads(password)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Ville (INSEE)</th>
                <th className="px-6 py-4">Montant Projet</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {new Date(l.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{l.email}</div>
                    <div className="text-xs text-slate-500 font-mono">{l.telephone || 'Non renseigné'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">{l.code_insee_recherche}</td>
                  <td className="px-6 py-4 font-semibold text-purple-700">
                    {Math.round(l.montant_projet).toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={l.statut || 'nouveau'}
                      onChange={(e) => updateStatut(l.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="contacte">Contacté</option>
                      <option value="converti">Converti</option>
                      <option value="perdu">Perdu</option>
                    </select>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Aucun lead enregistré pour le moment.
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
