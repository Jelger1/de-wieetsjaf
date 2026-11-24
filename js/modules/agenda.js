// Verbergt evenementen waarvan de datum voorbij is (de bouw gebeurt niet elke dag).
import { nuInKerkrade } from './tijden.js';

export function initAgenda() {
  const vandaag = nuInKerkrade().iso;
  document.querySelectorAll('[data-eind]').forEach((el) => {
    if (el.dataset.eind < vandaag) el.hidden = true;
  });
  document.querySelectorAll('[data-agenda]').forEach((lijst) => {
    const zichtbaar = [...lijst.children].some((li) => !li.hidden);
    const leeg = lijst.parentElement.querySelector('[data-agenda-leeg]');
    if (leeg) leeg.hidden = zichtbaar;
  });
}
