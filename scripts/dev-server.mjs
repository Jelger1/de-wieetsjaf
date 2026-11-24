// Lokale ontwikkelserver zonder afhankelijkheden.
// - Serveert dist/ op http://localhost:4321
// - /api/bierkaart via dezelfde kern als in productie (api/lib/untappd.mjs), met .env voor de sleutels
// - Bouwt automatisch opnieuw bij wijzigingen (met --watch)
// - --testdata: gebruikt de duidelijk gemarkeerde lokale testdata voor de bierkaart
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { bierkaart, geheugenCache } from '../api/lib/untappd.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const PORT = Number(process.env.PORT || 4321);
const testdata = args.has('--testdata');

// .env inlezen (alleen lokaal; nooit committen)
const env = { ...process.env };
const envPad = path.join(ROOT, '.env');
if (fs.existsSync(envPad)) {
  for (const regel of fs.readFileSync(envPad, 'utf8').split(/\r?\n/)) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !m[2].startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const cache = geheugenCache();

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf',
};

function bouw() {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, 'scripts/build.mjs'), ...(testdata ? ['--testdata'] : [])], { stdio: 'inherit' });
    p.on('exit', resolve);
  });
}

function globaleHeaders() {
  const f = path.join(DIST, '_headers');
  if (!fs.existsSync(f)) return {};
  // Eerste blok ('/*') uit dist/_headers: dezelfde beveiligingsheaders als in productie
  const blok = fs.readFileSync(f, 'utf8').split(/\n(?=\S)/)[0].split('\n').slice(1);
  return Object.fromEntries(blok.map((r) => r.trim()).filter(Boolean)
    .map((r) => [r.slice(0, r.indexOf(':')), r.slice(r.indexOf(':') + 1).trim()])
    .filter(([k]) => k !== 'X-Robots-Tag')
    // Lokaal is er geen https: zonder deze regel zou WebKit localhost-verzoeken naar https omzetten
    .map(([k, v]) => [k, k === 'Content-Security-Policy' ? v.replace(/;\s*upgrade-insecure-requests/, '') : v]));
}

function redirects() {
  const f = path.join(DIST, '_redirects');
  if (!fs.existsSync(f)) return new Map();
  return new Map(fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((r) => { const [van, naar, code] = r.split(/\s+/); return [van, { naar, code: Number(code) || 301 }]; }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let p = decodeURIComponent(url.pathname);

  if (p === '/api/bierkaart') {
    const data = testdata
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bierkaart.testdata.json'), 'utf8'))
      : await bierkaart({ env, cache });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(data));
  }

  const r = redirects().get(p);
  if (r) { res.writeHead(r.code, { Location: r.naar }); return res.end(); }

  let bestand = path.join(DIST, p);
  if (!bestand.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(bestand) && fs.statSync(bestand).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { Location: `${p}/${url.search}` }); return res.end(); }
    bestand = path.join(bestand, 'index.html');
  }
  if (!fs.existsSync(bestand)) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    const nf = path.join(DIST, '404.html');
    return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Niet gevonden');
  }
  const ext = path.extname(bestand);
  const kopjes = { ...(ext === '.html' ? globaleHeaders() : {}), 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': /\/(assets|css|js)\//.test(p) ? 'public, max-age=31536000, immutable' : 'no-cache', ...(process.env.MEET ? {} : { 'X-Robots-Tag': 'noindex' }) };
  // Comprimeren zoals een echte host (brotli of gzip) voor tekstbestanden
  const tekst = ['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt', '.webmanifest'].includes(ext);
  const acc = String(req.headers['accept-encoding'] || '');
  if (tekst && /\bbr\b/.test(acc)) {
    res.writeHead(200, { ...kopjes, 'Content-Encoding': 'br', Vary: 'Accept-Encoding' });
    return fs.createReadStream(bestand).pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })).pipe(res);
  }
  if (tekst && /\bgzip\b/.test(acc)) {
    res.writeHead(200, { ...kopjes, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    return fs.createReadStream(bestand).pipe(zlib.createGzip({ level: 9 })).pipe(res);
  }
  res.writeHead(200, kopjes);
  fs.createReadStream(bestand).pipe(res);
});

if (!args.has("--geen-bouw")) await bouw();
server.listen(PORT, () => console.log(`\nDé Wieëtsjaf lokaal: http://localhost:${PORT}${testdata ? '  (TESTDATA bierkaart)' : ''}\n`));

if (args.has('--watch')) {
  let timer = null;
  const opnieuw = () => { clearTimeout(timer); timer = setTimeout(() => bouw(), 150); };
  for (const map of ['src', 'css', 'js', 'data', 'assets/brand', 'assets/icons']) {
    fs.watch(path.join(ROOT, map), { recursive: true }, (_e, f) => { if (f && !String(f).includes('generated')) opnieuw(); });
  }
  console.log('Wacht op wijzigingen in src/, css/, js/, data/ …');
}
