// Controlli di qualità sul sorgente e sulle carte dei kana. Riferimenti: TC-KAN, TC-CAR-06 (DEF-08, DEF-13).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {kanaCards, r2k} from '../../src/romaji.js';

test('DEF-13: nessun carattere invisibile (area d\'uso privato) nel sorgente', () => {
  const dir = new URL('../../src/', import.meta.url);
  for (const f of readdirSync(dir).filter(x => x.endsWith('.js'))) {
    const t = readFileSync(new URL(f, dir), 'utf8');
    assert.equal(/[-]/.test(t), false, f);
  }
});

test('DEF-13: le vocali lunghe continuano a funzionare con i segnaposto scritti per esteso', () => {
  const attese = {kā: ['かあ', 'カー'], kī: ['きい', 'キー'], kū: ['くう', 'クー'], kē: ['けえ', 'ケー'], kō: ['こう', 'コー']};
  for (const [romaji, [hira, kata]] of Object.entries(attese)) {
    assert.equal(r2k(romaji).hira, hira, romaji);
    assert.equal(r2k(romaji).kata, kata, romaji);
  }
});

test('TC-CAR-06 (DEF-08): nelle carte dei kana il romaji è unico, quindi la modalità inversa non è ambigua', () => {
  for (const katakana of [false, true]) {
    const carte = kanaCards(katakana);
    const romaji = carte.map(c => c.r);
    const doppi = romaji.filter((r, i) => romaji.indexOf(r) !== i);
    assert.deepEqual(doppi, [], (katakana ? 'katakana' : 'hiragana') + ': ' + doppi.join(' '));
  }
});

test('le carte dei kana hanno identificatori unici e il numero atteso', () => {
  const h = kanaCards(false), k = kanaCards(true);
  assert.equal(new Set(h.map(c => c.id)).size, h.length);
  assert.equal(new Set(k.map(c => c.id)).size, k.length);
  assert.ok(h.length >= 100 && k.length > h.length);
});
