// Test della conversione romaji <-> kana. Riferimenti al test book: TC-ROM-01/02/03/05, TC-KAN-03.
import test from 'node:test';
import assert from 'node:assert/strict';
import {r2k, k2r, toKata, toHira} from '../../src/romaji.js';

const hira = s => r2k(s).hira;

test('TC-ROM-01: saluti con は letta «wa»', () => {
  assert.equal(hira('konnichiwa'), 'こんにちは');
  assert.equal(r2k('konnichiwa').kata, 'コンニチハ');
  assert.equal(hira('konbanwa'), 'こんばんは');
  assert.equal(hira('konnichiwa minasan'), 'こんにちは みなさん');
  assert.equal(hira('Konnichiwa!'), 'こんにちは！');
});

test('TC-ROM-01: «wa» come particella resta わ (la scelta は avviene nella scrittura mista)', () => {
  assert.equal(hira('watashi wa'), 'わたし わ');
});

test('TC-ROM-02: ortografie alternative', () => {
  const casi = {tya: 'ちゃ', si: 'し', shi: 'し', tu: 'つ', tsu: 'つ', hu: 'ふ', fu: 'ふ', zi: 'じ',
    sya: 'しゃ', xtu: 'っ', ti: 'ち', chi: 'ち', ja: 'じゃ', zya: 'じゃ', jya: 'じゃ', xa: 'ぁ'};
  for (const [romaji, kana] of Object.entries(casi)) assert.equal(hira(romaji), kana, romaji);
});

test('TC-ROM-03: consonante doppia, vocale lunga, ん', () => {
  assert.equal(hira('gakkou'), 'がっこう');
  assert.equal(hira('matcha'), 'まっちゃ');
  assert.equal(hira('rāmen'), 'らあめん');
  assert.equal(r2k('rāmen').kata, 'ラーメン');
  assert.equal(r2k('ra-men').kata, 'ラーメン');
  assert.equal(hira('n'), 'ん');
  assert.equal(hira("n'"), 'ん');
  assert.equal(hira("kin'en"), 'きんえん');
  assert.equal(hira('kinen'), 'きねん');
});

test('TC-ROM-03: «nn» vale ん se non è seguito da vocale o y', () => {
  assert.equal(hira('nn'), 'ん');
  assert.equal(hira('kannji'), 'かんじ');
  assert.equal(hira('honn'), 'ほん');
  assert.equal(hira('konnnichiwa'), 'こんにちは');
  assert.equal(hira('konna'), 'こんな');     // nn + vocale: ん + な
  assert.equal(hira('kannya'), 'かんにゃ');  // nn + y: ん + にゃ
});

test('TC-ROM-03: punteggiatura', () => {
  assert.equal(hira('hon.'), 'ほん。');
});

test('TC-ROM-05, TC-KAN-03: kana -> romaji', () => {
  assert.equal(k2r('こんにちは'), 'konnichiwa');
  assert.equal(k2r('こんばんは'), 'konbanwa');
  assert.equal(k2r('コンニチハ'), 'konnichiwa');
  assert.equal(k2r('ラーメン'), 'rāmen');
  assert.equal(k2r('がっこう'), 'gakkou');
  assert.equal(k2r('きんえん'), "kin'en");
  assert.equal(k2r('まっちゃ'), 'matcha');
  assert.equal(k2r('ティー'), 'tī');
  assert.equal(k2r('ファミリー'), 'famirī');
});

test('は resta «ha» fuori dai saluti', () => {
  assert.equal(k2r('はは'), 'haha');
  assert.equal(k2r('はなはだ'), 'hanahada');
  assert.equal(k2r('せんたくはき'), 'sentakuhaki');
});

test('toKata e toHira sono inverse sui kana base', () => {
  assert.equal(toKata('こんにちは'), 'コンニチハ');
  assert.equal(toHira('コンニチハ'), 'こんにちは');
});
