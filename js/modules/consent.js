// Toestemmingsmechanisme voor niet-noodzakelijke scripts (staat UIT zolang er geen tracking is).
// Aanzetten: data/integraties.json → consent.actief = true, en voeg scripts zó toe:
//   <script type="text/plain" data-consent="marketing" data-src="https://…"></script>
// Zo’n script wordt pas uitgevoerd na toestemming voor die categorie. Weigeren is even makkelijk als accepteren,
// niets staat vooraf aan, en via ‘Cookievoorkeuren’ in de voet kan de bezoeker zijn keuze altijd wijzigen.
const SLEUTEL = 'wieetsjaf-toestemming';

function lees(versie) {
  try {
    const v = JSON.parse(localStorage.getItem(SLEUTEL) || 'null');
    return v && v.versie === versie ? v : null;
  } catch { return null; }
}

function bewaar(versie, keuzes) {
  const v = { versie, keuzes, datum: new Date().toISOString() };
  try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch { /* opslag geblokkeerd: keuze geldt voor dit bezoek */ }
  return v;
}

function activeer(keuzes) {
  document.querySelectorAll('script[type="text/plain"][data-consent]').forEach((oud) => {
    if (!keuzes[oud.dataset.consent] || oud.dataset.geactiveerd) return;
    const s = document.createElement('script');
    for (const { name, value } of oud.attributes) if (!['type', 'data-consent', 'data-src'].includes(name)) s.setAttribute(name, value);
    if (oud.dataset.src) s.src = oud.dataset.src; else s.textContent = oud.textContent;
    oud.dataset.geactiveerd = 'true';
    oud.after(s);
  });
}

function maakDialoog(cfg, huidig, klaar) {
  const d = document.createElement('dialog');
  d.className = 'toestemming donker';
  d.setAttribute('aria-labelledby', 'toestemming-titel');
  const vinkjes = cfg.categorieen.map((c) => `
    <label class="toestemming__keuze"><input type="checkbox" name="${c.id}" ${huidig?.keuzes?.[c.id] ? 'checked' : ''}>
      <span><strong>${c.naam}</strong><br><span class="klein">${c.uitleg}</span></span></label>`).join('');
  d.innerHTML = `
    <form method="dialog" class="toestemming__form">
      <h2 id="toestemming-titel" class="kop-3">Cookies en metingen</h2>
      <p>We gebruiken alleen extra cookies als jij dat goedvindt. Je kunt je keuze altijd wijzigen via ‘Cookievoorkeuren’ onderaan de pagina. <a href="/cookies/">Meer uitleg</a>.</p>
      <details class="toestemming__details"><summary>Zelf kiezen</summary>${vinkjes}</details>
      <div class="knoppen">
        <button class="knop" value="weigeren">Alles weigeren</button>
        <button class="knop" value="accepteren">Alles accepteren</button>
        <button class="knop knop--rand" value="opslaan">Keuze opslaan</button>
      </div>
    </form>`;
  d.addEventListener('close', () => {
    const actie = d.returnValue;
    if (!actie) return; // Escape: geen keuze, dialoog komt bij een volgend bezoek terug
    const keuzes = Object.fromEntries(cfg.categorieen.map((c) => [c.id,
      actie === 'accepteren' ? true : actie === 'weigeren' ? false : Boolean(d.querySelector(`input[name="${c.id}"]`)?.checked)]));
    klaar(keuzes);
    d.remove();
  });
  document.body.append(d);
  return d;
}

export function initConsent(cfg) {
  if (!cfg?.actief) return;
  const versie = cfg.versie || 1;
  let huidig = lees(versie);
  const toepassen = (keuzes) => { huidig = bewaar(versie, keuzes); activeer(keuzes); };
  const open = () => { const d = maakDialoog(cfg, huidig, toepassen); d.showModal(); };
  if (huidig) activeer(huidig.keuzes); else open();
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-consent-open]')) return;
    // Intrekken: eerder geladen scripts verdwijnen pas na herladen; dat melden we niet stil weg.
    open();
  });
}
