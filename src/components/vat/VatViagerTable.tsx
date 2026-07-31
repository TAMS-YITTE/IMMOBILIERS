import React from 'react';
import { Check, X, Shield, Clock, HeartPulse, GraduationCap } from 'lucide-react';

export default function VatViagerTable() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex justify-center items-center gap-3">
          <GraduationCap className="text-indigo-600" size={32} />
          Ne confondez plus Vente à Terme et Viager
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          La Vente à Terme (VAT) est souvent confondue avec le Viager. Pourtant, ce sont deux mécanismes radicalement différents. Voici pourquoi la VAT est beaucoup plus sécurisante pour les deux parties.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="w-1/3 p-4 border-b-2 border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-sm">
                Critère
              </th>
              <th className="w-1/3 p-4 border-b-2 border-amber-200 bg-amber-50 text-amber-900 font-bold text-lg text-center rounded-tl-xl">
                Vente à Terme (VAT)
              </th>
              <th className="w-1/3 p-4 border-b-2 border-slate-200 bg-slate-50 text-slate-600 font-bold text-lg text-center rounded-tr-xl">
                Viager
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Durée */}
            <tr>
              <td className="p-4 bg-white text-slate-700 font-medium flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                Durée du paiement
              </td>
              <td className="p-4 bg-amber-50/50 text-center">
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
                  <Check size={16} /> FIXE ET CONNUE
                </span>
                <p className="text-xs text-amber-700/70 mt-1">Ex: 15 ans exacts</p>
              </td>
              <td className="p-4 bg-slate-50/50 text-center">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full text-sm">
                  <HelpCircle size={16} /> ALÉATOIRE
                </span>
                <p className="text-xs text-slate-500 mt-1">Jusqu'au décès du vendeur</p>
              </td>
            </tr>

            {/* Héritage */}
            <tr>
              <td className="p-4 bg-white text-slate-700 font-medium flex items-center gap-2">
                <Shield size={18} className="text-slate-400" />
                En cas de décès du vendeur
              </td>
              <td className="p-4 bg-amber-50/50 text-center text-sm font-medium text-amber-900">
                L'acheteur continue de payer les rentes aux <strong className="text-amber-700">héritiers</strong> jusqu'à la fin prévue.
              </td>
              <td className="p-4 bg-slate-50/50 text-center text-sm text-slate-600">
                Le paiement s'arrête. Le bien appartient totalement à l'acheteur. Les héritiers n'ont rien.
              </td>
            </tr>

            {/* Décès de l'acheteur */}
            <tr>
              <td className="p-4 bg-white text-slate-700 font-medium flex items-center gap-2">
                <HeartPulse size={18} className="text-slate-400" />
                En cas de décès de l'acheteur
              </td>
              <td className="p-4 bg-amber-50/50 text-center text-sm font-medium text-amber-900">
                Les héritiers de l'acheteur héritent du bien et <strong className="text-amber-700">doivent continuer</strong> à payer les rentes.
              </td>
              <td className="p-4 bg-slate-50/50 text-center text-sm text-slate-600">
                Même principe.
              </td>
            </tr>

            {/* Risque pour le vendeur */}
            <tr>
              <td className="p-4 bg-white text-slate-700 font-medium">
                Risque financier pour le vendeur
              </td>
              <td className="p-4 bg-amber-50/50 text-center">
                <span className="font-bold text-amber-700">Zéro risque</span>
                <p className="text-xs text-amber-700/70 mt-1">Le prix total est perçu quoiqu'il arrive.</p>
              </td>
              <td className="p-4 bg-slate-50/50 text-center">
                <span className="font-bold text-red-500">Risque de longévité</span>
                <p className="text-xs text-slate-500 mt-1">S'il décède tôt, il aura "bradé" son bien.</p>
              </td>
            </tr>

            {/* Risque pour l'acheteur */}
            <tr>
              <td className="p-4 bg-white text-slate-700 font-medium">
                Risque financier pour l'acheteur
              </td>
              <td className="p-4 bg-amber-50/50 text-center">
                <span className="font-bold text-amber-700">Aucun pari sur la mort</span>
                <p className="text-xs text-amber-700/70 mt-1">Le coût total est connu dès la signature.</p>
              </td>
              <td className="p-4 bg-slate-50/50 text-center">
                <span className="font-bold text-red-500">Pari macabre</span>
                <p className="text-xs text-slate-500 mt-1">Si le vendeur vit vieux, l'acheteur paie le bien très cher.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant local pour contourner l'oubli d'import de HelpCircle s'il y en a eu
const HelpCircle = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
