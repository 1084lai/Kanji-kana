// Riconoscitore di kanji offline (confronto di tratti normalizzati, dati KanjiVG).
// Riconoscitore di kanji offline: confronto di tratti normalizzati con i dati KanjiVG
const NP = 10;
function resampleStroke(p, n) {
  if (p.length === 1) return Array.from({length: n}, () => [p[0][0], p[0][1]]);
  const L = [0];
  for (let i = 1; i < p.length; i++) L.push(L[i-1] + Math.hypot(p[i][0]-p[i-1][0], p[i][1]-p[i-1][1]));
  const T = L[L.length-1];
  if (T === 0) return Array.from({length: n}, () => [p[0][0], p[0][1]]);
  const out = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const t = T * k / (n-1);
    while (j < L.length-2 && L[j+1] < t) j++;
    const seg = L[j+1]-L[j], f = seg === 0 ? 0 : (t-L[j])/seg;
    out.push([p[j][0]+f*(p[j+1][0]-p[j][0]), p[j][1]+f*(p[j+1][1]-p[j][1])]);
  }
  return out;
}
function normalize(strokes) { // strokes: [[ [x,y]... ]...] gia' ricampionati -> normalizza il bbox complessivo
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of strokes) for (const [x,y] of s) { x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y); }
  const sc = Math.max(x1-x0, y1-y0) || 1, cx=(x0+x1)/2, cy=(y0+y1)/2;
  return strokes.map(s => s.map(([x,y]) => [(x-cx)/sc, (y-cy)/sc]));
}
function prepare(raw, minLen) {
  // raw: tratti disegnati in pixel; elimina i tratti quasi nulli solo se sono "sporchi" (troppo corti)
  const out = [];
  for (const s of raw) {
    if (s.length < 1) continue;
    let len = 0; for (let i=1;i<s.length;i++) len += Math.hypot(s[i][0]-s[i-1][0], s[i][1]-s[i-1][1]);
    out.push({len, pts: s});
  }
  if (!out.length) return [];
  const kept = out.filter(o => o.len >= (minLen||0) || out.length === 1);
  return normalize(kept.map(o => resampleStroke(o.pts, NP)));
}
const FULL = [0,1,2,3,4,5,6,7,8,9], FAST = [0,3,6,9];
function strokeDist(a, b, idx) { // a,b: [NP][2]
  let f = 0, r = 0;
  for (let t = 0; t < idx.length; t++) {
    const i = idx[t], k = NP-1-i;
    let dx = a[i][0]-b[i][0], dy = a[i][1]-b[i][1]; f += Math.sqrt(dx*dx+dy*dy);
    dx = a[i][0]-b[k][0]; dy = a[i][1]-b[k][1]; r += Math.sqrt(dx*dx+dy*dy);
  }
  f /= idx.length; r /= idx.length;
  return Math.min(f, 1.35*r + 0.03);
}
function score(q, ref, idx) {
  const n = q.length, m = ref.length;
  // distanze fra tutte le coppie di tratti
  const D = new Array(n);
  for (let i = 0; i < n; i++) { D[i] = new Float32Array(m); for (let j = 0; j < m; j++) D[i][j] = strokeDist(q[i], ref[j], idx); }
  // ordine rispettato (stesso numero di tratti)
  let ord = Infinity;
  if (n === m) { let s = 0; for (let i = 0; i < n; i++) s += D[i][i]; ord = s / n; }
  // abbinamento libero (greedy sui costi minori)
  const ui = new Uint8Array(n), uj = new Uint8Array(m); let s = 0;
  for (let c = Math.min(n,m); c > 0; c--) {
    let bd = 1e9, bi = -1, bj = -1;
    for (let i = 0; i < n; i++) { if (ui[i]) continue; const row = D[i]; for (let j = 0; j < m; j++) if (!uj[j] && row[j] < bd) { bd = row[j]; bi = i; bj = j; } }
    ui[bi] = 1; uj[bj] = 1; s += bd;
  }
  const unm = Math.abs(n-m);
  const free = (s + 0.22*unm) / Math.max(n,m);
  return Math.min(ord, free*1.12 + 0.01);
}
function decodeDB(db) {
  const bin = typeof atob !== 'undefined' ? Uint8Array.from(atob(db.blob), c => c.charCodeAt(0)) : new Uint8Array(globalThis.Buffer.from(db.blob, 'base64'));
  const entries = []; let off = 0;
  for (const [ch, n, common] of db.idx) {
    const strokes = [];
    for (let s = 0; s < n; s++) {
      const pts = [];
      for (let k = 0; k < NP; k++) { pts.push([bin[off]/2, bin[off+1]/2]); off += 2; }
      strokes.push(pts);
    }
    entries.push({ch, n, common, strokes: normalize(strokes)});
  }
  return entries;
}
function recognize(raw, entries, topK, minLen) {
  const q = prepare(raw, minLen);
  if (!q.length) return [];
  let res = [];
  const n = q.length;
  const pen = e => e.common ? 0 : 0.012; // i kanji rari partono con un leggero svantaggio
  for (const e of entries) {
    if (Math.abs(e.n - n) > Math.max(3, Math.ceil(n*0.5))) continue;
    res.push([e, score(q, e.strokes, FAST) + pen(e)]);
  }
  res.sort((a,b)=>a[1]-b[1]);
  res = res.slice(0, 250).map(([e]) => [e.ch, score(q, e.strokes, FULL) + pen(e)]);
  res.sort((a,b)=>a[1]-b[1]);
  return res.slice(0, topK||12);
}
export {FULL, NP, decodeDB, normalize, prepare, recognize, resampleStroke, score, strokeDist};
