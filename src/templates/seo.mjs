// Structured data (schema.org). Alleen echte, geverifieerde gegevens; geen reviews of ratings.
import { schemaOpeningHours } from '../../js/modules/tijden.js';

export function restaurantJsonLd(ctx) {
  const s = ctx.site;
  const j = {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'BarOrPub'],
    '@id': `${ctx.basisUrl}/#restaurant`,
    name: s.naam,
    alternateName: s.naamZonderAccenten,
    description: s.omschrijving,
    url: `${ctx.basisUrl}/`,
    telephone: s.telefoon.e164,
    email: s.email,
    foundingDate: String(s.sinds),
    image: [`${ctx.basisUrl}/assets/images/interieur-bar-800.webp`, `${ctx.basisUrl}/assets/images/interieur-neon-800.webp`],
    logo: `${ctx.basisUrl}/assets/brand/apple-touch-icon.png`,
    address: {
      '@type': 'PostalAddress', streetAddress: s.adres.straat, postalCode: s.adres.postcode,
      addressLocality: s.adres.plaats, addressRegion: s.adres.regio, addressCountry: s.adres.land,
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng },
    openingHoursSpecification: schemaOpeningHours(ctx.tijden),
    servesCuisine: ['Nederlands', 'Limburgs', 'Internationaal'],
    acceptsReservations: 'True',
    hasMenu: `${ctx.basisUrl}/menukaart/`,
    sameAs: [s.social.instagram, s.social.facebook, s.social.untappd],
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: ctx.integraties.reserveren.guestplan.directeLink, inLanguage: 'nl', actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
      result: { '@type': 'FoodEstablishmentReservation', name: `Tafel reserveren bij ${s.naam}` },
    },
  };
  if (s.juridisch.statutaireNaam) j.legalName = s.juridisch.statutaireNaam;
  if (s.juridisch.kvkNummer) j.identifier = { '@type': 'PropertyValue', propertyID: 'KvK', value: s.juridisch.kvkNummer };
  return j;
}

export function menuJsonLd(ctx) {
  const sectie = (k) => ({
    '@type': 'MenuSection',
    name: k.titel,
    ...(k.tijden ? { description: k.tijden } : {}),
    hasMenuItem: k.groepen.flatMap((g) => (g.items || []).map((i) => {
      const prijs = i.prijs ?? i.prijzen?.[0]?.prijs;
      return {
        '@type': 'MenuItem', name: i.naam, ...(i.omschrijving ? { description: i.omschrijving } : {}),
        ...(prijs != null ? { offers: { '@type': 'Offer', price: prijs.toFixed(2), priceCurrency: 'EUR' } } : {}),
        ...(i.veg === 'V' ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
      };
    })),
  });
  return {
    '@context': 'https://schema.org', '@type': 'Menu', name: `Menukaart ${ctx.site.naam}`,
    url: `${ctx.basisUrl}/menukaart/`, inLanguage: 'nl', hasMenuSection: ctx.menu.kaarten.map(sectie),
  };
}
