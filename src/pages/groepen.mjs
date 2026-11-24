import { esc, html, picture } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd } from '../templates/layout.mjs';

const VERENIGINGEN = [
  'Kirchroatsjer Vasteloavends Verain (KVV 1936)', 'Koninklijk Kerkraads Mannenkoor St. Lambertus', 'Sjun Jek', 'De Jekke Sjuppe',
  'Slavisch Byzantijns Koor Sobornost', 'Katholieke Vrouwengilde', 'Zangkoor St. Caecilia', 'Schuttersbroederschap St. Sebastianus 1617 Kerkrade',
  'Elektronische Dartvereniging De Wieëtsjaf', 'Kirchroadsjer Dialectverain', 'De Unie Kerkrade', 'Damescomité St. Lambertus',
  'Miranda Carnavals Verain (MCV)', 'ViaViella Kinderopvang', 'FNV', 'Blauw Wiess', 'VVE Beheer Willems',
  'Diverse Verenigingen van Eigenaren', 'E.K.H. Goudwinde', 'CDAJ',
];

export default function groepen(ctx) {
  const kruimel = [{ label: 'Groepen & De Kluis', href: '/groepen/' }];
  const s = ctx.site;
  const mail = (onderwerp) => `mailto:${s.email}?subject=${encodeURIComponent(onderwerp)}`;
  const inhoud = html`
${paginakop(ctx, {
    titel: 'Groepen & De Kluis',
    lead: 'Met collega’s, je vereniging of de hele familie? Bij Dé Wieëtsjaf schuif je met een groep aan in de zaak, of je zit samen in De Kluis: de oude bankkluis in de kelder.',
    kruimel,
    extra: '<ul class="springlijst" aria-label="Op deze pagina"><li><a href="#kluis">De Kluis</a></li><li><a href="#groepen">Groepen in de zaak</a></li><li><a href="#bedrijven">Bedrijven & kerst</a></li><li><a href="#verenigingen">Verenigingen</a></li></ul>',
  })}

<section class="sectie kluis donker" id="kluis" aria-labelledby="kluis-titel">
  <div class="container kluis__raster">
    <div class="kluis__typo" aria-hidden="true"><span>De</span><span>Kluis</span></div>
    <div class="stapel">
      <h2 id="kluis-titel">Een echte <span class="accent streep">bankkluis</span></h2>
      <p class="lead">Dé Wieëtsjaf zit in het voormalige Rabobank-pand aan de Markt. In de kelder ligt nog de oude bankkluis. Daar zit je met je gezelschap aan één lange tafel, helemaal onder elkaar.</p>
      <dl class="feiten">
        <div><dt>Gezelschap</dt><dd>Tot ongeveer 30 personen aan een lange tafel, flexibel in te delen</dd></div>
        <div><dt>Zaalhuur</dt><dd>Geen. Je betaalt alleen wat je eet en drinkt</dd></div>
        <div><dt>Techniek</dt><dd>Scherm en speakers die je zelf bedient, plus wifi</dd></div>
        <div><dt>Bestellen</dt><dd>Eten en drinken bestel je via een QR-code aan tafel</dd></div>
      </dl>
      <h3 class="kop-3" style="margin-top:var(--s-6)">Waarvoor?</h3>
      <ul class="kluis__ideeen">
        <li><strong>Vergaderen</strong> met koffie en vlaai, een lunchplank en het grote scherm.</li>
        <li><strong>Proeverij</strong> van bier of wijn.</li>
        <li><strong>Groepsuitje</strong>: eerst iets samen doen, daarna aan tafel.</li>
        <li><strong>Besloten feest</strong>: verjaardag, jubileum of afscheid in een echte bankkluis.</li>
      </ul>
      <div class="knoppen" style="margin-top:var(--s-5)">
        <a class="knop" href="${mail('Aanvraag De Kluis')}">De Kluis aanvragen</a>
        <a class="knop knop--rand" href="tel:${s.telefoon.e164}">Bel ${esc(s.telefoon.weergave)}</a>
      </div>
      <p class="klein">Vermeld in je mail de datum, het aantal personen en wat je wilt doen. We nemen zo snel mogelijk contact met je op.</p>
    </div>
  </div>
</section>

<section class="sectie" id="groepen" aria-labelledby="groep-titel">
  <div class="container raster-7-5">
    <div class="proza stapel">
      <h2 id="groep-titel">Groepen in de zaak</h2>
      <p class="lead">Voor groepen vanaf 10 personen serveren we shared plates: gerechten midden op tafel, om samen van te eten. Onze medewerkers vertellen je graag wat er mogelijk is.</p>
      <ul>
        <li>Iedere tafel krijgt één rekening. Splitsen? Dan stuurt één persoon een Tikkie.</li>
        <li>Allergieën of dieetwensen? Geef ze vooraf door, dan houden we er rekening mee.</li>
        <li>Met een grote groep? Bel of mail ons, dan kijken we samen wat er kan.</li>
      </ul>
      <div class="knoppen"><a class="knop" href="${mail('Reservering voor een groep')}">Mail ons je aanvraag</a><a class="knop knop--rand" href="tel:${s.telefoon.e164}">Bel ${esc(s.telefoon.weergave)}</a></div>
    </div>
    ${picture('gasten', { klasse: 'foto foto--45', sizes: '(min-width: 56rem) 24rem, 90vw' })}
  </div>
</section>

<section class="sectie bedrijven" id="bedrijven" aria-labelledby="bedrijf-titel">
  <div class="container">
    <div class="paneel bedrijven__paneel">
      <h2 class="paneel__titel" id="bedrijf-titel">Bedrijven & kerst</h2>
      <p class="lead">Van een kerstborrel tot een compleet verzorgd personeelsfeest: we maken er samen iets moois van, helemaal naar jullie wensen. Jullie de gezelligheid, wij de rest.</p>
      <p style="margin-top:var(--s-4)"><a class="tekstlink" href="${mail('Bedrijfsfeest of kerstborrel')}">Vraag de mogelijkheden aan</a></p>
    </div>
  </div>
</section>

<section class="sectie" id="verenigingen" aria-labelledby="ver-titel">
  <div class="container raster-5-7">
    <div class="stapel">
      <h2 id="ver-titel">Stamcafé van Kerkrade</h2>
      <p class="lead">Veel Kerkraadse verenigingen hebben hun vaste plek bij ons. Na de repetitie, de vergadering of de optocht.</p>
      <p>Zoekt jouw vereniging een vaste plek? <a href="${mail('Vaste plek voor onze vereniging')}">Laat het ons weten</a>.</p>
    </div>
    <ul class="verenigingen">${VERENIGINGEN.map((v) => `<li>${esc(v)}</li>`)}</ul>
  </div>
</section>`;

  return pagina(ctx, {
    pad: '/groepen/',
    titel: 'Groepen, bedrijven & De Kluis in Kerkrade',
    omschrijving: 'Met een groep eten of vergaderen in Kerkrade? In De Kluis, een echte bankkluis, zit je met zo’n 30 personen, zonder zaalhuur. Ook voor kerstborrels.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
    bodyKlasse: 'pagina-groepen',
  });
}
