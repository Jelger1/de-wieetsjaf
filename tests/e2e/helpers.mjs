import fs from 'node:fs';

/** Alle pagina's uit de gebouwde sitemap (paden). */
export function paginas() {
  const xml = fs.readFileSync('dist/sitemap.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

/** Verzamel console-fouten en paginafouten. */
export function volgFouten(page) {
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(`console: ${m.text()}`); });
  return fouten;
}

/** Blokkeer alle externe verzoeken (geen echte reserveringen, geen tracking tijdens tests). */
export async function blokkeerExtern(page) {
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
}
