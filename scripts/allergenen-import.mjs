// Zet de door de keuken ingevulde allergenenlijst (docs/allergenen-controlelijst.csv) in data/menukaart.json.
// Vul per gerecht een 'x' in bij elk allergeen dat erin zit; laat de rest leeg. Vul 'Gecontroleerd door' en 'Datum' in.
// Gebruik: node scripts/allergenen-import.mjs [--publiceer]
//   zonder --publiceer: alleen controleren en tonen wat er zou veranderen
//   met --publiceer: schrijft de allergenen weg en zet 'geverifieerd' op true (de site toont ze dan)
import fs from 'node:fs';

const publiceer = process.argv.includes('--publiceer');
const csv = fs.readFileSync('docs/allergenen-controlelijst.csv', 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).map((r) => r.split(';'));
const [kop, ...regels] = csv;
const menu = JSON.parse(fs.readFileSync('data/menukaart.json', 'utf8'));
const lijst = menu.allergenen.lijst;
const kolom = Object.fromEntries(kop.map((k, i) => [k, i]));
const fouten = [];
const perGerecht = new Map();
for (const r of regels) {
  const naam = r[kolom.Gerecht];
  if (!r[kolom['Gecontroleerd door']] || !r[kolom.Datum]) fouten.push(`Niet gecontroleerd: ${naam}`);
  perGerecht.set(`${r[kolom.Kaart]}|${naam}`, lijst.filter((a) => /^\s*x\s*$/i.test(r[kolom[a]] || '')));
}
let gezet = 0;
for (const k of menu.kaarten) for (const g of k.groepen) for (const i of (g.items || [])) {
  const a = perGerecht.get(`${k.titel}|${i.naam}`) ?? [...perGerecht.entries()].find(([sleutel]) => sleutel.endsWith(`|${i.naam}`))?.[1];
  if (!a) { fouten.push(`Ontbreekt in de lijst: ${k.titel} / ${i.naam}`); continue; }
  i.allergenen = a; gezet += 1;
}
console.log(`${gezet} gerechten gekoppeld.`);
if (fouten.length) { console.log(`\n${fouten.length} aandachtspunten:\n- ${fouten.join('\n- ')}`); if (publiceer) process.exit(1); }
if (publiceer) {
  menu.allergenen.geverifieerd = true;
  fs.writeFileSync('data/menukaart.json', `${JSON.stringify(menu, null, 2)}\n`);
  console.log('Opgeslagen in data/menukaart.json; de site toont de allergenen na de volgende bouw.');
} else console.log('\nControle klaar. Draai met --publiceer om op te slaan.');
