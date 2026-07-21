"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Home, Map, Wrench, Briefcase, Menu, X, ChevronDown } from 'lucide-react';

const OUTILS = [
  { href: '/outils/mensualite', label: 'Calcul Mensualité' },
  { href: '/outils/notaire', label: 'Frais de Notaire' },
  { href: '/outils/assurance-emprunteur', label: 'Assurance Emprunteur' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outilsOpen, setOutilsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 text-transparent bg-clip-text">
            Immobilier
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/villes" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <Map className="w-4 h-4 text-purple-400" />
            Villes
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors py-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Outils
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1">
              {OUTILS.map((o) => (
                <Link key={o.href} href={o.href} className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                  {o.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/pro" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
            <Briefcase className="w-4 h-4" />
            Espace Pro
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-6 py-4 space-y-1">
          <Link
            href="/villes"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Map className="w-4 h-4 text-purple-400" />
            Villes
          </Link>

          <button
            onClick={() => setOutilsOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              <Wrench className="w-4 h-4 text-blue-400" />
              Outils
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${outilsOpen ? 'rotate-180' : ''}`} />
          </button>
          {outilsOpen && (
            <div className="pl-11 space-y-1">
              {OUTILS.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {o.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/pro"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Espace Pro
          </Link>
        </div>
      )}
    </nav>
  );
}
