"use client";

import React, { useMemo, useState, useEffect, useDeferredValue } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { simulateBuyVsRent } from '@/lib/calculator';
import { Info, Loader2, MousePointerClick } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import CarteReglages, { SCENARIO_REFERENCE, type ScenarioCarte } from './CarteReglages';

interface CommuneData {
  code_insee: string;
  nom_commune: string | null;
  prix_m2_appart_moyen: number | null;
  prix_m2_maison_moyen: number | null;
  loyer_m2_appart_moyen: number | null;
  loyer_m2_maison_moyen: number | null;
  taxe_fonciere_moyenne: number | null;
  ratio_dpe_fg: number | null;
  codes_postaux: string[] | null;
}

// Zoom à partir duquel les communes individuelles apparaissent en surcouche
const ZOOM_COMMUNES = 3;

const NO_DATA_FILL = "#e2e8f0"; // slate-200

// L'Alsace-Moselle relève du livre foncier et non du cadastre : ces trois
// départements sont absents du fichier DVF, on l'explique au survol.
const DEPTS_HORS_DVF = new Set(["57", "67", "68"]);

// Échelle séquentielle : plus la bascule est rapide, plus c'est vert
const SCALE = [
  { max: 7, fill: "#047857", label: "Moins de 7 ans" },      // emerald-700
  { max: 10, fill: "#10b981", label: "7 à 10 ans" },          // emerald-500
  { max: 13, fill: "#fbbf24", label: "10 à 13 ans" },         // amber-400
  { max: 16, fill: "#f97316", label: "13 à 16 ans" },         // orange-500
  { max: Infinity, fill: "#dc2626", label: "16 ans et +" },   // red-600
];

function fillForBascule(bascule: number | null): string {
  if (bascule === null) return SCALE[SCALE.length - 1].fill;
  return SCALE.find((s) => bascule < s.max)!.fill;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatAnnees(valeur: number): string {
  if (!Number.isFinite(valeur)) return "jamais sur 25 ans";
  return `${valeur.toFixed(1).replace('.', ',')} ans`;
}

export default function CarteClient({ initialCommunes }: { initialCommunes: CommuneData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlBien = searchParams.get('bien');
  const defaultBien = urlBien === 'maison' ? 'maison' : 'appartement';

  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [coordsData, setCoordsData] = useState<Record<string, [number, number]> | null>(null);
  const [scenario, setScenario] = useState<ScenarioCarte>({
    ...SCENARIO_REFERENCE,
    typeBien: defaultBien
  });

  // Un recalcul complet coûte ~30 ms sur les 10 038 communes : on le laisse
  // passer en priorité basse pour que les curseurs restent fluides.
  const scenarioApplique = useDeferredValue(scenario);
  const recalculEnCours = scenarioApplique !== scenario;

  useEffect(() => {
    // Dynamically import the coordinates json to avoid blocking the main bundle
    import('@/data/communes-coords.json').then((mod) => {
      setCoordsData((mod.default as unknown) as Record<string, [number, number]>);
    }).catch(err => {
      console.warn("Coords data not yet available", err);
    });
  }, []);

  const processedCities = useMemo(() => {
    return initialCommunes
      .filter((c) => {
        if (scenarioApplique.typeBien === 'appartement') {
          return c.prix_m2_appart_moyen != null && c.loyer_m2_appart_moyen != null;
        } else {
          return c.prix_m2_maison_moyen != null && c.loyer_m2_maison_moyen != null;
        }
      })
      .map((c) => {
        const prixM2 = scenarioApplique.typeBien === 'appartement'
          ? (c.prix_m2_appart_moyen || 0)
          : (c.prix_m2_maison_moyen || 0);
          
        const loyerM2 = scenarioApplique.typeBien === 'appartement'
          ? (c.loyer_m2_appart_moyen || 0)
          : (c.loyer_m2_maison_moyen || 0);

      const sim = simulateBuyVsRent({
        prix_m2: prixM2,
        loyer_m2: loyerM2,
        taxe_fonciere_annuelle: c.taxe_fonciere_moyenne || 0,
        ratio_dpe_fg: c.ratio_dpe_fg || 0,
        surface: scenarioApplique.surface,
        apport: scenarioApplique.apport,
        taux_pret: scenarioApplique.tauxPret,
        duree_pret_annees: scenarioApplique.dureePret,
      });

      const bascule = sim.bascule_annee !== null ? Number(sim.bascule_annee) : null;

      return {
        code: c.code_insee,
        departement: c.code_insee.slice(0, 2),
        nom: c.nom_commune || c.code_insee,
        codePostal: c.codes_postaux && c.codes_postaux.length > 0 ? c.codes_postaux[0] : null,
        bascule,
        fill: fillForBascule(bascule),
        category: bascule !== null
          ? `bascule en ${formatAnnees(bascule)}`
          : `la location reste gagnante sur 25 ans`,
      };
    });
  }, [initialCommunes, scenarioApplique]);

  // Agrégation par département : bascule médiane des communes couvertes
  const deptStats = useMemo(() => {
    const parDept = new Map<string, number[]>();
    for (const c of processedCities) {
      const list = parDept.get(c.departement);
      // Une commune où l'achat ne bascule jamais compte comme "au-delà de l'horizon"
      const valeur = c.bascule ?? Infinity;
      if (list) list.push(valeur);
      else parDept.set(c.departement, [valeur]);
    }

    const stats: Record<string, { mediane: number; nbCommunes: number; fill: string }> = {};
    parDept.forEach((valeurs, dept) => {
      const mediane = median(valeurs);
      stats[dept] = {
        mediane,
        nbCommunes: valeurs.length,
        fill: fillForBascule(Number.isFinite(mediane) ? mediane : null),
      };
    });
    return stats;
  }, [processedCities]);

  const mapCenter = [2.5, 46.5]; // Center of France

  // Apply search filter if any
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return processedCities;
    const q = searchTerm.toLowerCase();
    return processedCities.filter((c) =>
      c.nom.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      (c.codePostal && c.codePostal.includes(q))
    );
  }, [processedCities, searchTerm]);

  // Les 10 000 points communes ne sont tracés qu'au zoom ou lors d'une recherche,
  // sinon ils saturent la carte et écrasent la lecture des départements.
  const isSearching = searchTerm.trim().length > 0;
  const showCommunes = isSearching || zoom >= ZOOM_COMMUNES;

  return (
    <div className="space-y-8">
      {/* Légende du Scénario de Référence */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-lg">
            <Info size={20} />
            Comment lire cette carte
          </div>
          <p className="text-sm text-slate-600">
            Chaque département est coloré selon <strong className="text-slate-900">l&apos;année de bascule médiane</strong> de ses communes :
            le moment où le patrimoine net de l&apos;acheteur dépasse celui du locataire ayant placé son apport.
          </p>
          <p className="text-sm text-slate-600">
            Le scénario ci-dessous s&apos;applique identiquement à toute la France : seules les données
            locales varient (prix au m², loyer, taxe foncière, passoires thermiques).
          </p>
        </div>

        {/* Réglages du scénario */}
        <div className="border-t border-slate-100 pt-6">
          <CarteReglages scenario={scenario} onChange={setScenario} />
        </div>

        {/* Échelle de couleurs */}
        <div>
          <div className="flex flex-wrap items-stretch gap-px rounded-xl overflow-hidden border border-slate-200 max-w-2xl">
            {SCALE.map((s) => (
              <div key={s.label} className="flex-1 min-w-[110px]">
                <div className="h-3" style={{ backgroundColor: s.fill }} />
                <div className="px-2 py-2 text-[11px] font-medium text-slate-600 bg-white text-center">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
            <MousePointerClick size={14} />
            Survolez un département pour le détail. Zoomez (molette) pour faire apparaître les communes une à une et cliquer dessus.
          </p>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: NO_DATA_FILL }} />
            En gris : départements sans prix de vente exploitable. L&apos;Alsace-Moselle (57, 67, 68) est absente du fichier DVF, ces trois départements relevant du livre foncier.
          </p>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Isoler une ville ou un code postal..."
          className="w-full bg-white border border-slate-200 rounded-full px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Carte Interactive */}
      <div className="w-full h-[600px] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
        {!coordsData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-4 text-purple-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-medium">Chargement des données cartographiques...</p>
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoAzimuthalEqualArea"
          projectionConfig={{
            rotate: [-3.0, -46.5, 0],
            scale: 2500
          }}
          className={`w-full h-full transition-opacity duration-150 ${recalculEnCours ? 'opacity-60' : 'opacity-100'}`}
        >
          <ZoomableGroup
            center={mapCenter as [number, number]}
            zoom={1}
            minZoom={1}
            maxZoom={10}
            onMoveEnd={({ zoom: z }) => setZoom(z)}
          >
            <Geographies geography="/data/france.geojson">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code as string;
                  const stat = deptStats[code];
                  const tooltip = stat
                    ? `${geo.properties.nom} — bascule médiane : ${formatAnnees(stat.mediane)} (${stat.nbCommunes} communes)`
                    : DEPTS_HORS_DVF.has(code)
                      ? `${geo.properties.nom} — non couvert par DVF (régime du livre foncier d'Alsace-Moselle)`
                      : `${geo.properties.nom} — aucune donnée de prix`;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={stat ? stat.fill : NO_DATA_FILL}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      data-tooltip-id="map-tooltip"
                      data-tooltip-content={tooltip}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.75, cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {coordsData && showCommunes && filteredCities.map((c) => {
              const coords = coordsData[c.code];
              if (!coords) return null;

              const rayon = isSearching ? 4 / Math.max(zoom, 1) : 3 / zoom;

              return (
                <Marker key={c.code} coordinates={coords}>
                  <circle
                    r={rayon}
                    fill={c.fill}
                    stroke="#ffffff"
                    strokeWidth={rayon / 4}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={`${c.nom} : ${c.category}`}
                    onClick={() => router.push(`/acheter-ou-louer/${c.code}`)}
                    className="cursor-pointer transition-opacity duration-200 hover:opacity-70"
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {!showCommunes && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-600 shadow-sm pointer-events-none">
            Zoomez pour afficher les {processedCities.length.toLocaleString('fr-FR')} communes
          </div>
        )}

        <Tooltip id="map-tooltip" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", padding: "8px 12px", fontSize: "14px" }} />
      </div>
    </div>
  );
}
