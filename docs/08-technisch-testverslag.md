# 08 · Technisch testverslag

*Uitgevoerd op 24 november 2026, lokaal op Windows 11 met Node 24, Playwright 1.65.1 (Chromium, Firefox, WebKit) en Lighthouse 12. Alle cijfers hieronder zijn echt gemeten; de ruwe Lighthouse-rapporten staan in `tests/lighthouse/*.json`.*

## 1. Samenvatting

| Onderdeel | Resultaat |
|---|---|
| Eenheidstests (`npm run test:unit`) | **8/8 geslaagd** (Untappd-kern, openingstijden) |
| End-to-end (`npx playwright test`) | **216 geslaagd, 0 mislukt**, 4 bewust overgeslagen (linkcontrole draait één keer), in 5 profielen: Chromium, Firefox, WebKit, Pixel 7 (mobiel Chromium), iPhone 14 (mobiel WebKit) |
| Toegankelijkheid (axe-core, WCAG 2.0/2.1/2.2 A + AA-regels) | **0 schendingen** op alle 24 pagina’s, desktop en mobiel |
| Breedtes 320, 375, 390, 430, 768, 1024, 1440, 1920 px | 200 schermen, **0 met horizontale overflow** na de fix in ronde 2 (de menukaart op 320 px) |
| Lighthouse (productiebouw, lokaal, met brotli) | Zie §3: alle pagina’s **≥ 97** op alle vier categorieën |

## 2. Wat de geautomatiseerde tests controleren

Per pagina (`tests/e2e/paginas.spec.mjs`), in alle profielen:
- HTTP 200; precies één `h1`; titel 10–75 tekens; meta description 50–170 tekens; canonical klopt; `noindex` in de lokale omgeving; JSON-LD is geldige JSON; elke `img` heeft een `alt`-attribuut; geen horizontale overflow; geen JavaScript-fouten; **geen cookies en geen localStorage** na het bezoek; axe-core zonder schendingen (Chromium-profielen).
- 404-pagina geeft status 404; vier oude URL’s geven een 301 naar de juiste nieuwe pagina; alle interne links (alle pagina’s afgelopen) geven < 400.

Interactie (`tests/e2e/interactie.spec.mjs`):
- **Reserveren** (Guestplan nagebootst, er wordt nooit echt gereserveerd): het script laadt niet vooraf maar wel na een klik, met de opties `showFab:false`, `open:false`, `locale:'nl'` en de juiste accessKey. De kerst-servicecode `4MgTmJ4` wordt doorgegeven. Een geblokkeerd script leidt naar de officiële Guestplan-pagina. Zonder JavaScript is de knop een gewone link.
- **Navigatie:** de skiplink focust `#inhoud`. Het mobiele menu opent met Enter, houdt de focus vast (20× Tab), sluit met Escape en geeft de focus terug aan de knop. Zonder JavaScript zijn de navigatie en de tijden zichtbaar.
- **Menukaart:** zoeken (‘zuurvlees’ → 2), het vegetarische filter, de melding ‘geen resultaten’, en prijzen die met de bron overeenkomen (Wieëtsjaf burger 23,50; hartige muffin 15,-).
- **Bierkaart:** met (test)data: 8 bieren, status ‘Actueel’, testdata-melding, zoeken (‘rolduc’ → 3), filter ‘Fles & blik’ → 4, geen dialoogvenster of `<script>` uit externe tekst (XSS). Verouderde data → ‘Mogelijk niet actueel’. Geen API → embed pas na een klik (iframe `…/22030/83945`). Netwerkstoring → melding en Untappd-link.

Toestemmingsmechanisme (`tests/e2e/consent.spec.mjs`, uitgeschakeld op de site, apart getest): een script draait niet vóór toestemming en wel na ‘Alles accepteren’; niets staat vooraf aangevinkt; ‘Alles weigeren’ blokkeert; de keuze wordt onthouden en is te wijzigen via ‘Cookievoorkeuren’.

## 3. Lighthouse (gemeten, niet geschat)

Productiebouw (`--productie`), geserveerd door `scripts/dev-server.mjs` met brotli-compressie, Lighthouse 12, standaard mobiel profiel (gesimuleerde trage 4G en CPU-vertraging), tenzij ‘desktop’.

| Pagina | Performance | Toegankelijkheid | Best practices | SEO | LCP | CLS | TBT | Gewicht |
|---|---|---|---|---|---|---|---|---|
| Home (mobiel) | 98 | 100 | 100 | 100 | 2,2 s | 0,002 | 0 ms | 224 kB |
| Home (desktop) | 100 | 100 | 100 | 100 | 0,5 s | 0,004 | 0 ms | 305 kB |
| Menukaart | 99 | 100 | 100 | 100 | 1,8 s | 0 | 0 ms | 118 kB |
| Bierkaart | 100 | 100 | 100 | 100 | 1,7 s | 0,01 | 0 ms | 297 kB |
| Alpine Gondel Dining | 99 | 100 | 100 | 100 | 1,9 s | 0 | 0 ms | 173 kB |
| Agenda | 100 | 100 | 100 | 100 | 1,5 s | 0 | 0 ms | 72 kB |
| Groepen & De Kluis | 100 | 100 | 100 | 100 | 1,6 s | 0 | 0 ms | 125 kB |
| Contact | 100 | 100 | 100 | 100 | 1,6 s | 0 | 0 ms | 106 kB |

Verbeteringen tijdens de metingen: de menukaart had eerst CLS 0,10, doordat de zoekbalk pas na JavaScript verscheen (opgelost via een `.js`-klasse die vóór het tekenen wordt gezet). Desktop-toegankelijkheid scoorde eerst 96, door een te klein klikdoel bij e-maillinks (WCAG 2.5.8; opgelost).

**Lokaal versus praktijk:** dit zijn labmetingen op een lokale server. Echte bezoekers (Core Web Vitals in Google Search Console en CrUX) worden pas na livegang gemeten. INP is niet in het lab te meten; TBT van 0 ms en de kleine hoeveelheid JavaScript (±13 kB per pagina, ±6 kB gecomprimeerd; met menukaart- of bierkaartmodule ±29 kB in totaal; geen frameworks) wijzen op een lage INP. Het Guestplan-script (±3 MB) laadt pas na een klik en telt dus niet mee in deze cijfers.

## 4. Visuele controle (drie rondes)

| Ronde | Wat | Gevonden en opgelost |
|---|---|---|
| 1 | Alle pagina’s op 390 en 1440 px (Chromium), beoordeeld als artdirector | CSS-naamconflict (`.bier`) brak het bierblok; tijdregel ‘LUNCH’ brak af; berglijn te hoog; lege bierkaart oogde kaal (feitenblok uit de menukaart toegevoegd); datumbereik brak lelijk; lenzen op mobiel te lang (lijstweergave); cookietabel liep uit beeld; menugroepen lieten gaten vallen (kolommen); gezichten in de gondelfoto afgesneden |
| 2 | Alle 25 pagina’s × 8 breedtes (200 schermen), automatische overflowcheck | Overflow menukaart op 320 px (foto naast ‘DESSERTS’); namen ‘SanctusFusion’ zonder spatie in lijstweergave; tijden afwisselend ‘23:00’ en ‘23.00’ (nu overal ‘23.00’) |
| 3 | Firefox, WebKit en mobiele profielen via de testsuite; echte Guestplan-widget | WebKit zette localhost-verzoeken naar https door de productie-CSP (alleen lokaal; opgelost in de testserver); Guestplan-paneel heeft geen `role="dialog"` (detectie en focusbeheer aangepast en getest met de echte widget) |

## 5. Externe integraties (handmatig/semi-automatisch)

| Integratie | Getest | Resultaat |
|---|---|---|
| Guestplan, echte widget | Openen (niets ingevuld), onder CSP, toetsenbordfocus | Werkt; paneel in bosgroen; focus erin en terug |
| Guestplan, directe link `guestplan.io/?i=…` | HTTP-status | 200 |
| Untappd-embed (officieel) | Laden na klik | Werkt; laadt Segment-pixel (gedocumenteerd) |
| Untappd-API | – | **Niet getest**: geen token beschikbaar |
| Cookies/opslag | `tests/meet-cookies.mjs` | Site: geen. Na Guestplan: 3 Stripe-cookies (zie 04) |

## 6. Niet getest / beperkingen

- Echte reserveringen (bewust niet gedaan).
- Echte Untappd-API-aanroep (geen toegang).
- Schermlezers (NVDA/VoiceOver) handmatig: axe en toetsenbordtests zijn gedaan, een test met echte gebruikers en schermlezers wordt aanbevolen.
- Zoom 200%: gecontroleerd via de breedtetest (1440 px op 200% gedraagt zich als 720 px; geen overflow op 768 en 375 px).
- Gedrag op de definitieve hosting (headers, redirects): te controleren na de eerste deploy (`curl -I`).

## 7. Zelf opnieuw testen

```bash
npm install
npx playwright install chromium firefox webkit
npm run test:unit
npx playwright test            # start zelf een testserver op poort 4322
node tests/schermen.mjs tests/screenshots 320,390,768,1440   # met draaiende preview (npm run dev)
```
