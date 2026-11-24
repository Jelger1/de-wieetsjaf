// Bierkaart: haalt de actuele kaart op via onze eigen server-proxy (/api/bierkaart, die Untappd aanroept)
// en vervangt daarmee de lijst die bij het bouwen in de pagina is gezet. Zoeken en filteren werken op de lijst.
// Veiligheid: externe tekst gaat uitsluitend via textContent naar de pagina, nooit via innerHTML.
import { leesConfig } from '../config.js';

const cfg = leesConfig().bierkaart || {};
const lijstEl = document.querySelector('[data-bierkaart]');
const previewEl = document.querySelector('[data-bierpreview]');

const el = (tag, klasse, tekst) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
};
const fmtAbv = (n) => (n == null ? '' : `${String(n).replace('.', ',')}%`);
const fmtPrijs = (p) => (p == null ? '' : `€ ${Number(p).toFixed(2).replace('.', ',')}`);
const fmtMoment = (iso) => new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Ruwe stijlgroepen voor de filters, afgeleid van de Untappd-stijlnaam. */
const STIJLGROEPEN = [
  ['IPA & pale ale', /ipa|pale ale|apa|neipa/i],
  ['Blond, tripel & quadrupel', /blond|tripel|quadrupel|dubbel|golden|strong ale|abbey|trappist|saison/i],
  ['Donker & stout', /stout|porter|bock|brown|dark|schwarz|barley ?wine|scotch/i],
  ['Zuur & fruit', /sour|gose|lambic|geuze|gueuze|kriek|fruit|wild ale|berliner/i],
  ['Wit & weizen', /wit|wheat|weizen|weiss|blanche/i],
  ['Pils & lager', /pils|lager|helles|k(ö|o)lsch|pilsner/i],
  ['Alcoholvrij', /non-alcoholic|alcoholvrij|alcohol-free|0\.0/i],
];
const stijlGroep = (b) => {
  if (b.type === 'non_alcoholic' || b.abv === 0) return 'Alcoholvrij';
  const hit = STIJLGROEPEN.find(([, re]) => re.test(b.stijl || ''));
  return hit ? hit[0] : 'Overig';
};

function bierRegel(b) {
  const li = el('li', 'bier');
  li.dataset.zoek = [b.naam, b.brouwerij, b.stijl].join(' ').toLowerCase();
  li.dataset.groep = stijlGroep(b);
  const tap = el('span', b.tap ? 'bier__tap' : 'bier__tap bier__tap--leeg', b.tap || '');
  if (b.tap) tap.setAttribute('aria-label', `Tap ${b.tap}`); else tap.setAttribute('aria-hidden', 'true');
  const tekst = el('div', 'bier__tekst');
  const naam = el('p', 'bier__naam', b.naam);
  if (b.nieuw) { naam.append(' '); naam.append(el('span', 'bier__nieuw', 'Nieuw')); }
  tekst.append(naam);
  const herkomst = [b.brouwerij, b.plaats].filter(Boolean).join(', ');
  if (herkomst) tekst.append(el('p', 'bier__brouwerij', herkomst));
  const meta = [b.stijl, fmtAbv(b.abv), b.ibu != null ? `${b.ibu} IBU` : '', b.nitro ? 'nitro' : ''].filter(Boolean).join(' · ');
  if (meta) tekst.append(el('p', 'bier__meta', meta));
  li.append(tap, tekst);
  const cont = (b.containers || []).map((c) => [c.naam, fmtPrijs(c.prijs)].filter(Boolean).join(' ')).filter(Boolean).join(' · ');
  if (cont) li.append(el('p', 'bier__prijs', cont));
  return li;
}

function render(doel, data, { max = Infinity } = {}) {
  const frag = document.createDocumentFragment();
  if (data.testdata) frag.append(el('p', 'melding melding--testdata', 'TESTDATA – fictieve bieren en prijzen, alleen lokaal'));
  let teller = 0;
  for (const s of data.secties || []) {
    const items = s.items.slice(0, Math.max(0, max - teller));
    teller += items.length;
    if (!items.length) continue;
    const sec = el('section', 'biersectie');
    sec.dataset.sectie = s.naam;
    sec.append(el('h3', 'biersectie__kop', s.naam));
    const ul = el('ul', 'bieren');
    items.forEach((b) => ul.append(bierRegel(b)));
    sec.append(ul);
    frag.append(sec);
  }
  if (data.binnenkort && max === Infinity) {
    const sec = el('section', 'biersectie biersectie--binnenkort');
    sec.append(el('h3', 'biersectie__kop', 'Binnenkort op de tap'));
    const ul = el('ul', 'bieren');
    data.binnenkort.items.forEach((b) => ul.append(bierRegel(b)));
    sec.append(ul);
    frag.append(sec);
  }
  const p = el('p', 'bierbijgewerkt klein');
  p.dataset.bijgewerkt = '';
  p.append('Laatst bijgewerkt via Untappd: ');
  const t = el('time', null, fmtMoment(data.opgehaald));
  t.dateTime = data.opgehaald;
  p.append(t);
  frag.append(p);
  doel.replaceChildren(frag);
}

function zetStatus(tekst, ok) {
  const s = document.querySelector('[data-bierstatus-tekst]');
  if (!s) return;
  s.textContent = tekst;
  s.dataset.open = String(ok);
  s.hidden = false;
}

function initGereedschap() {
  const gereedschap = document.querySelector('[data-biergereedschap]');
  if (!gereedschap || !lijstEl) return;
  const zoek = gereedschap.querySelector('[data-bierzoek]');
  const filters = gereedschap.querySelector('[data-bierfilters]');
  const teller = gereedschap.querySelector('[data-bierteller]');
  const regels = () => [...lijstEl.querySelectorAll('.bier')];
  if (!regels().length) return;
  // Filters op basis van wat er werkelijk op de kaart staat
  regels().forEach((li) => { if (!li.dataset.groep) li.dataset.groep = 'Overig'; });
  const secties = [...lijstEl.querySelectorAll('.biersectie')].map((s) => s.dataset.sectie).filter(Boolean);
  const groepen = [...new Set(regels().map((li) => li.dataset.groep))].sort((a, b) => (a === 'Overig') - (b === 'Overig') || a.localeCompare(b));
  filters.querySelectorAll('.filter').forEach((f) => f.remove());
  const maakFilter = (waarde, soort) => {
    const label = el('label', 'filter');
    const input = el('input');
    input.type = 'checkbox'; input.value = waarde; input.dataset.soort = soort;
    label.append(input, el('span', null, waarde));
    filters.append(label);
  };
  if (secties.length > 1) secties.forEach((s) => maakFilter(s, 'sectie'));
  if (groepen.length > 1) groepen.forEach((g) => maakFilter(g, 'groep'));
  filters.hidden = filters.querySelectorAll('.filter').length === 0;

  const pasToe = () => {
    const q = zoek.value.trim().toLowerCase();
    const aan = [...filters.querySelectorAll('input:checked')];
    const sec = aan.filter((i) => i.dataset.soort === 'sectie').map((i) => i.value);
    const grp = aan.filter((i) => i.dataset.soort === 'groep').map((i) => i.value);
    let zichtbaar = 0;
    regels().forEach((li) => {
      const sectie = li.closest('.biersectie')?.dataset.sectie;
      const ok = (!q || li.dataset.zoek.includes(q)) && (!sec.length || sec.includes(sectie)) && (!grp.length || grp.includes(li.dataset.groep));
      li.hidden = !ok;
      if (ok) zichtbaar += 1;
    });
    lijstEl.querySelectorAll('.biersectie').forEach((s) => { s.hidden = ![...s.querySelectorAll('.bier')].some((li) => !li.hidden); });
    teller.textContent = zichtbaar === regels().length ? `${zichtbaar} bieren` : `${zichtbaar} van ${regels().length} bieren`;
  };
  zoek.addEventListener('input', pasToe);
  filters.addEventListener('change', pasToe);
  gereedschap.hidden = false;
  pasToe();
}

function toonEmbedKeuze() {
  const embed = document.querySelector('[data-bierembed]');
  if (!embed || cfg.modus === 'api') return;
  embed.hidden = false;
  const knop = embed.querySelector('[data-bierembed-laad]');
  const houder = embed.querySelector('[data-bierembed-houder]');
  knop?.addEventListener('click', () => {
    // Officiële Untappd for Business iframe-embed (zelfde code als de huidige website).
    const iframe = document.createElement('iframe');
    iframe.src = cfg.embed.iframeUrl;
    iframe.title = 'Actuele bierkaart van Dé Wieëtsjaf op Untappd';
    iframe.loading = 'lazy';
    iframe.className = 'bierembed__iframe';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    houder.replaceChildren(iframe);
    knop.closest('.kader').hidden = true;
    iframe.focus();
  }, { once: true });
}

async function laad() {
  if (!lijstEl && !previewEl) return;
  // Lokale testmodus: de bouwstap zet testdata klaar (nooit in productie)
  const testUrl = document.documentElement.dataset.testdata ? '/api/bierkaart.testdata.json' : null;
  let data = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(testUrl || cfg.apiPad || '/api/bierkaart', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    clearTimeout(t);
    if (res.ok && (res.headers.get('content-type') || '').includes('json')) data = await res.json();
  } catch { /* netwerk of time-out: val terug op wat er al staat */ }

  const heeftLijst = data && (data.status === 'ok' || data.status === 'verouderd') && Array.isArray(data.secties) && data.secties.length;
  if (heeftLijst) {
    if (data.testdata) document.documentElement.dataset.testdata = 'true';
    if (lijstEl) render(lijstEl, data);
    if (previewEl) render(previewEl, data, { max: 6 });
    const uren = (Date.now() - Date.parse(data.opgehaald)) / 36e5;
    if (data.status === 'verouderd' || uren > (cfg.verouderdNaUren || 24)) {
      zetStatus(`Mogelijk niet actueel: laatst bijgewerkt op ${fmtMoment(data.opgehaald)}`, false);
    } else {
      zetStatus('Actueel via Untappd', true);
    }
    initGereedschap();
    return;
  }
  // Geen data via de API. Staat er al een (opgeslagen) lijst? Dan tonen we die met een waarschuwing.
  const statisch = lijstEl?.querySelector('.bier');
  if (statisch) {
    zetStatus('De actuele kaart kon niet worden opgehaald. Hieronder de laatst opgeslagen versie.', false);
    initGereedschap();
  } else if (data?.status === 'fout') {
    zetStatus('De bierkaart is tijdelijk niet beschikbaar.', false);
  }
  if (lijstEl) toonEmbedKeuze();
}

laad();
