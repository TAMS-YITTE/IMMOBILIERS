import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { ARTICLES, getArticle } from "../articles";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    // Le layout racine ajoute deja " | Kalcul.app" via son template de titre.
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/blog/${article.slug}`,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Kalcul.app" },
    publisher: { "@type": "Organization", name: "Kalcul.app" },
    url: `https://www.kalcul.app/blog/${article.slug}`,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-2xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Tous les articles
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <span>
              {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1"><Clock size={12} /> {article.readingMinutes} min de lecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{article.title}</h1>
        </header>

        <div className="space-y-5">
          {article.body.map((bloc, i) => {
            if (bloc.type === "h2") {
              return <h2 key={i} className="text-xl font-bold text-slate-900 pt-4">{bloc.text}</h2>;
            }
            if (bloc.type === "ul") {
              return (
                <ul key={i} className="space-y-2 pl-1">
                  {bloc.items.map((it, j) => (
                    <li key={j} className="flex gap-2 text-slate-700">
                      <span className="text-purple-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={i}
                className="text-slate-700 leading-relaxed [&_a]:text-purple-600 [&_a]:font-medium [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: bloc.html }}
              />
            );
          })}
        </div>

        {/* CTA vers le produit */}
        <div className="mt-10 bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-3xl p-6 md:p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Acheter ou louer chez vous ?</h2>
          <p className="text-sm text-white/90 mb-5">
            Obtenez votre année de bascule à partir des vraies données de votre commune.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold rounded-full px-6 py-3 hover:bg-slate-100 transition-colors"
          >
            Lancer ma simulation <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    </main>
  );
}
