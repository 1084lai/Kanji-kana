// Schede Kana, Romaji, Leggi e Carte (interfaccia).
import {$, copy} from './util.js';
import {KMETA} from './data.js';
import {BASE, DAK, EXTRA, HAN, YOON, k2r, r2k, toHira, toKata} from './romaji.js';
import {JWD, alignRuby, isGrammar, isKanji, kanjiSegments, loadJW, posIt, tokKey, tokenizeLine} from './reader.js';
import {dayNum, fmtIv, sched} from './srs.js';
const TABS = ['disegna','kana','romaji','leggi','carte','crediti'];
function showTab(t){
  if (!TABS.includes(t)) t = 'disegna';
  for (const x of TABS){ $('tab-'+x).hidden = x !== t; $('tb-'+x).classList.toggle('on', x === t); }
  try { history.replaceState(null, '', '#' + t); } catch(_){}
  window.dispatchEvent(new Event('resize'));
}
for (const x of TABS) $('tb-'+x).onclick = () => showTab(x);
$('foot-credits').onclick = e => { e.preventDefault(); showTab('crediti'); };
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

let KSEG = [], KOPEN = -1;
function kText(){ return KSEG.map(s => s.cands[s.sel]).join(''); }
function renderKanji(h){
  try { KSEG = kanjiSegments(h); } catch(e){ KSEG = [{cands: [h], sel: 0, plain: true}]; }
  KSEG = KSEG.filter(s => !(s.plain && /^\s+$/.test(s.cands[0])));
  KOPEN = -1; drawKanji();
}
function drawKanji(){
  const box = $('t-kanji'); box.innerHTML = '';
  KSEG.forEach((s, i) => {
    if (s.plain){ box.appendChild(document.createTextNode(s.cands[0])); return; }
    const b = document.createElement('span'); b.className = 'sw' + (i === KOPEN ? ' sel' : '') + (s.cands.length > 1 ? ' alt' : '');
    b.textContent = s.cands[s.sel];
    b.onclick = () => { KOPEN = KOPEN === i ? -1 : i; drawKanji(); };
    box.appendChild(b);
  });
  const al = $('k-alts'); al.innerHTML = '';
  if (KOPEN >= 0){
    const s = KSEG[KOPEN];
    const lb = document.createElement('span'); lb.className = 'lb2'; lb.textContent = (s.rd || s.cands[0]) + ' →'; al.appendChild(lb);
    s.cands.forEach((t, j) => { const b = document.createElement('button'); b.textContent = t; if (j === s.sel) b.className = 'on';
      b.onclick = () => { s.sel = j; KOPEN = -1; drawKanji(); }; al.appendChild(b); });
  }
}

// ---- scheda Kana
let kmode = 'hira';
const SECT = [
  ['Suoni base (gojūon)', 'Cinque vocali e le righe k, s, t, n, h, m, y, r, w + ん.', 5, BASE, false],
  ['Dakuten ゛ (suoni sonori)', 'Si aggiungono due trattini: ka→ga, sa→za, ta→da, ha→ba.', 5, DAK, false],
  ['Handakuten ゜ (riga p)', 'Un cerchietto sulla riga ha: ha→pa.', 5, HAN, false],
  ['Yōon (suoni contratti)', 'Sillaba in i + や ゆ よ piccoli: き+ゃ = きゃ.', 6, YOON.map(r => r), true],
  ['Suoni stranieri', 'Per parole straniere, soprattutto in katakana (ファミリー, ティー, ヴァイオリン).', 5, EXTRA, false]
];
function renderKana(){
  const box = $('kgrid'); box.innerHTML = '';
  for (const [title, desc, cols, groups, pairUp] of SECT){
    const sec = document.createElement('div'); sec.className = 'ksec';
    sec.innerHTML = '<h3></h3><p></p>'; sec.firstChild.textContent = title; sec.lastChild.textContent = desc;
    const g = document.createElement('div'); g.className = 'kg'; g.style.setProperty('--c', cols);
    const cells = [];
    for (const row of groups) for (const c of row) cells.push(c);
    for (const c of cells){
      const b = document.createElement('button'); b.className = 'kc' + (c ? '' : ' empty') + (c && c[0].length > 1 ? ' sm' : '');
      if (c){
        b.innerHTML = '<span class="kk"></span><span class="kr"></span>';
        b.firstChild.textContent = kmode === 'hira' ? c[0] : toKata(c[0]); b.lastChild.textContent = c[1];
        b.onclick = () => { $('ktxt').value += b.firstChild.textContent; updK(); };
      }
      g.appendChild(b);
    }
    sec.appendChild(g); box.appendChild(sec);
  }
}
function updK(){ $('kroma').textContent = $('ktxt').value ? k2r($('ktxt').value) : ''; }
$('s-hira').onclick = () => { kmode = 'hira'; $('s-hira').classList.add('on'); $('s-kata').classList.remove('on'); renderKana(); };
$('s-kata').onclick = () => { kmode = 'kata'; $('s-kata').classList.add('on'); $('s-hira').classList.remove('on'); renderKana(); };
$('ktxt').addEventListener('input', updK);
$('kdel').onclick = () => { const a = Array.from($('ktxt').value); a.pop(); $('ktxt').value = a.join(''); updK(); };

$('kcopy').onclick = () => copy($('ktxt').value, $('kcopy'));

// ---- scheda Romaji
let rmode = 'r2k';
function conv(){
  const v = $('rin').value;
  if (rmode === 'r2k'){ const r = r2k(v); $('t-hira').textContent = r.hira; $('t-kata').textContent = r.kata; renderKanji(r2k(v.replace(/(^|\s)(wa|e)(?=\s|$)/gi, (m, p, w) => p + (w.toLowerCase() === 'wa' ? 'ha' : 'he'))).hira); }
  else $('t-roma').textContent = k2r(v);
}
function setMode(m){
  rmode = m; $('m-r2k').classList.toggle('on', m === 'r2k'); $('m-k2r').classList.toggle('on', m === 'k2r');
  $('o-hira').hidden = $('o-kata').hidden = $('o-kanji').hidden = m !== 'r2k'; $('o-roma').hidden = m !== 'k2r';
  $('rin').placeholder = m === 'r2k' ? 'es. konnichiwa, gakkō, Tōkyō…' : 'es. こんにちは、ラーメン、がっこう…';
  buildChips(); conv();
}
const EX = {
  r2k: ['kyou wa ii tenki desu','watashi wa gakkou de benkyou shimasu','nihongo wo tabemasu','Tōkyō','rāmen','konnichiwa','kin\'en'],
  k2r: ['こんにちは','ありがとう','がっこう','ラーメン','コーヒー','ファミリー','きょう']
};
function buildChips(){
  const c = $('chips'); c.innerHTML = '';
  for (const x of EX[rmode]){ const b = document.createElement('button'); b.textContent = x; b.onclick = () => { $('rin').value = x; conv(); }; c.appendChild(b); }
}
$('m-r2k').onclick = () => setMode('r2k'); $('m-k2r').onclick = () => setMode('k2r');
$('rin').addEventListener('input', conv);
for (const b of document.querySelectorAll('[data-c]')) b.onclick = () => copy(b.dataset.c === 'kanji' ? kText() : $('t-' + b.dataset.c).textContent, b);

// ---- scheda Leggi: affiancamento alla lettura
let TOKS = [], SELT = -1, FMODE = 'all', ROMA = false, KNOWN = new Set();
try { KNOWN = new Set(JSON.parse(localStorage.getItem('kn_known_v1') || '[]')); } catch(_){}
function saveKnown(){ try { localStorage.setItem('kn_known_v1', JSON.stringify([...KNOWN])); } catch(_){} }
function h(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
function renderText(){
  const out = $('lout'); out.innerHTML = '';
  TOKS.forEach((t, i) => {
    if (t.kind === 'br'){ out.appendChild(document.createElement('br')); return; }
    if (t.kind === 'punct'){ out.appendChild(document.createTextNode(t.text)); return; }
    const c = t.cands[t.sel], sp = h('span', 'w' + (i === SELT ? ' sel' : '') + (t.kind === 'unk' ? ' unk' : '') + (KNOWN.has(tokKey(t)) ? ' known' : '') + (isGrammar(t) ? ' gm' : ''));
    const showRt = FMODE === 'all' || (FMODE === 'new' && !KNOWN.has(tokKey(t)) && !isGrammar(t));
    const rb = h('span', 'rb');
    for (const p of alignRuby(t.text, c.rd)){
      if (p.rt && showRt && t.kind === 'word'){ const r = document.createElement('ruby'); r.appendChild(document.createTextNode(p.t)); r.appendChild(h('rt', '', p.rt)); rb.appendChild(r); }
      else rb.appendChild(document.createTextNode(p.t));
    }
    sp.appendChild(rb);
    if (ROMA && c.rd){ sp.appendChild(h('span', 'rj', c.ro || k2r(c.rd))); }
    sp.onclick = () => { SELT = SELT === i ? -1 : i; renderText(); renderPanel(); if (SELT >= 0) $('lpanel').scrollIntoView({block: 'nearest', behavior: 'smooth'}); };
    out.appendChild(sp);
  });
  renderGloss();
}
function kanjiRow(ch){
  const m = KMETA[ch];
  const row = h('div', 'kr');
  row.appendChild(h('div', 'kb jp', ch));
  const d = h('div', 'kd');
  if (m){
    d.appendChild(h('div', 'km', (m.m || []).slice(0, 4).join(', ') || '—'));
    const rd = [];
    if (m.o && m.o.length) rd.push('on: ' + m.o.join('、'));
    if (m.k && m.k.length) rd.push('kun: ' + m.k.join('、'));
    d.appendChild(h('div', 'kx jp', rd.join('   ') || ''));
    const tg = []; if (m.n) tg.push(m.n + ' tratti'); if (m.j) tg.push('JLPT N' + m.j);
    if (tg.length) d.appendChild(h('div', 'kt', tg.join(' · ')));
  } else d.appendChild(h('div', 'km', 'Kanji non presente nei dati (raro).'));
  row.appendChild(d); return row;
}
function renderPanel(){
  const box = $('lpanel'); box.innerHTML = '';
  if (SELT < 0){ box.hidden = true; return; }
  box.hidden = false;
  const t = TOKS[SELT], c = t.cands[t.sel];
  const top = h('div', 'ptop');
  top.appendChild(h('div', 'pbig jp', t.text));
  const rt = h('div', 'prd');
  if (c.rd) { rt.appendChild(h('div', 'prk jp', c.rd)); rt.appendChild(h('div', 'prr', c.ro || k2r(c.rd))); }
  top.appendChild(rt); box.appendChild(top);
  const tags = h('div', 'tags');
  const pl = c.gram ? 'grammatica' : posIt(c.pos); if (pl) tags.appendChild(h('span', 'tag', pl));
  if (t.kind === 'kata') tags.appendChild(h('span', 'tag', 'katakana'));
  box.appendChild(tags);
  if (c.base){ box.appendChild(h('p', 'pinf', 'Forma flessa di ' + c.base + (c.baseRd && c.baseRd !== c.base ? ' (' + c.baseRd + ')' : '') + ' → ' + c.lab + '.')); }
  if (c.usual) box.appendChild(h('p', 'pinf', 'Di solito si scrive con i kanji: ' + c.usual + '.'));
  if (c.note) box.appendChild(h('p', 'pnote', c.note));
  if (t.kind === 'kata') box.appendChild(h('p', 'pnote', 'Parola in katakana non presente nel dizionario: probabilmente un nome o una parola straniera. Si legge come è scritta: «' + k2r(t.text) + '».'));
  if (t.kind === 'unk') box.appendChild(h('p', 'pnote', 'Kanji non riconosciuto come parola intera; qui sotto trovi i dati del singolo carattere.'));
  if (t.kind === 'rawk') box.appendChild(h('p', 'pnote', 'Sequenza di hiragana non riconosciuta (forma flessa insolita, nome o parola rara): «' + k2r(t.text) + '».'));
  if (c.gloss){ box.appendChild(h('div', 'plb', 'Significati (in inglese)')); box.appendChild(h('div', 'pgl', c.gloss.split('; ').join(' · '))); }
  if (t.cands.length > 1){
    box.appendChild(h('div', 'plb', 'Altre possibilità (tocca per scegliere)'));
    const al = h('div', 'alts jp');
    t.cands.forEach((x, j) => { const b = h('button', j === t.sel ? 'on' : '', (x.rd || x.surf) + (x.gloss ? ' – ' + x.gloss.split('; ')[0] : '')); b.onclick = () => { t.sel = j; renderText(); renderPanel(); }; al.appendChild(b); });
    box.appendChild(al);
  }
  const ks = [...new Set([...(c.base || t.text)].filter(isKanji))];
  if (ks.length){ box.appendChild(h('div', 'plb', 'Kanji nella parola')); for (const ch of ks) box.appendChild(kanjiRow(ch)); }
  const act = h('div', 'acts');
  const key = tokKey(t);
  if (key && !c.gram){
    const kb = h('button', '', KNOWN.has(key) ? '✓ La conosco (tocca per annullare)' : 'La conosco già');
    kb.onclick = () => { KNOWN.has(key) ? KNOWN.delete(key) : KNOWN.add(key); saveKnown(); renderText(); renderPanel(); };
    act.appendChild(kb);
  }
  if (t.kind === 'word' || t.kind === 'unk'){
    const fb = h('button', '', '＋ Flashcard');
    fb.onclick = () => { const ok = t.kind === 'unk' ? addCustom(kanjiCard(t.text)) : addCustom(wordCard(c, t.text)); fb.textContent = ok ? 'Aggiunta ✓' : 'Già nelle carte'; renderDecks(); };
    act.appendChild(fb);
  }
  const a = h('a', 'btn', 'Apri su Jisho ↗'); a.href = 'https://jisho.org/search/' + encodeURIComponent(c.base || t.text); a.target = '_blank'; a.rel = 'noopener'; act.appendChild(a);
  box.appendChild(act);
}
function glossItems(){
  const seen = new Set(), items = [];
  for (const t of TOKS){
    if (t.kind !== 'word' && t.kind !== 'unk') continue;
    if (isGrammar(t)) continue;
    const c = t.cands[t.sel], key = tokKey(t);
    if (seen.has(key)) continue; seen.add(key);
    const rd = c.baseRd || c.rd;
    items.push({key, surf: c.base || c.surf, rd, gloss: (c.gloss || '').split('; ').slice(0, 2).join(' · ')});
  }
  return items;
}
function renderGloss(){
  const box = $('lglist'); box.innerHTML = '';
  const items = glossItems();
  $('lgcount').textContent = items.length ? '(' + items.length + ' parole, ' + items.filter(x => !KNOWN.has(x.key)).length + ' nuove)' : '';
  for (const it of items){
    const row = h('label', 'gr' + (KNOWN.has(it.key) ? ' known' : ''));
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = KNOWN.has(it.key);
    cb.onchange = () => { cb.checked ? KNOWN.add(it.key) : KNOWN.delete(it.key); saveKnown(); renderText(); renderPanel(); };
    row.appendChild(cb);
    const tx = h('span', 'gt jp'); tx.appendChild(h('b', '', it.surf)); tx.appendChild(document.createTextNode((it.rd && it.rd !== it.surf ? '【' + it.rd + '】' : '') + ' ')); tx.appendChild(h('span', 'gg', it.gloss));
    row.appendChild(tx); box.appendChild(row);
  }
}
function analyze(){
  const txt = $('lin').value;
  TOKS = []; SELT = -1;
  txt.split('\n').forEach((line, i, arr) => {
    if (line.trim()) { try { TOKS.push(...tokenizeLine(line.replace(/\s+/g, ' ').trim())); } catch(e){ TOKS.push({kind: 'punct', text: line}); } }
    if (i < arr.length - 1) TOKS.push({kind: 'br'});
  });
  $('lout').hidden = !TOKS.length; renderText(); renderPanel();
}
$('lin').addEventListener('input', analyze);
$('l-ex').onclick = () => { $('lin').value = '昨日、友達と駅の近くで美味しいラーメンを食べました。'; analyze(); };
$('l-clr').onclick = () => { $('lin').value = ''; analyze(); };
for (const m of ['all', 'new', 'none']) $('f-' + m).onclick = () => { FMODE = m; for (const x of ['all','new','none']) $('f-' + x).classList.toggle('on', x === m); renderText(); };
$('l-rj').onchange = () => { ROMA = $('l-rj').checked; renderText(); };
$('l-copyg').onclick = () => copy(glossItems().map(i => i.surf + '\t' + (i.rd || '') + '\t' + i.gloss).join('\n'), $('l-copyg'));
$('l-addg').onclick = () => {
  let n = 0;
  for (const t of TOKS){ if ((t.kind !== 'word' && t.kind !== 'unk') || isGrammar(t) || KNOWN.has(tokKey(t))) continue; const c = t.cands[t.sel]; if (addCustom(t.kind === 'unk' ? kanjiCard(t.text) : wordCard(c, t.text))) n++; }
  $('l-addg').textContent = n ? n + ' carte aggiunte ✓' : 'Nessuna carta nuova'; setTimeout(() => $('l-addg').textContent = 'Aggiungi le nuove alle flashcard', 1800); renderDecks();
};
$('l-reset').onclick = () => { KNOWN = new Set(); saveKnown(); renderText(); renderPanel(); };

// ---- flashcard in stile Anki (ripetizione dilazionata)
let FC = {cards: {}, cust: [], set: {nw: 10, rev: false}, st: {day: 0, nd: {}, rv: 0}}, FC_NOSAVE = false;
function fcLoad(){
  try { const s = localStorage.getItem('fc_v1'); if (s){ const o = JSON.parse(s); FC.cards = o.cards || {}; FC.cust = o.cust || []; FC.set = Object.assign(FC.set, o.set || {}); FC.st = Object.assign(FC.st, o.st || {}); } }
  catch(_){ FC_NOSAVE = true; }
}
function fcSave(){ try { localStorage.setItem('fc_v1', JSON.stringify(FC)); } catch(_){ FC_NOSAVE = true; const w = $('fc-warn'); if (w) w.hidden = false; } }
function fcDay(){ const d = dayNum(Date.now()); if (FC.st.day !== d) FC.st = {day: d, nd: {}, rv: 0}; }
// ---- mazzi
const KROM = {'ぢ':'ji (di)','づ':'zu (du)','を':'o (wo)'};
const DECKS = [
  {id:'hira', name:'Hiragana', sub:'ひらがな', kind:'kana'}, {id:'kata', name:'Katakana', sub:'カタカナ', kind:'kana'},
  {id:'kj5', name:'Kanji N5', sub:'i più semplici', kind:'kanji', lvl:5}, {id:'kj4', name:'Kanji N4', kind:'kanji', lvl:4}, {id:'kj3', name:'Kanji N3', kind:'kanji', lvl:3},
  {id:'kj2', name:'Kanji N2', kind:'kanji', lvl:2}, {id:'kj1', name:'Kanji N1', sub:'e oltre', kind:'kanji', lvl:1},
  {id:'vc5', name:'Vocabolario N5', kind:'vocab', rank:2}, {id:'vc4', name:'Vocabolario N4', kind:'vocab', rank:4}, {id:'vc3', name:'Vocabolario N3', kind:'vocab', rank:8}, {id:'vc2', name:'Vocabolario N2', kind:'vocab', rank:12},
  {id:'mine', name:'Le mie carte', sub:'aggiunte da Leggi, Disegna o a mano', kind:'custom'}
];
const DCACHE = {};
function cardsOf(d){
  if (d.kind === 'custom') return FC.cust.map(c => ({id: c.id, c, kind: 'custom'}));
  if (DCACHE[d.id]) return DCACHE[d.id];
  let out = [];
  if (d.kind === 'kana'){
    const kt = d.id === 'kata', groups = [BASE, DAK, HAN, YOON].concat(kt ? [EXTRA] : []);
    for (const g of groups) for (const row of g) for (const c of row) if (c){ const k = kt ? toKata(c[0]) : c[0]; out.push({id: (kt ? 'k:' : 'h:') + k, k, r: KROM[c[0]] || c[1], kind: 'kana'}); }
  } else if (d.kind === 'kanji'){
    const M = KMETA;
    out = Object.keys(M).filter(ch => M[ch].j === d.lvl).sort((a, b) => (M[a].n || 0) - (M[b].n || 0)).map(ch => ({id: 'j:' + ch, ch, kind: 'kanji'}));
  } else if (d.kind === 'vocab'){
    loadJW();
    for (const s in JWD) for (const e of JWD[s]) if (e[1] === d.rank && e[2]) out.push({id: 'v:' + s + '|' + e[0], s, e, kind: 'vocab'});
    out.sort((a, b) => a.s.length - b.s.length);
  }
  return DCACHE[d.id] = out;
}
function deckCounts(d){
  fcDay(); const now = Date.now(), today = dayNum(now), cs = cardsOf(d);
  let nw = 0, lr = 0, rv = 0;
  for (const c of cs){ const s = FC.cards[c.id]; if (!s) nw++; else if (s[0] === 1){ if (s[1] <= now + 20 * 60000) lr++; } else if (s[1] <= today) rv++; }
  nw = Math.min(nw, Math.max(0, FC.set.nw - (FC.st.nd[d.id] || 0)));
  return {nw, lr, rv, total: cs.length};
}
function pickCard(d){
  fcDay(); const now = Date.now(), today = dayNum(now), nd = FC.st.nd[d.id] || 0;
  let learn = null, later = null, nw = null, rev = [], rmin = 1e12;
  for (const c of cardsOf(d)){
    const s = FC.cards[c.id];
    if (!s){ if (!nw && nd < FC.set.nw) nw = c; }
    else if (s[0] === 1){ if (s[1] <= now){ if (!learn || s[1] < FC.cards[learn.id][1]) learn = c; } else if (!later || s[1] < FC.cards[later.id][1]) later = c; }
    else if (s[1] <= today){ if (s[1] < rmin){ rmin = s[1]; rev = [c]; } else if (s[1] === rmin) rev.push(c); }
  }
  if (learn) return learn;
  if (rev.length) return rev[Math.floor(Math.random() * rev.length)];
  if (nw) return nw;
  return later;
}
// ---- creazione carte personalizzate
function addCustom(card){ if (FC.cust.some(x => x.id === card.id)) return false; FC.cust.push(card); fcSave(); return true; }
function kanjiCard(ch){
  const m = KMETA[ch] || {};
  const rd = []; if (m.o && m.o.length) rd.push('on: ' + m.o.join('、')); if (m.k && m.k.length) rd.push('kun: ' + m.k.join('、'));
  return {id: 'u:' + ch, f: ch, b: [(m.m || []).slice(0, 4).join(', ') || '—', rd.join('   '), m.n ? m.n + ' tratti' : '']};
}
function wordCard(c, text){
  const rd = c.baseRd || c.rd, sf = c.base || c.surf || text;
  return {id: 'u:' + sf + '|' + (rd || ''), f: sf, b: [(rd || '') + (rd ? ' (' + k2r(rd) + ')' : ''), (c.gloss || c.note || '').split('; ').slice(0, 3).join(' · '), posIt(c.pos)]};
}
window.addEventListener('fc-add', e => { const d = e.detail || {}; if (d.type === 'kanji' && d.ch) addCustom(kanjiCard(d.ch)); renderDecks(); });
// ---- interfaccia
let CD = null, CC = null, SHOWN = false, UNDO = null;
function renderDecks(){
  fcDay();
  const box = $('fc-decks'); box.innerHTML = '';
  const tot = FC.st.rv;
  $('fc-today').textContent = 'Oggi: ' + tot + (tot === 1 ? ' risposta' : ' risposte') + ' · carte studiate in totale: ' + Object.keys(FC.cards).length;
  for (const d of DECKS){
    const n = d.kind === 'custom' ? FC.cust.length : null;
    if (d.kind === 'custom' && !n && !true) continue;
    const row = h('div', 'dk');
    const info = h('div', 'di'); info.appendChild(h('div', 'dn', d.name)); if (d.sub) info.appendChild(h('div', 'ds', d.sub));
    row.appendChild(info);
    let ct; try { ct = deckCounts(d); } catch(_){ ct = {nw: 0, lr: 0, rv: 0, total: 0}; }
    const cn = h('div', 'dc'); cn.appendChild(h('span', 'cn', String(ct.nw))); cn.appendChild(h('span', 'cl', String(ct.lr))); cn.appendChild(h('span', 'cr', String(ct.rv)));
    row.appendChild(cn);
    const b = h('button', ct.nw + ct.lr + ct.rv ? 'pri' : '', ct.total === 0 ? 'Vuoto' : (ct.nw + ct.lr + ct.rv ? 'Studia' : 'Fatto ✓'));
    b.disabled = ct.total === 0; b.onclick = () => startStudy(d);
    row.appendChild(b); box.appendChild(row);
  }
  $('fc-nw').value = String(FC.set.nw); $('fc-rev').checked = !!FC.set.rev; $('fc-warn').hidden = !FC_NOSAVE;
}
function startStudy(d){ CD = d; $('fc-home').hidden = true; $('fc-study').hidden = false; nextCard(); }
function leaveStudy(){ CD = null; CC = null; $('fc-study').hidden = true; $('fc-home').hidden = false; renderDecks(); }
function nextCard(){
  UNDO && ($('fc-undo').disabled = false);
  CC = pickCard(CD); SHOWN = false; renderStudy();
}
function cardFace(c, back){
  const f = h('div', 'face jp');
  if (c.kind === 'kana'){
    const rev = !!FC.set.rev;
    if (!back){ f.appendChild(h('div', 'fbig', rev ? c.r.split(' ')[0] : c.k)); if (rev) f.lastChild.className = 'fbig'; }
    else {
      f.appendChild(h('div', 'fbig', rev ? c.k : c.r));
      if (/^[はをへ]$/.test(toHira(c.k))) f.appendChild(h('div', 'fsm', toHira(c.k) === 'は' ? 'Come particella si legge «wa».' : toHira(c.k) === 'へ' ? 'Come particella si legge «e».' : 'Come particella si legge «o».'));
    }
  } else if (c.kind === 'kanji'){
    const m = KMETA[c.ch] || {};
    if (!back) f.appendChild(h('div', 'fbig k', c.ch));
    else {
      f.appendChild(h('div', 'fmid', (m.m || []).slice(0, 5).join(', ') || '—'));
      const rd = []; if (m.o && m.o.length) rd.push('on: ' + m.o.join('、')); if (m.k && m.k.length) rd.push('kun: ' + m.k.join('、'));
      f.appendChild(h('div', 'fsm', rd.join('\n')));
      f.appendChild(h('div', 'fsm', [m.n ? m.n + ' tratti' : '', m.j ? 'JLPT N' + m.j : ''].filter(Boolean).join(' · ')));
    }
  } else if (c.kind === 'vocab'){
    if (!back) f.appendChild(h('div', 'fbig w', c.s));
    else {
      f.appendChild(h('div', 'fmid', c.e[0])); f.appendChild(h('div', 'fsm', k2r(c.e[0])));
      f.appendChild(h('div', 'fgl', c.e[2].split('; ').join(' · '))); const p = posIt(c.e[3]); if (p) f.appendChild(h('div', 'fsm', p));
    }
  } else {
    if (!back) f.appendChild(h('div', 'fbig w', c.c.f));
    else c.c.b.filter(Boolean).forEach((l, i) => f.appendChild(h('div', i === 0 ? 'fmid' : 'fsm', l)));
  }
  return f;
}
function renderStudy(){
  const now = Date.now();
  fcDay();
  $('fc-title').textContent = CD.name;
  const ct = deckCounts(CD);
  $('fc-cn').textContent = ct.nw; $('fc-cl').textContent = ct.lr; $('fc-cr').textContent = ct.rv;
  const area = $('fc-card'); area.innerHTML = '';
  const ans = $('fc-ans'); ans.innerHTML = '';
  if (!CC){
    area.appendChild(h('div', 'fdone', 'Hai finito per ora 🎉'));
    area.appendChild(h('div', 'fsm', 'Torna più tardi per i ripassi, oppure aumenta le nuove carte al giorno nelle impostazioni.'));
    const b = h('button', 'pri', 'Torna ai mazzi'); b.onclick = leaveStudy; ans.appendChild(b); return;
  }
  area.appendChild(cardFace(CC, false));
  if (SHOWN){ area.appendChild(h('hr')); area.appendChild(cardFace(CC, true)); }
  if (!SHOWN){ const b = h('button', 'pri wide', 'Mostra risposta'); b.onclick = () => { SHOWN = true; renderStudy(); }; ans.appendChild(b); return; }
  const cur = FC.cards[CC.id] || [0, 0, 0, 2.5, 0, 0, 0];
  const grid = h('div', 'ag');
  [['Ancora', 1, 'again'], ['Difficile', 2, 'hard'], ['Bene', 3, 'good'], ['Facile', 4, 'easy']].forEach(([l, r, cls]) => {
    const b = h('button', 'ab ' + cls); b.appendChild(h('span', 'al', l)); b.appendChild(h('span', 'ai', fmtIv(sched(cur, r, now), now)));
    b.onclick = () => answer(r); grid.appendChild(b);
  });
  ans.appendChild(grid);
}
function answer(r){
  if (!CC) return;
  const now = Date.now(), id = CC.id, prev = FC.cards[id] ? FC.cards[id].slice() : null;
  fcDay();
  UNDO = {id, prev, deck: CD.id, rv: FC.st.rv};
  FC.cards[id] = sched(prev || [0, 0, 0, 2.5, 0, 0, 0], r, now);
  if (!prev) FC.st.nd[CD.id] = (FC.st.nd[CD.id] || 0) + 1;
  FC.st.rv++; fcSave(); nextCard();
}
function undo(){
  if (!UNDO || !CD) return;
  if (UNDO.prev) FC.cards[UNDO.id] = UNDO.prev; else { delete FC.cards[UNDO.id]; FC.st.nd[UNDO.deck] = Math.max(0, (FC.st.nd[UNDO.deck] || 1) - 1); }
  const uid = UNDO.id; FC.st.rv = UNDO.rv; UNDO = null; fcSave();
  CC = cardsOf(CD).find(c => c.id === uid) || null; SHOWN = false; renderStudy();
  $('fc-undo').disabled = true;
}
document.addEventListener('keydown', e => {
  if ($('tab-carte').hidden || $('fc-study').hidden || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return;
  if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); if (CC && !SHOWN){ SHOWN = true; renderStudy(); } else if (CC && SHOWN) answer(3); }
  else if (SHOWN && CC && '1234'.includes(e.key)) answer(+e.key);
});
$('fc-back').onclick = leaveStudy; $('fc-undo').onclick = () => undo();
$('fc-nw').onchange = () => { FC.set.nw = Math.max(0, Math.min(200, +$('fc-nw').value || 0)); fcSave(); renderDecks(); };
$('fc-rev').onchange = () => { FC.set.rev = $('fc-rev').checked; fcSave(); };
$('fc-addm').onclick = () => {
  const f = $('fc-f').value.trim(), b = $('fc-b').value.trim();
  if (!f || !b) return;
  addCustom({id: 'u:' + f + '|m' + Date.now(), f, b: b.split('\n')});
  $('fc-f').value = ''; $('fc-b').value = ''; $('fc-addm').textContent = 'Aggiunta ✓'; setTimeout(() => $('fc-addm').textContent = 'Aggiungi carta', 1200); renderDecks();
};
$('fc-bkc').onclick = () => { const s = btoa(unescape(encodeURIComponent(JSON.stringify(FC)))); $('fc-bk').value = s; copy(s, $('fc-bkc')); };
$('fc-bkr').onclick = () => {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob($('fc-bk').value.trim()))));
    FC.cards = o.cards || {}; FC.cust = o.cust || []; FC.set = Object.assign({nw: 10, rev: false}, o.set || {}); FC.st = Object.assign({day: 0, nd: {}, rv: 0}, o.st || {});
    fcSave(); renderDecks(); $('fc-bkr').textContent = 'Ripristinato ✓';
  } catch(_){ $('fc-bkr').textContent = 'Testo non valido'; }
  setTimeout(() => $('fc-bkr').textContent = 'Ripristina', 1600);
};
let RST = 0;
$('fc-rst').onclick = () => { if (!RST){ RST = 1; $('fc-rst').textContent = 'Sicuro? Tocca ancora per azzerare'; setTimeout(() => { RST = 0; $('fc-rst').textContent = 'Azzera tutti i progressi'; }, 3000); return; }
  FC.cards = {}; FC.st = {day: dayNum(Date.now()), nd: {}, rv: 0}; fcSave(); RST = 0; $('fc-rst').textContent = 'Azzera tutti i progressi'; renderDecks(); };
fcLoad();

renderKana(); setMode('r2k'); renderDecks();
showTab(location.hash.slice(1));
