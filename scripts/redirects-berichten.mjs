// Maakt 301-redirects voor alle oude WordPress-nieuwsberichten (bron: docs/bronnen/oude-post-sitemap.xml).
// Elk bericht gaat naar de inhoudelijk best passende nieuwe pagina, op basis van trefwoorden in de URL.
// Gebruik: node scripts/redirects-berichten.mjs   → schrijft data/redirects-berichten.json
import fs from 'node:fs';

const xml = fs.readFileSync('docs/bronnen/oude-post-sitemap.xml', 'utf8');
const handmatig = new Set(JSON.parse(fs.readFileSync('data/redirects.json', 'utf8')).regels.map((r) => r.van));
const paden = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => p !== '/');

// Volgorde = prioriteit
const REGELS = [
  [/beermonday/, '/agenda/beermonday/'],
  [/vacature|personeel-gezocht|werken/, '/werken-bij/'],
  [/kluis|vergader|bedrijfsfeest|personeelsfeest|kerstborrel|feestelijk-afsluiten|vereniging/, '/groepen/'],
  [/kerst/, '/arrangementen/'],
  [/gondel|gondola|alpine/, '/arrangementen/alpine-gondel-dining/'],
  [/wijn|wine|cuvee|prosecco|champagne/, '/bierkaart/#wijn'],
  [/bier|beer|brouwerij|bock|ipa|tripel|dubbel|sanctus|fridge|tap|stout|wmc-blond/, '/bierkaart/'],
  [/menu|gerecht|lunch|diner|salade|burger|ossenhaas|biefstuk|wafel|coquille|voorgerecht|dessert|hap|plank|soep|zuurvlees|spareribs|vis|vega|asperge|wild|stamppot|ontbijt|brunch|afhalen|bezorg|keuken/, '/menukaart/'],
  [/carnaval|zietsong|feest|party|wmc|optreden|live|muziek|concert|pavilion|bockentocht|markt|terras|evenement|activiteit|agenda|pasen|moederdag|vaderdag|valentijn|koningsdag|oud-en-nieuw|nieuwjaar/, '/agenda/'],
  [/open|sluit|tijden|vakantie|corona/, '/contact/'],
];

const regels = [];
const telling = {};
for (const p of paden) {
  if (handmatig.has(p)) continue;
  const slug = p.toLowerCase();
  const doel = (REGELS.find(([re]) => re.test(slug)) || [null, '/agenda/'])[1];
  regels.push({ van: p, naar: doel });
  telling[doel] = (telling[doel] || 0) + 1;
}
// Categorie-, tag- en auteursarchieven van WordPress
regels.push({ van: '/category/*', naar: '/agenda/' }, { van: '/tag/*', naar: '/agenda/' }, { van: '/author/*', naar: '/' }, { van: '/feed/*', naar: '/' }, { van: '/feed', naar: '/' });

fs.writeFileSync('data/redirects-berichten.json', JSON.stringify({
  _uitleg: 'Automatisch gegenereerd door scripts/redirects-berichten.mjs uit de oude post-sitemap (293 berichten). Niet met de hand bewerken; pas de regels in het script aan.',
  gegenereerd: new Date().toISOString().slice(0, 10),
  regels,
}, null, 1));
console.log(`${regels.length} regels geschreven.`, telling);
