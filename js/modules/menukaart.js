// Menukaart: zoeken, vegetarisch filter, printknop en actieve sectie in de navigatie.
const gereedschap = document.querySelector('[data-menugereedschap]');
const zoek = document.querySelector('[data-menuzoek]');
const veg = document.querySelector('[data-menuveg]');
const teller = document.querySelector('[data-menuteller]');
const leeg = document.querySelector('[data-menuleeg]');
const gerechten = [...document.querySelectorAll('.menudeel .gerecht')];

function normaliseer(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
gerechten.forEach((g) => { g.dataset.zoekN = normaliseer(g.dataset.zoek || g.textContent); });

function pasToe() {
  const q = normaliseer(zoek.value.trim());
  const alleenVeg = veg.checked;
  let n = 0;
  for (const g of gerechten) {
    const isVeg = Boolean(g.dataset.veg) || g.closest('.menugroep')?.dataset.vegGroep === 'true';
    const ok = (!q || g.dataset.zoekN.includes(q)) && (!alleenVeg || isVeg);
    g.hidden = !ok;
    if (ok) n += 1;
  }
  document.querySelectorAll('.menugroep').forEach((gr) => { gr.hidden = ![...gr.querySelectorAll('.gerecht')].some((g) => !g.hidden); });
  document.querySelectorAll('.menudeel').forEach((d) => { d.hidden = ![...d.querySelectorAll('.menugroep')].some((g) => !g.hidden); });
  const filtert = q || alleenVeg;
  teller.textContent = filtert ? `${n} van ${gerechten.length} gerechten` : '';
  leeg.hidden = n > 0;
}

if (gereedschap && zoek && veg) {
  zoek.addEventListener('input', pasToe);
  veg.addEventListener('change', pasToe);
  document.querySelector('[data-print]')?.addEventListener('click', () => {
    zoek.value = ''; veg.checked = false; pasToe(); window.print();
  });
}

// Actieve sectie markeren in de sticky navigatie
const links = [...document.querySelectorAll('.menunav__lijst a')];
if ('IntersectionObserver' in window && links.length) {
  const obs = new IntersectionObserver((items) => {
    for (const it of items) {
      if (!it.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.find((a) => a.getAttribute('href') === `#${it.target.id}`)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.menudeel, #allergenen').forEach((s) => obs.observe(s));
}
