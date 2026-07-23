import Link from 'next/link';
import { Home, Map, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 text-transparent bg-clip-text">
              Kalcul.app
            </span>
          </Link>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            La première plateforme d&apos;intelligence immobilière pour les particuliers. 
            Simulez, comparez et investissez en toute transparence grâce aux données ouvertes de l&apos;État.
          </p>
        </div>

        {/* Links Col 1 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Outils & Données</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/villes" className="hover:text-purple-600 transition-colors flex items-center gap-2">
                <Map className="w-4 h-4" /> Annuaire des Villes
              </Link>
            </li>
            <li>
              <Link href="/carte" className="hover:text-purple-600 transition-colors flex items-center gap-2">
                <Map className="w-4 h-4" /> Carte Thermique
              </Link>
            </li>
            <li>
              <Link href="/outils/mensualite" className="hover:text-purple-600 transition-colors flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Calcul Mensualité
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Col 2 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Légal & Société</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/pro" className="hover:text-purple-600 transition-colors">Espace Pro (Courtiers)</Link></li>
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
