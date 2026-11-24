// Herbruikbare bouwstenen voor pagina's.
import { esc, html, fmtPrijs, fmtEuro, datumDelen, fmtDatum, picture, icoon } from '../lib/html.mjs';
import { WEEKVOLGORDE, DAGNAMEN, fmtBereik, volgendeEersteMaandagen } from '../../js/modules/tijden.js';

/* ---------------------------------------------------------- Menukaart */
const VEG_LABEL = { V: 'Vegetarisch', 'V*': 'Vegetarisch mogelijk' };

export function vegTeken(veg) {
  if (!veg) return '';
  return `<abbr class="veg" title="${VEG_LABEL[veg]}"><span aria-hidden="true">${veg}</span><span class="sr-only">${VEG_LABEL[veg]}</span></abbr>`;
}

function prijsHtml(item) {
  if (item.prijzen) {
    return item.prijzen.map((p) => `<span class="gerecht__variant"><small>${esc(p.label)}</small> ${fmtPrijs(p.prijs)}</span>`).join('<span aria-hidden="true"> · </span>');
  }
  if (item.toeslag) return `<small>toeslag</small> +${fmtPrijs(item.toeslag)}`;
  if (item.prijs != null) return fmtPrijs(item.prijs);
  return '';
}

export function gerecht(item, { allergenen = false } = {}) {
  const merken = [
    item.favoriet ? `<span class="gerecht__merk" title="Favoriet van het huis">${icoon('hart', 'merk-hart')}<span class="sr-only">Favoriet van het huis</span></span>` : '',
    item.streek ? `<span class="gerecht__merk" title="Lokaal recept">${icoon('pin', 'merk-pin')}<span class="sr-only">Lokaal recept</span></span>` : '',
  ].join('');
  const zoek = [item.naam, item.omschrijving].filter(Boolean).join(' ').toLowerCase();
  return html`<li class="gerecht" data-zoek="${esc(zoek)}" data-veg="${item.veg || ''}">
    <span class="gerecht__naam">${merken}${esc(item.naam)} ${vegTeken(item.veg)}</span>
    <span class="gerecht__prijs">${prijsHtml(item)}</span>
    ${item.omschrijving ? `<span class="gerecht__oms">${esc(item.omschrijving)}</span>` : ''}
    ${item.tip ? `<span class="gerecht__tip">${esc(item.tip)}</span>` : ''}
    ${allergenen && Array.isArray(item.allergenen) ? `<span class="gerecht__allergenen">${item.allergenen.length ? `Bevat: ${esc(item.allergenen.join(', '))}` : 'Geen van de 14 hoofdallergenen'}</span>` : ''}
  </li>`;
}

export function gerechtenLijst(items, opties = {}) {
  return `<ul class="gerechten">${items.map((i) => gerecht(i, opties)).join('')}</ul>`;
}

/** Vind een gerecht op naam in de menukaartdata (voor uitlichtingen op andere pagina's). */
export function zoekGerecht(menu, naam) {
  for (const k of menu.kaarten) for (const g of k.groepen) for (const i of (g.items || [])) if (i.naam === naam) return i;
  return null;
}

/* ------------------------------------------------------- Openingstijden */
export function tijdenTabel(tijden, soort = 'zaak', { caption = '', id = '' } = {}) {
  return html`<table class="tijden"${id ? ` id="${id}"` : ''} data-tijden="${soort}">
    ${caption ? `<caption>${esc(caption)}</caption>` : ''}
    <tbody>
      ${WEEKVOLGORDE.map((d) => `<tr data-dag="${d}"><th scope="row">${DAGNAMEN[d]}</th><td>${fmtBereik(tijden[soort][d])}</td></tr>`)}
    </tbody>
  </table>`;
}

export function keukenSamenvatting(tijden) {
  const sluit = new Set(WEEKVOLGORDE.map((d) => tijden.keuken[d]?.[1]).filter(Boolean));
  return sluit.size === 1 ? `Keuken dagelijks tot ${[...sluit][0].replace(':', '.')} uur` : 'Keukentijden verschillen per dag';
}

/* ---------------------------------------------------------------- Agenda */
export function komendeEvenementen(ctx, { max = 20 } = {}) {
  const vandaag = ctx.vandaag;
  const lijst = [];
  for (const e of ctx.agenda.evenementen) {
    const eind = (e.eindOnbekend ? e.start : (e.eind || e.start)).slice(0, 10);
    if (eind >= vandaag) lijst.push({ ...e, soort: 'evenement' });
  }
  for (const t of ctx.agenda.terugkerend) {
    if (t.regel !== 'eerste-maandag') continue;
    const [eerst] = volgendeEersteMaandagen(vandaag, 1, t.uitzonderingen || []);
    if (eerst) {
      lijst.push({
        id: t.id, soort: 'terugkerend', titel: t.titel, start: `${eerst}T${t.tijd}`, tijd: t.tijd,
        kort: t.kort, brouwerij: t.brouwerijPerDatum?.[eerst] || null, link: '/agenda/beermonday/',
        datumTekst: `${fmtDatum(eerst)}, vanaf ${t.tijd.replace(':', '.')} uur`,
      });
    }
  }
  return lijst.sort((a, b) => a.start.localeCompare(b.start)).slice(0, max);
}

export function evenementLink(e) { return e.link && e.soort === 'terugkerend' ? e.link : `/agenda/${e.id}/`; }

export function agendaRij(ctx, e, { kop = 'h3', knop = true } = {}) {
  const d = datumDelen(e.start);
  const eindDelen = e.eind && !e.eindOnbekend && e.eind.slice(0, 10) !== e.start.slice(0, 10) ? datumDelen(e.eind) : null;
  const dagTekst = eindDelen ? `${d.dag}–${eindDelen.dag}` : String(d.dag);
  const eindIso = (e.eindOnbekend ? e.start : (e.eind || e.start)).slice(0, 10);
  return html`<li class="agenda__item" data-eind="${eindIso}">
    <p class="datumblok" aria-hidden="true"><span class="datumblok__dag${eindDelen ? ' datumblok__dag--bereik' : ''}">${dagTekst}</span><span class="datumblok__maand">${d.maandKort}</span><span class="datumblok__wd">${d.weekdag}</span></p>
    <div class="agenda__tekst">
      <${kop}><a href="${evenementLink(e)}">${esc(e.titel)}${e.brouwerij ? `: ${esc(e.brouwerij)}` : ''}</a></${kop}>
      <p class="agenda__meta">${esc(e.datumTekst || fmtDatum(e.start))}${e.prijs ? ` · ${esc(e.prijs)}` : ''}</p>
      <p>${esc(e.kort)}</p>
    </div>
    ${knop && e.reserveren?.verplicht ? `<div class="agenda__actie">${reserveerLink(ctx, e)}</div>` : ''}
  </li>`;
}

function reserveerLink(ctx, e) {
  const g = ctx.integraties.reserveren.guestplan;
  const service = e.reserveren?.guestplanService;
  const href = service ? g.serviceLink.replace('{service}', service).replace('{accessKey}', g.accessKey) : g.directeLink;
  return `<a class="knop knop--rand" href="${esc(href)}" data-reserveer${service ? ` data-service="${esc(service)}"` : ''} data-bron="agenda-${esc(e.id)}" rel="noopener">Reserveer<span class="sr-only"> voor ${esc(e.titel)}</span></a>`;
}

export function evenementJsonLd(ctx, e) {
  const plaats = {
    '@type': 'Place', name: ctx.site.naam,
    address: { '@type': 'PostalAddress', streetAddress: ctx.site.adres.straat, postalCode: ctx.site.adres.postcode, addressLocality: ctx.site.adres.plaats, addressCountry: 'NL' },
  };
  const tijd = (iso) => (iso.length > 10 ? `${iso}:00${offsetAmsterdam(iso)}` : iso);
  const j = {
    '@context': 'https://schema.org', '@type': 'Event', name: e.titel, description: e.omschrijving || e.kort,
    startDate: tijd(e.start), eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: plaats,
    organizer: { '@type': 'Organization', name: ctx.site.naam, url: ctx.basisUrl },
    url: ctx.basisUrl + evenementLink(e),
  };
  if (e.eind && !e.eindOnbekend) j.endDate = tijd(e.eind);
  if (e.prijsWaarde != null) j.offers = { '@type': 'Offer', price: e.prijsWaarde.toFixed(2), priceCurrency: 'EUR', url: ctx.basisUrl + evenementLink(e), availability: 'https://schema.org/InStock' };
  return j;
}

/** UTC-offset van Europe/Amsterdam op een datum (zomertijd: laatste zondag maart t/m laatste zondag oktober). */
function offsetAmsterdam(iso) {
  const [j, m, d] = iso.slice(0, 10).split('-').map(Number);
  const laatsteZondag = (maand) => { const x = new Date(Date.UTC(j, maand, 0)); return x.getUTCDate() - x.getUTCDay(); };
  const zomer = (m > 3 && m < 10) || (m === 3 && d >= laatsteZondag(3)) || (m === 10 && d < laatsteZondag(10));
  return zomer ? '+02:00' : '+01:00';
}

/* ---------------------------------------------------------- Sanctus-lenzen */
export const SANCTUS = [
  { id: 'fusion', naam: 'Sanctus Fusion', stijl: 'IPA', abv: '7,5%', smaak: 'Citrus, hop en tropisch fruit' },
  { id: 'mordax', naam: 'Sanctus Mordax', stijl: 'Belgian Blond', abv: '6,5%', smaak: 'Vlierbloesem en szechuanpeper: licht, fris en tintelend' },
  { id: 'equinox', naam: 'Sanctus Equinox', stijl: 'Brown IPA', abv: '8%', smaak: 'Donker, zacht en hoppig. Mout en hop in balans, zoals dag en nacht' },
];

export function lenzen({ kop = 'h3' } = {}) {
  return html`<ul class="lenzen">
    ${SANCTUS.map((b) => `<li class="lens">${picture(`lens-${b.id}`, { sizes: '(min-width: 56rem) 13rem, 60vw', alt: `Taplens van ${b.naam}` })}
      <${kop}>${b.naam.replace('Sanctus ', 'Sanctus <br>')}</${kop}>
      <p><strong>${b.stijl} · ${b.abv}</strong><br>${b.smaak}</p></li>`)}
  </ul>`;
}

export function datumBlokTekst(iso) { const d = datumDelen(iso); return `${d.weekdag} ${d.dag} ${d.maand}`; }
export { fmtEuro, fmtDatum };
