"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Map, Building2, Wrench, Briefcase, Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';

const OUTILS = [
  { href: '/outils/mensualite', label: 'Calcul Mensualité' },
  { href: '/outils/notaire', label: 'Frais de Notaire' },
  { href: '/outils/assurance-emprunteur', label: 'Assurance Emprunteur' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outilsOpen, setOutilsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Une connexion réussie ferme automatiquement la modale
      if (session?.user) setAuthOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <nav className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl md:rounded-full shadow-sm">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 text-transparent bg-clip-text">
              Kalcul.app
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/carte" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Map className="w-4 h-4 text-purple-600" />
              Carte
            </Link>

            <Link href="/villes" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Building2 className="w-4 h-4 text-purple-600" />
              Villes
            </Link>

            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Outils
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex flex-col gap-1">
                {OUTILS.map((o) => (
                  <Link key={o.href} href={o.href} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                    {o.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/pro" className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all group-hover:shadow-lg">
              <Briefcase className="w-4 h-4" />
              Espace Pro
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
                  Mon espace
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  title="Se déconnecter"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LogIn className="w-4 h-4 text-purple-600" />
                Se connecter
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 py-4 space-y-2 rounded-b-3xl">
            <Link
              href="/carte"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Map className="w-4 h-4 text-purple-600" />
              Carte
            </Link>

            <Link
              href="/villes"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              Villes
            </Link>

            <button
              onClick={() => setOutilsOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-blue-600" />
                Outils
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${outilsOpen ? 'rotate-180' : ''}`} />
            </button>
            {outilsOpen && (
              <div className="pl-12 space-y-1">
                {OUTILS.map((o) => (
                  <Link
                    key={o.href}
                    href={o.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {o.label}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/pro"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Espace Pro
            </Link>

            <div className="border-t border-slate-200 pt-2 mt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-600" />
                    Mon espace
                  </Link>
                  <button
                    onClick={() => { supabase.auth.signOut(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-purple-600" />
                  Se connecter
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
