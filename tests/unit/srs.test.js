// Test del pianificatore delle carte. Riferimento: TC-CAR-03.
import test from 'node:test';
import assert from 'node:assert/strict';
import {sched, dayNum, fmtIv} from '../../src/srs.js';

const NOW = Date.UTC(2026, 10, 26, 10, 0, 0);
const MIN = 60000;
const nuova = () => [0, 0, 0, 2.5, 0, 0, 0];
const [S, D, IV, EF, LP] = [0, 1, 2, 3, 4];

test('carta nuova: «Ancora» -> riprova tra 1 minuto', () => {
  const c = sched(nuova(), 1, NOW);
  assert.equal(c[S], 1);
  assert.equal(c[D], NOW + 1 * MIN);
});

test('carta nuova: «Bene» due volte -> passi di 10 minuti, poi 1 giorno', () => {
  let c = sched(nuova(), 3, NOW);
  assert.equal(c[S], 1);
  assert.equal(c[D], NOW + 10 * MIN);
  c = sched(c, 3, NOW);
  assert.equal(c[S], 2);
  assert.equal(c[IV], 1);
  assert.equal(c[D], dayNum(NOW) + 1);
});

test('carta nuova: «Facile» -> 4 giorni', () => {
  const c = sched(nuova(), 4, NOW);
  assert.equal(c[S], 2);
  assert.equal(c[IV], 4);
});

test('ripasso: «Bene» moltiplica per il fattore', () => {
  const c = sched([2, 0, 10, 2.5, 0, 3, 0], 3, NOW);
  assert.equal(c[IV], 25);
  assert.equal(c[EF], 2.5);
});

test('ripasso: «Difficile» e «Facile»', () => {
  const dura = sched([2, 0, 10, 2.5, 0, 3, 0], 2, NOW);
  assert.equal(dura[IV], 12);
  assert.equal(dura[EF], 2.35);
  const facile = sched([2, 0, 10, 2.5, 0, 3, 0], 4, NOW);
  assert.equal(facile[EF], 2.65);
  assert.ok(facile[IV] > 25);
});

test('ripasso: lapsus -> intervallo dimezzato, fattore ridotto, ritorno all\'apprendimento', () => {
  const c = sched([2, 0, 10, 2.5, 0, 3, 0], 1, NOW);
  assert.equal(c[S], 1);
  assert.equal(c[IV], 5);
  assert.equal(c[EF], 2.3);
  assert.equal(c[LP], 1);
  assert.equal(c[D], NOW + 10 * MIN);
});

test('il fattore non scende sotto 1,3', () => {
  let c = [2, 0, 10, 1.4, 0, 3, 0];
  for (let i = 0; i < 5; i++) c = sched([2, 0, 10, c[EF], c[LP], 3, 0], 1, NOW);
  assert.equal(c[EF], 1.3);
});

test('fmtIv: minuti, giorni, mesi', () => {
  assert.equal(fmtIv([1, NOW + 10 * MIN, 0], NOW), '10 min');
  assert.equal(fmtIv([2, 0, 1], NOW), '1 giorno');
  assert.equal(fmtIv([2, 0, 4], NOW), '4 giorni');
  assert.equal(fmtIv([2, 0, 60], NOW), '2 mesi');
});
