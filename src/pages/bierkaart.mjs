import { esc, html, picture, icoon } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd } from '../templates/layout.mjs';
import { lenzen } from '../templates/componenten.mjs';

const fmtAbv = (n) => (n == null ? '' : `${String(n).replace('.', ',')}%`);
const fmtPrijs = (p) => (p == null ? '' : `€ ${p.toFixed(2).replace('.', ',')}`);
const fmtMoment = (iso) => new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Eén bierregel (zelfde opmaak als js/modules/bierkaart.js rendert). */
function bierRegel(b) {
  const meta = [b.stijl, fmtAbv(b.abv), b.ibu != null ? `${b.ibu} IBU` : ''].filter(Boolean).join(' · ');
  const herkomst = [b.brouwerij, b.plaats].filter(Boolean).join(', ');
  const cont = (b.containers || []).map((c) => [c.naam, fmtPrijs(c.prijs)].filter(Boolean).join(' ')).filter(Boolean).join(' · ');
  return html`<li class="bier" data-zoek="${esc([b.naam, b.brouwerij, b.stijl].join(' ').toLowerCase())}">
    ${b.tap ? `<span class="bier__tap" aria-label="Tap ${esc(b.tap)}">${esc(b.tap)}</span>` : '<span class="bier__tap bier__tap--leeg" aria-hidden="true"></span>'}
    <div class="bier__tekst">
      <p class="bier__naam">${esc(b.naam)}${b.nieuw ? ' <span class="bier__nieuw">Nieuw</span>' : ''}</p>
      ${herkomst ? `<p class="bier__brouwerij">${esc(herkomst)}</p>` : ''}
      ${meta ? `<p class="bier__meta">${esc(meta)}</p>` : ''}
    </div>
    ${cont ? `<p class="bier__prijs">${esc(cont)}</p>` : ''}
  </li>`;
}

/** Statische lijst bij de bouw (werkt zonder JavaScript). Gebruikt de laatste snapshot als die er is. */
export function bierLijstStatisch(ctx, { max = Infinity, compact = false } = {}) {
  const d = ctx.bierkaart;
  if (!d || !d.secties?.length) {
    return html`<div class="bierleeg" data-bierstatus="geen-data">
      ${compact ? `<ul class="biercijfers" aria-label="Ons bieraanbod">
        <li><span class="biercijfers__getal">200+</span><span>speciaalbieren in de walk-in fridge</span></li>
        <li><span class="biercijfers__getal">50</span><span>wijnen</span></li>
        <li><span class="biercijfers__getal">3</span><span>eigen Sanctus-bieren van de tap</span></li>
      </ul>` : ''}
      <p>De actuele tap- en flessenlijst houden we bij in Untappd.${compact ? '' : ' Zodra de koppeling actief is, staat hij hier automatisch.'}</p>
      <p><a class="tekstlink" href="${esc(ctx.integraties.bierkaart.venueUrl)}" rel="noopener">Bekijk ons aanbod op Untappd</a></p>
    </div>`;
  }
  let teller = 0;
  const secties = d.secties.map((s) => {
    const items = s.items.slice(0, Math.max(0, max - teller));
    teller += items.length;
    return items.length ? `<section class="biersectie" data-sectie="${esc(s.naam)}"><h3 class="biersectie__kop">${esc(s.naam)}</h3><ul class="bieren">${items.map(bierRegel).join('')}</ul></section>` : '';
  }).join('');
  return html`${d.testdata ? '<p class="melding melding--testdata">TESTDATA – fictieve bieren en prijzen, alleen lokaal</p>' : ''}
    ${secties}
    <p class="bierbijgewerkt klein" data-bijgewerkt>Laatst bijgewerkt via Untappd: <time datetime="${esc(d.opgehaald)}">${esc(fmtMoment(d.opgehaald))}</time></p>`;
}

export default function bierkaart(ctx) {
  const kruimel = [{ label: 'Bierkaart', href: '/bierkaart/' }];
  const b = ctx.integraties.bierkaart;
  const inhoud = html`
${paginakop(ctx, {
    titel: 'Bierkaart',
    lead: 'Meer dan 200 bieren in de walk-in fridge en een wisselend aanbod op de tap. Deze kaart komt rechtstreeks uit Untappd: wat het team daar bijwerkt, staat hier ook.',
    kruimel,
    extra: '<ul class="springlijst" aria-label="Op deze pagina"><li><a href="#actueel">Nu op de kaart</a></li><li><a href="#sanctus">Sanctus, ons eigen bier</a></li><li><a href="#wijn">Wijn</a></li></ul>',
  })}

<section class="sectie bierkaart" id="actueel" aria-labelledby="actueel-titel">
  <div class="container">
    <div class="bierkaart__kop">
      <h2 id="actueel-titel">Nu op de kaart</h2>
      <p class="status bierkaart__status" data-bierstatus-tekst hidden></p>
    </div>
    <div class="bierkaart__gereedschap" data-biergereedschap hidden>
      <div class="veld zoekveld">
        <label for="bierzoek">Zoek een bier, brouwerij of stijl</label>
        <div class="zoekveld">${icoon('zoek')}<input class="invoer" id="bierzoek" type="search" autocomplete="off" placeholder="Bijvoorbeeld tripel of Rolduc" data-bierzoek></div>
      </div>
      <fieldset class="filters" data-bierfilters><legend>Toon</legend></fieldset>
      <p class="klein" aria-live="polite" data-bierteller></p>
    </div>
    <div class="bierlijst" data-bierkaart>${bierLijstStatisch(ctx)}</div>
    <div class="bierembed" data-bierembed hidden>
      <div class="kader">
        <p class="kader__kop">Bekijk de officiële kaart van Untappd</p>
        <p>We laden de bierkaart pas als je erom vraagt. Untappd registreert daarbij een weergave van de kaart (met het adres van deze pagina). Liever niet? Bekijk ons aanbod dan <a href="${esc(b.venueUrl)}" rel="noopener">direct op Untappd</a>.</p>
        <p style="margin-top:var(--s-4)"><button class="knop" type="button" data-bierembed-laad>Toon de bierkaart</button></p>
      </div>
      <div class="bierembed__houder" data-bierembed-houder></div>
    </div>
    <noscript><p class="klein" style="margin-top:var(--s-4)">Zonder JavaScript zie je de laatst opgeslagen lijst. De actuele kaart staat ook op <a href="${esc(b.venueUrl)}">Untappd</a>.</p></noscript>
  </div>
</section>

<section class="sectie sanctus donker" id="sanctus" aria-labelledby="sanctus-titel">
  <div class="container">
    <div class="raster-7-5">
      <div class="stapel">
        <h2 id="sanctus-titel">Sanctus: <span class="accent streep">alleen van de tap</span></h2>
        <p class="lead">Onze eigen bieren, gebrouwen in opdracht van Dé Wieëtsjaf door Brouwerij Rolduc in Kerkrade. Elk nieuw bier is een volgend hoofdstuk.</p>
      </div>
      ${picture('sanctus-tap', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 26rem, 90vw' })}
    </div>
    <div style="margin-top:var(--s-8)">${lenzen()}</div>
  </div>
</section>

<section class="sectie wijn" id="wijn" aria-labelledby="wijn-titel">
  <div class="container raster-5-7">
    ${picture('cuvee', { klasse: 'foto foto--43', sizes: '(min-width: 56rem) 28rem, 90vw' })}
    <div class="stapel">
      <h2 id="wijn-titel">Wijn</h2>
      <p class="lead">Naast bier liggen er zo’n 50 wijnen in de walk-in fridge. Twee daarvan dragen onze eigen naam: de Cuvée Dé Wieëtsjaf, als Pinot Noir en als Chardonnay.</p>
      <p>Bij verschillende gerechten op de kaart staat een wijntip, zoals de Bodegas Briego Crianza bij de ossenhaas en de Paparuda Chardonnay Reserva bij de zeewolf. Twijfel je? Vraag het ons team. De rest van ons drankaanbod vind je in de drankenkaart in de zaak.</p>
    </div>
  </div>
</section>

<section class="sectie--krap">
  <div class="container"><p class="klein nix">Geniet, maar drink met mate. NIX18: wij schenken geen alcohol aan jongeren onder de 18 jaar.</p></div>
</section>`;

  return pagina(ctx, {
    pad: '/bierkaart/',
    titel: 'Bierkaart: speciaalbier in Kerkrade',
    omschrijving: 'De actuele bierkaart van Dé Wieëtsjaf in Kerkrade: wisseltaps, trappisten en 200+ speciaalbieren. Plus Sanctus, ons eigen bier van Brouwerij Rolduc.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
    modules: ['bierkaart'],
    bodyKlasse: 'pagina-bierkaart',
    ogBeeld: '/assets/og/og-bierkaart.jpg',
  });
}
