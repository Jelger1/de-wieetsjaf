// Meet welke cookies, lokale opslag en externe domeinen er in beeld komen.
// LET OP: opent alleen de reserveringswidget en de Untappd-kaart; vult NIETS in en reserveert NIETS.
// Gebruik (met draaiende preview op :4321): node tests/meet-cookies.mjs
import { chromium } from 'playwright';

const BASIS = process.env.BASIS || 'http://localhost:4321';
const b = await chromium.launch();
const ctx = await b.newContext({ locale: 'nl-NL' });
const p = await ctx.newPage();
const domeinen = new Set();
p.on('request', (r) => { const h = new URL(r.url()).hostname; if (h !== 'localhost') domeinen.add(h); });

const opslag = async (label) => {
  const cookies = (await ctx.cookies()).map((c) => `${c.domain} ${c.name}${c.expires > 0 ? ` (verloopt ${new Date(c.expires * 1000).toISOString().slice(0, 10)})` : ' (sessie)'}`);
  const ls = await p.evaluate(() => Object.keys(localStorage));
  const ss = await p.evaluate(() => Object.keys(sessionStorage));
  console.log(`\n== ${label}\n  cookies: ${cookies.join(', ') || 'geen'}\n  localStorage (eigen domein): ${ls.join(', ') || 'geen'}\n  sessionStorage: ${ss.join(', ') || 'geen'}\n  externe domeinen tot nu toe: ${[...domeinen].join(', ') || 'geen'}`);
};

await p.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
await opslag('Homepage geladen, niets aangeklikt');

await p.goto(`${BASIS}/reserveren/`, { waitUntil: 'networkidle' });
await p.locator('main a[data-reserveer]').first().click();
await p.waitForSelector('#gstpln-widget-host', { state: 'attached', timeout: 20000 }).catch(() => {});
await p.waitForTimeout(6000);
const widget = await p.evaluate(() => Boolean(document.querySelector('#gstpln-widget-host')));
console.log(`\nGuestplan-widget aanwezig na klik: ${widget}; URL nog op de site: ${p.url().startsWith(BASIS)}`);
await opslag('Na klik op Reserveren (widget geopend, niets ingevuld)');

await p.goto(`${BASIS}/bierkaart/`, { waitUntil: 'networkidle' });
const knop = p.locator('[data-bierembed-laad]');
if (await knop.isVisible()) { await knop.click(); await p.waitForTimeout(6000); }
await opslag('Na laden van de Untappd-kaart');
await b.close();
