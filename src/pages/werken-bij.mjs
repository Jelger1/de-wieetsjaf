import { esc, html, picture } from '../lib/html.mjs';
import { pagina, paginakop, kruimelJsonLd } from '../templates/layout.mjs';

// Bron: vacaturebeeld op wieetsjaf.nl/vacatures (november 2026). Laat de eigenaar bevestigen of de vacature nog openstaat.
const VACATURE = {
  titel: 'Medewerker bediening met passie voor speciaalbier',
  intro: 'Ben jij die horecatopper die niet alleen een dienblad kan dragen, maar ook vol enthousiasme kan vertellen over een frisse IPA, een robuuste stout of de perfecte bier-spijscombinatie? Bij Dé Wieëtsjaf in Kerkrade draait het om beleving. We zoeken een medewerker bediening die onze gasten niet alleen voorziet van een drankje, maar hen ook meeneemt in de wereld van speciaalbier.',
  doen: ['Je ontvangt gasten met een glimlach en zorgt dat ze zich meteen welkom voelen.', 'Je adviseert onze gasten over ons ruime aanbod speciaalbieren en bijpassende gerechten.', 'Je draait mee in een bruisende zaak waar gezelligheid en kwaliteit hand in hand gaan.', 'Je denkt mee en groeit mee met ons team en ons bierconcept.'],
  jij: ['Je bent 21 jaar of ouder.', 'Je hebt ervaring in de bediening en bent niet bang voor een levendige zaak.', 'Je hebt affiniteit met speciaalbier. Kennis is mooi, maar enthousiasme nog belangrijker!', 'Je bent communicatief sterk en een echte teamplayer.'],
  bieden: ['Een salaris conform de horeca-cao.', 'Training en verdieping in speciaalbier: van bierstijlen tot bier-spijscombinaties.', 'Ruimte om jezelf te ontwikkelen en door te groeien.', 'Werken in een gezellig, hecht team op een toplocatie in Kerkrade.', 'Een moderne werkplek waar kwaliteit en beleving centraal staan.'],
};

export default function werkenBij(ctx) {
  const kruimel = [{ label: 'Werken bij', href: '/werken-bij/' }];
  const v = VACATURE;
  const lijst = (titel, items) => `<div><h3>${esc(titel)}</h3><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
  const inhoud = html`
${paginakop(ctx, { titel: 'Werken bij Dé Wieëtsjaf', lead: 'Gastvrij, nieuwsgierig en gek op speciaalbier? Dan zoeken we jou.', kruimel })}
<section class="sectie">
  <div class="container raster-7-5">
    <article class="proza stapel">
      <h2>${esc(v.titel)}</h2>
      <p class="lead">${esc(v.intro)}</p>
      <div class="vacature-lijsten">${lijst('Wat ga je doen', v.doen)}${lijst('Wie ben jij', v.jij)}${lijst('Wat bieden wij', v.bieden)}</div>
      <p>Lijkt het je geweldig om samen met ons gasten te verrassen met de mooiste speciaalbieren en een topbeleving? Dan ben jij degene die we zoeken.</p>
      <p><a class="knop" href="mailto:${esc(ctx.site.email)}?subject=${encodeURIComponent(`Sollicitatie: ${v.titel}`)}">Stuur je gegevens naar ${esc(ctx.site.email)}</a></p>
    </article>
    ${picture('team-tap', { klasse: 'foto foto--45 foto--scheur', sizes: '(min-width: 56rem) 24rem, 90vw' })}
  </div>
</section>`;
  return pagina(ctx, {
    pad: '/werken-bij/',
    titel: 'Werken bij: medewerker bediening in Kerkrade',
    omschrijving: 'Vacature bij Dé Wieëtsjaf in Kerkrade: medewerker bediening met passie voor speciaalbier. Salaris volgens de horeca-cao en training in speciaalbier.',
    inhoud,
    jsonld: [kruimelJsonLd(ctx, kruimel)],
  });
}
