import Link from 'next/link';
import { Home, Map, Wrench, Briefcase } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
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
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1">
              <Link href="/outils/mensualite" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                Calcul Mensualité
              </Link>
              <Link href="/outils/notaire" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                Frais de Notaire
              </Link>
              <Link href="/outils/assurance-emprunteur" className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                Assurance Emprunteur
              </Link>
            </div>
          </div>

          <Link href="/pro" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
            <Briefcase className="w-4 h-4" />
            Espace Pro
          </Link>
        </div>

      </div>
    </nav>
  );
}
