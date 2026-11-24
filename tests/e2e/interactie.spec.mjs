// Interactie: navigatie, reserveren (Guestplan nagebootst; er wordt NOOIT echt gereserveerd), menukaart, bierkaart.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { blokkeerExtern, volgFouten } from './helpers.mjs';

const GUESTPLAN_NEP = `
  // Nagebootste Guestplan-loader voor tests: legt vast hoe de site de widget aanroept.
  window.__gpAanroepen = [];
  window._gstpln = window._gstpln || {};
  window.__gpOpties = JSON.parse(JSON.stringify(window._gstpln));
  window._gstpln.openBookingWidget = function (opts) {
    window.__gpAanroepen.push(opts || null);
    let host = document.getElementById('gstpln-widget-host');
    if (!host) { host = document.createElement('div'); host.id = 'gstpln-widget-host'; document.body.appendChild(host); host.attachShadow({ mode: 'open' }); }
    if (!host.shadowRoot.querySelector('[role=dialog]')) {
      const d = document.createElement('div'); d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Reserveren (test)');
      const b = document.createElement('button'); b.textContent = 'Sluiten'; b.onclick = () => d.remove(); d.appendChild(b);
      host.shadowRoot.appendChild(d); b.focus();
    }
  };
`;

test.describe('reserveren', () => {
  test('knop laadt Guestplan pas bij klik en opent de widget zonder zwevende knop', async ({ page }) => {
    let geladen = 0;
    await blokkeerExtern(page); // eerst: latere routes hebben voorrang
    await page.route('https://cdn.guestplan.com/widget.js', (r) => { geladen += 1; r.fulfill({ contentType: 'text/javascript', body: GUESTPLAN_NEP }); });
    await page.goto('/reserveren/');
    expect(geladen).toBe(0); // niet vooraf geladen
    const knop = page.locator('main a[data-reserveer]').first();
    await expect(knop).toHaveAttribute('href', /guestplan\.io\/\?i=9f563a2008503edff53d98bbf3704571d1bc31d9/);
    await knop.click();
    await expect.poll(() => page.evaluate(() => window.__gpAanroepen?.length || 0)).toBeGreaterThan(0);
    expect(geladen).toBe(1);
    const opties = await page.evaluate(() => window.__gpOpties);
    expect(opties).toMatchObject({ accessKey: '9f563a2008503edff53d98bbf3704571d1bc31d9', showFab: false, open: false, locale: 'nl' });
    expect(page.url()).toContain('/reserveren/'); // bleef op de pagina
  });

  test('servicecode van het kerstmenu wordt doorgegeven', async ({ page }) => {
    await blokkeerExtern(page);
    await page.route('https://cdn.guestplan.com/widget.js', (r) => r.fulfill({ contentType: 'text/javascript', body: GUESTPLAN_NEP }));
    await page.goto('/arrangementen/kerstmenu-2026/');
    await page.locator('main a[data-reserveer][data-service="4MgTmJ4"]').first().click();
    await expect.poll(() => page.evaluate(() => window.__gpAanroepen?.[0])).toEqual({ serviceCode: '4MgTmJ4' });
  });

  test('terugval: als het script niet laadt, gaat de bezoeker naar de officiële Guestplan-pagina', async ({ page }) => {
    await page.route('https://cdn.guestplan.com/widget.js', (r) => r.abort());
    let naar = null;
    await page.route('https://guestplan.io/**', (r) => { naar = r.request().url(); r.fulfill({ contentType: 'text/html', body: '<title>guestplan (test)</title>' }); });
    await page.goto('/');
    await page.locator('main a[data-reserveer]').first().click();
    await expect.poll(() => naar).toContain('guestplan.io/?i=9f563a2008503edff53d98bbf3704571d1bc31d9');
  });

  test('zonder JavaScript is reserveren een gewone link', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('a[data-reserveer]').first()).toHaveAttribute('href', /^https:\/\/guestplan\.io\//);
    await ctx.close();
  });
});

test.describe('navigatie', () => {
  test('skiplink springt naar de inhoud', async ({ page, browserName }) => {
    await blokkeerExtern(page);
    await page.goto('/menukaart/');
    // Safari/WebKit springt met Tab standaard niet naar links (instelling van de gebruiker).
    // Daar controleren we dat de skiplink het eerste focusbare element is en testen we de werking.
    if (browserName === 'webkit') {
      expect(await page.evaluate(() => document.querySelector('a[href], button')?.className)).toBe('skiplink');
      await page.locator('.skiplink').focus();
    } else {
      await page.keyboard.press('Tab');
    }
    await expect(page.locator('.skiplink')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#inhoud')).toBeFocused();
  });

  test('mobiel menu: openen met toetsenbord, focus vasthouden, sluiten met Escape', async ({ page }) => {
    await blokkeerExtern(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const knop = page.locator('.navknop');
    await knop.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#navpaneel')).toBeVisible();
    await expect(knop).toHaveAttribute('aria-expanded', 'true');
    for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.getElementById('navpaneel').contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#navpaneel')).toBeHidden();
    await expect(knop).toBeFocused();
  });

  test('zonder JavaScript is de navigatie zichtbaar', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('#hoofdnav a[href="/menukaart/"]')).toBeVisible();
    await expect(page.locator('.tijden').first()).toBeVisible();
    await ctx.close();
  });
});

test.describe('menukaart', () => {
  test('zoeken en vegetarisch filter', async ({ page }) => {
    await blokkeerExtern(page);
    await page.goto('/menukaart/');
    const zichtbaar = () => page.locator('.menudeel .gerecht:visible').count();
    const totaal = await zichtbaar();
    expect(totaal).toBeGreaterThan(60);
    await page.fill('[data-menuzoek]', 'zuurvlees');
    await expect.poll(zichtbaar).toBe(2);
    await expect(page.locator('[data-menuteller]')).toHaveText(/2 van/);
    await page.fill('[data-menuzoek]', '');
    await page.check('[data-menuveg]');
    await expect.poll(zichtbaar).toBeLessThan(totaal);
    for (const naam of await page.locator('.menudeel .gerecht:visible .gerecht__naam').allTextContents()) expect(naam).toMatch(/V|Gnocchi|Wafel/);
    await page.fill('[data-menuzoek]', 'xyzonbekend');
    await expect(page.locator('[data-menuleeg]')).toBeVisible();
  });

  test('prijzen en gerechten komen overeen met de bron', async ({ page }) => {
    await page.goto('/menukaart/');
    const burger = page.locator('#diner .gerecht', { hasText: 'Wieëtsjaf burger' });
    await expect(burger.locator('.gerecht__prijs')).toHaveText('23,50');
    await expect(page.locator('#lunch .gerecht', { hasText: 'Hartige muffin' }).locator('.gerecht__prijs')).toHaveText('15,-');
  });
});

test.describe('bierkaart', () => {
  const MOCK = (data) => async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  const TEST = JSON.parse(fs.readFileSync('data/bierkaart.testdata.json', 'utf8'));

  test('met API-data: lijst, zoeken, filteren, geen XSS', async ({ page }) => {
    await blokkeerExtern(page);
    let dialoog = false;
    page.on('dialog', (d) => { dialoog = true; d.dismiss(); });
    await page.route('**/api/bierkaart', MOCK({ ...TEST, opgehaald: new Date().toISOString() }));
    await page.goto('/bierkaart/');
    await expect(page.locator('.bierkaart .bier')).toHaveCount(8);
    await expect(page.locator('[data-bierstatus-tekst]')).toHaveText(/Actueel/);
    await expect(page.locator('.melding--testdata')).toBeVisible();
    await page.fill('[data-bierzoek]', 'rolduc');
    await expect(page.locator('.bierkaart .bier:visible')).toHaveCount(3);
    await page.fill('[data-bierzoek]', '');
    await page.locator('[data-bierfilters] label', { hasText: 'Fles & blik' }).click();
    await expect(page.locator('.bierkaart .bier:visible')).toHaveCount(4);
    expect(dialoog).toBe(false);
    expect(await page.locator('.bierkaart script').count()).toBe(0);
  });

  test('verouderde data wordt als zodanig gemarkeerd', async ({ page }) => {
    await blokkeerExtern(page);
    await page.route('**/api/bierkaart', MOCK({ ...TEST, status: 'verouderd', opgehaald: '2026-11-01T10:00:00Z' }));
    await page.goto('/bierkaart/');
    await expect(page.locator('[data-bierstatus-tekst]')).toHaveText(/Mogelijk niet actueel/);
  });

  test('zonder API: officiële Untappd-embed pas na klik', async ({ page }) => {
    let embedGeladen = false;
    await blokkeerExtern(page);
    await page.route('https://business.untappd.com/**', (r) => { embedGeladen = true; r.fulfill({ contentType: 'text/html', body: '<p>embed (test)</p>' }); });
    await page.route('**/api/bierkaart', MOCK({ status: 'niet-geconfigureerd' }));
    await page.goto('/bierkaart/');
    await expect(page.locator('[data-bierembed]')).toBeVisible();
    expect(embedGeladen).toBe(false);
    await page.click('[data-bierembed-laad]');
    await expect(page.locator('iframe.bierembed__iframe')).toHaveAttribute('src', 'https://business.untappd.com/embeds/iframes/22030/83945');
    await expect.poll(() => embedGeladen).toBe(true);
  });

  test('bij een storing toont de pagina een melding en een link naar Untappd', async ({ page }) => {
    await blokkeerExtern(page);
    await page.route('**/api/bierkaart', (r) => r.abort());
    await page.goto('/bierkaart/');
    await expect(page.locator('a[href="https://untappd.com/v/de-wieetsjaf/685582"]').first()).toBeVisible();
    await expect(page.locator('[data-bierembed]')).toBeVisible();
  });
});

test('geen JavaScript-fouten op de homepage', async ({ page }) => {
  await blokkeerExtern(page);
  const fouten = volgFouten(page);
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(fouten.filter((f) => !f.includes('Failed to load resource'))).toEqual([]);
});
