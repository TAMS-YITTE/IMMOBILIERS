import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Politique de confidentialité | Kalcul.app' };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="22 juillet 2026">
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          YITTE (SIREN 919 805 028), 65 B rue Alexandre Bickart, 77500 Chelles, est responsable du traitement des données
          personnelles collectées sur Kalcul.app. Pour toute question : <a href="mailto:contact@kalcul.app">contact@kalcul.app</a>.
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <p>Deux formulaires collectent des données personnelles :</p>
        <ul>
          <li>
            <strong>Mise en relation avec un courtier</strong> : email, téléphone (facultatif), ville et montant du projet
            renseignés dans le simulateur, uniquement si vous cochez la case de consentement prévue à cet effet.
          </li>
          <li>
            <strong>Achat d&apos;un rapport PDF</strong> : votre email (transmis par Stripe lors du paiement) et les paramètres
            de simulation associés à votre rapport.
          </li>
        </ul>
        <p>
          Aucune donnée bancaire n&apos;est collectée ou stockée par Kalcul.app : les paiements sont traités directement par
          Stripe, qui agit en tant que sous-traitant conforme PCI-DSS.
        </p>
      </section>

      <section>
        <h2>Finalités et base légale</h2>
        <ul>
          <li>Mise en relation avec un courtier partenaire : consentement explicite (case à cocher, non pré-cochée).</li>
          <li>Génération et envoi du rapport PDF acheté : exécution d&apos;un contrat de vente.</li>
          <li>Prévention de la fraude et du spam (champ honeypot) : intérêt légitime.</li>
        </ul>
      </section>

      <section>
        <h2>Destinataires des données</h2>
        <p>
          Les demandes de mise en relation sont transmises aux courtiers partenaires concernés par votre zone géographique.
          Vos données transitent également par nos sous-traitants techniques : Supabase (hébergement base de données),
          Vercel (hébergement du site) et Stripe (traitement des paiements).
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les demandes de mise en relation sont conservées 3 ans à compter du dernier contact. Les données liées à un achat
          de rapport sont conservées conformément aux obligations légales de conservation des documents commerciaux et
          comptables (10 ans).
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données. Vous pouvez exercer ces droits en
          écrivant à <a href="mailto:contact@kalcul.app">contact@kalcul.app</a>. Vous disposez également du droit d&apos;introduire
          une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Kalcul.app utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du site (préférences
          d&apos;affichage). Aucun cookie publicitaire ou de traçage tiers n&apos;est déposé à ce jour.
        </p>
      </section>
    </LegalPage>
  );
}
