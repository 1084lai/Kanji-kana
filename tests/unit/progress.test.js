// Validazione dei progressi e dei backup. Riferimenti: TC-SYN-03, TC-CAR-09 (DEF-04).
import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHEMA_VERSION, validateProgress, encodeBackup, decodeBackup} from '../../src/progress.js';

const valido = () => ({
  cards: {'h:あ': [2, 20500, 4, 2.5, 0, 3, 0], 'j:日': [1, 1.7e12, 0, 2.5, 0, 1, 1]},
  cust: [{id: 'u:約束|m|promessa', f: '約束', b: ['promessa', 'やくそく (yakusoku)']}],
  set: {nw: 15, rev: true},
  st: {day: 20500, nd: {hira: 3}, rv: 12}
});
const errore = (o, codice = 'formato') => assert.throws(() => validateProgress(o), e => e.codice === codice);

test('TC-SYN-03: un salvataggio valido passa e prende la versione corrente', () => {
  const r = validateProgress(valido());
  assert.equal(r.v, SCHEMA_VERSION);
  assert.deepEqual(r.cards, valido().cards);
  assert.deepEqual(r.set, {nw: 15, rev: true});
});

test('TC-SYN-03: i backup senza versione (formato precedente) sono accettati', () => {
  const r = validateProgress({cards: {}, cust: [], set: {nw: 10, rev: false}, st: {day: 0, nd: {}, rv: 0}});
  assert.equal(r.v, SCHEMA_VERSION);
  assert.deepEqual(validateProgress({}).cards, {});
});

test('TC-SYN-03: versione futura rifiutata con codice «versione»', () => {
  errore({...valido(), v: SCHEMA_VERSION + 1}, 'versione');
});

test('TC-SYN-03: forme non valide rifiutate', () => {
  for (const x of [null, 5, 'testo', [], true]) errore(x);
  errore({...valido(), cards: 5});
  errore({...valido(), cards: []});
  errore({...valido(), cards: {a: 'abc'}});
  errore({...valido(), cards: {a: [2, 1, 1]}});
  errore({...valido(), cards: {a: [9, 0, 0, 2.5, 0, 0, 0]}});
  errore({...valido(), cards: {a: [2, 0, 0, 0.5, 0, 0, 0]}});
  errore({...valido(), cards: {a: [2, 0, 0, NaN, 0, 0, 0]}});
  errore({...valido(), cust: {}});
  errore({...valido(), cust: [{f: 'x', b: []}]});
  errore({...valido(), cust: [{id: 'a', f: 'x', b: [1]}]});
  errore({...valido(), set: {nw: -1}});
  errore({...valido(), set: {nw: 201}});
  errore({...valido(), set: {nw: 1.5}});
  errore({...valido(), set: {rev: 'sì'}});
  errore({...valido(), st: {day: 'x'}});
  errore({...valido(), st: {nd: {a: -1}}});
  errore({...valido(), v: 0});
  errore({...valido(), v: '1'});
});

test('TC-CAR-09: il backup va e viene, anche con caratteri giapponesi', () => {
  const testo = encodeBackup(valido());
  assert.match(testo, /^[A-Za-z0-9+/=]+$/);
  assert.deepEqual(decodeBackup(testo), validateProgress(valido()));
});

test('TC-CAR-09: un backup molto grande non fa esplodere la codifica', () => {
  const grande = valido();
  for (let i = 0; i < 40000; i++) grande.cards['v:' + i] = [2, 20500, 4, 2.5, 0, 3, 0];
  assert.equal(Object.keys(decodeBackup(encodeBackup(grande)).cards).length, 40002);
});

test('TC-SYN-03: testi alterati o non decodificabili rifiutati', () => {
  const testo = encodeBackup(valido());
  for (const x of ['', 'non è base64!!', testo.slice(0, 40), testo.slice(0, -4) + 'AAAA', btoa('null'), btoa('[1,2]'), btoa('{"cards":5}')])
    assert.throws(() => decodeBackup(x), e => e.codice === 'formato', x.slice(0, 20));
});

test('TC-SYN-03: backup di una versione futura rifiutato', () => {
  assert.throws(() => decodeBackup(btoa(JSON.stringify({v: 99, cards: {}}))), e => e.codice === 'versione');
});

test('i backup delle versioni precedenti (btoa/escape) si leggono ancora', () => {
  const vecchio = btoa(unescape(encodeURIComponent(JSON.stringify({cards: {}, cust: [{id: 'u:猫', f: '猫', b: ['gatto']}], set: {nw: 10, rev: false}, st: {day: 0, nd: {}, rv: 0}}))));
  assert.equal(decodeBackup(vecchio).cust[0].f, '猫');
});
