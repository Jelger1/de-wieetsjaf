import { esc, html, picture, icoon } from '../lib/html.mjs';
import { pagina, reserveerKnop } from '../templates/layout.mjs';
import { gerecht, zoekGerecht, tijdenTabel, keukenSamenvatting, komendeEvenementen, agendaRij, lenzen } from '../templates/componenten.mjs';
import { restaurantJsonLd } from '../templates/seo.mjs';
import { bierLijstStatisch } from './bierkaart.mjs';

export default function home(ctx) {
  const m = ctx.menu;
  const lunch = ['Limburgs zuurvlees', 'De Wieëtsjaf burger', 'Hartige muffin'].map((n) => zoekGerecht(m, n)).filter(Boolean);
  const diner = ['Gebakken eend', 'Gestoomde zeewolf', 'Gnocchi ricotta & spinazie'].map((n) => zoekGerecht(m, n)).filter(Boolean);
  const plankje = m.kaarten[0].groepen.find((g) => g.id === 'lunchplankje');
  const agenda = komendeEvenementen(ctx, { max: 4 });
  const seizoen = ctx.arrangementen.find((a) => a.uitgelicht);
  const s = ctx.site;

  const inhoud = html`
<section class="held" aria-labelledby="held-titel">
  <div class="container held__raster">
    <div class="held__tekst">
      <p class="ondertitel held__plaats">Markt 47 · Kerkrade · sinds ${s.sinds}</p>
      <h1 class="blokkop" id="held-titel"><span>Welkom bij</span><span>Dé Wieëtsjaf</span></h1>
      <ul class="reeks" aria-label="Wat je bij ons kunt doen"><li>Lunch</li><li>Diner</li><li>Borrel</li><li>Feestzaal</li></ul>
      <p class="lead">Dé ontmoetingsplek aan de Markt in Kerkrade. Voor een snelle lunch, een uitgebreid diner of een borrel op het terras. In onze walk-in fridge liggen meer dan 200 bieren en 50 wijnen.</p>
      <div class="knoppen">
        ${reserveerKnop(ctx, { bron: 'home-held' })}
        <a class="knop knop--rand" href="/menukaart/">Bekijk de menukaart</a>
      </div>
      <p class="status held__status" data-status="zaak" hidden></p>
    </div>
    <div class="held__beeld">
      ${picture('interieur-bar', { klasse: 'foto foto--43 held__foto', sizes: '(min-width: 64rem) 36rem, 100vw', laden: 'eager', prioriteit: true })}
      ${picture('team-tap', { klasse: 'foto foto--45 foto--scheur held__foto2', sizes: '(min-width: 64rem) 14rem, 40vw' })}
      <img class="naadlogo held__logo" src="/assets/images/logo-rond-128.png" srcset="/assets/images/logo-rond-128.webp 128w, /assets/images/logo-rond-256.webp 256w" sizes="7.5rem" width="128" height="128" alt="">
    </div>
  </div>
</section>

<section class="vandaag donker" aria-label="Openingstijden en adres">
  <div class="container vandaag__raster">
    <div class="vandaag__blok">
      <h2 class="ondertitel">Vandaag</h2>
      <p class="vandaag__groot" data-vandaag="zaak"><a href="/contact/#openingstijden">Openingstijden</a></p>
      <p class="klein" data-vandaag="keuken">${keukenSamenvatting(ctx.tijden)}</p>
    </div>
    <div class="vandaag__blok">
      <h2 class="ondertitel">Adres</h2>
      <p class="vandaag__groot">${esc(s.adres.straat)}</p>
      <p class="klein">${esc(s.adres.postcode)} ${esc(s.adres.plaats)} · <a href="${esc(s.routeUrl)}" rel="noopener">Route plannen</a></p>
    </div>
    <div class="vandaag__blok">
      <h2 class="ondertitel">Bellen</h2>
      <p class="vandaag__groot"><a href="tel:${s.telefoon.e164}">${esc(s.telefoon.weergave)}</a></p>
      <p class="klein"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>
    </div>
  </div>
</section>

<section class="sectie eten" aria-labelledby="eten-titel">
  <div class="container">
    <h2 class="sr-only" id="eten-titel">Eten bij Dé Wieëtsjaf</h2>
    <div class="eten__raster">
      <div class="eten__kaart">
        <p class="kaartkop"><span class="kaartkop__woord" aria-hidden="true">Lunch</span><span class="kaartkop__tijd">11.00 – 17.00 uur</span></p>
        <h3 class="sr-only">Lunch, van 11.00 tot 17.00 uur</h3>
        <div class="paneel">
          <p class="paneel__titel kop">Lunchplankje</p>
          <p class="paneel__prijs"><strong>Kies 3 gerechten</strong> 16,50 <span aria-hidden="true">·</span> <strong>extra gerecht</strong> 5,50</p>
          <p class="klein">${plankje.items.slice(0, 7).map((i) => esc(i.naam)).join(', ')} en meer.</p>
        </div>
        <ul class="gerechten">${lunch.map(gerecht).join('')}</ul>
      </div>
      <div class="eten__kaart">
        <p class="kaartkop"><span class="kaartkop__woord" aria-hidden="true">Diner</span><span class="kaartkop__tijd">17.00 – 20.00 uur</span></p>
        <h3 class="sr-only">Diner, van 17.00 tot 20.00 uur</h3>
        <ul class="gerechten">${diner.map(gerecht).join('')}</ul>
        <p class="eten__meer"><a class="knop" href="/menukaart/">Naar de complete menukaart</a></p>
      </div>
      <figure class="eten__beeld">
        ${picture('gerechten-tafel', { klasse: 'foto foto--23', sizes: '(min-width: 64rem) 22rem, 90vw' })}
      </figure>
    </div>
  </div>
</section>

<section class="sectie bierblok donker" aria-labelledby="bier-titel">
  <div class="container">
    <div class="bierblok__kop">
      <h2 id="bier-titel">Uit de <span class="accent streep">walk-in fridge</span></h2>
      <p class="lead">Midden in de zaak staat het kloppende hart van Dé Wieëtsjaf: een walk-in fridge met meer dan 200 bieren en 50 wijnen. Stap gerust binnen. Van frisse witbieren tot volle trappisten en bittere IPA’s, met unieke wisseltaps en seizoensbieren.</p>
    </div>
    <div class="bierblok__raster">
      <div class="bierblok__tap">
        <h3 class="bierblok__subkop">Nu op de kaart</h3>
        <div class="bierpreview" data-bierpreview>${bierLijstStatisch(ctx, { max: 6, compact: true })}</div>
        <p><a class="knop" href="/bierkaart/">Bekijk de hele bierkaart</a></p>
      </div>
      ${picture('team-fridge', { klasse: 'foto foto--45 foto--scheur bierblok__foto', sizes: '(min-width: 64rem) 24rem, 90vw' })}
    </div>
    <div class="bierblok__sanctus">
      <h3 class="bierblok__subkop">Ons eigen bier, alleen van de tap</h3>
      <p>De Sanctus-bieren worden in opdracht van Dé Wieëtsjaf gebrouwen door Brouwerij Rolduc. Je drinkt ze alleen van de tap.</p>
      ${lenzen({ kop: 'h4' })}
    </div>
  </div>
</section>

${agenda.length ? html`
<section class="sectie agenda-blok" aria-labelledby="agenda-titel">
  <div class="container agenda-blok__raster">
    <div class="agenda-blok__kop">
      <h2 id="agenda-titel">Binnenkort</h2>
      <p>Van Beermonday tot kerstdiner. Elke eerste maandag van de maand komt er een brouwerij langs.</p>
      <p><a class="tekstlink" href="/agenda/">Hele agenda</a></p>
    </div>
    <ol class="agenda" data-agenda>${agenda.map((e) => agendaRij(ctx, e))}</ol>
  </div>
</section>` : ''}

${seizoen ? html`
<section class="seizoen naadblok donker" aria-labelledby="seizoen-titel">
  ${picture(seizoen.afbeeldingen[0], { klasse: 'naadblok__foto', sizes: '(min-width: 60rem) 46vw, 100vw' })}
  <div class="naadblok__band">
    <img class="naadlogo naadblok__logo" src="/assets/images/logo-rond-128.png" srcset="/assets/images/logo-rond-128.webp 128w, /assets/images/logo-rond-256.webp 256w" sizes="7.5rem" width="128" height="128" alt="" loading="lazy">
    <div class="container container--smal naadblok__tekst">
      <h2 id="seizoen-titel">${esc(seizoen.titel.split(' ').slice(0, 1).join(' '))}<br><span class="accent streep">${esc(seizoen.titel.split(' ').slice(1).join(' '))}</span></h2>
      <p class="ondertitel">${esc(seizoen.ondertitel)}</p>
      <p class="lead">${esc(seizoen.kort)}</p>
      <div class="knoppen naadblok__knoppen">
        ${(seizoen.reserveren?.diensten ?? [{ label: 'Reserveer', service: seizoen.reserveren?.guestplanService }])
          .map((d, i) => reserveerKnop(ctx, { tekst: d.label, klasse: i ? 'knop knop--rand' : 'knop', service: d.service, bron: `home-seizoen-${i}` }))}
      </div>
      <a class="tekstlink seizoen__meer" href="/arrangementen/${seizoen.id}/">Zo werkt het: menu, tijden en aanbetaling</a>
    </div>
    <div class="seizoen__bergen" aria-hidden="true">${icoon('bergen', 'bergen')}</div>
  </div>
</section>` : ''}

<section class="sectie groepen-blok" aria-labelledby="groepen-titel">
  <div class="container raster-5-7">
    ${picture('interieur-tafel', { klasse: 'foto foto--32', sizes: '(min-width: 56rem) 30rem, 100vw' })}
    <div class="stapel">
      <h2 id="groepen-titel">Met een groep? <span class="streep">De Kluis</span></h2>
      <p class="lead">In de kelder van het oude Rabobank-pand ligt De Kluis: een echte bankkluis waar je met zo’n 30 personen aan een lange tafel zit.</p>
      <p>Voor een vergadering, een proeverij, een verjaardag of een teamuitje. Je betaalt geen zaalhuur, alleen wat je eet en drinkt. Ook in de zaak zelf schuiven verenigingen en gezelschappen graag aan.</p>
      <p><a class="knop" href="/groepen/">Mogelijkheden voor groepen</a></p>
    </div>
  </div>
</section>

<section class="sectie bezoek" aria-labelledby="bezoek-titel">
  <div class="container bezoek__raster">
    <div class="bezoek__tekst stapel">
      <h2 id="bezoek-titel">Aan de Markt in Kerkrade</h2>
      <address class="bezoek__adres">${esc(s.adres.straat)}<br>${esc(s.adres.postcode)} ${esc(s.adres.plaats)}</address>
      <div class="knoppen">
        <a class="knop" href="${esc(s.routeUrl)}" rel="noopener">${icoon('route')}Route plannen</a>
        <a class="knop knop--rand" href="tel:${s.telefoon.e164}">${icoon('telefoon')}${esc(s.telefoon.weergave)}</a>
      </div>
    </div>
    <div class="bezoek__tijden">
      ${tijdenTabel(ctx.tijden, 'zaak', { caption: 'Openingstijden' })}
      <p class="klein" style="margin-top:var(--s-3)">${keukenSamenvatting(ctx.tijden)}. Op maandag vanaf 12.00 uur.</p>
    </div>
    ${picture('gondel-04', { klasse: 'foto foto--45 bezoek__foto', sizes: '(min-width: 64rem) 22rem, 90vw' })}
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/',
    titel: 'Dé Wieëtsjaf | Restaurant & speciaalbier aan de Markt in Kerkrade',
    omschrijving: 'Lunchen, dineren en speciaalbier aan de Markt in Kerkrade. Meer dan 200 bieren en 50 wijnen, een eigen bier van de tap, terras en De Kluis voor groepen. Reserveer online.',
    inhoud,
    jsonld: [restaurantJsonLd(ctx)],
    bodyKlasse: 'pagina-home',
    modules: ['bierkaart'],
    preload: '<link rel="preload" as="image" type="image/avif" imagesrcset="/assets/images/interieur-bar-400.avif 400w, /assets/images/interieur-bar-800.avif 800w" imagesizes="(min-width: 64rem) 36rem, 100vw" fetchpriority="high">',
  });
}
