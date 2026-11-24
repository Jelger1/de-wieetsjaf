// Untappd for Business – server-side proxy-kern.
// Platformonafhankelijk: gebruikt alleen fetch, AbortController en een meegegeven cache.
// Documentatie: https://docs.business.untappd.com/  (zie docs/03-untappd-integratie.md)
//
// Beveiliging:
// - Het API-token komt uitsluitend uit omgevingsvariabelen en verlaat de server nooit.
// - Gebruik een READ-ONLY token (Untappd: Settings & Integrations > API Access).
// - Alle externe tekst wordt opgeschoond en ingekort; URL's alleen https en alleen Untappd-domeinen.

const API_BASIS = 'https://business.untappd.com/api/v1';
const CACHE_SLEUTEL = 'bierkaart:v1';
const LAATST_GOED_SLEUTEL = 'bierkaart:laatst-goed:v1';

export function leesConfig(env = {}) {
  const getal = (v, std) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : std);
  return {
    email: env.UNTAPPD_API_EMAIL || '',
    token: env.UNTAPPD_API_TOKEN || '',
    menuId: env.UNTAPPD_MENU_ID || '',
    locationId: env.UNTAPPD_LOCATION_ID || '',
    cacheSeconden: Math.max(60, getal(env.UNTAPPD_CACHE_SECONDEN, 900)),
    timeoutMs: Math.min(20000, Math.max(1000, getal(env.UNTAPPD_TIMEOUT_MS, 8000))),
    nieuwDagen: getal(env.UNTAPPD_NIEUW_DAGEN, 14),
    bronNaam: env.UNTAPPD_SOURCE_NAME || 'Website Dé Wieëtsjaf',
  };
}

export const isGeconfigureerd = (c) => Boolean(c.email && c.token && /^\d+$/.test(String(c.menuId)));

/* ---------------------------------------------------------- Opschonen */
const MAX = { naam: 120, brouwerij: 120, stijl: 80, plaats: 80, beschrijving: 600, sectie: 80, container: 40 };

export function schoonTekst(v, max = 200) {
  if (v == null) return '';
  return String(v)
    .replace(/<[^>]*>/g, ' ')           // geen HTML uit externe bron
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

const TOEGESTANE_HOSTS = [/(^|\.)untappd\.com$/i, /(^|\.)untappd\.akamaized\.net$/i, /(^|\.)untp\.beer$/i];
export function schoonUrl(v) {
  if (!v || typeof v !== 'string') return null;
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:') return null;
    if (!TOEGESTANE_HOSTS.some((r) => r.test(u.hostname))) return null;
    return u.toString();
  } catch { return null; }
}

const getalOfNull = (v, min, max) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 100) / 100 : null;
};

function normaliseerItem(item, { nu, nieuwDagen }) {
  if (!item || typeof item !== 'object') return null;
  const naam = schoonTekst(item.name, MAX.naam);
  if (!naam) return null;
  const gemaakt = Date.parse(item.created_at);
  const containers = (Array.isArray(item.containers) ? item.containers : [])
    .map((c) => ({
      naam: schoonTekst(c?.container_size?.name || c?.name, MAX.container),
      prijs: getalOfNull(c?.price, 0, 1000),
      valuta: /^[A-Z]{3}$/.test(c?.currency || '') ? c.currency : 'EUR',
    }))
    .filter((c) => c.naam || c.prijs != null)
    .slice(0, 6);
  return {
    id: String(item.id ?? '').replace(/[^\w-]/g, '').slice(0, 24),
    type: schoonTekst(item.type, 30) || 'beer',
    naam,
    brouwerij: schoonTekst(item.brewery, MAX.brouwerij),
    plaats: schoonTekst(item.brewery_location, MAX.plaats),
    land: schoonTekst(item.brewery_country, MAX.plaats),
    stijl: schoonTekst(item.style, MAX.stijl),
    abv: getalOfNull(item.abv, 0, 80),
    ibu: getalOfNull(item.ibu, 0, 300),
    beschrijving: schoonTekst(item.description, MAX.beschrijving),
    tap: schoonTekst(item.tap_number, 6),
    label: schoonUrl(item.label_image_thumb) || schoonUrl(item.label_image),
    containers,
    nitro: item.nitro === true,
    cask: item.cask === true,
    nieuw: Number.isFinite(gemaakt) ? (nu - gemaakt) / 864e5 <= nieuwDagen : false,
    toegevoegd: Number.isFinite(gemaakt) ? new Date(gemaakt).toISOString() : null,
  };
}

/** Zet een Untappd 'full' menu-antwoord om naar ons eigen, gevalideerde formaat. */
export function normaliseerMenu(json, { nu = Date.now(), nieuwDagen = 14 } = {}) {
  const menu = json?.menu;
  if (!menu || typeof menu !== 'object' || !Array.isArray(menu.sections)) {
    throw new Error('Onverwacht antwoord van Untappd: geen menu met secties.');
  }
  if (menu.unpublished === true) throw new Error('Het Untappd-menu staat op ongepubliceerd.');
  const sectie = (s) => ({
    id: String(s.id ?? '').replace(/[^\w-]/g, '').slice(0, 24),
    naam: schoonTekst(s.name, MAX.sectie) || 'Bieren',
    items: (Array.isArray(s.items) ? s.items : []).map((i) => normaliseerItem(i, { nu, nieuwDagen })).filter(Boolean),
  });
  const secties = menu.sections.filter((s) => s && s.public !== false).map(sectie).filter((s) => s.items.length);
  const opDek = menu.on_deck_section && menu.on_deck_section.public !== false ? sectie(menu.on_deck_section) : null;
  return {
    menu: { naam: schoonTekst(menu.name, 120), bijgewerkt: Date.parse(menu.updated_at) ? new Date(menu.updated_at).toISOString() : null },
    secties,
    binnenkort: opDek && opDek.items.length ? opDek : null,
    aantal: secties.reduce((n, s) => n + s.items.length, 0),
  };
}

/* ----------------------------------------------------------- Ophalen */
async function haalJson(url, c) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), c.timeoutMs);
  try {
    const auth = typeof btoa === 'function' ? btoa(`${c.email}:${c.token}`) : Buffer.from(`${c.email}:${c.token}`).toString('base64');
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) {
      const fout = new Error(`Untappd antwoordde met HTTP ${res.status}`);
      fout.status = res.status;
      throw fout;
    }
    const tekst = await res.text();
    if (tekst.length > 5_000_000) throw new Error('Antwoord van Untappd is onverwacht groot.');
    return JSON.parse(tekst);
  } finally { clearTimeout(t); }
}

/**
 * Hoofdfunctie. cache: { get(key) -> Promise<obj|null>, put(key, obj, ttlSeconden) -> Promise }
 * Geeft altijd een object terug dat veilig naar de browser kan (nooit het token).
 */
export async function bierkaart({ env, cache, nu = Date.now(), forceer = false }) {
  const c = leesConfig(env);
  if (!isGeconfigureerd(c)) {
    return { status: 'niet-geconfigureerd', bericht: 'De Untappd-API is (nog) niet ingesteld. Gebruik de officiële embed of stel de omgevingsvariabelen in.' };
  }
  if (!forceer) {
    const vers = await cache.get(CACHE_SLEUTEL).catch(() => null);
    if (vers && vers.opgehaald && nu - Date.parse(vers.opgehaald) < c.cacheSeconden * 1000) return { ...vers, cache: 'hit' };
  }
  try {
    const json = await haalJson(`${API_BASIS}/menus/${encodeURIComponent(c.menuId)}?full=true&source_name=${encodeURIComponent(c.bronNaam)}`, c);
    const data = normaliseerMenu(json, { nu, nieuwDagen: c.nieuwDagen });
    const resultaat = { status: 'ok', bron: 'untappd-api', testdata: false, opgehaald: new Date(nu).toISOString(), ...data };
    await cache.put(CACHE_SLEUTEL, resultaat, c.cacheSeconden).catch(() => {});
    await cache.put(LAATST_GOED_SLEUTEL, resultaat, 60 * 60 * 24 * 30).catch(() => {});
    return { ...resultaat, cache: 'miss' };
  } catch (e) {
    const laatst = await cache.get(LAATST_GOED_SLEUTEL).catch(() => null);
    const reden = e.name === 'AbortError' ? 'time-out' : (e.status === 401 || e.status === 403 ? 'geen toegang' : 'storing');
    if (laatst) return { ...laatst, status: 'verouderd', reden, cache: 'laatst-goed' };
    return { status: 'fout', reden, bericht: 'De bierkaart kon niet worden opgehaald.' };
  }
}

/* --------------------------------------------------------- Caches */
export function geheugenCache() {
  const m = new Map();
  return {
    async get(k) { const v = m.get(k); if (!v) return null; if (v.tot < Date.now()) { m.delete(k); return null; } return v.waarde; },
    async put(k, waarde, ttl) { m.set(k, { waarde, tot: Date.now() + ttl * 1000 }); },
  };
}
