import VatSellerSimulator from '@/components/vat/VatSellerSimulator';

export const metadata = {
  title: 'Simulateur Vendeur | Vente à Terme Libre',
  description: 'Votre bien immobilier stagne sur le marché ? Vendez au prix fort et percevez une rente régulière, sécurisée par acte notarié, avec la Vente à Terme.',
};

export default function VendeurPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <VatSellerSimulator />
    </main>
  );
}
