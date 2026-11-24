// Maakt screenshots van pagina's voor visuele controle: node scripts/screenshot.mjs <pad> <breedte> <uitvoer.png> [volledig]
import { chromium } from 'playwright';
const [, , pad = '/', breedte = '1440', uit = 'shot.png', volledig = 'ja'] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(breedte), height: Number(breedte) < 600 ? 800 : 900 }, deviceScaleFactor: 1 });
const fouten = [];
p.on('pageerror', (e) => fouten.push(`pageerror: ${e.message}`));
p.on('console', (m) => { if (m.type() === 'error') fouten.push(`console: ${m.text()}`); });
await p.goto(`http://localhost:4321${pad}`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// Scroll door de pagina zodat lazy-load-afbeeldingen laden
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
await p.waitForTimeout(800);
await Promise.race([p.waitForLoadState('networkidle'), p.waitForTimeout(5000)]);
await p.screenshot({ path: uit, fullPage: volledig === 'ja' });
console.log(JSON.stringify({ fouten, hoogte: await p.evaluate(() => document.documentElement.scrollHeight), overflow: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth) }));
await b.close();
