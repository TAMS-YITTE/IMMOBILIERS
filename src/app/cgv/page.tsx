import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Conditions Générales de Vente | Kalcul.app' };

export default function CGVPage() {
  return (
    <LegalPage title="Conditions Générales de Vente" updated="22 juillet 2026">
      <section>
        <h2>Article 1 — Objet et champ d&apos;application</h2>
        <p>
          Les présentes Conditions Générales de Vente (CGV) régissent la vente, par YITTE (SIREN 919 805 028), du service de
          rapport financier détaillé « Acheter vs Louer » proposé sur le site Kalcul.app. Toute commande implique l&apos;acceptation
          sans réserve des présentes CGV.
        </p>
      </section>

      <section>
        <h2>Article 2 — Description du service</h2>
        <p>
          Le rapport PDF vendu au prix de 4,99 € TTC contient une analyse détaillée personnalisée (comparaison achat/location sur
          plusieurs durées de détention, tableau d&apos;amortissement complet, projection de patrimoine net) générée à partir des
          paramètres saisis par l&apos;acheteur et des données publiques disponibles pour la commune sélectionnée.
        </p>
      </section>

      <section>
        <h2>Article 3 — Prix et paiement</h2>
        <p>
          Le prix est indiqué en euros TTC avant validation de la commande. Le paiement s&apos;effectue en ligne, en une seule fois,
          par carte bancaire via la plateforme sécurisée Stripe. La commande n&apos;est validée qu&apos;après confirmation du
          paiement par Stripe.
        </p>
      </section>

      <section>
        <h2>Article 4 — Livraison</h2>
        <p>
          Le rapport PDF est généré et mis à disposition immédiatement après confirmation du paiement, directement depuis le
          site. En cas d&apos;incident technique empêchant la génération du rapport, l&apos;acheteur peut contacter{' '}
          <a href="mailto:contact@kalcul.app">contact@kalcul.app</a> pour obtenir une nouvelle génération ou un remboursement.
        </p>
      </section>

      <section>
        <h2>Article 5 — Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour la
          fourniture d&apos;un contenu numérique non fourni sur un support matériel dont l&apos;exécution a commencé après accord
          préalable exprès du consommateur, qui a également renoncé expressément à son droit de rétractation. En validant sa
          commande et en obtenant l&apos;accès immédiat au rapport, l&apos;acheteur reconnaît et accepte cette renonciation.
        </p>
      </section>

      <section>
        <h2>Article 6 — Nature du contenu</h2>
        <p>
          Le rapport fourni est une estimation indicative fondée sur des données publiques et les paramètres saisis par
          l&apos;acheteur. Il ne constitue pas un conseil financier, fiscal ou juridique personnalisé, ni un engagement d&apos;un
          établissement bancaire ou d&apos;un tiers. YITTE ne saurait être tenu responsable des décisions prises sur la base de ce
          rapport.
        </p>
      </section>

      <section>
        <h2>Article 7 — Réclamations et litiges</h2>
        <p>
          Toute réclamation peut être adressée à <a href="mailto:contact@kalcul.app">contact@kalcul.app</a>. À défaut de
          résolution amiable, le consommateur peut recourir gratuitement à un médiateur de la consommation. Les présentes CGV
          sont soumises au droit français ; à défaut d&apos;accord amiable, les tribunaux français compétents seront seuls
          saisis.
        </p>
      </section>
    </LegalPage>
  );
}
