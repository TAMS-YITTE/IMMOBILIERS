import VatInvestorSimulator from '@/components/vat/VatInvestorSimulator';

export const metadata = {
  title: 'Simulateur Investisseur Vente à Terme Occupée | TRI & Décote',
  description: 'Calculez le Rendement (TRI Newton-Raphson) et la décote d\'un investissement en Vente à Terme Occupée ou Libre.',
};

export default function InvestisseurPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <VatInvestorSimulator />
    </main>
  );
}
