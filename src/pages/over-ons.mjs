import { esc, html, picture } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';

export default function overOns(ctx) {
  const kruimel = [{ label: 'Over ons', href: '/over-ons/' }];
  const s = ctx.site;
  const nb = s.nieuwsbrief;
  const inhoud = html`
${paginakop(ctx, {
    titel: 'Over Dé Wieëtsjaf',
    lead: `Sinds ${s.sinds} een vaste plek aan de Markt in Kerkrade. Inmiddels in het oude Rabobank-pand, zeven dagen per week open voor lunch, diner, borrel en feest.`,
    kruimel,
  })}

<section class="sectie verhaal">
  <div class="container verhaal__raster">
    <div class="proza stapel">
      <p class="lead">Dé Wieëtsjaf is de ontmoetingsplek van Kerkrade. Of je nu komt voor een snelle lunch, een uitgebreid diner, een borrel of een feestje: bij ons voel je je thuis.</p>
      <p>Midden in de zaak staat de walk-in fridge, het kloppende hart van Dé Wieëtsjaf. Daar liggen meer dan 200 bieren en 50 wijnen, uitgezocht uit de beste smaken van het moment. Stap gerust binnen, laat je inspireren en kies je eigen drankje.</p>
      <p>Op de kaart staan klassiekers als het Limburgs zuurvlees naar lokaal recept en de Wieëtsjaf burger van Heuvel Angus, naast gerechten die met het seizoen meegaan. Ons brood komt van huisbakkerij Curfs.</p>
      <p>We zijn echte bier- en wijnfanaten. Daarom hebben we met Brouwerij Rolduc onze eigen Sanctus-bieren laten brouwen, en schenken we twee eigen wijnen: de Cuvée Dé Wieëtsjaf.</p>
    </div>
    <div class="verhaal__beelden">
      ${picture('interieur-neon', { klasse: 'foto foto--32', sizes: '(min-width: 64rem) 30rem, 100vw' })}
      ${picture('team-dienblad', { klasse: 'foto foto--45 foto--scheur verhaal__klein', sizes: '(min-width: 64rem) 13rem, 45vw' })}
    </div>
  </div>
</section>

<section class="sectie--krap impressie" aria-labelledby="imp-titel">
  <div class="container">
    <h2 id="imp-titel" class="kop-3">Een kijkje binnen</h2>
    <ul class="impressie__raster">
      <li>${picture('interieur-zaal', { klasse: 'foto foto--43', sizes: '(min-width: 64rem) 24rem, 50vw' })}</li>
      <li>${picture('team-wijnwand', { klasse: 'foto foto--23', sizes: '(min-width: 64rem) 16rem, 50vw' })}</li>
      <li>${picture('interieur-muur', { klasse: 'foto foto--43', sizes: '(min-width: 64rem) 24rem, 50vw' })}</li>
      <li>${picture('lunchplank', { klasse: 'foto foto--23', sizes: '(min-width: 64rem) 16rem, 50vw' })}</li>
      <li>${picture('interieur-tap', { klasse: 'foto foto--43', sizes: '(min-width: 64rem) 24rem, 50vw' })}</li>
      <li>${picture('cocktails', { klasse: 'foto foto--23', sizes: '(min-width: 64rem) 16rem, 50vw' })}</li>
    </ul>
    <p class="klein" style="margin-top:var(--s-4)">Liever virtueel rondkijken? <a href="${esc(s.kaartUrl)}" rel="noopener">Bekijk de zaak op Google Maps</a>.</p>
  </div>
</section>

<section class="sectie wandelen" id="wandelen" aria-labelledby="wandel-titel">
  <div class="container raster-7-5">
    <div class="proza stapel">
      <h2 id="wandel-titel">Wandelaars en fietsers</h2>
      <p class="lead">Veel wandelroutes door Zuid-Limburg komen langs Kerkrade. Begin je tocht met koffie en vlaai, of sluit hem af met een koud speciaalbier of een warme maaltijd op ons terras.</p>
      <p>Op <a href="https://wandelgidszuidlimburg.com/?s=wieetsjaf&amp;submit=Go" rel="noopener">Wandelgids Zuid-Limburg</a> vind je honderden routes door het Zuid-Limburgse landschap. Via <a href="https://www.smart-market.nl/search?q=wieetsjaf&amp;options%5Bprefix%5D=last" rel="noopener">Smart Market</a> vind je aanbiedingen voor wandelaars bij Dé Wieëtsjaf.</p>
    </div>
    ${picture('koffie-gebak', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 22rem, 90vw' })}
  </div>
</section>

<section class="sectie donker nieuwsbrief" id="nieuwsbrief" aria-labelledby="nb-titel">
  <div class="container container--smal stapel">
    <h2 id="nb-titel">Als eerste weten wat er speelt?</h2>
    ${nb.formAction ? html`
    <p class="lead">Schrijf je in voor de nieuwsbrief en hoor als eerste over Beermonday, nieuwe menu’s en evenementen.</p>
    <form class="nb-form" action="${esc(nb.formAction)}" method="post">
      <div class="veld"><label for="nb-email">E-mailadres</label><input class="invoer" id="nb-email" name="email" type="email" autocomplete="email" required></div>
      <label class="nb-toestemming"><input type="checkbox" name="toestemming" required> Ja, ik wil de nieuwsbrief van Dé Wieëtsjaf ontvangen. Afmelden kan altijd via de link in elke mail. Zie de <a href="/privacy/">privacyverklaring</a>.</label>
      <button class="knop" type="submit">Inschrijven</button>
    </form>` : html`
    <p class="lead">Nieuws over Beermonday, nieuwe menu’s en evenementen delen we op Instagram en Facebook.</p>
    <div class="knoppen"><a class="knop" href="${esc(s.social.instagram)}" rel="noopener">Volg ons op Instagram</a><a class="knop knop--rand" href="${esc(s.social.facebook)}" rel="noopener">Facebook</a></div>`}
  </div>
</section>

<section class="sectie">
  <div class="container raster-2">
    <div class="stapel">
      <h2 class="kop-3">Werken bij Dé Wieëtsjaf</h2>
      <p>Enthousiast over speciaalbier en gastvrijheid? <a href="/werken-bij/">Bekijk de vacature</a>.</p>
    </div>
    <div class="stapel">
      <h2 class="kop-3">Kom langs</h2>
      <div class="knoppen">${reserveerKnop(ctx, { bron: 'over-ons' })}<a class="knop knop--rand" href="/contact/">Contact & route</a></div>
    </div>
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/over-ons/',
    titel: 'Over ons: sinds 2008 aan de Markt in Kerkrade',
    omschrijving: 'Sinds 2008 de ontmoetingsplek aan de Markt in Kerkrade: restaurant, café en een walk-in fridge met meer dan 200 bieren en 50 wijnen.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
    bodyKlasse: 'pagina-over',
  });
}
