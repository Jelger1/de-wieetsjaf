// Mobiel menu: toegankelijk paneel met focusval, Escape om te sluiten en focus terug naar de knop.
const FOCUSBAAR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initNavigatie() {
  const knop = document.querySelector('.navknop');
  const paneel = document.getElementById('navpaneel');
  if (!knop || !paneel) return;
  const sluitKnop = paneel.querySelector('.navpaneel__sluit');
  const achtergrond = [document.querySelector('.site-kop'), document.querySelector('main'), document.querySelector('.site-voet'), document.querySelector('.actiebalk')].filter(Boolean);

  const open = () => {
    paneel.hidden = false;
    knop.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('nav-open');
    achtergrond.forEach((el) => { el.inert = true; });
    (paneel.querySelector('[aria-current]') || sluitKnop).focus();
    document.addEventListener('keydown', toets);
  };
  const sluit = () => {
    paneel.hidden = true;
    knop.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('nav-open');
    achtergrond.forEach((el) => { el.inert = false; });
    document.removeEventListener('keydown', toets);
    knop.focus();
  };
  function toets(e) {
    if (e.key === 'Escape') { e.preventDefault(); sluit(); return; }
    if (e.key !== 'Tab') return;
    const items = [...paneel.querySelectorAll(FOCUSBAAR)].filter((el) => el.offsetParent !== null);
    const eerste = items[0]; const laatste = items[items.length - 1];
    if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
    else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
  }
  knop.addEventListener('click', open);
  sluitKnop.addEventListener('click', sluit);
  paneel.addEventListener('click', (e) => { if (e.target.closest('a')) { paneel.hidden = true; document.documentElement.classList.remove('nav-open'); achtergrond.forEach((el) => { el.inert = false; }); } });
  matchMedia('(min-width: 64.0625rem)').addEventListener('change', (e) => { if (e.matches && !paneel.hidden) sluit(); });
}
