import VatBuyerCapacity from '@/components/vat/VatBuyerCapacity';

export const metadata = {
  title: 'Capacité d\'achat Vente à Terme | Sans Banque',
  description: 'Calculez quel bien immobilier vous pouvez acheter sans crédit bancaire grâce à la Vente à Terme Libre.',
};

export default function CapaciteAchatPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <VatBuyerCapacity />
    </main>
  );
}
