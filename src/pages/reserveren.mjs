import { esc, html, picture } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';

export default function reserveren(ctx) {
  const kruimel = [{ label: 'Reserveren', href: '/reserveren/' }];
  const s = ctx.site;
  const g = ctx.integraties.reserveren.guestplan;
  const inhoud = html`
${paginakop(ctx, { titel: 'Reserveer een tafel', lead: 'Kies je dag, tijd en aantal personen in ons reserveringssysteem. Voor lunch, diner of een borrel.', kruimel })}

<section class="sectie reserveren">
  <div class="container raster-7-5">
    <div class="stapel">
      <div class="reserveren__actie">
        ${reserveerKnop(ctx, { tekst: 'Open de reserveringen', klasse: 'knop knop--groot', bron: 'reserveerpagina' })}
        <p class="klein">Het reserveringsvenster opent op deze pagina. Werkt dat niet, dan ga je naar <a href="${esc(g.directeLink)}" rel="noopener">de reserveringspagina van Guestplan</a>.</p>
      </div>
      <div class="kader">
        <p class="kader__kop">Liever bellen?</p>
        <p>Bel ons op <a href="tel:${s.telefoon.e164}"><strong>${esc(s.telefoon.weergave)}</strong></a>. Tijdens openingstijden helpen we je graag verder.</p>
      </div>
      <h2 class="kop-3" style="margin-top:var(--s-6)">Goed om te weten</h2>
      <ul class="proza">
        <li>Allergieën of dieetwensen? Zet ze bij je reservering, dan houden we er rekening mee.</li>
        <li>Met een grote groep of voor De Kluis? <a href="/groepen/">Bekijk de mogelijkheden</a> of mail naar <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>.</li>
        <li>Alles over de Alpine gondels en het kerstmenu vind je bij de <a href="/arrangementen/">arrangementen</a>.</li>
        <li>Je reservering wijzigen of annuleren? Bel of mail ons.</li>
      </ul>
      <p class="klein">Reserveren verloopt via Guestplan. In onze <a href="/privacy/">privacyverklaring</a> lees je wat er met je gegevens gebeurt.</p>
    </div>
    ${picture('interieur-zaal', { klasse: 'foto foto--43', sizes: '(min-width: 56rem) 28rem, 90vw' })}
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/reserveren/',
    titel: 'Reserveren: tafel boeken in Kerkrade',
    omschrijving: 'Reserveer online een tafel bij Dé Wieëtsjaf aan de Markt in Kerkrade, voor lunch, diner of borrel. Liever bellen? 045 888 85 42.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
    bodyKlasse: 'pagina-reserveren',
  });
}
