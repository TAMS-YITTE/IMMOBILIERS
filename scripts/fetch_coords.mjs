import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Fetching all communes with data from Supabase...');
  
  const PAGE_SIZE = 1000;
  const allCommunes = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("communes_metrics")
      .select("code_insee, nom_commune")
      .not("prix_m2_appart_moyen", "is", null)
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    
    allCommunes.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log(`Found ${allCommunes.length} communes in DB.`);

  console.log('Fetching geo data from Github (high54/Communes-France-JSON)...');
  const res = await fetch('https://raw.githubusercontent.com/high54/Communes-France-JSON/master/france.json');
  const geoData = await res.json();
  
  console.log(`Found ${geoData.length} communes in Github JSON.`);
  
  const coordsMap = {};
  
  const githubIndex = {};
  for (const c of geoData) {
    const insee = c.CityCode || c.Code_commune_INSEE;
    if (insee) {
      githubIndex[insee] = c;
    }
  }

  let matched = 0;
  let missing = 0;

  for (const c of allCommunes) {
    const insee = c.code_insee;
    const match = githubIndex[insee];
    
    if (match && match.latitude && match.longitude) {
      coordsMap[insee] = [Number(match.longitude), Number(match.latitude)];
      matched++;
    } else {
      missing++;
    }
  }

  console.log(`Matched ${matched}, Missing ${missing}.`);

  if (missing > 0) {
    console.log('Fetching missing from geo.api.gouv.fr...');
    const missingInsees = allCommunes.filter(c => !coordsMap[c.code_insee]).map(c => c.code_insee);
    
    for (let i = 0; i < missingInsees.length; i += 50) {
      const batch = missingInsees.slice(i, i + 50);
      await Promise.all(batch.map(async (insee) => {
        try {
          const r = await fetch(`https://geo.api.gouv.fr/communes/${insee}?fields=centre`);
          if (r.ok) {
            const d = await r.json();
            if (d.centre && d.centre.coordinates) {
              coordsMap[insee] = d.centre.coordinates; // [lon, lat]
              matched++;
              missing--;
            }
          }
        } catch (e) {}
      }));
      process.stdout.write(`\rProgress: ${matched}/${allCommunes.length}`);
    }
    console.log();
  }

  const outPath = path.resolve(__dirname, '../src/data/communes-coords.json');
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(outPath, JSON.stringify(coordsMap));
  console.log(`\nSaved coords mapping to ${outPath}`);
}

main();
