// Test del riconoscitore. Riferimenti: TC-DIS-02, TC-DIS-03.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA, KMETA} from '../helpers/load-data.js';
import {decodeDB, recognize} from '../../src/recognizer.js';

const entries = decodeDB(DATA.db);
const per = ch => entries.find(e => e.ch === ch);
// Tratti «disegnati»: i tratti di riferimento ingranditi e con un piccolo tremore deterministico.
const disegna = (ch, scala = 3) => per(ch).strokes.map((s, i) =>
  s.map((p, k) => [p[0] * scala + Math.sin(i * 7 + k) * 0.4, p[1] * scala + Math.cos(i * 5 + k) * 0.4]));

test('i dati hanno 6.395 kanji con metadati (TC-DIS-10)', () => {
  assert.equal(entries.length, 6395);
  assert.equal(Object.keys(KMETA).length, 6395);
});

test('TC-DIS-02: i kanji di prova sono tra i primi 3 risultati', () => {
  for (const ch of ['日', '山', '水', '木', '人', '本']) {
    const top = recognize(disegna(ch), entries, 14, 3).map(r => r[0]);
    assert.ok(top.length <= 14);
    assert.ok(top.slice(0, 3).includes(ch), ch + ' non è tra i primi 3: ' + top.slice(0, 5).join(''));
  }
});

test('TC-DIS-03: uno sfioramento molto corto viene ignorato', () => {
  const tratti = disegna('山');
  const senza = recognize(tratti, entries, 5, 3).map(r => r[0]);
  const con = recognize([...tratti, [[10, 10], [10.5, 10.5]]], entries, 5, 3).map(r => r[0]);
  assert.deepEqual(con, senza);
});

test('nessun tratto -> nessun risultato', () => {
  assert.deepEqual(recognize([], entries, 5, 3), []);
});
