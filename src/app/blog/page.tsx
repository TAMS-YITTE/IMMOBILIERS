import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Immobilier | Kalcul.app",
  description: "Actualités, guides et conseils pour réussir votre achat immobilier ou optimiser votre location.",
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Le Blog Immobilier</h1>
        <p className="text-slate-600 mb-12">
          Retrouvez prochainement nos analyses détaillées sur le marché de l'immobilier, les taux d'intérêt et des conseils pour investir intelligemment.
        </p>
        <div className="bg-purple-100 text-purple-700 rounded-2xl p-8 border border-purple-200 inline-block">
          <h2 className="text-xl font-bold mb-2">Bientôt disponible 🚀</h2>
          <p>Nos experts préparent les premiers articles.</p>
        </div>
      </div>
    </main>
  );
}
