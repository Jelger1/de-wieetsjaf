// Eenheidstests voor de Untappd-kern: node --test tests/unit/
import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseerMenu, schoonTekst, schoonUrl, bierkaart, geheugenCache, isGeconfigureerd, leesConfig } from '../../api/lib/untappd.mjs';

const VOORBEELD = {
  menu: {
    id: 1, name: 'Biermenu', unpublished: false, updated_at: '2026-11-20T10:00:00Z',
    sections: [
      { id: 10, name: 'Van de tap', public: true, items: [
        { id: 100, name: 'Testbier <b>IPA</b>', brewery: 'Brouwerij', style: 'IPA - American', abv: '6.5', ibu: 40, tap_number: '1', created_at: '2026-11-22T10:00:00Z',
          label_image_thumb: 'https://untappd.akamaized.net/site/beer_logos/x.jpeg', containers: [{ price: '4.5', currency: 'EUR', container_size: { name: '25cl' } }] },
        { id: 101, name: '', brewery: 'Leeg' },
        { id: 102, name: 'Kwaadaardig', label_image: 'javascript:alert(1)', description: '<script>alert(1)</script>Lekker' },
      ] },
      { id: 11, name: 'Verborgen', public: false, items: [{ id: 200, name: 'Geheim' }] },
    ],
  },
};

test('normaliseert, schoont op en verbergt niet-publieke secties', () => {
  const r = normaliseerMenu(VOORBEELD, { nu: Date.parse('2026-11-24T10:00:00Z'), nieuwDagen: 14 });
  assert.equal(r.secties.length, 1);
  assert.equal(r.aantal, 2);
  const [a, b] = r.secties[0].items;
  assert.equal(a.naam, 'Testbier IPA');
  assert.equal(a.abv, 6.5);
  assert.equal(a.nieuw, true);
  assert.equal(a.containers[0].prijs, 4.5);
  assert.equal(a.containers[0].naam, '25cl');
  assert.equal(b.label, null);
  assert.ok(!b.beschrijving.includes('<'));
});

test('weigert onverwachte antwoorden en ongepubliceerde menu’s', () => {
  assert.throws(() => normaliseerMenu({}));
  assert.throws(() => normaliseerMenu({ menu: { sections: [], unpublished: true } }));
});

test('schoonUrl staat alleen https op Untappd-domeinen toe', () => {
  assert.equal(schoonUrl('http://untappd.com/x.png'), null);
  assert.equal(schoonUrl('https://evil.example/x.png'), null);
  assert.ok(schoonUrl('https://labels.untappd.com/x.png'));
  assert.equal(schoonTekst('a<script>b</script>c'), 'a b c');
});

test('zonder configuratie: status niet-geconfigureerd, geen netwerk', async () => {
  const r = await bierkaart({ env: {}, cache: geheugenCache() });
  assert.equal(r.status, 'niet-geconfigureerd');
  assert.equal(isGeconfigureerd(leesConfig({ UNTAPPD_API_EMAIL: 'a', UNTAPPD_API_TOKEN: 'b', UNTAPPD_MENU_ID: 'abc' })), false);
});

test('bij storing: terugval op laatst gelukte kaart, gemarkeerd als verouderd; token lekt nooit', async () => {
  const env = { UNTAPPD_API_EMAIL: 'a@b.nl', UNTAPPD_API_TOKEN: 'GEHEIM-TOKEN', UNTAPPD_MENU_ID: '123', UNTAPPD_CACHE_SECONDEN: '60' };
  const cache = geheugenCache();
  const echt = globalThis.fetch;
  let gezien = null;
  try {
    globalThis.fetch = async (url, opts) => { gezien = { url, opts }; return new Response(JSON.stringify(VOORBEELD), { status: 200 }); };
    const ok = await bierkaart({ env, cache, forceer: true });
    assert.equal(ok.status, 'ok');
    assert.match(gezien.url, /^https:\/\/business\.untappd\.com\/api\/v1\/menus\/123\?full=true/);
    assert.match(gezien.opts.headers.Authorization, /^Basic /);
    assert.ok(!JSON.stringify(ok).includes('GEHEIM-TOKEN'));
    globalThis.fetch = async () => new Response('fout', { status: 500 });
    const oud = await bierkaart({ env, cache, forceer: true });
    assert.equal(oud.status, 'verouderd');
    assert.equal(oud.aantal, 2);
    globalThis.fetch = async () => new Response('nee', { status: 401 });
    const leeg = await bierkaart({ env, cache: geheugenCache(), forceer: true });
    assert.equal(leeg.status, 'fout');
    assert.equal(leeg.reden, 'geen toegang');
    assert.ok(!JSON.stringify(leeg).includes('GEHEIM-TOKEN'));
  } finally { globalThis.fetch = echt; }
});

test('cache: tweede aanroep binnen de interval doet geen netwerkverzoek', async () => {
  const env = { UNTAPPD_API_EMAIL: 'a@b.nl', UNTAPPD_API_TOKEN: 't', UNTAPPD_MENU_ID: '123', UNTAPPD_CACHE_SECONDEN: '600' };
  const cache = geheugenCache();
  const echt = globalThis.fetch;
  let n = 0;
  try {
    globalThis.fetch = async () => { n += 1; return new Response(JSON.stringify(VOORBEELD), { status: 200 }); };
    await bierkaart({ env, cache });
    const tweede = await bierkaart({ env, cache });
    assert.equal(n, 1);
    assert.equal(tweede.cache, 'hit');
  } finally { globalThis.fetch = echt; }
});
