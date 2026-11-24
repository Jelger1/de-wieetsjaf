import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { status, eersteMaandag, volgendeEersteMaandagen, nuInKerkrade } from '../../js/modules/tijden.js';

const tijden = JSON.parse(fs.readFileSync('data/openingstijden.json', 'utf8'));

test('eerste maandag van de maand', () => {
  assert.equal(eersteMaandag(2026, 12), '2026-12-07');
  assert.equal(eersteMaandag(2027, 1), '2027-01-04');
  assert.equal(eersteMaandag(2026, 9), '2026-09-07');
  assert.deepEqual(volgendeEersteMaandagen('2026-12-07', 2), ['2026-12-07', '2027-01-04']);
});

test('openingsstatus in Kerkrade-tijd, ook over middernacht', () => {
  assert.equal(status(tijden, 'zaak', new Date('2026-11-24T13:00:00Z')).open, true); // di 14:00
  const vr = status(tijden, 'zaak', new Date('2026-11-27T22:30:00Z')); // vr 23:30
  assert.equal(vr.open, true);
  assert.match(vr.tekst, /middernacht/);
  assert.equal(status(tijden, 'zaak', new Date('2026-11-30T10:30:00Z')).open, false); // ma 11:30, opent 12:00
  assert.equal(status(tijden, 'keuken', new Date('2026-11-24T19:30:00Z')).open, false); // di 20:30
  assert.equal(nuInKerkrade(new Date('2026-07-01T22:30:00Z')).dag, 'do'); // zomertijd: 00:30 op donderdag
});
