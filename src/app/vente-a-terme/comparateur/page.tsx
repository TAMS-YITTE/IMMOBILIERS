import VatComparator from '@/components/vat/VatComparator';

export const metadata = {
  title: 'Comparateur Achat Classique vs Vente à Terme',
  description: 'Le crédit bancaire est trop cher ou refusé ? Comparez l\'achat immobilier classique avec la Vente à Terme.',
};

export default function ComparateurPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <VatComparator />
    </main>
  );
}
