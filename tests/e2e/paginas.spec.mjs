// Alle pagina's: laden zonder fouten, SEO-basis, toegankelijkheid (axe), geen overflow, geen cookies.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { paginas, volgFouten, blokkeerExtern } from './helpers.mjs';

const PADEN = paginas();

for (const pad of PADEN) {
  test(`pagina ${pad}`, async ({ page, context }, info) => {
    await blokkeerExtern(page);
    const fouten = volgFouten(page);
    const res = await page.goto(pad);
    expect(res.status()).toBe(200);

    // SEO-basis
    await expect(page.locator('h1')).toHaveCount(1);
    const titel = await page.title();
    expect(titel.length).toBeGreaterThan(10);
    expect(titel.length).toBeLessThanOrEqual(75);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc.length).toBeGreaterThan(50);
    expect(desc.length).toBeLessThanOrEqual(170);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${pad.replace(/\//g, '\\/')}$`));
    // Lokale omgeving mag nooit geïndexeerd worden
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    for (const blok of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(() => JSON.parse(blok)).not.toThrow();

    // Afbeeldingen hebben alt-attribuut en laden
    const zonderAlt = await page.locator('img:not([alt])').count();
    expect(zonderAlt).toBe(0);

    // Geen horizontale overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);

    // Toegankelijkheid (WCAG 2.2 AA-regels van axe-core)
    if (info.project.name === 'chromium' || info.project.name === 'mobiel-chromium') {
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const samenvatting = axe.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(samenvatting, samenvatting.join('\n')).toEqual([]);
    }

    // Privacy: de site zelf zet geen cookies en geen lokale opslag
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);

    expect(fouten.filter((f) => !f.includes('net::ERR_FAILED') && !f.includes('Failed to load resource')), fouten.join('\n')).toEqual([]);
  });
}

test('404-pagina geeft status 404 met eigen opmaak', async ({ page }) => {
  const res = await page.goto('/deze-pagina-bestaat-niet/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText(/Deze pagina is op/i);
});

test('oude URL’s worden doorgestuurd (301)', async ({ request }) => {
  for (const [van, naar] of [['/wijnkaart/', '/bierkaart/#wijn'], ['/kerstmenu-2026/', '/arrangementen/kerstmenu-2026/'], ['/saldo-2/', '/cadeaukaart/'], ['/verenigingen/', '/groepen/#verenigingen']]) {
    const r = await request.get(van, { maxRedirects: 0 });
    expect(r.status(), van).toBe(301);
    expect(r.headers().location, van).toBe(naar);
  }
});

test('alle interne links werken', async ({ page, request }) => {
  test.skip(test.info().project.name !== 'chromium', 'eenmaal is genoeg');
  const gezien = new Set();
  for (const pad of PADEN) {
    await page.goto(pad);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) gezien.add(href.split('#')[0]);
  }
  for (const href of gezien) {
    const r = await request.get(href);
    expect(r.status(), href).toBeLessThan(400);
  }
});
