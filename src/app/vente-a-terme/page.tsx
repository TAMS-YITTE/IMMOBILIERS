import VatQuiz from '@/components/vat/VatQuiz';

export const metadata = {
  title: 'Vente à Terme Libre : Le Simulateur & Guide Complet',
  description: 'Découvrez la Vente à Terme Libre (VAT), la meilleure alternative au crédit immobilier et au viager. Qualifiez votre profil en 30 secondes.',
};

export default function VatPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
          L'immobilier <span className="text-indigo-600">sans les banques</span>
        </h1>
        <p className="text-xl text-slate-600">
          La Vente à Terme (VAT) vous permet d'acheter ou de vendre directement, sans crédit bancaire.
        </p>
      </div>
      <VatQuiz />
    </main>
  );
}
