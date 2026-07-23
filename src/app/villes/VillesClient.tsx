"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { DEPARTEMENTS, departementFromCodeInsee } from "@/lib/departements";

type Ville = { code_insee: string; nom_commune: string; codes_postaux: string[] | null };

export default function VillesClient({ initialVilles }: { initialVilles: Ville[] }) {
  const [query, setQuery] = useState("");
  const [departement, setDepartement] = useState("");

  const departementsDisponibles = useMemo(() => {
    const codes = new Set(initialVilles.map((v) => departementFromCodeInsee(v.code_insee)));
    return Array.from(codes)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((code) => ({ code, nom: DEPARTEMENTS[code] || code }));
  }, [initialVilles]);

  const filtered = useMemo(() => {
    let result = initialVilles;

    if (departement) {
      result = result.filter((v) => departementFromCodeInsee(v.code_insee) === departement);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((v) =>
        v.nom_commune?.toLowerCase().includes(q) ||
        v.code_insee?.includes(q) ||
        v.codes_postaux?.some((cp) => cp.includes(q))
      );
    }

    return result.slice(0, 100);
  }, [initialVilles, query, departement]);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher une ville ou un code postal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          className="w-full sm:w-64 bg-white border border-slate-200 text-slate-900 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-shadow"
        >
          <option value="">Tous les départements</option>
          {departementsDisponibles.map(({ code, nom }) => (
            <option key={code} value={code}>
              {code} — {nom}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((ville) => (
          <Link
            key={ville.code_insee}
            href={`/acheter-ou-louer/${ville.code_insee}`}
            className="p-5 bg-white border border-slate-200 rounded-3xl hover:shadow-md transition-all group flex flex-col justify-center"
          >
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              {ville.nom_commune}
            </h2>
            <span className="text-xs text-slate-500 mt-1 font-mono">
              {ville.codes_postaux && ville.codes_postaux.length > 0 ? ville.codes_postaux[0] : `Code INSEE: ${ville.code_insee}`}
            </span>
          </Link>
        ))}
      </div>
      
      {filtered.length === 100 && (
        <p className="text-slate-500 mt-6 text-sm italic">
          Plus de 100 résultats trouvés. Utilisez la recherche pour affiner.
        </p>
      )}
      {filtered.length === 0 && (
        <p className="text-slate-500 mt-6 text-sm">
          Aucune commune trouvée pour &quot;{query}&quot;.
        </p>
      )}
    </div>
  );
}
