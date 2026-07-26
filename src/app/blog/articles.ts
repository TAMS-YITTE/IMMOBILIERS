// Contenu editorial du blog. Articles rediges pour cibler des requetes reelles
// et renvoyer vers le simulateur et les outils (maillage interne + valeur SEO).
// Le corps est une suite de blocs simples rendus par /blog/[slug]/page.tsx.

export type Bloc =
  | { type: 'p'; html: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] };

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingMinutes: number;
  body: Bloc[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'acheter-ou-louer-2026',
    title: 'Acheter ou louer en 2026 : la méthode pour vraiment décider',
    description:
      "Faut-il acheter ou continuer à louer en 2026 ? La règle de la durée de détention, le coût réel d'un achat et comment trancher avec vos propres chiffres.",
    date: '2026-07-25',
    readingMinutes: 6,
    body: [
      { type: 'p', html: "« Louer, c'est jeter de l'argent par les fenêtres. » On l'entend partout, et c'est faux la moitié du temps. En 2026, avec des taux autour de 3,5 % et des prix qui se stabilisent, la vraie réponse dépend d'un seul paramètre décisif : <strong>combien de temps vous comptez rester</strong>." },
      { type: 'h2', text: "La seule question qui compte : l'année de bascule" },
      { type: 'p', html: "Acheter coûte cher au départ (apport, frais de notaire ~8 %, éventuels travaux). Ces frais sont « perdus » si vous revendez trop tôt. À l'inverse, chaque année qui passe, vous remboursez du capital et le bien se valorise. Il existe donc une <strong>année de bascule</strong> : le moment où avoir acheté devient plus rentable qu'avoir loué et placé son apport." },
      { type: 'p', html: "Avant cette année, la location gagne. Après, l'achat gagne. Tout l'enjeu est de comparer cette année de bascule à votre horizon de vie réel." },
      { type: 'ul', items: [
        "Vous restez moins de 5 ans → la location est presque toujours gagnante.",
        "Entre 5 et 10 ans → ça se joue commune par commune (prix, loyer, taxe foncière).",
        "Plus de 10 ans → l'achat est très souvent le bon choix.",
      ] },
      { type: 'h2', text: 'Pourquoi les moyennes nationales ne servent à rien' },
      { type: 'p', html: "Le rapport prix/loyer varie du simple au triple selon la ville. Acheter est vite rentable là où les loyers sont élevés face aux prix ; ça l'est beaucoup moins là où les prix se sont envolés sans que les loyers suivent. Une moyenne « France entière » ne vous dit rien sur <em>votre</em> ville." },
      { type: 'p', html: "C'est exactement ce que calcule notre simulateur : il part des <strong>vraies données de votre commune</strong> (prix au m² issus des transactions DVF, loyers ANIL, taxe foncière DGFiP) et vous donne votre année de bascule personnalisée." },
      { type: 'h2', text: 'Les coûts que les gens oublient' },
      { type: 'ul', items: [
        "Frais de notaire : ~8 % dans l'ancien, à provisionner dès le départ.",
        "Taxe foncière : un poste annuel récurrent, très variable d'une commune à l'autre.",
        "Charges de copropriété et entretien : comptez une provision annuelle.",
        "Travaux énergétiques : un logement classé F ou G devra être rénové.",
      ] },
      { type: 'p', html: "Un simulateur honnête intègre tout ça. Le nôtre provisionne même les travaux selon la proportion de passoires thermiques de la commune." },
      { type: 'h2', text: 'Comment décider en 3 minutes' },
      { type: 'p', html: "Ne vous fiez pas à une intuition. Entrez votre projet (surface, apport, durée) dans le <a href=\"/\">simulateur Acheter ou Louer</a>, comparez l'année de bascule à votre horizon, et regardez la <a href=\"/carte\">carte de France</a> pour situer votre ville. Si vous hésitez encore, le rapport PDF détaillé reprend tous vos chiffres, poste par poste." },
    ],
  },
  {
    slug: 'frais-de-notaire-2026',
    title: 'Frais de notaire en 2026 : combien prévoir et comment les calculer',
    description:
      'Ancien ou neuf, le montant des frais de notaire en 2026, ce qu\'ils contiennent vraiment (la part du notaire est minime) et comment les estimer avant d\'acheter.',
    date: '2026-07-25',
    readingMinutes: 5,
    body: [
      { type: 'p', html: "On les appelle « frais de notaire », mais c'est trompeur : l'essentiel part à l'État, pas au notaire. Comprendre leur composition évite les mauvaises surprises au moment de boucler votre plan de financement." },
      { type: 'h2', text: 'Combien en 2026 ?' },
      { type: 'ul', items: [
        "Dans l'ancien : environ 7 à 8 % du prix du bien.",
        "Dans le neuf (VEFA) : environ 2 à 3 % seulement.",
      ] },
      { type: 'p', html: "Sur un appartement ancien à 250 000 €, comptez donc autour de <strong>20 000 €</strong> de frais, à financer en plus du prix — souvent sur votre apport." },
      { type: 'h2', text: 'Ce que contiennent réellement ces frais' },
      { type: 'ul', items: [
        "Droits de mutation (taxes départementales et communales) : la plus grosse part, ~5,8 % dans l'ancien.",
        "Émoluments du notaire : sa rémunération réglementée, environ 1 % seulement.",
        "Débours et formalités : frais avancés pour les documents officiels.",
      ] },
      { type: 'p', html: "Autrement dit, la part qui revient vraiment au notaire est faible : l'essentiel est un impôt sur la transaction." },
      { type: 'h2', text: 'Pourquoi ça change votre décision achat/location' },
      { type: 'p', html: "Ces 8 % sont « perdus » le jour de l'achat. C'est précisément ce qui repousse l'<a href=\"/\">année de bascule</a> entre acheter et louer : plus vous revendez tôt, moins vous avez le temps de les amortir. Un achat n'a de sens financier que si vous restez assez longtemps pour absorber ces frais." },
      { type: 'h2', text: 'Estimer avant de vous engager' },
      { type: 'p', html: "Utilisez notre <a href=\"/outils/notaire\">calculateur de frais de notaire</a> pour un montant précis selon votre bien, puis lancez le <a href=\"/\">simulateur Acheter ou Louer</a> : il intègre déjà ces frais dans le calcul de rentabilité de votre commune." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
