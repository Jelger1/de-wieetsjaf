// Het toestemmingsmechanisme staat uit, maar moet werken zodra het wordt aangezet.
// Deze test gebruikt een testpagina met een geblokkeerd script en controleert dat het pas na toestemming draait.
import { test, expect } from '@playwright/test';

const PAGINA = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Toestemmingstest</title><link rel="stylesheet" href="/css/site.css"></head><body>
<main><h1>Test</h1></main>
<footer><button type="button" data-consent-open>Cookievoorkeuren</button></footer>
<script type="text/plain" data-consent="marketing">window.__marketingGeladen = (window.__marketingGeladen || 0) + 1;</script>
<script type="module">import { initConsent } from '/js/modules/consent.js'; initConsent({ actief: true, versie: 1, categorieen: [{ id: 'statistiek', naam: 'Statistieken', uitleg: 'x' }, { id: 'marketing', naam: 'Marketing', uitleg: 'y' }] });</script>
</body></html>`;

test.beforeEach(async ({ page }) => {
  await page.route('**/__toestemming-test/', (r) => r.fulfill({ contentType: 'text/html', body: PAGINA }));
});

test('script draait niet vóór toestemming, wel na accepteren', async ({ page }) => {
  await page.goto('/__toestemming-test/');
  const dialoog = page.locator('dialog.toestemming');
  await expect(dialoog).toBeVisible();
  expect(await page.evaluate(() => window.__marketingGeladen)).toBeUndefined();
  // Niets staat vooraf aangevinkt
  await page.locator('summary').click();
  expect(await page.locator('dialog input[type=checkbox]:checked').count()).toBe(0);
  await page.getByRole('button', { name: 'Alles accepteren' }).click();
  await expect.poll(() => page.evaluate(() => window.__marketingGeladen)).toBe(1);
});

test('weigeren is even makkelijk en blokkeert; keuze is later te wijzigen', async ({ page }) => {
  await page.goto('/__toestemming-test/');
  await page.getByRole('button', { name: 'Alles weigeren' }).click();
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__marketingGeladen)).toBeUndefined();
  await page.reload();
  await expect(page.locator('dialog.toestemming')).toHaveCount(0); // keuze onthouden
  await page.getByRole('button', { name: 'Cookievoorkeuren' }).click();
  await expect(page.locator('dialog.toestemming')).toBeVisible();
  await page.getByRole('button', { name: 'Alles accepteren' }).click();
  await expect.poll(() => page.evaluate(() => window.__marketingGeladen)).toBe(1);
});
