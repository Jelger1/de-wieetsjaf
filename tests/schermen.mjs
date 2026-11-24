// Visuele controle: screenshots van alle pagina's op meerdere breedtes, met console-fouten en overflow-check.
// Gebruik: node tests/schermen.mjs [uitvoermap] [breedtes,komma,gescheiden] [browser]
import { chromium, firefox, webkit } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UIT = process.argv[2] || 'tests/screenshots';
const BREEDTES = (process.argv[3] || '390,1440').split(',').map(Number);
const BROWSER = { chromium, firefox, webkit }[process.argv[4] || 'chromium'];
const BASIS = process.env.BASIS || 'http://localhost:4321';
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const PADEN = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).concat(['/bestaat-niet/'])
  .filter((p) => !process.env.ALLEEN || process.env.ALLEEN.split(',').includes(p));

fs.mkdirSync(UIT, { recursive: true });
const b = await BROWSER.launch();
const rapport = [];
for (const w of BREEDTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const pad of PADEN) {
    const p = await ctx.newPage();
    const fouten = [];
    p.on('pageerror', (e) => fouten.push(`pageerror: ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') fouten.push(`console: ${m.text()}`); });
    p.on('requestfailed', (r) => { const u = r.url(); if (u.startsWith(BASIS)) fouten.push(`request: ${u} ${r.failure()?.errorText}`); });
    p.on('response', (r) => { if (r.url().startsWith(BASIS) && r.status() >= 400 && !r.url().includes('bestaat-niet') && !r.url().includes('/api/')) fouten.push(`http ${r.status()}: ${r.url()}`); });
    await p.goto(BASIS + pad, { waitUntil: 'domcontentloaded' });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await Promise.race([p.waitForLoadState('networkidle'), p.waitForTimeout(4000)]);
    const info = await p.evaluate(() => {
      const breed = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed'; }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      return { overflow: document.documentElement.scrollWidth > innerWidth, breed, h1: document.querySelectorAll('h1').length, titel: document.title };
    });
    const naam = `${(pad.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home')}-${w}.png`;
    await p.screenshot({ path: path.join(UIT, naam), fullPage: true });
    rapport.push({ pad, w, ...info, fouten });
    await p.close();
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(path.join(UIT, 'rapport.json'), JSON.stringify(rapport, null, 1));
const problemen = rapport.filter((r) => r.overflow || r.fouten.length || r.h1 !== 1);
console.log(`${rapport.length} schermen. Problemen: ${problemen.length}`);
for (const r of problemen) console.log(`- ${r.pad} @${r.w}: overflow=${r.overflow} ${r.breed.join(' ')} h1=${r.h1} ${r.fouten.join(' | ')}`);
