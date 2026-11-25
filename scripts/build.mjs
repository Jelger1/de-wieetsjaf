// Bouwt de complete statische site naar dist/.
// Gebruik:  node scripts/build.mjs               (lokaal, noindex)
//           node scripts/build.mjs --productie  (SITE_URL uit env, indexeerbaar)
//           node scripts/build.mjs --testdata   (lokale testdata bierkaart; NOOIT met --productie)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { root, leesJson } from '../src/lib/html.mjs';
import { nuInKerkrade } from '../js/modules/tijden.js';

const args = new Set(process.argv.slice(2));
const productie = args.has('--productie') || process.env.SITE_ENV === 'productie';
const testmodus = args.has('--testdata');
if (productie && testmodus) { console.error('Weigering: testdata mag nooit in een productiebouw.'); process.exit(1); }

const DOEL = path.join(root, 'dist');
// Eerst in een tijdelijke map bouwen en pas aan het eind wisselen: zo is dist/ nooit half gevuld
const DIST = path.join(root, `.dist-bouw-${process.pid}`);
const waarschuwingen = [];
const t0 = Date.now();

// ------------------------------------------------------------ Context
const site = leesJson('data/site.json');
const basisUrl = (process.env.SITE_URL || (productie ? site.url : 'http://localhost:4321')).replace(/\/$/, '');
const integraties = leesJson('data/integraties.json');
const tijden = leesJson('data/openingstijden.json');
const menu = leesJson('data/menukaart.json');
const agenda = leesJson('data/agenda.json');
const vandaag = process.env.BOUWDATUM || nuInKerkrade().iso;
const arrangementen = leesJson('data/arrangementen.json').items.filter((a) => a.actief !== false && (!a.tot || a.tot >= vandaag || a.archiveren));

let bierkaart = null;
const snapshot = path.join(root, 'data/bierkaart.snapshot.json');
if (testmodus) bierkaart = leesJson('data/bierkaart.testdata.json');
else if (fs.existsSync(snapshot)) {
  bierkaart = leesJson('data/bierkaart.snapshot.json');
  if (bierkaart.testdata) { console.error('Weigering: de snapshot bevat testdata.'); process.exit(1); }
}

for (const [k, v] of Object.entries(site.juridisch)) if (!k.startsWith('_') && v == null) waarschuwingen.push(`site.json: juridisch.${k} is nog leeg (wettelijk verplicht op de website, zie docs/04-juridische-audit.md).`);
if (!menu.allergenen.geverifieerd) waarschuwingen.push('menukaart.json: allergenen nog niet geverifieerd door de keuken; site toont alleen de algemene melding.');

// Kleine inline-script: zet .js op <html> vóór het tekenen (voorkomt verspringen van de navigatie)
const inlineScript = "document.documentElement.classList.add('js')";
const inlineHash = crypto.createHash('sha256').update(inlineScript).digest('base64');

// ---------------------------------------------------------------- CSS
const CSS_VOLGORDE = ['css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css', ...fs.readdirSync(path.join(root, 'css/pages')).sort().map((f) => `css/pages/${f}`)];
const cssBron = CSS_VOLGORDE.map((f) => `/* ${f} */\n${fs.readFileSync(path.join(root, f), 'utf8')}`).join('\n');
const css = cssBron
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
// Let op: selectors als 'a :hover' komen niet voor; de minify is bewust eenvoudig.

const jsBestanden = ['js/main.js', ...fs.readdirSync(path.join(root, 'js/modules')).map((f) => `js/modules/${f}`)];
const versie = crypto.createHash('sha1').update(css + jsBestanden.map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('') + JSON.stringify(integraties)).digest('hex').slice(0, 10);

const ctx = { site, basisUrl, integraties, tijden, menu, agenda, arrangementen, bierkaart, vandaag, productie, testmodus, versie, inlineScript };

// ------------------------------------------------------------- Uitvoer
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
process.on('exit', () => fs.rmSync(DIST, { recursive: true, force: true }));
const schrijf = (rel, inhoud) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, inhoud); };
const kopieerMap = (van, naar) => fs.cpSync(path.join(root, van), path.join(DIST, naar), { recursive: true });

schrijf('css/site.css', css);
kopieerMap('js', 'js');
// Versie aan relatieve imports hangen, zodat browsers na een update geen oude modules gebruiken
for (const f of fs.readdirSync(path.join(DIST, 'js'), { recursive: true }).filter((x) => String(x).endsWith('.js'))) {
  const p = path.join(DIST, 'js', String(f));
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/(from\s+|import\()(['"])(\.{1,2}\/[^'"?]+\.js)\2/g, `$1$2$3?v=${versie}$2`));
}
kopieerMap('assets/fonts', 'assets/fonts');
kopieerMap('assets/images', 'assets/images');
kopieerMap('assets/brand', 'assets/brand');
if (fs.existsSync(path.join(root, 'assets/og'))) kopieerMap('assets/og', 'assets/og');
if (fs.existsSync(path.join(root, 'assets/downloads'))) kopieerMap('assets/downloads', 'assets/downloads');
for (const f of ['favicon.ico', 'site.webmanifest']) if (fs.existsSync(path.join(root, 'assets/brand', f))) fs.copyFileSync(path.join(root, 'assets/brand', f), path.join(DIST, f));
if (testmodus) schrijf('api/bierkaart.testdata.json', JSON.stringify(bierkaart));

// -------------------------------------------------------------- Pagina's
const paginas = [];
for (const bestand of fs.readdirSync(path.join(root, 'src/pages')).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(path.join(root, 'src/pages', bestand)).href);
  const resultaten = [];
  if (mod.default) resultaten.push(...[].concat(await mod.default(ctx)));
  // Modules kunnen ook meerdere pagina's teruggeven: [{ pad, html }]
  if (mod.paginas) resultaten.push(...(await mod.paginas(ctx)));
  for (const r of resultaten) {
    const item = typeof r === 'string' ? { pad: bestand === 'home.mjs' ? '/' : `/${bestand.replace('.mjs', '')}/`, html: r } : r;
    const rel = item.bestand || (item.pad === '/' ? 'index.html' : `${item.pad.replace(/^\//, '')}index.html`);
    schrijf(rel, item.html);
    if (!item.geenSitemap) paginas.push(item.pad);
  }
}

// --------------------------------------------------------- SEO-bestanden
schrijf('robots.txt', productie
  ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${basisUrl}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
schrijf('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paginas.filter((p) => p !== '/404/').map((p) => `  <url><loc>${basisUrl}${p}</loc><lastmod>${vandaag}</lastmod></url>`).join('\n')}\n</urlset>\n`);

// Redirects (Cloudflare Pages / Netlify-formaat)
const redirects = leesJson('data/redirects.json');
const berichten = fs.existsSync(path.join(root, 'data/redirects-berichten.json')) ? leesJson('data/redirects-berichten.json').regels : [];
schrijf('_redirects', `${[...redirects.regels, ...berichten].map((r) => `${r.van} ${r.naar} ${r.code || 301}`).join('\n')}\n`);

// Beveiligingsheaders
const csp = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${inlineHash}' https://cdn.guestplan.com https://embed-menu-preloader.untappdapi.com https://business.untappd.com https://assets.untappd.com https://challenges.cloudflare.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline' https://assets.untappd.com",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://assets.untappd.com",
  "connect-src 'self' https://etender-connect.com https://api.guestplan.com https://widget.guestplan.com https://cdn.guestplan.com https://pm.guestplan.app https://*.stripe.com https://business.untappd.com https://api.segment.io",
  "frame-src https://widget.guestplan.com https://guestplan.io https://challenges.cloudflare.com https://js.stripe.com https://m.stripe.network https://hooks.stripe.com https://business.untappd.com https://service2.loyaltyinabox.com",
  "form-action 'self' https:",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');
schrijf('_headers', `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN
${productie ? '' : '  X-Robots-Tag: noindex, nofollow\n'}
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/css/*
  Cache-Control: public, max-age=31536000, immutable
/js/*
  Cache-Control: public, max-age=31536000, immutable
/api/*
  X-Robots-Tag: noindex
`);

// ------------------------------------------------- Submap (GitHub Pages)
// Staat de site niet in de hoofdmap van een domein, maar in een submap (SITE_URL met een pad, zoals
// https://jelger1.github.io/de-wieetsjaf), dan krijgen alle root-relatieve paden die submap als voorvoegsel.
const basisPad = new URL(basisUrl).pathname.replace(/\/$/, '');
if (basisPad) {
  const pre = (u) => (u.startsWith('/') && !u.startsWith('//') && !u.startsWith(`${basisPad}/`) ? basisPad + u : u);
  const herschrijf = (s) => s
    .replace(/\b(href|src|action|poster)="(\/[^"]*)"/g, (_, a, u) => `${a}="${pre(u)}"`)
    .replace(/\b(srcset|imagesrcset)="([^"]*)"/g, (_, a, v) => `${a}="${v.split(',').map((d) => pre(d.trim())).join(', ')}"`)
    .replace(/url\((["']?)(\/[^)"']*)\1\)/g, (_, q, u) => `url(${q}${pre(u)}${q})`)
    .replace(/"(start_url|src|apiPad)":\s*"(\/[^"]*)"/g, (_, k, u) => `"${k}":"${pre(u)}"`)
    .replace(/(['"])\/api\//g, `$1${basisPad}/api/`);
  for (const f of fs.readdirSync(DIST, { recursive: true }).map(String).filter((x) => /\.(html|css|js|webmanifest)$/.test(x))) {
    const p = path.join(DIST, f);
    fs.writeFileSync(p, herschrijf(fs.readFileSync(p, 'utf8')));
  }
}

// ------------------------------------------------------------ Wisselen
const oud = `${DOEL}-oud-${process.pid}`;
for (let poging = 0; ; poging++) {
  try {
    if (fs.existsSync(DOEL)) fs.renameSync(DOEL, oud);
    fs.renameSync(DIST, DOEL);
    break;
  } catch (e) {
    if (poging > 20) throw e;
    await new Promise((r) => setTimeout(r, 150));
  }
}
fs.rmSync(oud, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });

// ------------------------------------------------------------- Verslag
const grootte = (rel) => (fs.statSync(path.join(DOEL, rel)).size / 1024).toFixed(1);
console.log(`Gebouwd in ${Date.now() - t0} ms → dist/ (${productie ? 'PRODUCTIE' : 'lokaal'}${testmodus ? ', TESTDATA' : ''})`);
console.log(`  ${paginas.length} pagina's · css ${grootte('css/site.css')} kB · versie ${versie} · basis-URL ${basisUrl}`);
for (const w of waarschuwingen) console.log(`  ! ${w}`);
