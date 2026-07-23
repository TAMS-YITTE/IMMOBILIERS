import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Calcul de Mensualité et Capacité d'Emprunt",
  description: "Estimez rapidement votre mensualité de crédit immobilier ou votre capacité d'emprunt à partir de votre budget mensuel. Simulateur gratuit et instantané.",
};

export default function MensualiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
