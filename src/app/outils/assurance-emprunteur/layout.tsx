import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Coût de l'Assurance Emprunteur",
  description: "Calculez le coût mensuel et total de votre assurance de prêt immobilier en fonction de votre âge et du montant emprunté.",
};

export default function AssuranceEmprunteurLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
