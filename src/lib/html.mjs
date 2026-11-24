// Kleine, veilige HTML-hulpmiddelen voor de bouwstap. Alle tekst uit data gaat door esc().
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const root = ROOT;

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Template-tag die ingevoegde waarden NIET escapet (gebruik esc() expliciet). Voegt arrays samen. */
export const html = (strings, ...vals) => strings.reduce((out, s, i) => {
  const v = vals[i - 1];
  const txt = Array.isArray(v) ? v.join('') : (v === false || v == null ? '' : String(v));
  return out + txt + s;
});

export const leesJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

/** 15 -> "15,-", 15.5 -> "15,50", 0.75 -> "0,75" (kaartnotatie, prijzen in euro) */
export function fmtPrijs(n) {
  if (n == null || Number.isNaN(n)) return '';
  if (Number.isInteger(n)) return `${n},-`;
  return n.toFixed(2).replace('.', ',');
}
export const fmtEuro = (n) => `€ ${Number.isInteger(n) ? `${n},-` : n.toFixed(2).replace('.', ',')}`;

const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export function datumDelen(iso) {
  const [j, m, d] = iso.slice(0, 10).split('-').map(Number);
  const dt = new Date(Date.UTC(j, m - 1, d));
  return { jaar: j, maand: MAANDEN[m - 1], maandKort: MAANDEN_KORT[m - 1], dag: d, weekdag: DAGEN[dt.getUTCDay()] };
}
export const fmtDatum = (iso) => { const p = datumDelen(iso); return `${p.weekdag} ${p.dag} ${p.maand} ${p.jaar}`; };

/** Beeldregister (data/afbeeldingen.json + generated) */
let REG, GEN;
function beeld(key) {
  REG ??= leesJson('data/afbeeldingen.json').items;
  GEN ??= fs.existsSync(path.join(ROOT, 'data/afbeeldingen.generated.json')) ? leesJson('data/afbeeldingen.generated.json') : {};
  const item = REG[key];
  const gen = GEN[key];
  if (!item || !gen) throw new Error(`Afbeelding '${key}' ontbreekt in het register of is nog niet gegenereerd (npm run images).`);
  const bestand = item.alias || key;
  return { item, gen, bestand };
}
export const beeldAlt = (key) => beeld(key).item.alt;
export const beeldRatio = (key) => beeld(key).gen.ratio;

/**
 * <picture> met AVIF + WebP en width/height tegen layoutverschuiving.
 * opts: sizes, klasse, laden ('lazy'|'eager'), prioriteit (fetchpriority=high), alt (overschrijft), decoratief
 */
export function picture(key, opts = {}) {
  const { item, gen, bestand } = beeld(key);
  const v = gen.varianten;
  const srcset = (ext) => v.map((x) => `/assets/images/${bestand}-${x.w}.${ext} ${x.w}w`).join(', ');
  const groot = v[v.length - 1];
  const sizes = opts.sizes || '100vw';
  const alt = opts.decoratief ? '' : (opts.alt ?? item.alt);
  const laden = opts.laden || 'lazy';
  return `<picture${opts.klasse ? ` class="${esc(opts.klasse)}"` : ''}>`
    + `<source type="image/avif" srcset="${srcset('avif')}" sizes="${esc(sizes)}">`
    + `<source type="image/webp" srcset="${srcset('webp')}" sizes="${esc(sizes)}">`
    + `<img src="/assets/images/${gen.fallback.replace(key, bestand)}" alt="${esc(alt)}" width="${groot.w}" height="${groot.h}"`
    + ` loading="${laden}" decoding="${laden === 'eager' ? 'sync' : 'async'}"${opts.prioriteit ? ' fetchpriority="high"' : ''}`
    + `${opts.imgKlasse ? ` class="${esc(opts.imgKlasse)}"` : ''}${opts.stijl ? ` style="${esc(opts.stijl)}"` : ''}></picture>`;
}

/** Inline SVG-icoon uit assets/icons (decoratief, aria-hidden). */
const ICONS = {};
export function icoon(naam, klasse = 'icoon') {
  ICONS[naam] ??= fs.readFileSync(path.join(ROOT, 'assets/icons', `${naam}.svg`), 'utf8').trim();
  return ICONS[naam].replace('<svg', `<svg class="${klasse}" aria-hidden="true" focusable="false"`);
}

export function woordmerk(klasse = 'woordmerk') {
  const svg = fs.readFileSync(path.join(ROOT, 'assets/brand/woordmerk.svg'), 'utf8').trim();
  return svg.replace('<svg', `<svg class="${klasse}" role="img" aria-label="Dé Wieëtsjaf, since 2008"`);
}

export const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
