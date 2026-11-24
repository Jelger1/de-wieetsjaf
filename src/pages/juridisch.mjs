// Privacy, cookies, toegankelijkheid, voorwaarden en 404.
import fs from 'node:fs';
import path from 'node:path';
import { esc, html, root } from '../lib/html.mjs';
import { md } from '../lib/md.mjs';
import { pagina, paginakop, kruimelJsonLd } from '../templates/layout.mjs';

const lees = (f) => fs.readFileSync(path.join(root, 'data/teksten', f), 'utf8');
const conceptBalk = '<p class="concept" role="note">Concept: deze tekst moet nog worden gecontroleerd door Dé Wieëtsjaf. Onderdelen tussen [vierkante haken] worden nog ingevuld.</p>';

function prozaPagina(ctx, { pad, titel, omschrijving, lead, body, concept = false, noindex = false }) {
  const kruimel = [{ label: titel, href: pad }];
  return {
    pad,
    html: pagina(ctx, {
      pad, titel, omschrijving, noindex,
      jsonld: [kruimelJsonLd(ctx, kruimel)],
      inhoud: html`${paginakop(ctx, { titel: esc(titel), lead, kruimel })}
<section class="sectie--krap"><div class="container"><div class="proza stapel">${concept ? conceptBalk : ''}${body}</div></div></section>`,
    }),
  };
}

export function paginas(ctx) {
  const cookies = JSON.parse(lees('cookies.json'));
  const privacyBody = md(lees('privacy.md').replace(/^# .*$/m, ''));
  const loyalty = md(lees('loyaltyprogramma.md').replace(/^# .*$/m, ''));

  const cookieTabel = html`<table>
    <thead><tr><th scope="col">Wanneer</th><th scope="col">Partij</th><th scope="col">Wat</th><th scope="col">Waarom</th></tr></thead>
    <tbody>${cookies.items.map((c) => `<tr><td data-kop="Wanneer">${esc(c.wanneer)}</td><td data-kop="Partij">${esc(c.partij)}</td><td data-kop="Wat">${esc(c.wat)}</td><td data-kop="Waarom">${esc(c.waarom)}</td></tr>`)}</tbody>
  </table>`;

  return [
    prozaPagina(ctx, {
      pad: '/privacy/', titel: 'Privacyverklaring', concept: true,
      omschrijving: 'Hoe Dé Wieëtsjaf in Kerkrade omgaat met je persoonsgegevens bij reserveren, contact, de nieuwsbrief en het loyaltyprogramma.',
      body: privacyBody,
    }),
    prozaPagina(ctx, {
      pad: '/cookies/', titel: 'Cookies', concept: true,
      omschrijving: 'Welke cookies en externe diensten de website van Dé Wieëtsjaf gebruikt. Standaard geen tracking.',
      lead: 'Kort gezegd: deze website plaatst zelf geen cookies en volgt je niet. Externe diensten laden pas als jij erom vraagt.',
      body: html`
        <p>Daarom zie je bij ons ook geen cookiemelding. Lettertypes en afbeeldingen staan op onze eigen server, we gebruiken geen Google Analytics en geen advertentiepixels, en de kaart van Google Maps laden we niet in de pagina: je opent hem zelf via een link.</p>
        <h2>Wanneer komen externe diensten in beeld?</h2>
        ${cookieTabel}
        <p class="klein">Laatst gecontroleerd: ${esc(cookies.gecontroleerd)}. ${esc(cookies.methode)}</p>
        <h2>Zelf regelen</h2>
        <p>In je browser kun je cookies altijd bekijken en verwijderen. Vragen? Mail naar <a href="mailto:${esc(ctx.site.email)}">${esc(ctx.site.email)}</a>.</p>`,
    }),
    prozaPagina(ctx, {
      pad: '/toegankelijkheid/', titel: 'Toegankelijkheid',
      omschrijving: 'Hoe de website van Dé Wieëtsjaf toegankelijk is gemaakt voor iedereen, en waar je terechtkunt als iets niet werkt.',
      lead: 'We willen dat iedereen onze website kan gebruiken: met een muis, het toetsenbord, een schermlezer of een vergrootglas.',
      concept: true,
      body: html`
        <h2>Wat we hebben gedaan</h2>
        <ul>
          <li>We bouwen volgens de richtlijnen van WCAG 2.2 op niveau AA.</li>
          <li>Alle informatie staat als echte tekst op de site, ook de menukaart. Geen menukaart als plaatje.</li>
          <li>Je kunt alles met het toetsenbord bedienen, met een zichtbare focus.</li>
          <li>Kleurcontrasten zijn gecontroleerd. De tekst blijft leesbaar bij 200% zoom.</li>
          <li>Afbeeldingen hebben een beschrijving. Bewegingen staan uit als je dat in je apparaat hebt ingesteld.</li>
        </ul>
        <h2>Wat nog niet goed werkt</h2>
        <ul>
          <li>Het reserveringsvenster komt van Guestplan. Daar hebben wij geen invloed op. Lukt reserveren niet? Bel ons op <a href="tel:${ctx.site.telefoon.e164}">${esc(ctx.site.telefoon.weergave)}</a>.</li>
          <li>De officiële bierkaart van Untappd (als die via Untappd wordt getoond) is niet door ons gemaakt.</li>
        </ul>
        <h2>Iets gevonden?</h2>
        <p>Werkt er iets niet, of is iets moeilijk te gebruiken? Mail naar <a href="mailto:${esc(ctx.site.email)}">${esc(ctx.site.email)}</a>. We reageren zo snel mogelijk.</p>
        <p class="klein">Technisch getest in november 2026 met geautomatiseerde controles (axe-core) en handmatige toetsenbordtests. Zie het testverslag in de projectdocumentatie.</p>`,
    }),
    prozaPagina(ctx, {
      pad: '/voorwaarden/', titel: 'Voorwaarden',
      omschrijving: 'Voorwaarden van Dé Wieëtsjaf, waaronder de voorwaarden van het loyaltyprogramma.',
      body: html`
        <ul>
          <li><a href="/voorwaarden/loyaltyprogramma/">Voorwaarden loyaltyprogramma</a> (versie 1.0, 1 mei 2026)</li>
          <li><a href="/privacy/">Privacyverklaring</a></li>
          <li><a href="/cookies/">Cookies</a></li>
        </ul>`,
    }),
    {
      pad: '/voorwaarden/loyaltyprogramma/',
      html: pagina(ctx, {
        pad: '/voorwaarden/loyaltyprogramma/', actief: '/voorwaarden/',
        titel: 'Voorwaarden loyaltyprogramma',
        omschrijving: 'De algemene voorwaarden van het loyaltyprogramma van Dé Wieëtsjaf in Kerkrade.',
        jsonld: [kruimelJsonLd(ctx, [{ label: 'Voorwaarden', href: '/voorwaarden/' }, { label: 'Loyaltyprogramma', href: '/voorwaarden/loyaltyprogramma/' }])],
        inhoud: html`${paginakop(ctx, { titel: 'Voorwaarden loyaltyprogramma', kruimel: [{ label: 'Voorwaarden', href: '/voorwaarden/' }, { label: 'Loyaltyprogramma', href: '/voorwaarden/loyaltyprogramma/' }] })}
<section class="sectie--krap"><div class="container"><div class="proza stapel">${loyalty}</div></div></section>`,
      }),
    },
    {
      pad: '/404/',
      bestand: '404.html',
      geenSitemap: true,
      html: pagina(ctx, {
        pad: '/404/', titel: 'Pagina niet gevonden', noindex: true,
        omschrijving: 'Deze pagina bestaat niet (meer).',
        inhoud: html`<section class="sectie niet-gevonden"><div class="container stapel">
          <p class="kaartkop" aria-hidden="true"><span class="kaartkop__woord">404</span></p>
          <h1>Deze pagina is op</h1>
          <p class="lead">De pagina die je zoekt bestaat niet (meer). Misschien vind je hier wat je zocht:</p>
          <ul class="springlijst">
            <li><a href="/menukaart/">Menukaart</a></li><li><a href="/bierkaart/">Bierkaart</a></li><li><a href="/agenda/">Agenda</a></li>
            <li><a href="/reserveren/">Reserveren</a></li><li><a href="/contact/">Contact & openingstijden</a></li>
          </ul>
          <p><a class="knop" href="/">Naar de homepage</a></p>
        </div></section>`,
      }),
    },
  ];
}
