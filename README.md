# Website Dé Wieëtsjaf

Nieuwe website van **Dé Wieëtsjaf**, restaurant en speciaalbiercafé aan de Markt in Kerkrade. Ze is volledig op maat gebouwd in de huisstijl van de menukaart en de social media: statische HTML, moderne CSS en een beetje vanilla JavaScript, zonder frameworks en zonder WordPress.

- **Snel:** Lighthouse 97–100 op alle gemeten pagina’s; ±13 kB JavaScript per pagina.
- **Toegankelijk:** axe-core zonder fouten op alle pagina’s, WCAG 2.2 AA als doel.
- **Privacyvriendelijk:** geen cookies, geen trackers, lettertypes zelf gehost.
- **Makkelijk te beheren:** menu, openingstijden, agenda en arrangementen staan in `data/*.json`. De bierkaart komt automatisch uit Untappd.

## Snel starten (lokaal)

Vereist: **Node.js 20+**. Voor het opnieuw maken van foto’s: Python 3.11+ met Pillow 11 (`pip install pillow`).

```bash
npm install                     # installeert alleen testgereedschap (Playwright, axe)
npm run dev                     # bouwt de site en start http://localhost:4321 (bouwt opnieuw bij elke wijziging)
npm run dev:testdata            # idem, met duidelijk gemarkeerde TESTDATA voor de bierkaart
```

De lokale site is **nooit indexeerbaar**: `robots.txt` blokkeert alles, elke pagina heeft `noindex` en de server stuurt `X-Robots-Tag: noindex`.

## Mappen

```
data/            Alle inhoud: site.json, openingstijden.json, menukaart.json, agenda.json, arrangementen.json,
                 integraties.json (Guestplan/Untappd/toestemming), afbeeldingen.json, redirects*.json, teksten/
src/pages/       Eén bestand per pagina (of paginagroep); HTML-templates in JavaScript
src/templates/   Paginaschil (kop, voet, actiebalk), componenten, structured data
src/lib/         HTML-hulpmiddelen (escapen, <picture>, Markdown voor juridische teksten)
css/             tokens.css (huisstijl) → base → layout → components → pages/*  (wordt één bestand)
js/              main.js + modules/ (navigatie, reserveren, openingsstatus, agenda, menukaart, bierkaart, toestemming)
api/lib/         Untappd-kern (server-side, platformonafhankelijk)
functions/api/   Cloudflare Pages Function: GET /api/bierkaart
assets/          fonts (OFL), images (gegenereerd), brand (woordmerk, favicons), icons, og (deelbeelden)
scripts/         build, dev-server, afbeeldingen, og-beelden, untappd-sync, redirects-berichten, allergenen-import
tests/           unit/ (node --test), e2e/ (Playwright), lighthouse/ (meetrapporten), meet-cookies.mjs, schermen.mjs
docs/            01–10: analyse, audit, integraties, juridisch, ontwerp, SEO, testverslag, beheer, open punten
```

## Configureren

1. **Bedrijfsgegevens:** `data/site.json`. Vul vóór livegang `juridisch.statutaireNaam`, `kvkNummer` en `btwId` in; de bouw waarschuwt zolang ze leeg zijn.
2. **Reserveren (Guestplan):** `data/integraties.json` → `reserveren`. De accessKey is publiek en al ingevuld. Uitleg: `docs/05-guestplan-integratie.md`.
3. **Bierkaart (Untappd):** zonder verdere instellingen gebruikt de site de officiële Untappd-embed (pas na een klik). Met Untappd **Premium**: kopieer `.env.example` naar `.env` (lokaal) of zet de variabelen in de hosting. Uitleg: `docs/03-untappd-integratie.md`. **Zet nooit tokens in de code of in git.**
4. **Nieuwsbrief en cadeaukaart:** `data/site.json` → `nieuwsbrief.formAction` en `cadeaukaart.shopUrl`.

## Beheren

Zie **`docs/09-beheerhandleiding.md`**: openingstijden, menukaart, allergenen, evenementen, seizoensconcepten, foto’s, nieuwe pagina’s.

## Testen

```bash
npm run test:unit               # 8 eenheidstests (Untappd-kern, openingstijden)
npx playwright install chromium firefox webkit   # eenmalig
npx playwright test             # 216 end-to-end tests in 5 browserprofielen (start zelf een server op :4322)
```

## Preview online (GitHub Pages)

Bij elke push naar `main` bouwt GitHub de site en zet hem op **https://jelger1.github.io/de-wieetsjaf/** (workflow `.github/workflows/github-pages.yml`). Eenmalig instellen: **Settings > Pages > Build and deployment > Source: GitHub Actions**.

- De preview is openbaar voor wie de link heeft, maar **niet indexeerbaar** (`noindex` op elke pagina).
- De site staat daar in een submap; de bouw zet `/de-wieetsjaf` automatisch voor alle interne paden (afgeleid uit `SITE_URL`).
- GitHub Pages kent geen `_headers`, `_redirects` en serverfuncties. De bierkaart valt daar terug op de officiële Untappd-embed (na een klik). Voor de echte livegang blijft Cloudflare Pages het advies.

## Publiceren (advies: Cloudflare Pages)

De site is statisch, op één kleine serverfunctie na (`/api/bierkaart`). Cloudflare Pages ondersteunt alles wat erin zit: `_headers` (CSP en cache), `_redirects` (316 redirects) en `functions/`.

1. Koppel deze GitHub-repository aan een nieuw **Cloudflare Pages**-project.
2. **Build command:** `npm run build:productie` · **Output directory:** `dist` · **Node:** 20 of hoger.
3. **Omgevingsvariabelen:** `SITE_URL=https://www.wieetsjaf.nl`, `SITE_ENV=productie`, en eventueel de `UNTAPPD_*`-variabelen (het token als *secret*).
4. Optioneel: KV-namespace als binding `BIERKAART_KV`.
5. Bekijk eerst de **preview-URL** (`*.pages.dev`). Die is niet indexeerbaar zolang `SITE_ENV` niet `productie` is: gebruik voor previews een aparte omgeving zonder `SITE_ENV`.
6. Pas na akkoord: het domein `www.wieetsjaf.nl` koppelen in Cloudflare (DNS). **Niet gedaan in dit project.**
7. Na livegang: Search Console (sitemap `https://www.wieetsjaf.nl/sitemap.xml`), Google Bedrijfsprofiel bijwerken, 404’s volgen.

Een andere statische host kan ook (Netlify ondersteunt `_headers`/`_redirects` direct). Dan moet `functions/api/bierkaart.js` worden omgezet naar het functieformaat van die host; de kern in `api/lib/untappd.mjs` blijft gelijk.

**Dagelijks verversen (optioneel):** laat de bouw elke ochtend draaien (Cloudflare deploy hook + cron, of GitHub Actions) met `npm run untappd:sync && npm run build:productie`. Zo staan de agenda en de bierkaart ook zonder JavaScript up-to-date.

## Wat is er beter dan de oude website?

| Oud (WordPress) | Nieuw |
|---|---|
| Menukaart als 9 afbeeldingen (±1 MB), onvindbaar in Google | Menukaart als tekst: doorzoekbaar, filter op vegetarisch, printbaar, met prijzen in Google (structured data) |
| ±3 MB JavaScript en ±25 Google-lettertypefamilies op elke pagina | ±13 kB eigen JavaScript, 2 zelf gehoste fonts; Guestplan laadt pas bij een klik |
| Stripe-cookies en Google-verzoeken bij elk bezoek, geen privacyverklaring | Geen cookies of trackers; gemeten cookieoverzicht; concept-privacyverklaring |
| ‘Algemene voorwaarden’ was een leeg advocatensjabloon | Opgeschoond; loyaltyvoorwaarden behouden |
| Lege wijnkaart, ‘Info’ gaf een 404, dubbele saldopagina’s | Heldere structuur met 7 hoofdonderdelen, geen dode links (getest) |
| Evenementen verstopt tussen 293 nieuwsberichten | Agenda met eigen pagina per evenement, Beermonday automatisch, evenementen in Google |
| De Kluis stond nergens | Eigen sectie Groepen & De Kluis |
| Geen meta descriptions, generieke titels | Unieke titels en omschrijvingen, Restaurant-, Menu- en Event-structured data |
| Mobiel: inzoomen op plaatjes | Mobile first, met een vaste actiebalk Bel · Route · Reserveer |
| Huisstijl van de site week af van het drukwerk | Dezelfde letters, kleuren en vormen als de menukaart en de social posts |
| Bierkaart: Untappd-iframe direct geladen (met tracking) | Eigen weergave via de officiële API zodra Premium-toegang er is; anders de officiële embed pas na een klik |

## Licenties

- Lettertypes Bebas Neue en Hanken Grotesk: SIL Open Font License 1.1 (zie `assets/fonts/OFL-*.txt`).
- Foto’s en logo’s: eigendom van Dé Wieëtsjaf (gebruiksrechten te bevestigen, zie `docs/10-openstaande-punten.md`).
- Code: eigendom van Dé Wieëtsjaf.
