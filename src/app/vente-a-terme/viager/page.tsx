import VatViagerTable from '@/components/vat/VatViagerTable';

export const metadata = {
  title: 'Différence entre Vente à Terme et Viager',
  description: 'Ne confondez plus Vente à Terme et Viager. Comparez les avantages, les risques et la sécurité de ces deux mécanismes immobiliers.',
};

export default function ViagerPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <VatViagerTable />
    </main>
  );
}
