"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, RefreshCw, Download } from 'lucide-react';

interface VatLead {
  id: string;
  email: string;
  telephone: string | null;
  role: string | null;
  source: string | null;
  budget: number | null;
  bouquet: number | null;
  rente_mensuelle: number | null;
  duree: number | null;
  statut: string | null;
  created_at: string;
}

function toCsv(rows: VatLead[]): string {
  if (rows.length === 0) return '';
  const cols = Array.from(rows.reduce((set, r) => {
    Object.keys(r).forEach((k) => set.add(k));
    return set;
  }, new Set<string>()));
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(';');
  const lines = rows.map((r) => cols.map((c) => esc((r as unknown as Record<string, unknown>)[c])).join(';'));
  return '﻿' + [header, ...lines].join('\r\n');
}

const euro = (n: number | null) => (n === null || n === undefined ? '—' : `${Math.round(n).toLocaleString('fr-FR')} €`);

export default function AdminVatLeadsPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<VatLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLeads = async (pwd: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/vat-leads', { headers: { Authorization: `Bearer ${pwd}` } });
      if (res.status === 401) {
        setErrorMsg('Mot de passe incorrect');
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.error) setErrorMsg(data.error);
      else {
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
      const res = await fetch('/api/admin/vat-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id, statut: newStatut }),
      });
      const data = await res.json();
      if (data.success) setLeads(leads.map((l) => (l.id === id ? { ...l, statut: newStatut } : l)));
    } catch (err) {
      console.error('Error updating VAT lead status:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(password);
  };

  const downloadCsv = () => {
    const csv = toCsv(leads);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-leads-kalcul-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-lg">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Espace Admin - Leads VAT</h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Entrez le mot de passe d&apos;administration pour accéder aux leads Vente à Terme.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errorMsg && <p className="text-red-600 text-xs text-center">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-lg text-white font-medium py-3 rounded-full transition-all duration-150 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 py-12 text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Leads Vente à Terme
          </h1>
          <p className="text-slate-500 text-sm mt-1">{leads.length} lead(s) enregistré(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 px-4 py-2 rounded-full transition-colors shadow-sm">
            Leads crédit
          </Link>
          <button
            onClick={downloadCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-xs text-white px-4 py-2 rounded-full transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Exporter CSV ({leads.length})
          </button>
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
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Contact</th>
                <th className="px-4 py-4">Rôle</th>
                <th className="px-4 py-4">Budget</th>
                <th className="px-4 py-4">Bouquet</th>
                <th className="px-4 py-4">Rente/mois</th>
                <th className="px-4 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-xs font-mono text-slate-500">
                    {new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{l.email}</div>
                    <div className="text-xs text-slate-500 font-mono">{l.telephone || '—'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.role === 'vendeur' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {l.role || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{euro(l.budget)}</td>
                  <td className="px-4 py-4">{euro(l.bouquet)}</td>
                  <td className="px-4 py-4">{euro(l.rente_mensuelle)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={l.statut || 'nouveau'}
                      onChange={(e) => updateStatut(l.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    Aucun lead Vente à Terme pour le moment.
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
