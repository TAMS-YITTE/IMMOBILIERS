import Link from 'next/link';
import { Home, Map, Building2, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
        
        {/* Brand Col */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 text-transparent bg-clip-text">
              Kalcul.app
            </span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed">
            La première plateforme d&apos;intelligence immobilière pour les particuliers. 
            Simulez, comparez et investissez en toute transparence grâce aux données ouvertes de l&apos;État.
          </p>
        </div>

        {/* Bloc Produits & Outils */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Plateforme</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <Link href="/villes" className="hover:text-purple-600 transition-colors">
                Annuaire des villes
              </Link>
            </li>
            <li>
              <Link href="/carte" className="hover:text-purple-600 transition-colors flex items-center gap-2">
                <Map className="w-4 h-4" /> Carte de France
              </Link>
            </li>
            <li>
              <Link href="/pro" className="hover:text-purple-600 transition-colors">
                Espace Pro (Courtiers)
              </Link>
            </li>
          </ul>
        </div>

        {/* BLOC DÉDIÉ : VENTE À TERME */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-700 tracking-wider uppercase">Vente à Terme (VAT)</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/vente-a-terme" className="text-slate-700 font-semibold hover:text-amber-600 transition-colors flex items-center gap-2">
                Vente à Terme Libre
              </Link>
            </li>
            <li>
              <Link href="/vente-a-terme/investisseur" className="text-emerald-700 font-semibold hover:text-emerald-600 transition-colors flex items-center gap-2">
                Simulateur TRI Investisseur
              </Link>
            </li>
            <li>
              <Link href="/outils/mensualite" className="text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" /> Calcul Mensualité
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-slate-600 hover:text-amber-600 transition-colors">
                Blog Immo
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Col Legal */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Légal</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><Link href="/mentions-legales" className="hover:text-purple-600 transition-colors">Mentions légales</Link></li>
            <li><Link href="/cgv" className="hover:text-purple-600 transition-colors">CGV & Tarifs</Link></li>
            <li><Link href="/confidentialite" className="hover:text-purple-600 transition-colors">Confidentialité</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Kalcul.app — Édité par YITTE (SIREN 919 805 028)</p>
        <p>Données issues de DVF, ADEME, ANIL, impots.gouv.fr</p>
      </div>
    </footer>
  );
}
