# 09 · Beheerhandleiding

Voor medewerkers en de beheerder van de website. Alle inhoud staat in **JSON-bestanden in de map `data/`**. Na een wijziging bouwt de site zichzelf opnieuw (bij hosting via git automatisch na een commit).

> **Tip:** open JSON-bestanden in VS Code of een andere editor die fouten laat zien. Let op komma’s en aanhalingstekens. Gaat er iets mis, dan stopt de bouw met een foutmelding en blijft de oude site online.

## Wat hoef je níet op de website te doen?

- **Bierkaart:** alleen bijwerken in **Untappd for Business**. De website neemt het automatisch over (zie `03-untappd-integratie.md`).
- **Reserveringen:** alleen in **Guestplan**.

## Openingstijden — `data/openingstijden.json`

```json
"zaak":   { "ma": ["12:00", "23:00"], "vr": ["10:00", "00:00"], … },
"keuken": { "ma": ["12:00", "20:00"], … }
```
- Gesloten op een dag: zet `null` in plaats van de tijden.
- **Afwijkende dag** (feestdag, sluiting): voeg een blok toe onder `afwijkend` en zet `"actief": true`:
```json
{ "datum": "2026-12-31", "zaak": ["10:00", "18:00"], "keuken": null, "label": "Oudejaarsdag", "actief": true }
```
De tijden verschijnen automatisch in de kop, de voet, op de contactpagina, in ‘Nu open’ en in Google (structured data).

## Menukaart — `data/menukaart.json`

Elk gerecht:
```json
{ "naam": "Limburgs zuurvlees", "omschrijving": "Zacht gegaard stoofvlees …", "prijs": 22.5, "favoriet": true, "streek": true, "veg": "V" }
```
- **Prijs** als getal met een **punt**: `22.5` wordt “22,50” en `15` wordt “15,-”.
- Twee prijzen: `"prijzen": [{ "label": "normaal", "prijs": 17.5 }, { "label": "klein", "prijs": 15.5 }]`.
- Toeslag op het lunchplankje: `"toeslag": 0.5`.
- `"veg": "V"` = vegetarisch, `"V*"` = vegetarisch mogelijk; `"favoriet": true` = hartje; `"streek": true` = pin (lokaal recept); `"tip": "Onze wijntip: …"`.
- Gerecht weghalen: verwijder het blok tussen `{ }` (let op de komma ervóór of erachter).
- Werk ook `"bijgewerkt"` bij (datum).

**Allergenen:** pas tonen als de keuken ze heeft gecontroleerd.
1. Laat de keuken `docs/allergenen-controlelijst.csv` invullen (een `x` per allergeen, plus naam en datum).
2. `node scripts/allergenen-import.mjs` controleert de lijst.
3. `node scripts/allergenen-import.mjs --publiceer` zet de allergenen in de menukaart. De site toont daarna per gerecht “Bevat: …”.

## Evenementen — `data/agenda.json`

Kopieer een bestaand blok onder `evenementen` en pas het aan. (De `//`-uitleg hieronder is alleen ter verduidelijking: JSON kent geen commentaar, dus neem die niet over.)
```json
{
  "id": "whisky-proeverij-2027",            // wordt de URL: /agenda/whisky-proeverij-2027/
  "titel": "Whiskyproeverij in De Kluis",
  "start": "2027-02-10T19:30",              // of alleen de datum: "2027-02-10"
  "eind":  "2027-02-10T22:00",
  "datumTekst": "Woensdag 10 februari 2027, 19.30 uur",
  "kort": "Eén zin voor in de lijst.",
  "omschrijving": "Een paar zinnen voor de eigen pagina.",
  "prijs": "€ 35 p.p.", "prijsWaarde": 35,
  "reserveren": { "verplicht": true, "via": "guestplan", "guestplanService": "CODE-UIT-GUESTPLAN" },
  "afbeelding": "wijnen",                    // sleutel uit data/afbeeldingen.json
  "bevestigd": true                          // alleen dan krijgt Google het evenement te zien
}
```
- Voorbije evenementen verdwijnen vanzelf (ook als de site een paar dagen niet opnieuw is gebouwd).
- **Beermonday** komt automatisch elke eerste maandag in de agenda. Brouwerij bekend? Vul onder `terugkerend` → `brouwerijPerDatum` in: `"2026-12-07": "Brouwerij X"`. Valt een Beermonday uit? Zet de datum in `uitzonderingen`.

## Seizoensconcepten en arrangementen — `data/arrangementen.json`

- `actief: false` haalt een arrangement van de site; `tot: "2027-01-21"` laat het na die datum automatisch verdwijnen.
- `uitgelicht: true`: het arrangement staat groot op de homepage (één tegelijk).
- `archiveren: true`: de pagina blijft bestaan met de melding “niet te boeken” (zonder indexering); `false`: de pagina verdwijnt.
- Guestplan-services staan onder `reserveren` (`guestplanService` of een lijst `diensten`).

## Bedrijfsgegevens — `data/site.json`

Naam, adres, telefoon, e-mail, social media, en (nog in te vullen) **statutaire naam, KvK-nummer en btw-id**. Eén keer aanpassen geldt overal: kop, voet, contact, structured data.

## Foto’s — `data/afbeeldingen.json` + `npm run images`

1. Zet de originele foto in de hoofdmap `Dé Wieëtsjaf` (of in `assets/originals/`).
2. Voeg een regel toe met een sleutel, het bronpad, een **beschrijvende alt-tekst** en de breedtes, bijvoorbeeld `[480, 800, 1200]`.
3. Draai `npm run images` (Python + Pillow): dat maakt AVIF- en WebP-versies. Originelen blijven onaangetast.
4. Gebruik de sleutel in een pagina of in `agenda.json`.

## Teksten van pagina’s

Staan in `src/pages/*.mjs` (HTML in JavaScript-templates). Juridische teksten staan in `data/teksten/` (Markdown en JSON). Zoek de zin op en pas hem aan; houd de `${…}`-delen intact.

## Nieuwe pagina toevoegen

1. Kopieer bijvoorbeeld `src/pages/cadeaukaart.mjs` naar `src/pages/mijn-pagina.mjs` → URL `/mijn-pagina/`.
2. Pas titel, omschrijving en inhoud aan.
3. Wil je hem in het hoofdmenu? Voeg hem toe aan `NAVIGATIE` in `src/templates/layout.mjs`.
4. De sitemap past zich vanzelf aan.

## Huisstijl

Kleuren, lettertypes, ruimtes en vormen staan op één plek: `css/tokens.css`. Pas daar een kleur aan en hij verandert overal.

## Nieuwsbrief, cadeaukaart, tracking

- Nieuwsbrief: vul `site.json` → `nieuwsbrief.formAction` (en `aanbieder`). Het formulier verschijnt dan op `/over-ons/#nieuwsbrief`.
- Cadeaukaart: vul `site.json` → `cadeaukaart.shopUrl`. De knop ‘Bestel een cadeaukaart’ verschijnt dan.
- Tracking (bijvoorbeeld Meta Pixel): **eerst** `integraties.json` → `consent.actief: true`, dan het script toevoegen met `type="text/plain" data-consent="marketing"`. Pas de privacy- en cookiepagina aan.

## Meertaligheid (later)

De site is nu Nederlands. Voor Duits en Engels: teksten per taal in `data/` (bijv. `menukaart.de.json`) en een taalmap (`/de/`, `/en/`) in de bouwstap. Laat vertalingen controleren door een moedertaalspreker: er worden **geen** automatische vertalingen gepubliceerd.

## Oude inhoud archiveren

Evenementen en arrangementen verdwijnen vanzelf. Wil je een oude pagina weghalen die bezoekers nog via Google vinden? Voeg een redirect toe in `data/redirects.json` (`{ "van": "/oud/", "naar": "/nieuw/" }`).
