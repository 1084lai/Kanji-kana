// Conversione romaji <-> kana (Hepburn) e tabelle dei kana.
const sp = s => s.split(' ');
const rows = (k, r) => { const a = sp(k), b = sp(r); return a.map((x,i) => x === '-' ? null : [x, b[i]]); };
const BASE = [
  rows('あ い う え お','a i u e o'), rows('か き く け こ','ka ki ku ke ko'), rows('さ し す せ そ','sa shi su se so'),
  rows('た ち つ て と','ta chi tsu te to'), rows('な に ぬ ね の','na ni nu ne no'), rows('は ひ ふ へ ほ','ha hi fu he ho'),
  rows('ま み む め も','ma mi mu me mo'), rows('や - ゆ - よ','ya - yu - yo'), rows('ら り る れ ろ','ra ri ru re ro'),
  rows('わ - - - を','wa - - - wo'), rows('ん - - - -','n - - - -')
];
const DAK = [ rows('が ぎ ぐ げ ご','ga gi gu ge go'), rows('ざ じ ず ぜ ぞ','za ji zu ze zo'), rows('だ ぢ づ で ど','da ji zu de do'), rows('ば び ぶ べ ぼ','ba bi bu be bo') ];
const HAN = [ rows('ぱ ぴ ぷ ぺ ぽ','pa pi pu pe po') ];
const YOON = ['きゃ きゅ きょ|kya kyu kyo','しゃ しゅ しょ|sha shu sho','ちゃ ちゅ ちょ|cha chu cho','にゃ にゅ にょ|nya nyu nyo','ひゃ ひゅ ひょ|hya hyu hyo','みゃ みゅ みょ|mya myu myo','りゃ りゅ りょ|rya ryu ryo','ぎゃ ぎゅ ぎょ|gya gyu gyo','じゃ じゅ じょ|ja ju jo','びゃ びゅ びょ|bya byu byo','ぴゃ ぴゅ ぴょ|pya pyu pyo']
  .map(x => { const [k,r] = x.split('|'); return rows(k, r); });
const EXTRA = [rows('ゔ うぃ うぇ うぉ しぇ','vu wi we wo she'), rows('じぇ ちぇ つぁ つぃ つぇ','je che tsa tsi tse'), rows('つぉ てぃ でぃ とぅ どぅ','tso ti di tu du'),
  rows('でゅ ふぁ ふぃ ふぇ ふぉ','dyu fa fi fe fo'), rows('ふゅ ゔぁ ゔぃ ゔぇ ゔぉ','fyu va vi ve vo')];

const toKata = h => h.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
const toHira = k => k.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

// ---- tabelle di conversione
const T = {}, R = {};
const addT = (r, k) => { if (!(r in T)) T[r] = k; };
for (const grp of [BASE, DAK, HAN, YOON]) for (const row of grp) for (const c of row) if (c) { addT(c[1], c[0]); if (!(c[0] in R)) R[c[0]] = c[1]; }
const ALIAS = {si:'し',ti:'ち',tu:'つ',hu:'ふ',zi:'じ',di:'ぢ',du:'づ',
  tya:'ちゃ',tyu:'ちゅ',tyo:'ちょ',cya:'ちゃ',cyu:'ちゅ',cyo:'ちょ',sya:'しゃ',syu:'しゅ',syo:'しょ',
  jya:'じゃ',jyu:'じゅ',jyo:'じょ',zya:'じゃ',zyu:'じゅ',zyo:'じょ',dya:'ぢゃ',dyu:'ぢゅ',dyo:'ぢょ',
  ye:'いぇ',thi:'てぃ',dhi:'でぃ',thu:'てゅ',dhu:'でゅ',twu:'とぅ',dwu:'どぅ',who:'うぉ',
  xa:'ぁ',xi:'ぃ',xu:'ぅ',xe:'ぇ',xo:'ぉ',la:'ぁ',li:'ぃ',lu:'ぅ',le:'ぇ',lo:'ぉ',
  xya:'ゃ',xyu:'ゅ',xyo:'ょ',lya:'ゃ',lyu:'ゅ',lyo:'ょ',xtu:'っ',xtsu:'っ',ltu:'っ',ltsu:'っ',xwa:'ゎ',
  kwa:'くぁ',gwa:'ぐぁ'};
for (const r in ALIAS) addT(r, ALIAS[r]);
for (const row of EXTRA) for (const c of row) if (c) { addT(c[1], c[0]); if (!(c[0] in R)) R[c[0]] = c[1]; }
const PUNCT = {'.':'。',',':'、','?':'？','!':'！','-':'ー','[':'「',']':'」','~':'〜',':':'：',';':'；','(':'（',')':'）'};
const PUNCT_R = {'。':'.','、':',','？':'?','！':'!','「':'"','」':'"','〜':'~','：':':','；':';','（':'(','）':')','　':' '};
const MACS = {a:'ā',i:'ī',u:'ū',e:'ē',o:'ō'};

// Saluti in cui は si legge «wa»: si scrivono con は anche se in romaji si digita «wa».
const GREET_W = /(こんにち|こんばん)わ(?![ぁ-ゖ])/g;
const GREET_H = /(?<![ぁ-ゖ])(こんにち|こんばん)は/g;
// Le vocali lunghe (ā ī ū ē ō) diventano la vocale più un segnaposto \uE001-\uE005 (area d'uso privato di Unicode):
// in hiragana il segnaposto è la vocale che allunga, in katakana è «ー».
function r2k(src){
  const s = src.normalize('NFC').toLowerCase()
    .replace(/[āâ]/g,'a\uE001').replace(/[īî]/g,'i\uE002').replace(/[ūû]/g,'u\uE003').replace(/[ēê]/g,'e\uE004').replace(/[ōô]/g,'o\uE005');
  let out = '';
  for (let i = 0; i < s.length;){
    const c = s[i];
    if (c >= '\uE001' && c <= '\uE005'){ out += c; i++; continue; }
    const n = s[i+1];
    if (c === 'n' && n === 'n' && !/[aiueoy'’]/.test(s[i+2] || '')){ out += 'ん'; i += 2; continue; }
    if (n && c === n && /[bcdfghjklmpqrstvwxyz]/.test(c)){ out += 'っ'; i++; continue; }
    if (c === 't' && s.startsWith('ch', i+1)){ out += 'っ'; i++; continue; }
    let hit = false;
    for (let L = 4; L >= 1; L--){ const k = s.substr(i, L); if (k.length === L && T[k]){ out += T[k]; i += L; hit = true; if (k === 'n' && (s[i] === "'" || s[i] === '’')) i++; break; } }
    if (hit) continue;
    if (c === 'n'){ i += (n === "'" || n === '’') ? 2 : 1; out += 'ん'; continue; }
    out += PUNCT[c] || c; i++;
  }
  out = out.replace(GREET_W, (m, a) => a + 'は');
  return {hira: out.replace(/[\uE001-\uE005]/g, m => ['あ','い','う','え','う'][m.charCodeAt(0)-0xE001]),
          kata: toKata(out.replace(/[\uE001-\uE005]/g, 'ー'))};
}
function nextSyl(h, j){
  const two = h.substr(j, 2); if (two.length === 2 && R[two]) return {r: R[two], len: 2};
  if (R[h[j]]) return {r: R[h[j]], len: 1};
  return null;
}
function k2r(src){
  const h = toHira(src.normalize('NFC')).replace(GREET_H, (m, a) => a + 'わ');
  let out = '';
  for (let i = 0; i < h.length;){
    const c = h[i];
    if (c === 'っ'){ const nx = nextSyl(h, i+1); if (nx && !/^[aiueo]/.test(nx.r)) out += nx.r.startsWith('ch') ? 't' : nx.r[0]; i++; continue; }
    if (c === 'ー'){ out = out.replace(/([aiueo])$/, m => MACS[m]); i++; continue; }
    if (c === 'ん'){ const nx = nextSyl(h, i+1); out += (nx && /^[aiueoy]/.test(nx.r)) ? "n'" : 'n'; i++; continue; }
    const nx = nextSyl(h, i);
    if (nx){ out += nx.r; i += nx.len; continue; }
    out += PUNCT_R[c] || c; i++;
  }
  return out;
}

// Carte dei kana per il ripasso. Il retro/fronte inverso è il romaji: «ji (di)», «zu (du)» e «o (wo)» distinguono ぢ, づ e を da じ, ず e お.
const KROM = {'ぢ':'ji (di)','づ':'zu (du)','を':'o (wo)'};
function kanaCards(katakana){
  const groups = [BASE, DAK, HAN, YOON].concat(katakana ? [EXTRA] : []);
  const out = [];
  for (const g of groups) for (const row of g) for (const c of row) if (c){
    const k = katakana ? toKata(c[0]) : c[0];
    out.push({id: (katakana ? 'k:' : 'h:') + k, k, r: KROM[c[0]] || c[1], kind: 'kana'});
  }
  return out;
}
export {KROM, kanaCards, ALIAS, BASE, DAK, EXTRA, HAN, MACS, PUNCT, PUNCT_R, YOON, addT, k2r, nextSyl, r2k, rows, sp, toHira, toKata, R, T};
