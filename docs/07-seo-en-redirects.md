# 07 · SEO en redirects

## Geïmplementeerd

| Onderdeel | Hoe |
|---|---|
| Unieke titels | Per pagina in `src/pages/*.mjs`, met plaatsnaam waar relevant (“Menukaart: lunchen en dineren in Kerkrade”) |
| Meta descriptions | Per pagina, 100–160 tekens (in de tests afgedwongen) |
| Koppen | Precies één `h1` per pagina (getest); logische `h2`/`h3` |
| Canonical | Absolute URL per pagina (`SITE_URL` bij een productiebouw) |
| Open Graph / Twitter | Titel, omschrijving, 1200 × 630-beelden in de huisstijl (`assets/og/`) |
| Sitemap | `dist/sitemap.xml` (automatisch, zonder 404 of verlopen arrangementen) |
| robots.txt | Productie: alles toegestaan behalve `/api/`. **Lokaal en preview: `Disallow: /`** + `noindex` in elke pagina + `X-Robots-Tag` |
| Structured data | `Restaurant`/`BarOrPub` met adres, geo, openingstijden, telefoon, `hasMenu`, `acceptsReservations`, `ReserveAction`; `Menu` met alle gerechten en prijzen; `Event` alleen voor **bevestigde** evenementen; `BreadcrumbList`. **Geen** reviews of ratings |
| Interne links | Home → alle hoofdpagina’s; kruimelpaden; agenda ↔ arrangementen; menukaart ↔ bierkaart |
| Beschrijvende URL’s | `/menukaart/`, `/bierkaart/`, `/arrangementen/alpine-gondel-dining/`, `/agenda/beermonday/` |
| Alt-teksten | Elk beeld een beschrijvende alt (centraal in `data/afbeeldingen.json`); decoratief = leeg |
| Snelheid | Lighthouse SEO 100 op alle gemeten pagina’s (zie 08) |

**Zoekwoorden, natuurlijk verwerkt:** restaurant Kerkrade (home, titel), lunchen en dineren in Kerkrade (menukaart), speciaalbier Kerkrade (bierkaart), terras (home, over ons, gondel), Markt Kerkrade (home, contact), groepen/vergaderen Kerkrade (groepen), Beermonday (agenda).

## Consistente bedrijfsgegevens (NAP)

Overal dezelfde naam, hetzelfde adres en telefoonnummer, uit één bron (`data/site.json`): **Dé Wieëtsjaf, Markt 47, 6461 ED Kerkrade, 045 888 85 42**. Ook het Google Bedrijfsprofiel moet deze schrijfwijze krijgen (open punt).

## Redirects (301)

De bouw maakt `dist/_redirects` (Cloudflare Pages/Netlify-formaat) uit:
1. `data/redirects.json`: alle oude **pagina’s** met de hand gekoppeld (tabel hieronder);
2. `data/redirects-berichten.json`: alle **283 overige oude berichten**, automatisch ingedeeld op trefwoorden door `scripts/redirects-berichten.mjs` (bron: `docs/bronnen/oude-post-sitemap.xml`);
3. archieven: `/category/*` en `/tag/*` → `/agenda/`, `/author/*` en `/feed/*` → `/`.

| Oud | Nieuw |
|---|---|
| `/menukaart/`, `/bierkaart/`, `/reserveren/`, `/contact/` | blijven gelijk |
| `/info/` (was 404) | `/contact/` |
| `/wijnkaart/` | `/bierkaart/#wijn` |
| `/kerstmenu-2026/`, `/kerst-samen-natuurlijk/` | `/arrangementen/kerstmenu-2026/` |
| `/chefsmenu-november-2026/` | `/arrangementen/chefsmenu/` |
| `/impressie/`, `/links/` | `/over-ons/` |
| `/wandelingen/` | `/over-ons/#wandelen` |
| `/nieuwsbrief/` (+ 3 MailPoet-pagina’s) | `/over-ons/#nieuwsbrief` |
| `/nieuws/` | `/agenda/` |
| `/verenigingen/` | `/groepen/#verenigingen` |
| `/het-jaar-feestelijk-afsluiten/` | `/groepen/` |
| `/vacatures/` | `/werken-bij/` |
| `/saldo/`, `/saldo-2/` | `/cadeaukaart/` |
| `/algemene-voorwaarden/` | `/privacy/` |
| `/loyaltyprogramma-voorwaarden/` | `/voorwaarden/loyaltyprogramma/` |
| `/beermonday-is-terug/` (+ andere Beermonday-berichten) | `/agenda/beermonday/` |
| `/autumn-high-wine-bij-de-wieetsjaf/` | `/agenda/autumn-high-wine-2026/` |
| `/cuvee-de-wieetsjaf/` en andere wijnberichten | `/bierkaart/#wijn` |
| Gerechtberichten (`/onze-burgers/`, `/onze-nieuwe-lunchplank/`, …) | `/menukaart/` (43 berichten) |
| Bierberichten (`/wmc-blond-bij-ons-verkrijgbaar/`, …) | `/bierkaart/` (37) |
| Overige berichten (evenementen, acties, 2015–2026) | `/agenda/` (166) |

Verdeling automatisch ingedeelde berichten: agenda 166, menukaart 43, bierkaart 37, wijn 13, arrangementen 7, contact 6, beermonday 4, werken bij 2.

**Niet doorgestuurd:** `/wp-content/uploads/*` (oude afbeeldingen). Die geven na de overstap een 404; externe links naar afbeeldingen zijn zeldzaam. Wil je dat voorkomen, laat de uploads-map dan tijdelijk op de oude server staan.

## Na livegang

1. Google Search Console: domein verifiëren, de nieuwe sitemap indienen, ‘Pagina’s’ controleren op 404’s.
2. Google Bedrijfsprofiel: website-, menu- en reserveringslink bijwerken.
3. Na 4–6 weken: 404-rapport bekijken en eventueel `data/redirects.json` aanvullen.
