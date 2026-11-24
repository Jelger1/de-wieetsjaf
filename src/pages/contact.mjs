import { esc, html, picture, icoon } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';
import { tijdenTabel } from '../templates/componenten.mjs';
import { restaurantJsonLd } from '../templates/seo.mjs';

export default function contact(ctx) {
  const kruimel = [{ label: 'Contact', href: '/contact/' }];
  const s = ctx.site;
  const keukenAfwijking = ctx.tijden.keuken._let_op ? '' : '';
  const inhoud = html`
${paginakop(ctx, { titel: 'Contact & openingstijden', lead: 'Je vindt ons midden in Kerkrade, aan de Markt. Bel, mail of kom gewoon langs.', kruimel })}

<section class="sectie contact">
  <div class="container contact__raster">
    <div class="contact__blok stapel">
      <h2 class="kop-3">Adres</h2>
      <address class="contact__adres">${esc(s.naam)}<br>${esc(s.adres.straat)}<br>${esc(s.adres.postcode)} ${esc(s.adres.plaats)}</address>
      <div class="knoppen">
        <a class="knop" href="${esc(s.routeUrl)}" rel="noopener">${icoon('route')}Route plannen</a>
        <a class="knop knop--rand" href="${esc(s.kaartUrl)}" rel="noopener">Op de kaart</a>
      </div>
      <p class="klein">De knoppen openen Google Maps in een nieuw venster. Er wordt op deze pagina geen kaart van Google geladen.</p>
    </div>
    <div class="contact__blok stapel">
      <h2 class="kop-3">Bellen of mailen</h2>
      <p class="contact__groot"><a href="tel:${s.telefoon.e164}">${esc(s.telefoon.weergave)}</a></p>
      <p class="contact__groot contact__groot--mail"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>
      <p>Heb je een vraag, een suggestie of iets wat je met ons wilt delen? Stuur ons een mail; we reageren zo snel mogelijk.</p>
      <p>Volg ons op <a href="${esc(s.social.instagram)}" rel="noopener">Instagram</a> en <a href="${esc(s.social.facebook)}" rel="noopener">Facebook</a>.</p>
    </div>
    <div class="contact__blok stapel" id="openingstijden">
      <h2 class="kop-3">Openingstijden</h2>
      <p class="status" data-status="zaak" hidden></p>
      ${tijdenTabel(ctx.tijden, 'zaak', { caption: 'Zaak' })}
      ${tijdenTabel(ctx.tijden, 'keuken', { caption: 'Keuken' })}
      <p class="klein">Lunch van 11.00 tot 17.00 uur, diner van 17.00 tot 20.00 uur. Op feestdagen kunnen de tijden afwijken; die staan dan hier en in de agenda.</p>
    </div>
  </div>
</section>

<section class="sectie--krap">
  <div class="container raster-5-7">
    ${picture('gondel-04', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 26rem, 90vw', alt: 'De gevel van Dé Wieëtsjaf aan de Markt in Kerkrade, ’s avonds met de verlichte naam boven de deur' })}
    <div class="stapel">
      <h2>Reserveren</h2>
      <p class="lead">Een tafel reserveer je het snelst online. Liever bellen? Dat kan natuurlijk ook.</p>
      <div class="knoppen">${reserveerKnop(ctx, { bron: 'contact' })}<a class="knop knop--rand" href="tel:${s.telefoon.e164}">Bel ${esc(s.telefoon.weergave)}</a></div>
      <p class="klein">Met een groep of voor De Kluis? <a href="/groepen/">Bekijk de mogelijkheden</a>.</p>
    </div>
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/contact/',
    titel: 'Contact, openingstijden en route',
    omschrijving: `Dé Wieëtsjaf, ${s.adres.straat}, ${s.adres.postcode} ${s.adres.plaats}. Telefoon ${s.telefoon.weergave}. Bekijk de openingstijden van de zaak en de keuken en plan je route.`,
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel), restaurantJsonLd(ctx)],
    bodyKlasse: 'pagina-contact',
  });
}
