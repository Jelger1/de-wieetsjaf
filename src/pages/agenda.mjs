import { esc, html, picture, fmtDatum } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';
import { komendeEvenementen, agendaRij, evenementJsonLd, datumBlokTekst } from '../templates/componenten.mjs';
import { volgendeEersteMaandagen } from '../../js/modules/tijden.js';

export default function agenda(ctx) {
  const kruimel = [{ label: 'Agenda', href: '/agenda/' }];
  const lijst = komendeEvenementen(ctx);
  const bm = ctx.agenda.terugkerend.find((t) => t.id === 'beermonday');
  const data = bm ? volgendeEersteMaandagen(ctx.vandaag, 4, bm.uitzonderingen) : [];
  const inhoud = html`
${paginakop(ctx, {
    titel: 'Agenda',
    lead: 'Proeverijen, feestdagen en vaste avonden. Bij evenementen met beperkte plaatsen is reserveren verplicht; vol is vol.',
    kruimel,
  })}
<section class="sectie" aria-labelledby="komend-titel">
  <div class="container agenda-pagina">
    <h2 id="komend-titel" class="sr-only">Komende evenementen</h2>
    <ol class="agenda" data-agenda>${lijst.map((e) => agendaRij(ctx, e))}</ol>
    <p class="melding" data-agenda-leeg ${lijst.length ? 'hidden' : ''}>Er staan op dit moment geen evenementen gepland. Volg ons op <a href="${esc(ctx.site.social.instagram)}" rel="noopener">Instagram</a> of <a href="${esc(ctx.site.social.facebook)}" rel="noopener">Facebook</a> voor nieuws.</p>
  </div>
</section>
${bm ? html`
<section class="sectie donker beermonday-blok" aria-labelledby="bm-titel">
  <div class="container raster-7-5">
    <div class="stapel">
      <h2 id="bm-titel"><span class="accent streep">Beermonday</span></h2>
      <p class="ondertitel">Elke eerste maandag van de maand · vanaf ${bm.tijd.replace(':', '.')} uur</p>
      <p class="lead">${esc(bm.omschrijving)}</p>
      <p><a class="knop" href="/agenda/beermonday/">Meer over Beermonday</a></p>
    </div>
    <div>
      <h3 class="kop-3" style="color:var(--c-goud)">Volgende data</h3>
      <ul class="datalijst">${data.map((d) => `<li><span>${esc(datumBlokTekst(d))}</span>${bm.brouwerijPerDatum?.[d] ? `<span>${esc(bm.brouwerijPerDatum[d])}</span>` : '<span class="klein">brouwerij volgt</span>'}</li>`)}</ul>
    </div>
  </div>
</section>` : ''}`;

  return pagina(ctx, {
    pad: '/agenda/',
    titel: 'Agenda & evenementen in Kerkrade',
    omschrijving: 'Evenementen bij Dé Wieëtsjaf in Kerkrade: Beermonday elke eerste maandag van de maand, proeverijen, kerstdiner en carnavalsontbijt. Bekijk de agenda en reserveer.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel), ...lijst.filter((e) => e.bevestigd).map((e) => evenementJsonLd(ctx, e))],
    bodyKlasse: 'pagina-agenda',
  });
}

/** Detailpagina's: één per evenement, plus Beermonday. */
export function paginas(ctx) {
  const uit = [];
  const bm = ctx.agenda.terugkerend.find((t) => t.id === 'beermonday');
  if (bm) {
    const kruimel = [{ label: 'Agenda', href: '/agenda/' }, { label: 'Beermonday', href: '/agenda/beermonday/' }];
    const data = volgendeEersteMaandagen(ctx.vandaag, 6, bm.uitzonderingen);
    uit.push({
      pad: '/agenda/beermonday/',
      html: pagina(ctx, {
        pad: '/agenda/beermonday/',
        actief: '/agenda/',
        titel: 'Beermonday: speciaalbier proeven in Kerkrade',
        omschrijving: 'Beermonday bij Dé Wieëtsjaf: elke eerste maandag van de maand komt er een brouwerij langs. Vrije inloop vanaf 20.00 uur, met 2 proefglazen.',
        jsonld: [kruimelJsonLd(ctx, kruimel)],
        inhoud: html`
${paginakop(ctx, { titel: 'Beermonday', lead: esc(bm.kort), kruimel })}
<section class="sectie">
  <div class="container raster-7-5">
    <div class="proza stapel">
      <p class="lead">${esc(bm.omschrijving)}</p>
      <dl class="feiten">
        <div><dt>Wanneer</dt><dd>Elke eerste maandag van de maand</dd></div>
        <div><dt>Hoe laat</dt><dd>Vanaf ${bm.tijd.replace(':', '.')} uur</dd></div>
        <div><dt>Toegang</dt><dd>Vrije inloop, met 2 proefglazen</dd></div>
        <div><dt>Waar</dt><dd>${esc(ctx.site.naam)}, ${esc(ctx.site.adres.straat)}, ${esc(ctx.site.adres.plaats)}</dd></div>
      </dl>
      <h2>Komende data</h2>
      <ul class="datalijst datalijst--licht">${data.map((d) => `<li><span>${esc(fmtDatum(d))}</span><span>${bm.brouwerijPerDatum?.[d] ? esc(bm.brouwerijPerDatum[d]) : 'Brouwerij wordt bekendgemaakt'}</span></li>`)}</ul>
      <p class="klein">Welke brouwerij er komt, delen we vooraf op <a href="${esc(ctx.site.social.instagram)}" rel="noopener">Instagram</a> en <a href="${esc(ctx.site.social.facebook)}" rel="noopener">Facebook</a>. Geniet, maar drink met mate. NIX18.</p>
    </div>
    ${picture('team-tap', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 24rem, 90vw' })}
  </div>
</section>`,
      }),
    });
  }
  for (const e of ctx.agenda.evenementen) {
    const eind = (e.eindOnbekend ? e.start : (e.eind || e.start)).slice(0, 10);
    const voorbij = eind < ctx.vandaag;
    if (voorbij) continue; // voorbije evenementen worden niet meer gebouwd (oude URL's: zie redirects)
    const kruimel = [{ label: 'Agenda', href: '/agenda/' }, { label: e.titel, href: `/agenda/${e.id}/` }];
    uit.push({
      pad: `/agenda/${e.id}/`,
      html: pagina(ctx, {
        pad: `/agenda/${e.id}/`,
        actief: '/agenda/',
        titel: `${e.titel} · ${datumBlokTekst(e.start)}`,
        omschrijving: `${e.kort} ${ctx.site.naam}, ${ctx.site.adres.straat}, Kerkrade.`.slice(0, 158),
        jsonld: [kruimelJsonLd(ctx, kruimel), ...(e.bevestigd ? [evenementJsonLd(ctx, e)] : [])],
        ogType: 'article',
        inhoud: html`
${paginakop(ctx, { titel: esc(e.titel), lead: esc(e.datumTekst || fmtDatum(e.start)), kruimel })}
<section class="sectie">
  <div class="container raster-7-5">
    <div class="proza stapel">
      <p class="lead">${esc(e.omschrijving)}</p>
      <dl class="feiten">
        <div><dt>Wanneer</dt><dd>${esc(e.datumTekst || fmtDatum(e.start))}</dd></div>
        ${e.prijs ? `<div><dt>Prijs</dt><dd>${esc(e.prijs)}</dd></div>` : ''}
        <div><dt>Reserveren</dt><dd>${e.reserveren?.verplicht ? 'Verplicht. Vol is vol.' : 'Aanbevolen'}</dd></div>
        <div><dt>Waar</dt><dd>${esc(ctx.site.naam)}, ${esc(ctx.site.adres.straat)}, ${esc(ctx.site.adres.plaats)}</dd></div>
      </dl>
      <div class="knoppen">
        ${reserveerKnop(ctx, { tekst: 'Reserveer', service: e.reserveren?.guestplanService, bron: `evenement-${e.id}` })}
        ${e.link ? `<a class="knop knop--rand" href="${esc(e.link)}">Bekijk het menu</a>` : ''}
        <a class="knop knop--rand" href="tel:${ctx.site.telefoon.e164}">Of bel ${esc(ctx.site.telefoon.weergave)}</a>
      </div>
    </div>
    ${e.afbeelding ? picture(e.afbeelding, { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 24rem, 90vw' }) : ''}
  </div>
</section>`,
      }),
    });
  }
  return uit;
}
