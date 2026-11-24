# 02 · Audit huidige website wieetsjaf.nl

*Onderzocht op 24 november 2026: de lokale download (`wieetsjaf.nl/`: homepage + één pagina) en de live site (alle pagina’s uit `page-sitemap.xml`, 14 recente berichten en de sitemaps). De originele bestanden zijn niet aangepast. Bronnen van de sitemaps staan in `docs/bronnen/`.*

## 1. Techniek

| Onderdeel | Bevinding |
|---|---|
| Platform | WordPress 7.1.1, thema Astra 4.13, paginabouwer Spectra (UAG), Yoast SEO 28.6 |
| Scripts op elke pagina | jQuery + migrate, WordPress-emoji, Slick-carrousel, Spectra-scripts, **Stripe.js** (via GiveACard-embed), **Guestplan-widget** (3,1 MB bundel), WP Statistics-tracker |
| Lettertypes | ±25 Google-fontfamilies geladen vanaf `fonts.googleapis.com` (Fira Sans, Alegreya, Roboto, Cardo, Exo 2, Cormorant, …) terwijl er visueel maar enkele worden gebruikt. Laden vanaf Google-servers stuurt het IP-adres van bezoekers naar Google |
| Analytics/tracking | Geen Google Analytics of Meta Pixel gevonden (in de broncode stonden alleen ‘fbq’-tekens in base64-data). Wel WP Statistics (eigen server) |
| Cookiemelding | Geen. Stripe.js zet bij elk bezoek functionele cookies (`__stripe_mid`, `__stripe_sid`) |
| Formulieren | MailPoet-nieuwsbrief; WordPress-reactieformulieren onder pagina’s als ‘Wijnkaart’, ‘Verenigingen’, ‘Links’ en bij elk bericht |
| Gestructureerde data | Alleen Yoast `WebPage`/`Organization`, geen `Restaurant`, geen openingstijden, geen evenementen. Organisatienaam “De Wieëtsjaf”, logo `Wieetsjaf-Logo-nieuw.jpg` |
| robots.txt | Alles toegestaan, sitemap-index aanwezig |
| Meta descriptions | **Ontbreken op alle onderzochte pagina’s** |
| Titels | “Home - De Wieetsjaf”, “Menukaart - De Wieetsjaf”: zonder plaatsnaam of onderscheidend trefwoord |

## 2. Pagina-inventaris

| Oude URL | Inhoud | Oordeel | Nieuwe plek |
|---|---|---|---|
| `/` | Hero “welkom bij de wieëtsjaf – Hèt restaurant van Kerkrade”, algemene teksten over impressie/wandelaars, nieuwsslider (dubbele berichten), openingstijden | Generieke teksten, nieuws dubbel getoond | `/` (volledig nieuw) |
| `/menukaart/` | **9 afbeeldingen** (1085 × 2000 px) + reacties uit 2016/2018 | Niet doorzoekbaar, niet leesbaar voor schermlezers, zwaar op mobiel, niet indexeerbaar | `/menukaart/` als HTML |
| `/kerstmenu-2026/` | 2 afbeeldingen + Guestplan-servicelink | Idem | `/arrangementen/kerstmenu-2026/` |
| `/bierkaart/` | Officiële Untappd-iframe (`business.untappd.com/embeds/iframes/22030/83945`) | Werkt, maar laadt direct Untappd + Segment-tracking | `/bierkaart/` (API-proxy, embed alleen na klik) |
| `/wijnkaart/` | **Leeg**, alleen een reactieformulier | Bezoeker vindt niets | Wijnblok op `/bierkaart/#wijn` |
| `/reserveren/` | Tekst + link `guestplan.io/?i=…` | Werkt; extra stap | `/reserveren/` + reserveerknop overal |
| `/contact/` (titel ‘Informatie’) | Openingstijden, adres, telefoon, e-mail | Goed; menu-item heet ‘Info’ | `/contact/` |
| `/impressie/` | 30 foto’s + Google Street View-embed (laadt Google zonder toestemming) | Mooie foto’s, slechte opmaak, foto’s zonder alt-tekst | `/over-ons/` (selectie) |
| `/nieuws/` + 293 berichten (2015–2026) | Mix van gerechten, evenementen, acties, corona-meldingen | Evenementen tussen nieuws, geen agenda | `/agenda/` (+ redirects) |
| `/nieuwsbrief/` (+ 3 MailPoet-pagina’s) | MailPoet-formulier | Werkt alleen met WordPress | `/over-ons/#nieuwsbrief` (aanbieder kiezen) |
| `/wandelingen/` | Tekst + links Wandelgids en Smart Market | Nuttig, dun | `/over-ons/#wandelen` |
| `/verenigingen/` | Lijst van ±20 verenigingen + reacties | Waardevol (stamcafé) | `/groepen/#verenigingen` |
| `/vacatures/` | Eén afbeelding met tekst | Niet leesbaar/doorzoekbaar | `/werken-bij/` als tekst |
| `/saldo/`, `/saldo-2/` | Iframe saldochecker Loyalty in a Box (dubbel) | Dubbele pagina | `/cadeaukaart/` |
| `/links/` | Links naar bedrijven (uitvaart, ledverlichting, …) + reacties | Niet relevant voor gasten | Vervalt (→ `/over-ons/`) |
| `/algemene-voorwaarden/` | **Een niet-ingevuld privacysjabloon** (“De Wieetsjaf hier zelf de opsomming…”, “waarneming van de praktijk door een andere advocaat”) | Juridisch onjuist en ongeloofwaardig | `/privacy/` (nieuw concept) |
| `/loyaltyprogramma-voorwaarden/` | Voorwaarden loyaltyprogramma v1.0 | Goed, behouden | `/voorwaarden/loyaltyprogramma/` (letterlijk) |
| `/info/` | 404 | Kapotte link in navigatie | → `/contact/` |
| Privacy-/cookiepagina | **Bestaat niet** (404 op `/privacy/`, `/privacyverklaring/`, `/cookiebeleid/`) | Verplichte informatie ontbreekt | `/privacy/`, `/cookies/` |

## 3. Wat werkt goed (behouden)

- Professionele fotografie van interieur, team en gerechten.
- Correcte basisgegevens: Markt 47, 6461 ED Kerkrade, 045 888 85 42, info@wieetsjaf.nl.
- Guestplan-integratie (accessKey `9f563a…1d9`) en de directe link `guestplan.io/?i=…` werken.
- Officiële Untappd-koppeling bestaat al (location 22030, embed-thema 83945).
- Duidelijke openingstijden in de voet.

## 4. Problemen

1. **Menukaart als afbeeldingen**: ±1 MB op mobiel, niet zoekbaar, niet toegankelijk, prijzen niet vindbaar in Google.
2. **Snelheid:** 3+ MB JavaScript per pagina (Guestplan-bundel, Stripe, jQuery, carrousels) en tientallen fontbestanden, nog vóórdat iemand iets aanklikt.
3. **Privacy:** Google Fonts en Street View zonder toestemming, Stripe-cookies bij elk bezoek, geen privacyverklaring.
4. **Juridisch:** het privacysjabloon onder ‘Algemene voorwaarden’ is niet ingevuld; KvK-nummer en btw-id ontbreken op de site.
5. **Navigatie:** ‘Info’ leidt naar 404; evenementen zitten verstopt in ‘Nieuws’; De Kluis staat nergens.
6. **Dubbel/verouderd:** twee saldopagina’s, nieuwsslider met dubbele berichten, reacties uit 2016–2020 onder pagina’s, een lege wijnkaart.
7. **Tegenstrijdig:** keuken ‘dagelijks 11.00–20.00’ maar maandag open vanaf 12.00; desserts tot 21:00 terwijl de keuken om 20:00 sluit.
8. **Schrijfwijze:** afwisselend “De Wieetsjaf”, “De Wieëtsjaf” en “Dé Wieëtsjaf”.
9. **Mobiel:** geen snelle bel-/routeknop; menukaartplaatjes moeten worden ingezoomd.
10. **Alt-teksten** ontbreken bij vrijwel alle afbeeldingen.

## 5. SEO-waarde die behouden moet blijven

- De URL’s `/menukaart/`, `/bierkaart/`, `/reserveren/`, `/contact/` blijven gelijk.
- Alle overige pagina’s én alle 293 berichten krijgen een **301-redirect** naar de best passende nieuwe pagina (zie `07-seo-en-redirects.md`).
- Het Google Bedrijfsprofiel (niet onderzocht, geen toegang) moet na livegang naar de nieuwe URL’s verwijzen.

## 6. Externe integraties en scripts (niet blind overgenomen)

| Integratie | Oud | Nieuw |
|---|---|---|
| Guestplan | Op elke pagina geladen (3,1 MB) | Pas geladen na klik op ‘Reserveer’; zwevende knop uit |
| Untappd | Iframe direct geladen | Server-side API (bij Premium) of embed pas na klik |
| GiveACard + Stripe | Op elke pagina geladen | Niet op de site; cadeaukaartpagina met link (shop-URL op te vragen) |
| Loyalty in a Box | Iframe | Link naar de saldochecker |
| Google Fonts | ±25 families van Google | 2 families, zelf gehost |
| Google Maps/Street View | Embed zonder toestemming | Link naar Google Maps |
| WP Statistics | Eigen server | Vervalt (geen statistieken; optioneel later privacyvriendelijk) |
| MailPoet | WordPress | Aanbieder te kiezen (open punt) |

## 7. Door de eigenaar te controleren

Zie `10-openstaande-punten.md`. Belangrijkste: KvK-nummer en statutaire naam, keuken op maandag, desserttijd, of de vacature nog openstaat, de GiveACard-shoplink, en de looptijd van Alpine Gondel Dining.
