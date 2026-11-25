// Herbruikbare reserveringscomponent (Guestplan).
// - Elke link met [data-reserveer] werkt zonder JavaScript: hij verwijst naar de officiële Guestplan-pagina.
// - Met JavaScript wordt het officiële widgetscript pas bij de eerste klik geladen (sneller, geen
//   externe verzoeken voor bezoekers die niet reserveren) en opent de widget in de pagina.
// - Lukt dat niet binnen de wachttijd, dan gaat de bezoeker alsnog naar de directe link.
// Documentatie Guestplan: https://docs.guestplan.com/#/websitedevelopers  (zie docs/05-guestplan-integratie.md)

let laadBelofte = null;
let laatsteKnop = null;

function laadGuestplan(g) {
  if (laadBelofte) return laadBelofte;
  laadBelofte = new Promise((resolve, reject) => {
    // Officiële snippet, met de opties uit de Guestplan-documentatie:
    // showFab=false (geen zwevende knop), open=false (niet vanzelf openen).
    window._gstpln = Object.assign(window._gstpln || {}, {
      accessKey: g.accessKey,
      showFab: false,
      open: false,
      locale: g.locale || 'nl',
      color: g.kleur,
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = g.script;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Guestplan-script kon niet laden'));
    document.head.appendChild(s);
  });
  return laadBelofte;
}

/** Wacht tot de widget-methode beschikbaar is (het script laadt de eigenlijke widget zelf nog na). */
function wachtOpMethode(naam, ms) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    (function poll() {
      const f = window._gstpln?.[naam];
      if (typeof f === 'function') return resolve(f.bind(window._gstpln));
      if (performance.now() - start > ms) return reject(new Error('time-out'));
      setTimeout(poll, 120);
    })();
  });
}

function terugval(link) {
  // Officiële, gehoste reserveringspagina van Guestplan.
  window.location.assign(link.href);
}

export function initReserveren(config) {
  const g = config?.reserveren?.guestplan;
  if (!g?.accessKey) return;

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a[data-reserveer]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (link.getAttribute('aria-busy') === 'true') return;
    laatsteKnop = link;
    link.setAttribute('aria-busy', 'true');
    try {
      const deadline = performance.now() + (g.maxWachttijdMs || 15000);
      await laadGuestplan(g);
      const open = await wachtOpMethode('openBookingWidget', g.wachttijdMs || 8000);
      const service = link.dataset.service;
      // De widget opent pas als de restaurantgegevens binnen zijn (bij een koude cache kan dat even duren);
      // we proberen het tot de deadline. Lukt het niet, dan naar de directe link van precies deze dienst.
      let paneel = null;
      while (!paneel && performance.now() < deadline) {
        open(service ? { serviceCode: service } : undefined);
        await new Promise((r) => setTimeout(r, 300));
        paneel = widgetPaneel();
      }
      if (!paneel) throw new Error('widget opende niet');
      // Toetsenbordgebruikers direct in het reserveringsvenster zetten
      if (paneel.tagName === 'IFRAME') paneel.focus();
      else paneel.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])')?.focus();
      bewaakSluiten();
    } catch {
      terugval(link);
    } finally {
      link.removeAttribute('aria-busy');
    }
  });
}

/** Het zichtbare reserveringspaneel van Guestplan: in de shadow root van #gstpln-widget-host (scriptmodus),
 *  of het iframe [data-gstpln-widget-host] dat klikbaar wordt zodra het paneel open is (iframemodus). */
function widgetPaneel() {
  const root = document.querySelector('#gstpln-widget-host')?.shadowRoot;
  const p = root?.querySelector('.gp-widget--body, [role="dialog"]');
  if (p && p.getClientRects().length) return p;
  const frame = document.querySelector('iframe[data-gstpln-widget-host]');
  return frame && frame.style.pointerEvents === 'auto' ? frame : null;
}

/** Zet de focus terug op de knop waarmee de widget werd geopend, zodra de widget sluit. */
function bewaakSluiten() {
  const host = document.querySelector('#gstpln-widget-host');
  if (!host?.shadowRoot || !laatsteKnop) return;
  const knop = laatsteKnop;
  const obs = new MutationObserver(() => {
    if (widgetPaneel()) return;
    obs.disconnect();
    if (document.activeElement === document.body || document.activeElement === host) knop.focus();
  });
  obs.observe(host.shadowRoot, { childList: true, subtree: true, attributes: true });
}
