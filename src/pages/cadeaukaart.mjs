import { esc, html, picture } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd } from '../templates/layout.mjs';

export default function cadeaukaart(ctx) {
  const kruimel = [{ label: 'Cadeaukaart', href: '/cadeaukaart/' }];
  const s = ctx.site;
  const c = s.cadeaukaart;
  const inhoud = html`
${paginakop(ctx, { titel: 'Cadeaukaart', lead: 'Geef een avond bij Dé Wieëtsjaf cadeau: voor een lunch, diner of een rondje speciaalbier uit de walk-in fridge.', kruimel })}
<section class="sectie">
  <div class="container raster-7-5">
    <div class="stapel">
      ${c.shopUrl ? `<p><a class="knop" href="${esc(c.shopUrl)}" rel="noopener">Bestel een cadeaukaart</a></p>` : `<p class="lead">Wil je een cadeaukaart kopen? Vraag ernaar in de zaak of mail naar <a href="mailto:${esc(s.email)}?subject=${encodeURIComponent('Cadeaukaart')}">${esc(s.email)}</a>.</p>`}
      <div class="kader">
        <p class="kader__kop">Saldo bekijken</p>
        <p>Benieuwd hoeveel er nog op je cadeaukaart staat? Check het saldo via de saldochecker van onze kaartleverancier.</p>
        <p style="margin-top:var(--s-3)"><a class="knop knop--rand" href="${esc(c.saldoUrl)}" rel="noopener">Saldo checken</a></p>
      </div>
      <p>Betalen met je cadeaukaart? Vertel het ons vóór het afrekenen.</p>
      <p class="klein">Spaar je ook punten bij ons? Lees de <a href="/voorwaarden/loyaltyprogramma/">voorwaarden van het loyaltyprogramma</a>.</p>
    </div>
    ${picture('wijnen', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 24rem, 90vw' })}
  </div>
</section>`;
  return pagina(ctx, {
    pad: '/cadeaukaart/',
    titel: 'Cadeaukaart en saldo',
    omschrijving: 'Geef een cadeaukaart van Dé Wieëtsjaf in Kerkrade cadeau en check het saldo van je kaart.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
  });
}
