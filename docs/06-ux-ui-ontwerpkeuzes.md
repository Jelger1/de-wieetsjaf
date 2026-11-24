# 06 · UX- en UI-ontwerpkeuzes

## Uitgangspunt

De site moet voelen als de menukaart en de Instagram-posts van Dé Wieëtsjaf: hetzelfde bureau, dezelfde hand. Daarom is er geen nieuw beeldmerk, kleur of lettertype bedacht. Bestaande onderdelen zijn vertaald naar schermcomponenten (zie `01-huisstijlanalyse.md`, §5).

## Sitemap en navigatie

```
Home
├── Menukaart              (lunch, diner, borrel, kids, desserts, allergenen)
├── Bierkaart              (live Untappd, Sanctus, wijn)
├── Agenda                 ── /agenda/beermonday/, /agenda/<evenement>/
├── Arrangementen          ── /arrangementen/alpine-gondel-dining/, /kerstmenu-2026/, /chefsmenu/
├── Groepen & De Kluis     (De Kluis, groepen, bedrijven & kerst, verenigingen)
├── Over ons               (verhaal, impressie, wandelen, nieuwsbrief)
├── Contact                (adres, route, bellen, openingstijden zaak + keuken)
├── Reserveren
└── Voet: Cadeaukaart · Werken bij · Privacy · Cookies · Toegankelijkheid · Voorwaarden (+ loyaltyprogramma) · 404
```

Zeven hoofdonderdelen plus een vaste reserveerknop, zonder submenu’s. Gecombineerd waar het de bezoeker helpt:
- **Drankenkaart + bierkaart + wijnkaart** → één pagina **Bierkaart** (de oude wijnkaart was leeg; wijn staat op dezelfde pagina).
- **Evenementen + Beermonday + nieuws** → **Agenda**. Nieuwsberichten verouderen; evenementen niet.
- **Speciale arrangementen + Alpine Gondel Dining + kerstmenu** → **Arrangementen**, aan/uit te zetten per seizoen.
- **Groepen + verenigingen + De Kluis + kerstborrels** → één pagina.
- **Impressie + wandelen + nieuwsbrief + links** → **Over ons**.

## De negen bezoekersvragen

| Vraag | Antwoord binnen 1 tik/scroll |
|---|---|
| Kan ik reserveren? | Knop in de kop, in de hero en in de mobiele actiebalk |
| Wat kan ik eten? | Homepage: Lunch/Diner-blok met prijzen; menukaart als doorzoekbare tekst |
| Welke bieren? | Homepage-blok ‘Uit de walk-in fridge’; bierkaart met zoeken en filters |
| Openingstijden? | ‘Vandaag’-band direct onder de hero (live ‘Nu open tot …’), voet, contact |
| Waar? | ‘Vandaag’-band + ‘Route’ in de actiebalk (opent navigatie) |
| Wat kost het? | Prijzen als tekst bij elk gerecht en arrangement |
| Evenementen? | ‘Binnenkort’ op home, agenda met datumblokken |
| Met een groep? | Homepageblok De Kluis, pagina Groepen |
| Contact? | Bellen in de actiebalk, e-mail in de band en de voet |

## Mobile first

- **Actiebalk** onderaan (Bel · Route · Reserveer, 64 px hoog, rekening houdend met de iPhone-balk). De body krijgt evenveel ruimte onderaan, zodat de balk nooit inhoud afdekt.
- Menu als volledig paneel met grote Bebas-links, focusval, Escape en `inert` op de achtergrond.
- Menukaart: sticky sprongnavigatie (Lunch · Diner · Borrel · Kids · Desserts · Allergenen), zoeken en een filter op vegetarisch.
- Getest op 320, 375, 390, 430, 768, 1024, 1440 en 1920 px zonder horizontale overflow.

## Compositie per pagina (geen template)

- **Home:** kop in blokken + fotocollage (bar, barman met gescheurde rand, rond logo op de naad) → groene ‘Vandaag’-band → ‘LUNCH / DINER’ zoals op de kaart → bosgroen bierblok met Sanctus-lenzen → agendalijst met datumblokken → schermvullende gondelfoto met groene band en logo op de naad → De Kluis → bezoek (tijden, gevel ’s avonds).
- **Menukaart:** de kaart zelf, met labelblokken, panelen en kaders, in twee doorlopende kolommen op desktop.
- **Alpine Gondel Dining:** de opbouw van de Instagram-campagne V3 (foto, groen vlak, gecentreerde kop met gouden streep, ‘Goed om te weten’ met de eigen lijnillustraties).
- **Groepen:** De Kluis als donker blok met een typografische ‘kluisdeur’ (er zijn nog geen foto’s van De Kluis).

## Gecontroleerd tegen de 50 valkuilen

Bewust **niet** gebruikt: gradients, glassmorphism, glow, zwevende vlekken, slagschaduwen, zwart-goud ‘luxe’, nieuwe accentkleuren, Inter/Roboto, labels boven elke kop, tekst-gradients, pillknoppen, overal dezelfde radius, drie identieke USP-kaarten, bento-grids, alles gecentreerd, SaaS-opbouw, badges, iconen boven elk tekstblok, pijltjes achter knoppen, verzonnen reviews of cijfers, stockfoto’s, AI-beeld, carrousels, scrollanimaties, eigen cursor.

Bewuste uitzonderingen, met reden:
- **Vier gelijke tegels** ‘Goed om te weten’ op de gondelpagina: letterlijke vertaling van de carrouselslides 2–5 uit de eigen campagne.
- **Gecentreerde tekst** alleen in het gondel- en seizoensblok, zoals in de posts. Elders links uitgelijnd.
- **Brede kapitalen** (`.ondertitel`) alleen voor korte regels zoals ‘Nieuw in hartje Kerkrade’, zoals in de posts.
- **Cijfers** ‘200+ bieren / 50 wijnen / 3 Sanctus’: komen letterlijk van de eigen menukaart, niet verzonnen.
- **Één foto twee keer:** `team-tap` op home en op Beermonday/werken-bij (andere context, beperkt fotoaanbod).

## Toegankelijkheid in het ontwerp

Contrast gemeten (zie 01). Focus altijd zichtbaar (3 px). Doelen ≥ 24 px (WCAG 2.2). `prefers-reduced-motion` gerespecteerd; er zijn geen animaties die wachten. Allergenen en vegetarische tekens hebben tekstalternatieven. De datumblokken zijn decoratief (`aria-hidden`); de datum staat als tekst eronder.
