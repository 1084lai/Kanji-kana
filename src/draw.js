// Scheda Disegna: tela, riconoscimento e dettaglio del kanji.
import {$, copy} from './util.js';
import {recognize, decodeDB} from './recognizer.js';
import {DATA} from './data.js';
const db = DATA.db;
const entries = decodeDB(db);
const meta = db.meta;
$('count').textContent = entries.length.toLocaleString('it') + ' kanji';

const pad = $('pad'), ctx = pad.getContext('2d');
let strokes = [], cur = null, W = 0, H = 0, dpr = 1, timer = null, results = [], selected = null;

function resize(){
  const r = pad.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
  W = r.width; H = r.height; pad.width = Math.round(W*dpr); pad.height = Math.round(H*dpr);
  redraw();
}
function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function redraw(){
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = css('--line'); ctx.lineWidth = 1; ctx.setLineDash([5,5]);
  ctx.beginPath(); ctx.moveTo(W/2,8); ctx.lineTo(W/2,H-8); ctx.moveTo(8,H/2); ctx.lineTo(W-8,H/2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = css('--ink'); ctx.lineWidth = Math.max(5, W/55); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const all = cur ? strokes.concat([cur]) : strokes;
  for (const s of all){
    ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]);
    for (let i=1;i<s.length;i++) ctx.lineTo(s[i][0], s[i][1]);
    if (s.length === 1) ctx.lineTo(s[0][0]+0.01, s[0][1]);
    ctx.stroke();
  }
}
function pos(e){ const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
pad.addEventListener('pointerdown', e => {
  e.preventDefault(); try{ pad.setPointerCapture(e.pointerId); }catch(_){}
  clearTimeout(timer); cur = [pos(e)]; $('hint').style.display = 'none'; redraw();
});
pad.addEventListener('pointermove', e => {
  if (!cur) return; e.preventDefault();
  const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
  for (const ev of (evs.length ? evs : [e])){
    const p = pos(ev), l = cur[cur.length-1];
    if (Math.hypot(p[0]-l[0], p[1]-l[1]) >= 1.5) cur.push(p);
  }
  redraw();
});
function end(e){
  if (!cur) return;
  if (cur.length === 1) cur.push([cur[0][0]+3, cur[0][1]+3]); // un punto = tratto breve
  strokes.push(cur); cur = null; redraw(); updateButtons();
  timer = setTimeout(recognizeNow, 120);
}
pad.addEventListener('pointerup', end);
pad.addEventListener('pointercancel', end);
pad.addEventListener('contextmenu', e => e.preventDefault());

function updateButtons(){ $('undo').disabled = $('clear').disabled = strokes.length === 0; }
$('undo').onclick = () => { strokes.pop(); redraw(); updateButtons(); strokes.length ? recognizeNow() : reset(); };
$('clear').onclick = () => { strokes = []; redraw(); updateButtons(); reset(); $('hint').style.display = 'flex'; };

function reset(){ results = []; selected = null; $('cands').innerHTML = ''; $('detail').style.display = 'none'; $('status').textContent = ''; $('add').disabled = true; }

function recognizeNow(){
  if (!strokes.length) return;
  // il lato della tela fa da scala: ignora i tratti piu' corti di ~1% del lato
  const t0 = performance.now();
  results = recognize(strokes, entries, 14, Math.max(2, W*0.01));
  const ms = Math.round(performance.now() - t0);
  $('status').textContent = results.length ? strokes.length + (strokes.length === 1 ? ' tratto' : ' tratti') + ' · tocca un risultato per i dettagli' : 'Nessun risultato: prova a ridisegnare.';
  renderCands();
  if (results.length) select(results[0][0]);
}
function renderCands(){
  const box = $('cands'); box.innerHTML = '';
  for (const [ch] of results){
    const m = meta[ch], b = document.createElement('button');
    b.className = 'c' + (ch === selected ? ' sel' : ''); b.dataset.ch = ch;
    b.innerHTML = '<span class="g"></span><span class="t"></span>';
    b.firstChild.textContent = ch; b.lastChild.textContent = (m.m && m.m[0]) || '';
    b.onclick = () => select(ch);
    box.appendChild(b);
  }
}
function select(ch){
  selected = ch; const m = meta[ch];
  for (const b of $('cands').children) b.classList.toggle('sel', b.dataset.ch === ch);
  $('detail').style.display = 'block'; $('add').disabled = false;
  $('big').textContent = ch;
  $('mean').textContent = (m.m && m.m.length) ? m.m.join(', ') : '(nessun significato registrato)';
  $('on').textContent = (m.o && m.o.length) ? m.o.join('、') : '—';
  $('kun').textContent = (m.k && m.k.length) ? m.k.join('、') : '—';
  const tags = [];
  if (m.n) tags.push(m.n + ' tratti');
  if (m.j) tags.push('JLPT N' + m.j);
  if (m.g >= 1 && m.g <= 6) tags.push('scuola elementare, classe ' + m.g);
  else if (m.g === 8) tags.push('jōyō (superiori)');
  else if (m.g === 9 || m.g === 10) tags.push('uso nei nomi');
  $('tags').innerHTML = ''; for (const t of tags){ const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; $('tags').appendChild(s); }
  $('jisho').href = 'https://jisho.org/search/' + encodeURIComponent(ch + ' #kanji');
}
$('fcadd').onclick = () => { if (!selected) return; window.dispatchEvent(new CustomEvent('fc-add', {detail: {type: 'kanji', ch: selected}})); $('fcadd').textContent = 'Aggiunta ✓'; setTimeout(() => $('fcadd').textContent = '＋ Flashcard', 1400); };
$('copy1').onclick = () => selected && copy(selected, $('copy1'), 'Seleziona e copia a mano');
$('copyt').onclick = () => copy($('txt').value, $('copyt'), 'Seleziona e copia a mano');
function jt(){ $('jishot').href = 'https://jisho.org/search/' + encodeURIComponent($('txt').value || ''); }
$('txt').addEventListener('input', jt);
$('delt').onclick = () => { const a = Array.from($('txt').value); a.pop(); $('txt').value = a.join(''); jt(); };
$('add').onclick = () => {
  if (!selected) return; $('txt').value += selected; jt();
  strokes = []; redraw(); updateButtons(); reset(); $('hint').style.display = 'none';
};
jt();
window.addEventListener('resize', resize);
try{ matchMedia('(prefers-color-scheme:dark)').addEventListener('change', redraw); }catch(_){}
resize();
