# 01 · Huisstijlanalyse Dé Wieëtsjaf

*Opgesteld 24 november 2026. Gebaseerd op visuele inspectie van de bestanden in de hoofdmap `Dé Wieëtsjaf` (gerenderd en bekeken, niet alleen uitgelezen) en de huidige website.*

## 1. Bronnen en wat leidend is

Dé Wieëtsjaf heeft geen apart brandbook voor het restaurant. De huisstijl blijkt uit drie consistente families van uitingen:

| Familie | Bronbestanden (bekeken) | Rol |
|---|---|---|
| **Menukaart 2026** | `wieetsjaf.nl/images/1.jpeg` t/m `9.jpeg` (menukaart oktober 2026, 1085 × 2000 px) | Leidend voor de **papieren, redactionele** kant: lichte ondergrond, Bebas-koppen, labelblokken, panelen |
| **Social / promo** | `insta post voorbeelden stijl Dé Wieëtsjaf/*.jpeg` (6 posts), `Instagram Alpine Gondel Dining/Posts V3/*.jpg` (14 posts) met `Illustrator/LEES MIJ - Illustrator.txt` en `_bron/README.md` | Leidend voor **kleur en compositie**: bosgroen, crème, goud, rond logo op de naad, gouden streep |
| **Sanctus-bieren** (sub-merk) | `Claude-werkmap/stijlgids/index.html`, `Sanctus-serie brandboard/`, `Wieëtsjaf x Brouwerij Rolduc/Brandboard-Sanctus-Fusion-Compleet.pdf`, taplenzen in `videos/_assets/img/` | Eigen beeldtaal (gravure-krans, zon, Ohm-letter). Alleen gebruikt voor de Sanctus-onderdelen |

Het **woordmerk** “dé WIEËTSJAF »SINCE 2008«” staat als vector in `Brandboard-Sanctus-Fusion-Compleet.pdf` (sectie *Logo* en *Typeface*). Het is daaruit losgemaakt als `assets/brand/woordmerk.svg` (23 paden, 7,5 kB, `fill="currentColor"`, dus in elke huisstijlkleur te gebruiken). Op de huidige site staat het alleen als witte PNG van 600 px (`logo_2022_600.png`).

Het **ronde logo** (W in een crème schijf met “EAT • DRINK • PARTY” en “• SINCE 2008 •”) bestaat alleen als PNG van 509 px (`Instagram Alpine Gondel Dining/Illustrator/Elementen/logo-wieetsjaf-rond.png`, uitgeknipt uit de Mercato-post). Er is geen vectorversie gevonden. **Actiepunt:** het originele bestand opvragen bij de maker van het logo.

## 2. Kleur

Kleuren gemeten in de bestanden. De social-kleuren staan letterlijk in de Illustrator-bestanden (`LEES MIJ - Illustrator.txt`); de menukaartkleuren zijn gemeten als dominante kleuren in de menukaartbeelden (gekwantiseerd, dus ±2 per kanaal).

| Rol | HEX | RGB | Bron | Gebruik op de site |
|---|---|---|---|---|
| Bosgroen | `#11271B` | 17, 39, 27 | Social, exact | Donkere vlakken, kop van knoppen, voet, actiebalk |
| Bosgroen 2 (berglijn) | `#1A3828` | 26, 56, 40 | `Elementen/bergen.svg`, exact | Hover-tint, berglijn |
| Crème | `#F5E6C5` | 245, 230, 197 | Social, exact | Tekst en logo op donker |
| Goud | `#D0A550` | 208, 165, 80 | Social, exact | Streep onder accentwoord, knoppen op donker, kaders |
| Salie | `#A3B295` | 163, 178, 149 | Social, exact | Ondertitels op donker |
| Papier | `#F1EEE7` | 241, 238, 231 | Menukaart, gemeten | Hoofdondergrond |
| Paneel | `#EBE2D3` | 235, 226, 211 | Menukaart, gemeten | Uitgelichte panelen (Lunchplankje, specials) |
| Inkt | `#30312C` | 48, 49, 44 | Menukaart, gemeten | Lopende tekst |
| Olijf | `#3E4336` | 62, 67, 54 | Menukaart, gemeten | Koppen en labelblokken |
| Oker-tekst | `#7D5A17` | 125, 90, 23 | Afgeleid van goud | Kleine okerkleurige tekst op papier (goud zelf is daar te licht) |

**CMYK:** voor de restaurantkleuren zijn geen CMYK-waarden vastgelegd (de menukaart en de posts zijn RGB-ontwerpen). Voor de Sanctus-reeks staan CMYK-waarden in `Claude-werkmap/data/bb_assets.json` en het brandboard. Voor drukwerk van het restaurant: CMYK laten bepalen door de drukker op basis van de HEX-waarden hierboven.

**Contrast (WCAG 2.2, gemeten):**

| Combinatie | Verhouding | Oordeel |
|---|---|---|
| Crème op bosgroen | 12,79 : 1 | AAA |
| Goud op bosgroen | 6,90 : 1 | AA (ook kleine tekst) |
| Salie op bosgroen | 7,04 : 1 | AAA |
| Inkt op papier | 11,32 : 1 | AAA |
| Olijf op papier (en papier op olijf) | 8,79 : 1 | AAA |
| Oker-tekst op papier | 5,42 : 1 | AA |
| Bosgroen op goud (knoppen op donker) | 6,90 : 1 | AA |
| **Goud op papier** | **1,97 : 1** | Onvoldoende: alleen decoratief (strepen, kaders) |

Niet overgenomen: het groen `#136813` uit de huidige site en de Guestplan-instelling. Dat is geen huisstijlkleur.

## 3. Typografie

| Rol | Letter in het drukwerk | Op de website | Onderbouwing |
|---|---|---|---|
| Koppen (‘LUNCH’, ‘DINER’, ‘WELKOM BIJ’) | **Bebas Neue** | Bebas Neue, zelf gehost (OFL, 11,7 kB) | Exact dezelfde letter als op de kaart en in de posts (bevestigd in de Illustrator-README) |
| Lopende tekst menukaart | Een geometrische grotesk, vermoedelijk uit Canva; naam niet vastgesteld | **Hanken Grotesk** (OFL, variabel 300–700, 27,7 kB + cursief 27,6 kB) | Twaalf open-source kandidaten zijn naast de kaart gelegd. Hanken Grotesk komt het dichtst bij in breedte, x-hoogte en gewicht, en heeft een echte cursief (nodig voor omschrijvingen) |
| Ondertitels in brede kapitalen (social) | Copperplate Gothic Bold (benadering van ‘een brede stempelletter’) | Hanken Grotesk 700, kapitalen, spatiëring 0,14 em, spaarzaam | Copperplate heeft geen vrije webfontlicentie; één letterfamilie minder is ook sneller |
| Script-accenten (‘Lunchplankje’, ‘Butter & Bread’) | Een droge kwast-script | **Niet** gebruikt; panelen krijgen een Bebas-titel op de rand | Een extra lettertype voor een paar woorden kost laadtijd en voegt online weinig toe |
| Sanctus | Ohm (Adobe Fonts), Matura MT Script Capitals | Niet als font; de taplenzen worden als beeld gebruikt | Licentie Adobe Fonts dekt geen zelf-gehost webgebruik buiten Adobe-projecten |

**Hiërarchie op de site:** display (`LUNCH`, 4,25–9,5 rem) › H1 (2,9–5,25 rem) › H2 (2,4–3,75 rem) › H3 (1,6–2 rem), allemaal Bebas; daaronder Hanken Grotesk 17 px als basis, 300 voor intro’s, 700 voor gerechtnamen. Bebas heeft alleen kapitalen. Daarom staan koppen niet in `text-transform`, en lopende tekst nooit in kapitalen.

**Te bevestigen door de eigenaar/ontwerper:** de exacte naam van de broodletter van de menukaart. Is dat een webfont met licentie, dan kan Hanken Grotesk 1-op-1 worden vervangen in `css/tokens.css`.

## 4. Logo’s en merktekens

| Teken | Bestand | Gebruik op de site |
|---|---|---|
| Woordmerk dé WIEËTSJAF »SINCE 2008« | `assets/brand/woordmerk.svg` (vector uit het Fusion-brandboard) | Kop (bosgroen), voet en mobiel menu (crème), OG-beelden |
| Rond logo EAT • DRINK • PARTY | `logo-rond` (PNG/WebP, 128/256 px) | **Op de naad** tussen foto en groen vlak, net als in de posts. Maximaal één keer per scherm |
| Citroen-W, Sanctus-zon | Sanctus-bestanden | Alleen via de taplenzen |
| Limburgs Abdijbier-keurmerk | Brandboard | Niet gebruikt: volgens `videos/…/LEESMIJ.txt` niet bevestigd voor Mordax en Equinox |

## 5. Vormentaal en compositie (vertaald naar componenten)

| In het drukwerk | Waar | Component op de site |
|---|---|---|
| Kop in donkere blokken (‘WELKOM BIJ / DE WIEËTSJAF’) | Voorkant menukaart | `.blokkop`, de H1 op de homepage |
| Groot ‘LUNCH’ met kleine tijd ernaast (‘11:00 – 17:00 UUR’) | Elke kaartpagina | `.kaartkop` (home en menukaart) |
| Sectielabels: donker blokje met lichte tekst (‘Soepen’, ‘Vis’) | Menukaart | `.label` en de sectiekoppen van de bierkaart |
| Beige paneel met titel óp de rand (‘Lunchplankje’, ‘Wieëtsjaf specials’) | Menukaart | `.paneel` + `.paneel__titel` |
| Okerkleurig kader met afgeronde hoeken (‘Allergenen’, ‘Extra’s’) | Menukaart | `.kader` |
| ♥ favoriet en 📍 lokaal recept, (V) en (V*) | Menukaart | Iconen en `.veg` bij gerechten |
| Foto met **gescheurde papierrand** | Menukaart p. 2 (walk-in fridge) | `.foto--scheur` (SVG-masker, randhoogte vast) |
| ‘Lunch ◉ Diner ◉ Borrel ◉ Feestzaal’ | Voorkant menukaart | `.reeks` |
| Foto + effen groen vlak, rond logo op de naad | Alle social posts | Seizoensblok op home, kop van de Gondel-pagina |
| Gouden streep onder het accentwoord | Social posts | `.streep` |
| Brede kapitalen-ondertitel | Social posts | `.ondertitel` (spaarzaam) |
| Berglijn en lijnillustraties (gondel, plank, glazen, allergie) | Alpine-carrousel | Gondel-pagina (‘Goed om te weten’) |

**Vormen per type, bewust verschillend:** knoppen en labels bijna haaks (3 px, zoals de labels op de kaart), panelen 14 px, kaders 10 px, foto’s haaks of gescheurd. Geen pillen, geen kaartjes-in-kaartjes.

## 6. Fotografie

- **Interieur en team** (`Impressie-*.jpg`, `IMG_93xx.jpg`): professioneel, warm, donkere achtergronden, groene schorten met woordmerk. Sterk en authentiek, maar alleen beschikbaar in **600–800 px** (ook op de live site zijn geen grotere versies). Daarom laat het ontwerp deze foto’s nooit breder dan ±600 px zien, in kaders en collages.
- **Alpine Gondel Dining** (`Fotografie-Gondola-Dé Wieëtsjaf/`, 12 foto’s, 2500 × 3750 px): hoge resolutie, avond, kerstverlichting. Geschikt voor schermvullend gebruik.
- **Sanctus**: taplenzen (900 px, rond, transparant) en de barman aan de tap (2500 px). Volgens de afspraak (“alleen van de tap”) geen blikken.
- Niet gebruikt: blik-mockups (Sanctus is tap-only), AI-proefbeelden (`*-test-man*.jpg`, `tap-ai`), oude posters met tekst in het beeld, gedateerde actiebeelden.

**Wens voor nieuwe fotografie:** zie `docs/10-openstaande-punten.md` (De Kluis, gevel overdag, terras in de zomer, het team, interieur in hoge resolutie).

## 7. Tone of voice

Uit menukaart, posts en websiteteksten:
- **Je/jij**, direct en gastvrij: “bij ons voel je je altijd thuis”, “Stap de fridge gerust binnen”.
- Korte zinnen, concreet: “Kies 3 gerechten 16,50”, “Vol = vol”.
- Lokaal en een tikje eigenwijs: Limburgs zuurvlees “naar lokaal recept”, “Splitsen = Tikkie sturen”, Kirchröadsjer verenigingen.
- Social mag speelser (“Ski’s niet nodig. Honger wel.”). Op de site gebruiken we dat alleen in koppen van seizoensconcepten.
- **Schrijfwijze:** altijd **Dé Wieëtsjaf** (met accenten). Op de huidige site en in de kerstmenu-pdf staat vaak “De Wieetsjaf”.

## 8. Inconsistenties tussen uitingen (gevonden)

| Wat | Waar | Advies |
|---|---|---|
| “De Wieetsjaf” zonder accenten | Huidige site, kerstmenu-afbeeldingen, schema.org | Overal “Dé Wieëtsjaf”; zonder accenten alleen als zoekvariant (`alternateName`) |
| Kerstmenu 2026 in Times/Helvetica, wit met bruin | `Kerstmenu_De_Wieetsjaf_Kerkrade_2026-*.jpg` | Wijkt af van de huisstijl. Op de site staat het kerstmenu nu als tekst in de huisstijl |
| Fusion-smaak “framboos” | Tafelkaart en brandboard | Volgens de eigenaar (en de video-oplevering): **citrus, hop en tropisch fruit**. Zo staat het op de site |
| Fusion 7,4% / 7,5% | Oudere Mordax-kaart | 7,5% aangehouden (keuze klant, zie werkmap) |
| Dessertstijd 21:00, keuken tot 20:00 | Menukaart vs. openingstijden | Laten bevestigen (zie 10-openstaande-punten) |
| Keuken “dagelijks 11:00”, maar maandag open om 12:00 | Huidige site | Op de site: maandag keuken vanaf 12:00 |

## 9. Ontwerpbeslissingen in het kort

1. Twee registers die de zaak zelf al gebruikt: **papier** (menukaart: informatief, lezen, kiezen) en **bosgroen** (social: sfeer, bier, seizoen). Elke pagina wisselt ze af in plaats van alles grijs-wit.
2. Typografie zoals op de kaart: Bebas groot en gedurfd, de rest rustig en leesbaar.
3. Merkdetails sparen: één rond logo per scherm, gouden streep alleen onder het accentwoord, gescheurde rand alleen op enkele foto’s.
4. Geen nieuwe kleuren, geen gradients, geen schaduwen, geen glas-effecten. De enige ‘textuur’ is de berglijn uit de eigen Alpine-elementen.
