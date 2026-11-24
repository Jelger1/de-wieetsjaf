# 10 · Openstaande punten

Op volgorde van prioriteit. ✅ = de site is er al op voorbereid (alleen de gegevens ontbreken).

## Hoog: vóór livegang

| # | Punt | Wie | Waar invullen |
|---|---|---|---|
| 1 | ✅ **Statutaire naam, KvK-nummer, btw-id** (wettelijk verplicht). Welke entiteit exploiteert de zaak? De loyaltyvoorwaarden noemen “Holding De Wieetsjaf bv” | Eigenaar | `data/site.json` → `juridisch` |
| 2 | **Privacyverklaring** afronden: hostingpartij, nieuwsbriefdienst, bewaartermijnen, doorgifte buiten de EER. Daarna het concept-label weghalen | Eigenaar (+ jurist) | `data/teksten/privacy.md`, `src/pages/juridisch.mjs` |
| 3 | **Verwerkersovereenkomsten** met Guestplan, hosting, nieuwsbriefdienst, Loyalty in a Box en GiveACard/Stripe | Eigenaar | – |
| 4 | **Voorwaarden bij aanbetalingen** (gondel € 100, kerst € 25 p.p.): annuleringsbeleid, ‘geen herroepingsrecht’, voorwaarden in Guestplan instellen | Eigenaar | Guestplan-instellingen |
| 5 | **Hosting kiezen** en de domeinoverstap plannen (advies: Cloudflare Pages; zie README). DNS pas omzetten na akkoord | Eigenaar / Pure Minds | – |
| 6 | **Menukaart controleren**: prijzen, gerechten en de redactionele correcties (Caesar, Focaccia, Cannelloni, Gnocchi, Gruyère; ‘opgelsagen’ → ‘opgeslagen’) | Keuken | `data/menukaart.json` |

## Midden

| # | Punt | Wie |
|---|---|---|
| 7 | ✅ **Allergenen per gerecht**: de controlelijst laten invullen door de keuken | Keuken → `docs/allergenen-controlelijst.csv` |
| 8 | ✅ **Untappd**: Premium-abonnement? Dan een read-only token, het menu-ID en het location-ID (zie 03) | Eigenaar |
| 9 | **Keukentijden**: is de keuken op maandag vanaf 12.00 open? Desserts tot 21.00 terwijl de keuken om 20.00 sluit? | Eigenaar |
| 10 | ✅ **Nieuwsbriefdienst** kiezen (MailPoet werkt alleen met WordPress) en de 6.000 adressen met toestemmingsbewijs overzetten | Eigenaar / Pure Minds |
| 11 | ✅ **Cadeaukaart**: GiveACard-shoplink en voorwaarden (herroepingsrecht, herroepingsknop) | Eigenaar |
| 12 | **De Kluis**: kloppen ‘± 30 personen’, ‘geen zaalhuur’, ‘scherm, speakers, wifi’ en ‘bestellen via QR’? (bron: intakegesprek) | Eigenaar |
| 13 | **Vacature**: staat ‘Medewerker bediening met passie voor speciaalbier’ nog open? | Eigenaar |
| 14 | **Volkstoneel-menu**: welke voorstelling en locatie (Theater Kerkrade?) | Eigenaar |
| 15 | **NIX18-logo** (officieel bestand) toevoegen aan voet en bierkaart (RvA art. 32) | Eigenaar / STIVA |
| 16 | **Gebruiksrechten foto’s** bevestigen (fotograaf interieur/gerechten/team en de gondelfoto’s); leeftijd van mensen op bierfoto’s (≥ 25 jaar volgens de RvA) | Eigenaar |
| 17 | **Guestplan**: Stripe alleen laden bij services met betaling? Alt-teksten en taal in de widget? | Guestplan support |
| 18 | **EAA**: aantal medewerkers en jaaromzet, om te bepalen of de Europese toegankelijkheidswet geldt | Eigenaar |

## Laag / later

| # | Punt |
|---|---|
| 19 | **Nieuwe fotografie** in hoge resolutie: De Kluis (er zijn nog geen foto’s), gevel overdag en het terras in de zomer, het team, interieur en gerechten op ≥ 2000 px (de huidige foto’s zijn 600–800 px) |
| 20 | **Rond logo als vector** (nu alleen PNG van 509 px) en de naam van de broodletter van de menukaart (nu benaderd met Hanken Grotesk) |
| 21 | **Google Bedrijfsprofiel** bijwerken (naam met accenten, website-, menu- en reserveerlink) en Search Console instellen |
| 22 | **Statistieken**: wil je bezoekcijfers? Kies een privacyvriendelijke dienst zonder cookies, of zet het toestemmingsmechanisme aan |
| 23 | **Meertaligheid** (Duits/Engels) met gecontroleerde vertalingen |
| 24 | **Chefsmenu december** en de prijs van het chefsmenu (staat niet op de oude site) |
| 25 | **Vaste jaarevenementen** (Nieuwjaar 1 januari, carnaval, High Wine) met datum en tijd in de agenda |
| 26 | Untappd-**embed-thema** aanpassen aan de huisstijl (transparante achtergrond, tekstkleur #30312C) zolang er geen API is |
