import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Calcul des Frais de Notaire",
  description: "Estimez vos frais de notaire (droits de mutation, émoluments) pour l'achat d'un bien immobilier ancien ou neuf.",
};

export default function NotaireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
