// Hoofdscript: draait op elke pagina. Alles is progressive enhancement:
// zonder JavaScript werken links, navigatie en reserveren (via de directe Guestplan-link) gewoon.
import { leesConfig } from './config.js';
import { initNavigatie } from './modules/navigatie.js';
import { initReserveren } from './modules/reserveren.js';
import { initOpeningsstatus } from './modules/openingsstatus.js';
import { initAgenda } from './modules/agenda.js';

const config = leesConfig();

initNavigatie();
initReserveren(config);
initOpeningsstatus(config);
initAgenda();

if (config.consent?.actief) {
  import('./modules/consent.js').then((m) => m.initConsent(config.consent));
}
