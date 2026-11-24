import { esc, html, picture, icoon, fmtEuro } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd, reserveerKnop } from '../templates/layout.mjs';

const actueel = (ctx, a) => a.actief !== false && (!a.tot || a.tot >= ctx.vandaag);

function gangenLijst(m) {
  return html`<section class="gangen" aria-label="${esc(m.titel)}">
    <h3 class="gangen__titel">${esc(m.titel)}</h3>
    ${m.prijs != null || m.noot ? `<p class="gangen__prijs">${m.prijs != null ? `<strong>${fmtEuro(m.prijs)} p.p.</strong>` : ''}${m.prijs != null && m.noot ? ' · ' : ''}${m.noot ? esc(m.noot) : ''}</p>` : ''}
    <ol class="gangen__lijst">${m.gangen.map(([label, titel, oms]) => `<li>${label ? `<span class="gangen__label">${esc(label)}</span>` : ''}<span class="gangen__naam">${esc(titel)}</span>${oms ? `<span class="gangen__oms">${esc(oms)}</span>` : ''}</li>`)}</ol>
  </section>`;
}

export default function arrangementen(ctx) {
  const kruimel = [{ label: 'Arrangementen', href: '/arrangementen/' }];
  const lijst = ctx.arrangementen.filter((a) => actueel(ctx, a));
  const inhoud = html`
${paginakop(ctx, { titel: 'Arrangementen', lead: 'Seizoensconcepten, feestmenu’s en het chefsmenu van de maand. Wat er nu te boeken is:', kruimel })}
<section class="sectie">
  <div class="container arr-lijst">
    ${lijst.map((a, i) => html`
    <article class="arr ${i % 2 ? 'arr--om' : ''}" data-eind="${esc(a.tot || '9999-12-31')}">
      ${a.afbeeldingen?.[0] ? picture(a.afbeeldingen[0], { klasse: 'foto foto--43 arr__foto', sizes: '(min-width: 56rem) 34rem, 100vw' }) : `<div class="arr__typo" aria-hidden="true"><span>${esc(a.titel)}</span></div>`}
      <div class="arr__tekst stapel">
        <p class="ondertitel">${esc(a.ondertitel || '')}</p>
        <h2><a href="/arrangementen/${a.id}/">${esc(a.titel)}</a></h2>
        <p>${esc(a.kort)}</p>
        ${a.prijs ? `<p class="arr__prijs">${esc(a.prijs)}</p>` : ''}
        <div class="knoppen">
          <a class="knop" href="/arrangementen/${a.id}/">Bekijk ${esc(a.titel.toLowerCase().startsWith('kerst') || a.titel.toLowerCase().startsWith('chef') ? 'het menu' : 'alle details')}</a>
        </div>
      </div>
    </article>`)}
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/arrangementen/',
    titel: 'Arrangementen: Alpine Gondel Dining, kerstmenu en chefsmenu',
    omschrijving: 'Arrangementen bij Dé Wieëtsjaf in Kerkrade: Alpine Gondel Dining in je eigen privégondel, het kerstmenu en het chefsmenu van de maand.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
    bodyKlasse: 'pagina-arrangementen',
  });
}

export function paginas(ctx) {
  return ctx.arrangementen.filter((a) => actueel(ctx, a) || a.archiveren).map((a) => {
    const kruimel = [{ label: 'Arrangementen', href: '/arrangementen/' }, { label: a.titel, href: `/arrangementen/${a.id}/` }];
    const verlopen = !actueel(ctx, a);
    const isGondel = a.id === 'alpine-gondel-dining';
    const diensten = a.reserveren?.diensten;
    const reserveer = verlopen ? '' : (diensten
      ? diensten.map((d, i) => reserveerKnop(ctx, { tekst: d.label, klasse: i ? 'knop knop--rand' : 'knop', service: d.service, bron: `arr-${a.id}-${i}` })).join('')
      : reserveerKnop(ctx, { tekst: 'Reserveer', service: a.reserveren?.guestplanService, bron: `arr-${a.id}` }));
    const feiten = a.feiten?.length ? `<dl class="feiten">${a.feiten.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '';
    const inhoud = html`
${isGondel ? html`
<section class="gondel-held donker">
  ${picture(a.afbeeldingen[0], { klasse: 'gondel-held__foto', sizes: '100vw', laden: 'eager', prioriteit: true })}
  <div class="gondel-held__band">
    <img class="naadlogo gondel-held__logo" src="/assets/images/logo-rond-128.png" srcset="/assets/images/logo-rond-128.webp 128w, /assets/images/logo-rond-256.webp 256w" sizes="7.5rem" width="128" height="128" alt="">
    <div class="container container--smal gondel-held__tekst">
      <nav class="kruimel" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li><li><a href="/arrangementen/">Arrangementen</a></li><li aria-current="page">${esc(a.titel)}</li></ol></nav>
      <h1>Alpine<br><span class="accent streep">Gondel Dining</span></h1>
      <p class="ondertitel">${esc(a.ondertitel)}</p>
      <p class="lead">${esc(a.kort)}</p>
      <div class="knoppen" style="justify-content:center">${reserveer}</div>
    </div>
  </div>
</section>` : paginakop(ctx, { titel: esc(a.titel), lead: esc(a.kort), kruimel })}
${verlopen ? '<div class="container" style="margin-top:var(--s-6)"><p class="melding">Dit arrangement is op dit moment niet te boeken.</p></div>' : ''}

${isGondel ? html`
<section class="sectie gondel-info">
  <div class="container raster-7-5">
    <div class="proza stapel">
      ${a.verhaal.map((p) => `<p${p === a.verhaal[0] ? ' class="lead"' : ''}>${esc(p)}</p>`)}
      ${feiten}
    </div>
    ${picture(a.afbeeldingen[1], { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 26rem, 90vw' })}
  </div>
</section>
<section class="sectie donker gondel-menu" aria-labelledby="gm-titel">
  <div class="container">
    <h2 id="gm-titel">Alpine <span class="accent streep">Shared Menu</span></h2>
    <p class="ondertitel" style="margin-top:var(--s-3)">2 gangen · € 49,50 p.p.</p>
    <ol class="gondel-gangen">${a.gangen.map((g) => `<li><p class="ondertitel">${esc(g.label)}</p><h3>${esc(g.titel)}</h3><p>${esc(g.tekst)}</p></li>`)}</ol>
    <div class="gondel-extras">
      <h3 class="kop-3">Maak het compleet</h3>
      <ul class="reeks" aria-label="Extra’s">${a.extras.map((x) => `<li>${esc(x)}</li>`)}</ul>
      <p class="klein">Dranken en extra’s worden apart berekend.</p>
    </div>
  </div>
</section>
<section class="sectie gondel-weten" aria-labelledby="gw-titel">
  <div class="container">
    <h2 id="gw-titel">Goed om te weten</h2>
    <ul class="weetjes">
      <li>${icoon('gondel-4-tot-6', 'weetjes__icoon')}<h3>4 tot 6 personen</h3><p>Per privégondel, alleen voor jullie gezelschap.</p></li>
      <li>${icoon('brettl-plank', 'weetjes__icoon')}<h3>Alleen het Alpine Shared Menu</h3><p>Geen à la carte of kindermenu in de gondels.</p></li>
      <li>${icoon('glazen', 'weetjes__icoon')}<h3>Dranken & extra’s</h3><p>Worden apart berekend.</p></li>
      <li>${icoon('allergie', 'weetjes__icoon')}<h3>Allergieën?</h3><p>Geef ze vooraf door bij je reservering.</p></li>
    </ul>
    <div class="gondel-galerij">${a.afbeeldingen.slice(2, 5).map((k) => picture(k, { klasse: 'foto foto--23', sizes: '(min-width: 56rem) 22rem, 45vw' }))}</div>
    <div class="knoppen" style="margin-top:var(--s-7)">${reserveer}<a class="knop knop--rand" href="tel:${ctx.site.telefoon.e164}">Vragen? Bel ${esc(ctx.site.telefoon.weergave)}</a></div>
  </div>
</section>` : html`
<section class="sectie">
  <div class="container arr-menus">
    ${(a.menus || []).map(gangenLijst)}
  </div>
  <div class="container" style="margin-top:var(--s-7)">
    ${feiten ? `<div style="max-width:var(--max-tekst);margin-bottom:var(--s-6)">${feiten}</div>` : ''}
    <div class="knoppen">${reserveer}<a class="knop knop--rand" href="tel:${ctx.site.telefoon.e164}">Of bel ${esc(ctx.site.telefoon.weergave)}</a></div>
    <p class="klein" style="margin-top:var(--s-4)">Allergieën of dieetwensen? Geef ze door bij je reservering.</p>
  </div>
</section>`}`;

    return {
      pad: `/arrangementen/${a.id}/`,
      html: pagina(ctx, {
        pad: `/arrangementen/${a.id}/`,
        actief: '/arrangementen/',
        titel: isGondel ? 'Alpine Gondel Dining in Kerkrade: dineren in een privégondel' : `${a.titel}${a.ondertitel ? ` · ${a.ondertitel}` : ''}`,
        omschrijving: `${a.kort}`.slice(0, 158),
        inhoud,
        jsonld: [kruimelJsonLd(ctx, kruimel)],
        ogBeeld: isGondel ? '/assets/og/og-gondel.jpg' : undefined,
        noindex: verlopen,
        bodyKlasse: isGondel ? 'pagina-gondel' : 'pagina-arrangement',
      }),
      geenSitemap: verlopen,
    };
  });
}
