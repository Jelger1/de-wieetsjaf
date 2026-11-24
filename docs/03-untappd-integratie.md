# 03 · Untappd-integratie (automatische bierkaart)

*Gecontroleerd op 24 november 2026 aan de hand van de officiële documentatie: https://docs.business.untappd.com/, help.untappd.com-artikel 11573930285716 (API, bijgewerkt 31-03-2026) en 360034332011 (Website Embed, bijgewerkt 10-06-2025).*

## Doel

Het team werkt de bierkaart **alleen in Untappd for Business** bij. De website neemt dat automatisch over. Er is geen dubbel beheer.

## Wat er al is

- Het huidige account heeft **Untappd for Business**: de huidige site gebruikt de officiële iframe-embed `https://business.untappd.com/embeds/iframes/22030/83945`.
- Uit het officiële embed-script blijkt: **22030 = location-ID**, **83945 = thema (embed-ontwerp)**. Het publieke venue-ID **685582** (`untappd.com/v/de-wieetsjaf/685582`) is een ander nummer.
- Of het account **Premium** is (nodig voor de API) is **onbekend**. Dat bepaalt welke modus actief wordt.

## Architectuur

```
Untappd for Business ──(read-only token, server-side)──► /api/bierkaart  ──JSON──► browser (js/modules/bierkaart.js)
                                                             │  cache 15 min + 'laatst goed' 30 dagen
                                                             └─ normaliseren, valideren, opschonen
Bij de bouw: scripts/untappd-sync.mjs → data/bierkaart.snapshot.json → lijst staat al in de HTML (werkt zonder JavaScript)
Zonder API: officiële Untappd-embed, pas geladen als de bezoeker op ‘Toon de bierkaart’ klikt
```

| Bestand | Rol |
|---|---|
| `api/lib/untappd.mjs` | Platformonafhankelijke kern: ophalen, valideren, opschonen, cachen, terugvallen |
| `functions/api/bierkaart.js` | Cloudflare Pages Function (`GET /api/bierkaart`), optioneel met KV voor ‘laatst goed’ |
| `scripts/dev-server.mjs` | Lokale server, zelfde kern, leest `.env` |
| `scripts/untappd-sync.mjs` | Schrijft een snapshot voor de bouw (statische HTML) |
| `js/modules/bierkaart.js` | Frontend: lijst, zoeken, filters, status ‘laatst bijgewerkt’, embed-terugval |
| `data/integraties.json` → `bierkaart` | Modus (`auto`/`api`/`embed`), embed-ID’s, venue-URL, ‘verouderd na’-drempel |
| `data/bierkaart.testdata.json` | Gemarkeerde testdata, alleen lokaal (`npm run dev:testdata`); de bouw weigert testdata in productie |

**Modus `auto` (standaard):** levert de API een kaart, dan toont de site die in de eigen huisstijl. Anders verschijnt een knop om de officiële Untappd-embed te laden, en altijd een link naar het Untappd-profiel. Overstappen van embed naar API is alleen een kwestie van de omgevingsvariabelen zetten: verder hoeft er niets aan de site te veranderen.

## API-gegevens (officieel gedocumenteerd)

- Basis-URL `https://business.untappd.com/api/v1`, HTTP Basic met `email:token` (Base64).
- Eén verzoek voor de hele kaart: `GET /menus/{menu_id}?full=true` (secties, items, containers en maten).
- Gebruikte velden: `name`, `brewery`, `brewery_location`, `brewery_country`, `style`, `abv`, `ibu`, `description`, `tap_number`, `label_image(_thumb)`, `containers[].price/currency/container_size.name`, `section.public`, `menu.unpublished`, `on_deck_section` (‘Binnenkort op de tap’), `created_at` (voor ‘Nieuw’, standaard ≤ 14 dagen), `updated_at`, `nitro`.
- **Niet beschikbaar** in de API: een veld ‘uitverkocht/beschikbaar’. Wat niet op het menu staat, staat dus niet op de site. Schenkmaten staan als tekst (`container_size.name`); er is geen ml-veld.
- Geen webhooks: de site haalt de kaart dus periodiek op (cache, standaard 15 minuten).
- Rate limits zijn alleen gedocumenteerd voor `/sessions` (gebruiken we niet). Met 15 minuten cache gaan er hooguit ±100 verzoeken per dag naar Untappd.

## Beveiliging

- Alleen een **read-only token**. Het token staat uitsluitend in omgevingsvariabelen op de server en nooit in HTML, JavaScript of configuratie in git (`.env` staat in `.gitignore`).
- Alle tekst wordt opgeschoond (geen HTML), ingekort en in de browser alleen via `textContent` ingevoegd. Labelafbeeldingen alleen via https en alleen van Untappd-domeinen.
- Time-out 8 s; bij een storing komt de laatst gelukte kaart terug, gemarkeerd als ‘verouderd’. De site zegt dan: “Mogelijk niet actueel: laatst bijgewerkt op …”.
- De API-route geeft nooit het token of foutdetails terug (getest in `tests/unit/untappd.test.mjs`).

## Toegang krijgen: stappenplan voor de eigenaar

1. Log in op **business.untappd.com** met het **primaire** account (alleen tokens van de primaire gebruiker werken).
2. Controleer in het account welk abonnement actief is. Voor de API is **Premium** nodig (help-artikel 13225116244116). Zonder Premium: de site werkt met de embed (modus `auto` regelt dat al).
3. **Settings & Integrations > API Access** → maak een **Read Only**-token aan.
4. **Location-ID**: Settings & Integrations > Location Settings (verwacht: 22030).
5. **Menu-ID**: open het biermenu in het dashboard; het ID is het getal aan het eind van de URL.
6. Zet in de hosting (Cloudflare Pages > Settings > Variables and Secrets): `UNTAPPD_API_EMAIL`, `UNTAPPD_API_TOKEN` (als *secret*), `UNTAPPD_MENU_ID`, eventueel `UNTAPPD_CACHE_SECONDEN`.
7. Optioneel: koppel een KV-namespace als binding `BIERKAART_KV`, zodat de ‘laatst goed’-kopie ook na een nieuwe deploy bewaard blijft.
8. Optioneel: laat de bouw elke ochtend draaien met `npm run untappd:sync && npm run build:productie`, zodat de lijst ook zonder JavaScript actueel is.

## Embed-styling

In Untappd: *Embed Menus > Edit Embed*. Kies een transparante achtergrond (`TRANSPARENT`), tekstkleur `#30312C` en lettergrootte normaal. Eigen CSS is voor embeds niet gedocumenteerd. De iframe-embed staat daarom in een eigen kader en laadt pas na een klik, omdat hij een Segment-pixel (`api.segment.io`) met het pagina-adres verstuurt.

## Getest

- Eenheidstests: normaliseren, opschonen (XSS), niet-publieke secties, ongepubliceerd menu, cache-hit, terugval ‘verouderd’, geen toegang (401), token lekt niet.
- End-to-end (Chromium, Firefox, WebKit, mobiel): lijst met data, zoeken, filters, testdata-melding, verouderde data, geen API → embed pas na klik, netwerkstoring → melding + Untappd-link, geen uitgevoerde scripts uit externe tekst.
- **Niet getest:** een echte API-aanroep (geen token beschikbaar).
