import Link from 'next/link';
import { Scale, TrendingUp, Landmark, KeyRound, Leaf } from 'lucide-react';

const PAGES = [
  { slug: 'acheter-ou-louer', label: 'Acheter ou louer', icon: Scale },
  { slug: 'prix-m2', label: 'Prix au m²', icon: TrendingUp },
  { slug: 'taxe-fonciere', label: 'Taxe foncière', icon: Landmark },
  { slug: 'loyer-moyen', label: 'Loyer moyen', icon: KeyRound },
  { slug: 'renovation-energetique', label: 'Rénovation énergétique', icon: Leaf },
];

export default function CityPageNav({ codeInsee, current }: { codeInsee: string; current: string }) {
  return (
    <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
      {PAGES.map(({ slug, label, icon: Icon }) => {
        const active = slug === current;
        return (
          <Link
            key={slug}
            href={`/${slug}/${codeInsee}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon size={13} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
