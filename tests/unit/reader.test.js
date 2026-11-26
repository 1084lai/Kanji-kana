// Test dell'analisi del testo e della conversione in scrittura mista. Riferimenti: TC-LEG-01/03/04, TC-ROM-04.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA} from '../helpers/load-data.js';
import {tokenizeLine, kanjiSegments} from '../../src/reader.js';
import {r2k} from '../../src/romaji.js';

const sel = t => t.cands && t.cands[t.sel];

test('TC-LEG-01: ogni parola è un elemento separato', () => {
  const toks = tokenizeLine('私は学校で勉強します。');
  assert.deepEqual(toks.map(t => t.text), ['私', 'は', '学校', 'で', '勉強', 'します', '。']);
  assert.equal(toks.at(-1).kind, 'punct');
});

test('TC-LEG-04: la particella は ha una nota di lettura', () => {
  const ha = tokenizeLine('私は学校').find(t => t.text === 'は');
  assert.match(sel(ha).note, /wa/);
});

test('TC-LEG-03: forma flessa -> forma base', () => {
  const [t] = tokenizeLine('食べました');
  assert.equal(sel(t).base, '食べる');
  assert.equal(sel(t).rd, 'たべました');
});

const misto = romaji => kanjiSegments(r2k(romaji.replace(/(^|\s)(wa|e)(?=\s|$)/gi,
  (m, p, w) => p + (w.toLowerCase() === 'wa' ? 'ha' : 'he'))).hira).map(s => s.cands[s.sel]).join('');

test('TC-ROM-04: scrittura mista con particelle', () => {
  assert.equal(misto('watashi wa gakkou de benkyou shimasu'), '私 は 学校 で 勉強 します');
  assert.equal(misto('nihongo wo tabemasu'), '日本語 を 食べます');
});

test('TC-ROM-04: il saluto resta in hiragana o in kanji corretti', () => {
  assert.match(misto('konnichiwa'), /^(こんにちは|今日は)$/);
});

test('TC-ROM-04: «kanji» -> 漢字 (DEF-03)', () => {
  assert.equal(misto('kanji'), '漢字');
});

test('TC-ROM-04: tra omofoni vince la parola più comune', () => {
  assert.equal(misto('kaisha'), '会社');
  assert.equal(misto('sensei'), '先生');
  assert.equal(misto('gakusei'), '学生');
});

test('TC-ROM-04: precisione su 2.892 parole comuni (livello fino a N3) non scende sotto il 78%', () => {
  let n = 0, ok = 0;
  for (const [w, lst] of Object.entries(DATA.jw)) {
    if (!/[一-鿿]/.test(w)) continue;
    for (const [rd, rank] of lst) {
      if (rank > 8 || !/^[ぁ-ゖー]+$/.test(rd) || rd.length < 2) continue;
      n++;
      if (kanjiSegments(rd).map(x => x.cands[x.sel]).join('') === w) ok++;
    }
  }
  assert.ok(n > 2800, 'campione: ' + n);
  assert.ok(ok / n >= 0.78, (100 * ok / n).toFixed(1) + '%');
});

test('TC-LEG-07: la frase d\'esempio non contiene parti sconosciute', () => {
  const toks = tokenizeLine('昨日、友達と駅の近くで美味しいラーメンを食べました。');
  assert.equal(toks.filter(t => t.kind === 'unk').length, 0, toks.map(t => t.text + ':' + t.kind).join(' '));
});
