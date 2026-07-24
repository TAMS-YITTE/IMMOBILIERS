import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kalcul.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/villes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/comparer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/carte`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pro`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/outils/notaire`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/outils/mensualite`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/outils/assurance-emprunteur`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cgv`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // fiabilite_score plafonne a 10 et ~4400 communes partagent ce max (dont toutes les
  // grandes villes). Un limit=1000 en piochait 1000 au hasard dans ce palier, excluant
  // aleatoirement Lyon, Bordeaux, Nantes... Un limit=5000 couvre tout le palier fiab=10
  // (25 000 URLs au total, sous le plafond de 50 000 URLs/sitemap de Google).
  const { data: communes } = await supabase
    .from('communes_metrics')
    .select('code_insee')
    .not('prix_m2_appart_moyen', 'is', null)
    .order('fiabilite_score', { ascending: false })
    .order('code_insee', { ascending: true })
    .limit(5000);

  const citySubRoutes = ['acheter-ou-louer', 'prix-m2', 'loyer-moyen', 'taxe-fonciere', 'renovation-energetique'];
  const dynamicCityRoutes: MetadataRoute.Sitemap = [];

  if (communes) {
    for (const c of communes) {
      for (const route of citySubRoutes) {
        dynamicCityRoutes.push({
          url: `${baseUrl}/${route}/${c.code_insee}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: route === 'acheter-ou-louer' ? 0.8 : 0.6,
        });
      }
    }
  }

  return [...staticRoutes, ...dynamicCityRoutes];
}
