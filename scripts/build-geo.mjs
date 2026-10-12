// Generates public/geo/countries.json and public/geo/cities/<CC>.json from the all-the-cities
// dataset (every place with ≥1,000 inhabitants; data © GeoNames, CC BY 4.0).
// Run after upgrading the dataset: node scripts/build-geo.mjs
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const cities = require('all-the-cities');
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const out = join(process.cwd(), 'public', 'geo');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'cities'), { recursive: true });

const byCountry = new Map();
for (const c of cities) {
  if (!byCountry.has(c.country)) byCountry.set(c.country, []);
  byCountry.get(c.country).push(c);
}

const countries = [];
for (const [code, list] of byCountry) {
  let name;
  try { name = names.of(code); } catch { name = code; }
  if (!name || name === code) continue;
  // Largest first, so the most likely matches appear at the top; one entry per name.
  const seen = new Set();
  const unique = list.sort((a, b) => b.population - a.population).map((c) => c.name.trim()).filter((n) => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()));
  writeFileSync(join(out, 'cities', `${code}.json`), JSON.stringify(unique));
  countries.push({ code, name, cities: unique.length });
}
countries.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(out, 'countries.json'), JSON.stringify(countries));
console.log(`${countries.length} countries, ${countries.reduce((s, c) => s + c.cities, 0)} cities written to public/geo`);
