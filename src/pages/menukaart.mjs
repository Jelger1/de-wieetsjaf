import { esc, html, picture, icoon } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';
import { gerechtenLijst, keukenSamenvatting } from '../templates/componenten.mjs';
import { menuJsonLd } from '../templates/seo.mjs';

const BEELD = { lunch: 'lunchplank', diner: 'gerecht-wild', borrel: 'cocktails', kids: null, desserts: 'gerecht-dessert' };

function groep(menu, g) {
  const opties = { allergenen: menu.allergenen.geverifieerd === true };
  const bron = g.ref ? menu.kaarten.flatMap((k) => k.groepen).find((x) => x.id === g.ref) : g;
  const items = bron.items || [];
  if (g.stijl === 'uitgelicht') {
    return html`<section class="menugroep menugroep--uitgelicht" aria-labelledby="g-${g.id}">
      <div class="paneel">
        <h3 class="paneel__titel" id="g-${g.id}">${g.favoriet ? `${icoon('hart', 'merk-hart')} ` : ''}${esc(g.titel)}</h3>
        ${g.intro ? `<p class="menugroep__intro">${esc(g.intro)}</p>` : ''}
        ${gerechtenLijst(items, opties)}
        ${g.noot ? `<p class="menugroep__noot">${esc(g.noot)}</p>` : ''}
      </div>
    </section>`;
  }
  return html`<section class="menugroep" aria-labelledby="g-${g.id}" data-veg-groep="${g.id === 'vegetarisch'}">
    <h3 class="label" id="g-${g.id}">${esc(g.titel)}</h3>
    ${g.intro ? `<p class="menugroep__intro">${esc(g.intro)}</p>` : ''}
    ${gerechtenLijst(items, opties)}
    ${g.noot ? `<p class="menugroep__noot">${esc(g.noot)}</p>` : ''}
  </section>`;
}

export default function menukaart(ctx) {
  const m = ctx.menu;
  const kruimel = [{ label: 'Menukaart', href: '/menukaart/' }];
  const allergeen = m.allergenen;

  const inhoud = html`
${paginakop(ctx, {
    titel: 'Menukaart',
    lead: `Lunch, diner, borrel en desserts. ${keukenSamenvatting(ctx.tijden)}; op maandag vanaf 12.00 uur. ${esc(m.prijsnotitie)}`,
    kruimel,
  })}

<nav class="menunav" aria-label="Onderdelen van de menukaart">
  <div class="container">
    <ul class="menunav__lijst">${m.kaarten.map((k) => `<li><a href="#${k.id}">${esc(k.titel)}</a></li>`)}<li><a href="#allergenen">Allergenen</a></li></ul>
  </div>
</nav>

<div class="container menukaart">
  <div class="menukaart__gereedschap alleen-js" data-menugereedschap>
    <div class="veld">
      <label for="menuzoek">Zoek een gerecht</label>
      <div class="zoekveld">${icoon('zoek')}<input class="invoer" id="menuzoek" type="search" autocomplete="off" placeholder="Bijvoorbeeld burger of zalm" data-menuzoek></div>
    </div>
    <label class="filter"><input type="checkbox" data-menuveg><span>Alleen vegetarisch (mogelijk)</span></label>
    <button class="knop knop--rand geen-print" type="button" data-print>Print de kaart</button>
    <p class="klein" aria-live="polite" data-menuteller></p>
  </div>

  <dl class="legenda" aria-label="Uitleg van de tekens">
    <div><dt>${icoon('hart', 'merk-hart')}<span class="sr-only">Hartje</span></dt><dd>Favoriet van het huis</dd></div>
    <div><dt>${icoon('pin', 'merk-pin')}<span class="sr-only">Pin</span></dt><dd>Lokaal recept</dd></div>
    <div><dt><span class="veg" aria-hidden="true">V</span><span class="sr-only">V</span></dt><dd>Vegetarisch</dd></div>
    <div><dt><span class="veg" aria-hidden="true">V*</span><span class="sr-only">V met sterretje</span></dt><dd>Vegetarisch mogelijk</dd></div>
  </dl>

  ${m.kaarten.map((k) => html`
  <section class="menudeel" id="${k.id}" aria-labelledby="k-${k.id}">
    <header class="menudeel__kop">
      <h2 class="kaartkop" id="k-${k.id}"><span class="kaartkop__woord">${esc(k.titel)}</span>${k.tijden ? `<span class="kaartkop__tijd">${esc(k.tijden)}</span>` : ''}</h2>
      ${BEELD[k.id] ? picture(BEELD[k.id], { klasse: 'foto foto--45 menudeel__foto geen-print', sizes: '(min-width: 64rem) 14rem, 40vw' }) : ''}
    </header>
    <div class="menudeel__groepen">${k.groepen.map((g) => groep(m, g))}</div>
  </section>`)}

  <p class="menukaart__leeg" data-menuleeg hidden>Geen gerechten gevonden. Probeer een ander woord of zet het filter uit.</p>

  <section class="menu-onder" aria-label="Goed om te weten">
    <div class="kader" id="allergenen">
      <h2 class="kader__kop">Allergenen</h2>
      <p>${esc(allergeen.melding)}</p>
    </div>
    <div class="kader">
      <h2 class="kader__kop">Met een groep</h2>
      <p>${esc(m.groepsinfo)} Splitsen? Dan stuurt één persoon een Tikkie.</p>
      <p style="margin-top:var(--s-3)"><a class="tekstlink" href="/groepen/">Mogelijkheden voor groepen</a></p>
    </div>
    <div class="kader">
      <h2 class="kader__kop">Cadeaukaart</h2>
      <p>Heb je een cadeaukaart? Vertel het ons vóór het afrekenen.</p>
      <p style="margin-top:var(--s-3)"><a class="tekstlink" href="/cadeaukaart/">Over de cadeaukaart</a></p>
    </div>
  </section>

  <div class="menukaart__cta geen-print">
    <p class="kop kop-3">Zin gekregen?</p>
    <div class="knoppen">${reserveerKnop(ctx, { bron: 'menukaart' })}<a class="knop knop--rand" href="/bierkaart/">Bekijk de bierkaart</a></div>
  </div>
</div>`;

  return pagina(ctx, {
    pad: '/menukaart/',
    titel: 'Menukaart: lunchen en dineren in Kerkrade',
    omschrijving: 'De menukaart van Dé Wieëtsjaf aan de Markt in Kerkrade: lunchplankje, Limburgs zuurvlees, Wieëtsjaf burger, diner, borrelhapjes, kids en desserts. Met prijzen.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel), menuJsonLd(ctx)],
    modules: ['menukaart'],
    ogBeeld: '/assets/og/og-menukaart.jpg',
    bodyKlasse: 'pagina-menukaart',
  });
}
