import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { ARTICLES } from "./articles";

export const metadata: Metadata = {
  title: "Blog Immobilier",
  description:
    "Guides et analyses pour décider entre acheter et louer : année de bascule, frais de notaire, coût réel d'un achat immobilier en 2026.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const articles = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Le Blog Immobilier</h1>
          <p className="text-slate-600">
            Des guides concrets pour trancher entre acheter et louer, avec des vrais chiffres.
          </p>
        </header>

        <div className="space-y-5">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="block bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span>
                  {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1"><Clock size={12} /> {a.readingMinutes} min</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                {a.title}
              </h2>
              <p className="text-sm text-slate-600 mb-4">{a.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600">
                Lire l&apos;article <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
