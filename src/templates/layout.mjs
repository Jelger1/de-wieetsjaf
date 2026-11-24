// Paginaschil: <head>, kop met navigatie, voet, mobiele actiebalk.
import { esc, html, icoon, woordmerk } from '../lib/html.mjs';
import { WEEKVOLGORDE, DAGNAMEN, fmtBereik } from '../../js/modules/tijden.js';
import { keukenSamenvatting } from './componenten.mjs';

export const NAVIGATIE = [
  { href: '/menukaart/', label: 'Menukaart' },
  { href: '/bierkaart/', label: 'Bierkaart' },
  { href: '/agenda/', label: 'Agenda' },
  { href: '/arrangementen/', label: 'Arrangementen' },
  { href: '/groepen/', label: 'Groepen & De Kluis' },
  { href: '/over-ons/', label: 'Over ons' },
  { href: '/contact/', label: 'Contact' },
];

function navLink(item, actief, klasse = '') {
  const huidig = actief === item.href ? ' aria-current="page"' : (actief?.startsWith(item.href) && item.href !== '/' ? ' aria-current="true"' : '');
  return `<li><a href="${item.href}"${huidig}${klasse ? ` class="${klasse}"` : ''}>${esc(item.label)}</a></li>`;
}

export function reserveerKnop(ctx, { tekst = 'Reserveer een tafel', klasse = 'knop', service = null, bron = '' } = {}) {
  const g = ctx.integraties.reserveren.guestplan;
  const href = service ? g.serviceLink.replace('{service}', service).replace('{accessKey}', g.accessKey) : g.directeLink;
  return `<a class="${klasse}" href="${esc(href)}" data-reserveer${service ? ` data-service="${esc(service)}"` : ''}${bron ? ` data-bron="${esc(bron)}"` : ''} rel="noopener">${esc(tekst)}</a>`;
}

function kop(ctx, actief) {
  return html`
<header class="site-kop">
  <div class="container site-kop__binnen">
    <a class="site-kop__logo" href="/" aria-label="Dé Wieëtsjaf, naar de homepage">${woordmerk()}</a>
    <nav class="hoofdnav" id="hoofdnav" aria-label="Hoofdmenu">
      <ul class="hoofdnav__lijst">${NAVIGATIE.map((n) => navLink(n, actief))}</ul>
    </nav>
    <div class="site-kop__acties">
      ${reserveerKnop(ctx, { tekst: 'Reserveer', klasse: 'knop knop--reserveer', bron: 'kop' })}
      <button class="navknop" type="button" aria-expanded="false" aria-controls="navpaneel">${icoon('menu')}<span>Menu</span></button>
    </div>
  </div>
</header>
<div class="navpaneel donker" id="navpaneel" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="navpaneel__kop">
    <a href="/" aria-label="Dé Wieëtsjaf, naar de homepage">${woordmerk()}</a>
    <button class="navpaneel__sluit" type="button">${icoon('sluiten')}<span>Sluiten</span></button>
  </div>
  <nav aria-label="Hoofdmenu (mobiel)">
    <ul class="navpaneel__lijst">${[{ href: '/', label: 'Home' }, ...NAVIGATIE, { href: '/reserveren/', label: 'Reserveren' }].map((n) => navLink(n, actief))}</ul>
  </nav>
  <div class="navpaneel__voet">
    <span>${esc(ctx.site.adres.straat)}, ${esc(ctx.site.adres.plaats)}</span>
    <a href="tel:${ctx.site.telefoon.e164}">${esc(ctx.site.telefoon.weergave)}</a>
    <a href="mailto:${esc(ctx.site.email)}">${esc(ctx.site.email)}</a>
  </div>
</div>`;
}

function voet(ctx) {
  const s = ctx.site;
  const j = s.juridisch;
  const juridischeRegel = [j.statutaireNaam, j.kvkNummer && `KvK ${j.kvkNummer}`, j.btwId && `btw ${j.btwId}`].filter(Boolean).join(' · ');
  return html`
<footer class="site-voet donker">
  <div class="container">
    <div class="site-voet__raster">
      <div class="site-voet__merk">
        <a href="/" aria-label="Dé Wieëtsjaf, naar de homepage">${woordmerk()}</a>
        <p>Lunch, diner, borrel en feestzaal aan de Markt in Kerkrade. Sinds ${s.sinds}.</p>
      </div>
      <div>
        <h2>Bezoek</h2>
        <address>
          ${esc(s.adres.straat)}<br>${esc(s.adres.postcode)} ${esc(s.adres.plaats)}<br>
          <a href="tel:${s.telefoon.e164}">${esc(s.telefoon.weergave)}</a><br>
          <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>
        </address>
        <p class="klein" style="margin-top:var(--s-3)"><a href="${esc(s.routeUrl)}" rel="noopener">Route plannen</a></p>
      </div>
      <div>
        <h2>Open</h2>
        <dl class="site-voet__tijden">
          ${WEEKVOLGORDE.map((d) => `<dt>${DAGNAMEN[d].slice(0, 2)}</dt><dd>${fmtBereik(ctx.tijden.zaak[d])}</dd>`)}
        </dl>
        <p class="klein" style="margin-top:var(--s-3)">${keukenSamenvatting(ctx.tijden)}. <a href="/contact/#openingstijden">Alle tijden</a></p>
      </div>
      <nav aria-label="Ontdek">
        <h2>Ontdek</h2>
        <ul>
          <li><a href="/reserveren/">Reserveren</a></li>
          <li><a href="/menukaart/">Menukaart</a></li>
          <li><a href="/bierkaart/">Bierkaart</a></li>
          <li><a href="/agenda/">Agenda & Beermonday</a></li>
          <li><a href="/groepen/">Groepen & De Kluis</a></li>
          <li><a href="/cadeaukaart/">Cadeaukaart</a></li>
          <li><a href="/werken-bij/">Werken bij</a></li>
          <li><a href="${esc(s.social.instagram)}" rel="noopener">Instagram</a></li>
          <li><a href="${esc(s.social.facebook)}" rel="noopener">Facebook</a></li>
        </ul>
      </nav>
    </div>
    <div class="site-voet__onder">
      <p>© ${new Date().getFullYear()} ${esc(s.naam)}${juridischeRegel ? ` · ${esc(juridischeRegel)}` : ''}</p>
      <ul>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/cookies/">Cookies</a></li>
        <li><a href="/toegankelijkheid/">Toegankelijkheid</a></li>
        <li><a href="/voorwaarden/">Voorwaarden</a></li>
        ${ctx.integraties.consent.actief ? '<li><button type="button" class="linkknop" data-consent-open>Cookievoorkeuren</button></li>' : ''}
      </ul>
      <p class="site-voet__nix">Geniet, maar drink met mate. NIX18</p>
    </div>
  </div>
</footer>
<nav class="actiebalk" aria-label="Snelle acties">
  <a href="tel:${s.telefoon.e164}">${icoon('telefoon')}<span>Bel</span></a>
  <a href="${esc(s.routeUrl)}" rel="noopener">${icoon('route')}<span>Route</span></a>
  ${reserveerKnop(ctx, { tekst: 'Reserveer', klasse: 'actiebalk__reserveer', bron: 'actiebalk' })}
</nav>`;
}

/**
 * Volledige pagina.
 * p: { pad, titel, omschrijving, inhoud, jsonld[], ogBeeld, noindex, paginaCss[], modules[], body klasse }
 */
export function pagina(ctx, p) {
  const url = ctx.basisUrl + p.pad;
  const titel = p.pad === '/' ? p.titel : `${p.titel} | ${ctx.site.naam}`;
  const robots = ctx.productie && !p.noindex ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
  const og = ctx.basisUrl + (p.ogBeeld || '/assets/og/og-standaard.jpg');
  const config = {
    reserveren: ctx.integraties.reserveren,
    bierkaart: ctx.integraties.bierkaart,
    consent: ctx.integraties.consent,
    tijden: ctx.tijden,
    telefoon: ctx.site.telefoon,
    versie: ctx.versie,
  };
  const modules = ['main', ...(p.modules || [])];
  return `<!doctype html>
<html lang="nl"${ctx.testmodus ? ' data-testdata="true"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(p.omschrijving)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#11271b">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(ctx.site.naam)}">
<meta property="og:title" content="${esc(p.ogTitel || titel)}">
<meta property="og:description" content="${esc(p.omschrijving)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/bebas-neue.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/hanken-grotesk.woff2" as="font" type="font/woff2" crossorigin>
${p.preload || ''}
<link rel="stylesheet" href="/css/site.css?v=${ctx.versie}">
<script>${ctx.inlineScript}</script>
${(p.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
<script type="application/json" id="site-config">${JSON.stringify(config).replace(/</g, '\\u003c')}</script>
</head>
<body class="${p.bodyKlasse || ''}">
<a class="skiplink" href="#inhoud">Naar de inhoud</a>
${ctx.testmodus ? '<div class="melding melding--testdata" role="status" style="border-radius:0;text-align:center">Lokale testomgeving – niet publiceren</div>' : ''}
${kop(ctx, p.actief || p.pad)}
<main id="inhoud" tabindex="-1">
${p.inhoud}
</main>
${voet(ctx)}
${modules.map((m) => `<script type="module" src="/js/${m === 'main' ? 'main' : `modules/${m}`}.js?v=${ctx.versie}"></script>`).join('\n')}
</body>
</html>
`;
}

export function paginakop(ctx, { titel, lead, kruimel = [], extra = '', klasse = '' }) {
  return html`
<header class="paginakop ${klasse}">
  <div class="container paginakop__inhoud">
    ${kruimel.length ? `<nav class="kruimel" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li>${kruimel.map((k, i) => i === kruimel.length - 1 ? `<li aria-current="page">${esc(k.label)}</li>` : `<li><a href="${k.href}">${esc(k.label)}</a></li>`).join('')}</ol></nav>` : ''}
    <h1>${titel}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
  </div>
</header>`;
}

export function kruimelJsonLd(ctx, kruimel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'Home', href: '/' }, ...kruimel].map((k, i) => ({
      '@type': 'ListItem', position: i + 1, name: k.label, item: ctx.basisUrl + (k.href || ''),
    })),
  };
}
