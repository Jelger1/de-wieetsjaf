// Haalt de bierkaart één keer op via de officiële Untappd for Business API en schrijft
// data/bierkaart.snapshot.json. De bouwstap zet die lijst dan direct in de HTML (werkt zonder JavaScript).
// Gebruik: node scripts/untappd-sync.mjs        (leest .env of omgevingsvariabelen)
// Bedoeld voor een geplande taak vóór elke bouw (zie docs/03-untappd-integratie.md).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bierkaart, geheugenCache, leesConfig, isGeconfigureerd } from '../api/lib/untappd.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
const envPad = path.join(ROOT, '.env');
if (fs.existsSync(envPad)) {
  for (const r of fs.readFileSync(envPad, 'utf8').split(/\r?\n/)) {
    const m = r.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!isGeconfigureerd(leesConfig(env))) {
  console.log('Untappd-API niet ingesteld (UNTAPPD_API_EMAIL, UNTAPPD_API_TOKEN, UNTAPPD_MENU_ID). Snapshot overgeslagen.');
  process.exit(0);
}
const data = await bierkaart({ env, cache: geheugenCache(), forceer: true });
if (data.status !== 'ok') {
  console.error(`Ophalen mislukt (${data.status}${data.reden ? `, ${data.reden}` : ''}). Bestaande snapshot blijft staan.`);
  process.exit(1);
}
const { cache, ...schoon } = data;
fs.writeFileSync(path.join(ROOT, 'data/bierkaart.snapshot.json'), JSON.stringify(schoon, null, 1));
console.log(`Snapshot opgeslagen: ${data.aantal} items in ${data.secties.length} secties (${data.opgehaald}).`);
