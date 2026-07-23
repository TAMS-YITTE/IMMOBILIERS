"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { simulateBuyVsRent } from '@/lib/calculator';
import { Info, Loader2 } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

interface CommuneData {
  code_insee: string;
  nom_commune: string | null;
  prix_m2_appart_moyen: number | null;
  loyer_m2_appart_moyen: number | null;
  taxe_fonciere_moyenne: number | null;
  ratio_dpe_fg: number | null;
  codes_postaux: string[] | null;
}

const REF_SCENARIO = {
  surface: 50,
  apport: 25000,
  tauxPret: 0.035,
  dureePret: 25,
};

export default function CarteClient({ initialCommunes }: { initialCommunes: CommuneData[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [coordsData, setCoordsData] = useState<Record<string, [number, number]> | null>(null);

  useEffect(() => {
    // Dynamically import the coordinates json to avoid blocking the main bundle
    import('@/data/communes-coords.json').then((mod) => {
      setCoordsData((mod.default as unknown) as Record<string, [number, number]>);
    }).catch(err => {
      console.warn("Coords data not yet available", err);
    });
  }, []);

  const processedCities = useMemo(() => {
    return initialCommunes.map((c) => {
      const prixM2 = c.prix_m2_appart_moyen || 0;
      const loyerM2 = c.loyer_m2_appart_moyen || 0;

      const sim = simulateBuyVsRent({
        prix_m2: prixM2,
        loyer_m2: loyerM2,
        taxe_fonciere_annuelle: c.taxe_fonciere_moyenne || 0,
        ratio_dpe_fg: c.ratio_dpe_fg || 0,
        surface: REF_SCENARIO.surface,
        apport: REF_SCENARIO.apport,
        taux_pret: REF_SCENARIO.tauxPret,
        duree_pret_annees: REF_SCENARIO.dureePret,
      });

      const bascule = sim.bascule_annee !== null ? Number(sim.bascule_annee) : null;

      let fill = "#ef4444"; // red-500
      let category = 'Location gagne';
      if (bascule !== null && bascule <= 8) {
        fill = "#10b981"; // emerald-500
        category = `Très rentable (< 8 ans)`;
      } else if (bascule !== null && bascule <= 15) {
        fill = "#f59e0b"; // amber-500
        category = `Moyennement rentable (8-15 ans)`;
      } else if (bascule !== null) {
        category = `Bascule en ${bascule} ans`;
      }

      return {
        code: c.code_insee,
        nom: c.nom_commune || c.code_insee,
        codePostal: c.codes_postaux && c.codes_postaux.length > 0 ? c.codes_postaux[0] : null,
        bascule,
        fill,
        category,
      };
    });
  }, [initialCommunes]);

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

  return (
    <div className="space-y-8">
      {/* Légende du Scénario de Référence */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-lg">
            <Info size={20} />
            Scénario de référence fixe (Légende)
          </div>
          <p className="text-sm text-slate-500">
            Calcul basé sur un **appartement de 50 m²**, **25 000 € d&apos;apport** (20%), un prêt de **25 ans** à **3,5 %**.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-full text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Rentable en &lt; 8 ans
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-full text-amber-700">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            Rentable en 8-15 ans
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-full text-red-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            &gt; 15 ans / Location
          </div>
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
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
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
          className="w-full h-full"
        >
          <ZoomableGroup center={mapCenter as [number, number]} zoom={1} minZoom={1} maxZoom={10}>
            <Geographies geography="/data/france.geojson">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#e2e8f0" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {coordsData && filteredCities.map((c) => {
              const coords = coordsData[c.code];
              if (!coords) return null;

              return (
                <Marker key={c.code} coordinates={coords}>
                  <circle
                    r={searchTerm ? 4 : 2}
                    fill={c.fill}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={`${c.nom} : ${c.category}`}
                    onClick={() => router.push(`/acheter-ou-louer/${c.code}`)}
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onMouseEnter={(e) => { e.currentTarget.setAttribute('r', '5') }}
                    onMouseLeave={(e) => { e.currentTarget.setAttribute('r', searchTerm ? '4' : '2') }}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
        
        <Tooltip id="map-tooltip" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", padding: "8px 12px", fontSize: "14px" }} />
      </div>
    </div>
  );
}
