# 05 · Guestplan-integratie (reserveren)

*Gecontroleerd op 24 november 2026 met de officiële ontwikkelaarsdocumentatie (https://docs.guestplan.com/#/websitedevelopers, `#/widget_settings`, `#/direct_link`, `#/analytics`) en de officiële loader `https://cdn.guestplan.com/widget.js`. Er is **niet** gereserveerd: in tests is het reserveringsvenster alleen geopend of nagebootst.*

## Gegevens

| Wat | Waarde | Bron |
|---|---|---|
| accessKey | `9f563a2008503edff53d98bbf3704571d1bc31d9` (publiek) | Widgetcode van de eigenaar (24-11-2026) en de huidige site |
| Restaurant-ID bij Guestplan | 5078 (uit de widget-API, ter info) | Netwerkverkeer bij openen van de widget |
| Directe link (zonder JavaScript) | `https://guestplan.io/?i=9f563a…1d9` | Huidige site; geeft HTTP 200 (volledige reserveringspagina) |
| Servicelink kerstmenu | `https://widget.guestplan.com/?id=4MgTmJ409f563a…&locale=nl` → servicecode **4MgTmJ4** | Huidige kerstmenupagina |
| Services (publieke widget-API, 24-11-2026) | **LzwJrAP** Alpine Gondel Dining evening (23-11-2026 t/m 21-01-2027, start 17:00–18:00, 4–6 p., 180 min, aanbetaling € 100) · **8BFcwYf** idem afternoon (start 12:00–13:00) · **4MgTmJ4** Kerst 2026 (25–26 dec, start 18:00–19:00, aanbetaling € 25 p.p.) · **JZUP2ap** Volkstoneel Menu (26–28 nov, 3 gangen € 40,50) · **95qZvh6**/**SDNvxND** restaurant laag/hoog zitten | Gelezen uit het netwerkverkeer bij openen van de widget (niets gereserveerd) |

Alles staat centraal in `data/integraties.json` → `reserveren.guestplan`.

## Werking

1. Elke reserveerknop is een gewone link (`<a data-reserveer href="https://guestplan.io/?i=…">`). **Zonder JavaScript** opent die de officiële reserveringspagina van Guestplan.
2. Met JavaScript (`js/modules/reserveren.js`) wordt bij de **eerste klik** de officiële snippet geladen, met de gedocumenteerde opties:
   - `showFab: false`: geen zwevende knop over de site;
   - `open: false`: niet vanzelf openen;
   - `locale: 'nl'` en `color: '#11271B'` (bosgroen in plaats van het oude `#136813`).
3. Daarna roept de knop `_gstpln.openBookingWidget()` aan (met `{ serviceCode }` bij arrangementen zoals het kerstmenu).
4. **Terugval:** laadt het script niet binnen 8 seconden, of ontbreekt de methode, dan gaat de bezoeker naar de directe link. Bellen staat altijd vlak naast de knop.
5. **Focus:** het venster van Guestplan is een zijpaneel (geen modale dialoog) in een shadow root. Na openen zet de site de focus op het eerste bedienbare element in het paneel; na sluiten gaat de focus terug naar de knop waarmee het werd geopend.

Waarom pas bij een klik: de Guestplan-bundel is ±3 MB en laadt ook Stripe, dat cookies plaatst (zie `04-juridische-audit.md`). Op de oude site gebeurde dat bij elk bezoek.

## Plekken met een reserveerknop

Kop (desktop), mobiele actiebalk (altijd zichtbaar), hero op home, seizoensblok, menukaart, contact, reserveerpagina, over ons, elk evenement met verplichte reservering en elk arrangement.

## Getest

| Test | Resultaat |
|---|---|
| Script laadt niet vooraf, wel na klik; opties `showFab:false`, `open:false`, `locale:'nl'` | Geslaagd (5 browserprofielen) |
| Servicecode kerstmenu wordt doorgegeven | Geslaagd |
| Script geblokkeerd → doorsturen naar `guestplan.io/?i=…` | Geslaagd |
| Zonder JavaScript: gewone link | Geslaagd |
| Echte widget onder de strenge Content-Security-Policy (alleen openen, niets ingevuld) | Opent als zijpaneel in bosgroen, geen CSP-fouten (Chromium) |
| Toetsenbord met de echte widget: focus gaat het paneel in, na ‘Sluiten’ terug naar de knop | Geslaagd (Chromium) |

## Wat nog nodig is van de eigenaar of Guestplan

- **Verwerkersovereenkomst** met Guestplan (eTender B.V.). Er is geen publieke versie gevonden: opvragen via support@guestplan.com.
- Er wordt **aanbetaald** (gondel € 100, kerst € 25 p.p.). Wordt er ook een **no-showbedrag** ingehouden? Dan gelden extra informatieplichten (zie juridische audit, punt 16).
- De gondelpagina gebruikt de services **LzwJrAP** (avond) en **8BFcwYf** (middag); het kerstmenu **4MgTmJ4**; het Volkstoneel-menu **JZUP2ap**. Komt er een nieuwe service bij, vul de code in `data/arrangementen.json` of `data/agenda.json` in.
- **Voorwaarden bij aanbetalingen** in Guestplan instellen (zie juridische audit, punt 16).
- Kan Guestplan **Stripe alleen laden bij services met betaling**? Dat scheelt cookies bij gewone reserveringen.
- **Toegankelijkheid:** Guestplan publiceert geen toegankelijkheidsverklaring. De hosted pagina’s hebben geen `<html lang>`. Dat staat als beperking op `/toegankelijkheid/`.

## Vervangen door een andere aanbieder

Alleen `js/modules/reserveren.js` en `data/integraties.json` → `reserveren` aanpassen. Alle knoppen gebruiken `reserveerKnop()` uit `src/templates/layout.mjs`, dus de rest van de site blijft gelijk.
