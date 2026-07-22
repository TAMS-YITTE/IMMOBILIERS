import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Mentions légales | Kalcul.app' };

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="22 juillet 2026">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site Kalcul.app est édité par YITTE, entreprise individuelle immatriculée au Registre du Commerce et des Sociétés.
        </p>
        <ul>
          <li>SIREN : 919 805 028</li>
          <li>SIRET : 919 805 028 00017</li>
          <li>N° de TVA intracommunautaire : FR30919805028</li>
          <li>Siège social : 65 B rue Alexandre Bickart, 77500 Chelles, France</li>
          <li>Responsable de la publication : Tamsir Sock</li>
          <li>Contact : <a href="mailto:contact@kalcul.app">contact@kalcul.app</a></li>
        </ul>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., dont les coordonnées et modalités légales complètes sont disponibles sur{' '}
          <a href="https://vercel.com/legal" target="_blank" rel="noopener noreferrer">vercel.com/legal</a>.
        </p>
        <p>
          Les données de simulation sont stockées et servies via Supabase (Supabase Inc.), et les paiements sont traités par Stripe
          (Stripe Payments Europe Ltd.). Voir la <a href="/confidentialite">politique de confidentialité</a> pour le détail des traitements.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur Kalcul.app (textes, mises en page, calculs, visuels, code) est protégé par le droit
          d&apos;auteur. Toute reproduction ou réutilisation sans autorisation préalable est interdite, à l&apos;exception des données
          publiques sous-jacentes (DVF, DPE, fiscalité locale, loyers) qui restent soumises à leurs licences d&apos;origine (Etalab,
          ADEME, DGFiP, ANIL).
        </p>
      </section>

      <section>
        <h2>Nature du service</h2>
        <p>
          Les estimations, comparaisons et rapports produits par Kalcul.app sont fournis à titre indicatif, à partir de données
          publiques agrégées par commune. Ils ne constituent ni un conseil financier, fiscal ou juridique personnalisé, ni un
          engagement contractuel d&apos;un établissement prêteur. Toute décision d&apos;achat ou de location doit être confirmée
          auprès de professionnels qualifiés (notaire, banque, conseiller en gestion de patrimoine).
        </p>
      </section>

      <section>
        <h2>Limitation de responsabilité</h2>
        <p>
          YITTE met en œuvre des moyens raisonnables pour assurer l&apos;exactitude des données publiées, sans garantir l&apos;absence
          d&apos;erreur, notamment lorsque les sources publiques sous-jacentes sont incomplètes pour une commune donnée (voir le score
          de fiabilité affiché sur chaque page). YITTE ne pourra être tenu responsable des décisions prises sur la seule base des
          résultats du simulateur.
        </p>
      </section>
    </LegalPage>
  );
}
