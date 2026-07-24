# 🧠 Contexte Projet : Kalcul.app (Mise à jour)

Voici le contexte complet du projet sur lequel nous travaillons : Kalcul.app.

# 1. Le Produit & La Stack Technique
- **Produit** : Kalcul.app, un simulateur SaaS d'achat vs location immobilière avec calcul précis de "l'année de bascule" (le moment où l'achat devient plus rentable).
- **Stack** : Next.js 15 (App Router, React 19), Tailwind CSS v4, Supabase (pour la base de données des métriques financières par ville et les leads/achats).
- **Design** : Thème clair uniquement (désactivation de `prefers-color-scheme: dark`), UI épurée avec "Fat Footer" et navigation claire.
- **Hébergement** : Vercel (avec un fichier `.npmrc` contenant `legacy-peer-deps=true` pour contourner les conflits de version de React).

# 2. Ce qui a déjà été accompli (État actuel)
- **Refonte UI & SEO** : Navigation optimisée, design premium, et métadonnées dynamiques hyper-ciblées générées pour chaque page ville.
- **Outils statiques en place** : Calculateurs de mensualités, frais de notaire et assurance emprunteur fonctionnels.
- **La Carte Interactive Choroplèthe** : Véritable carte colorée par départements. Elle possède des curseurs permettant d'ajuster en temps réel le taux et l'apport.
- **Toggle Appartement / Maison (Dernier ajout)** : Un sélecteur permet de basculer la carte et les simulations entre les données des appartements et des maisons. Le choix est synchronisé dynamiquement dans l'URL (`?bien=maison`) pour optimiser le SEO.
- **Infrastructure de Paiement** : Les routes API de Stripe (`/api/checkout` et le webhook `/api/webhooks/stripe`) et la page `/paiement-reussi` sont prêtes et configurées pour vendre des rapports PDF détaillés.

# 3. Roadmap & Priorités de Développement
L'accent actuel est porté sur la Viralité et la Monétisation (Phases 2 & 3 de la roadmap) :
- **Génération de Leads & Comptes** : Générateur de rapports PDF premium payants (envoyés après paiement Stripe), intégration d'un système d'authentification (Supabase Auth) pour sauvegarder les historiques de simulation, et affiliation courtiers.
- **Stratégie de Viralité (Growth Hacking)** : Bouton pour générer et télécharger automatiquement une image stylisée contenant le bilan d'une ville (ex: "À Nantes, l'achat gagne en 6 ans"), prête à être partagée sur LinkedIn/Instagram. Mini-widgets intégrables pour les blogs immobiliers.
- **Améliorations Simulateur** : Rendre la taxe foncière dynamique selon la surface choisie, bouton "Me localiser" sur la carte, et recherche hyper-granulaire (quartiers de Paris, codes postaux précis).

# 4. Mission de la session d'aujourd'hui
[Écrivez ici la fonctionnalité précise à développer, par exemple : "Aujourd'hui, nous allons finaliser la génération du PDF premium envoyé après un paiement Stripe." ou "Aujourd'hui, nous allons créer le générateur d'images pour les réseaux sociaux."]
