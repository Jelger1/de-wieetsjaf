// Toont 'Nu open tot …' en markeert vandaag in tijdtabellen. Zonder JavaScript staat de volledige tabel er gewoon.
import { status, nuInKerkrade, tijdenVoor, fmtBereik } from './tijden.js';

export function initOpeningsstatus(config) {
  const data = config?.tijden;
  if (!data) return;
  const zaak = status(data, 'zaak');
  const keuken = status(data, 'keuken');
  const nu = nuInKerkrade();

  document.querySelectorAll('[data-status]').forEach((el) => {
    const s = el.dataset.status === 'keuken' ? keuken : zaak;
    el.textContent = el.dataset.status === 'zaak' && zaak.open && keuken.vandaag
      ? `${zaak.tekst} · ${keuken.open ? `keuken tot ${keuken.vandaag[1].replace(':', '.')} uur` : 'keuken gesloten'}`
      : s.tekst;
    el.dataset.open = String(s.open);
    el.hidden = false;
  });
  document.querySelectorAll('[data-vandaag]').forEach((el) => {
    const soort = el.dataset.vandaag;
    const { tijden } = tijdenVoor(data, soort, nu.iso, nu.dag);
    el.textContent = soort === 'zaak' ? (tijden ? fmtBereik(tijden) : 'Vandaag gesloten') : (tijden ? `Keuken ${fmtBereik(tijden)}` : 'Keuken vandaag gesloten');
  });
  document.querySelectorAll('table[data-tijden] tr[data-dag]').forEach((tr) => {
    if (tr.dataset.dag === nu.dag) tr.dataset.vandaag = 'true';
  });
}
