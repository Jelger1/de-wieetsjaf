// Maakt de deelafbeeldingen (Open Graph, 1200 × 630) in de huisstijl: node scripts/og-beelden.mjs
// Vereist: npm run images (voor de foto's) en Playwright (Chromium).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (rel) => fs.readFileSync(path.join(ROOT, rel)).toString('base64');
const woordmerk = fs.readFileSync(path.join(ROOT, 'assets/brand/woordmerk.svg'), 'utf8');
const bebas = b64('assets/fonts/bebas-neue.woff2');
const hanken = b64('assets/fonts/hanken-grotesk.woff2');

const BEELDEN = [
  { uit: 'og-standaard.jpg', foto: 'assets/images/interieur-bar-800.webp', kop: 'Restaurant & speciaalbier', sub: 'Markt 47 · Kerkrade · sinds 2008' },
  { uit: 'og-gondel.jpg', foto: 'assets/images/gondel-06-1200.webp', kop: 'Alpine Gondel Dining', sub: 'Je eigen privégondel · 4 tot 6 personen' },
  { uit: 'og-bierkaart.jpg', foto: 'assets/images/sanctus-tap-800.webp', kop: 'Bierkaart', sub: '200+ speciaalbieren · Sanctus van de tap' },
  { uit: 'og-menukaart.jpg', foto: 'assets/images/gerechten-tafel-600.webp', kop: 'Menukaart', sub: 'Lunch · Diner · Borrel' },
];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const o of BEELDEN) {
  await p.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:B;src:url(data:font/woff2;base64,${bebas})}
    @font-face{font-family:H;src:url(data:font/woff2;base64,${hanken});font-weight:300 700}
    *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;display:grid;grid-template-columns:620px 580px;background:#11271b;color:#f5e6c5;font-family:H}
    .t{padding:64px 56px;display:flex;flex-direction:column;justify-content:space-between}
    .t svg{width:300px;height:auto;color:#f5e6c5}
    h1{font-family:B;font-weight:400;font-size:96px;line-height:.92;color:#f5e6c5}
    h1 span{color:#d0a550;border-bottom:5px solid #d0a550}
    p{font-weight:700;font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:#a3b295}
    .f{background:url(data:image/webp;base64,${b64(o.foto)}) center/cover}
  </style></head><body><div class="t">${woordmerk}<div><h1>${o.kop.replace(/(\S+)$/, '<span>$1</span>')}</h1></div><p>${o.sub}</p></div><div class="f"></div></body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(ROOT, 'assets/og', o.uit), type: 'jpeg', quality: 82 });
  console.log('ok', o.uit);
}
await b.close();
