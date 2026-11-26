// Validazione, migrazione e copia di sicurezza (backup) dei progressi di studio.
// Chiude DEF-04 e REQ-SYN-03: un testo non valido o di una versione futura non tocca mai i progressi esistenti.
export const SCHEMA_VERSION = 1;

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isInt = v => Number.isInteger(v);
const num = v => typeof v === 'number' && Number.isFinite(v);

function fail(codice, dettaglio) {
  const e = new Error(dettaglio || codice);
  e.codice = codice;
  throw e;
}

function validaCarta(id, c) {
  // [stato, scadenza, intervallo, fattore, lapsus, ripetizioni, passo]
  if (!Array.isArray(c) || c.length !== 7 || !c.every(num)) fail('formato', 'carta ' + id);
  const [s, d, iv, ef, lp, rp, st] = c;
  if (![0, 1, 2].includes(s) || d < 0 || iv < 0 || ef < 1.3 || ef > 10 || lp < 0 || rp < 0 || st < 0) fail('formato', 'carta ' + id);
  return c.slice();
}

// Restituisce una copia normalizzata dei progressi, oppure lancia un errore con `codice` = 'formato' | 'versione'.
export function validateProgress(o) {
  if (!isObj(o)) fail('formato', 'non è un oggetto');
  const v = o.v === undefined ? 1 : o.v;               // i backup più vecchi non hanno la versione
  if (!isInt(v) || v < 1) fail('formato', 'versione');
  if (v > SCHEMA_VERSION) fail('versione', 'versione più recente');

  const cards = {};
  if (o.cards !== undefined) {
    if (!isObj(o.cards)) fail('formato', 'cards');
    for (const [id, c] of Object.entries(o.cards)) cards[id] = validaCarta(id, c);
  }

  const cust = [];
  if (o.cust !== undefined) {
    if (!Array.isArray(o.cust)) fail('formato', 'cust');
    for (const c of o.cust) {
      if (!isObj(c) || typeof c.id !== 'string' || !c.id || typeof c.f !== 'string' || !Array.isArray(c.b) || !c.b.every(x => typeof x === 'string')) fail('formato', 'carta personale');
      cust.push({id: c.id, f: c.f, b: c.b.slice()});
    }
  }

  const set = {nw: 10, rev: false};
  if (o.set !== undefined) {
    if (!isObj(o.set)) fail('formato', 'set');
    if (o.set.nw !== undefined) { if (!isInt(o.set.nw) || o.set.nw < 0 || o.set.nw > 200) fail('formato', 'nuove al giorno'); set.nw = o.set.nw; }
    if (o.set.rev !== undefined) { if (typeof o.set.rev !== 'boolean') fail('formato', 'inverti'); set.rev = o.set.rev; }
  }

  const st = {day: 0, nd: {}, rv: 0};
  if (o.st !== undefined) {
    if (!isObj(o.st)) fail('formato', 'st');
    if (o.st.day !== undefined) { if (!isInt(o.st.day)) fail('formato', 'giorno'); st.day = o.st.day; }
    if (o.st.rv !== undefined) { if (!isInt(o.st.rv) || o.st.rv < 0) fail('formato', 'risposte'); st.rv = o.st.rv; }
    if (o.st.nd !== undefined) {
      if (!isObj(o.st.nd)) fail('formato', 'nd');
      for (const [k, n] of Object.entries(o.st.nd)) { if (!isInt(n) || n < 0) fail('formato', 'nd'); st.nd[k] = n; }
    }
  }
  return {v: SCHEMA_VERSION, cards, cust, set, st};
}

// Backup: JSON in UTF-8, poi base64 (stesso formato delle versioni precedenti).
export function encodeBackup(progress) {
  const bytes = new TextEncoder().encode(JSON.stringify({...progress, v: SCHEMA_VERSION}));
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function decodeBackup(testo) {
  let json;
  try {
    const bin = atob(String(testo).trim());
    json = new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  } catch (_) { fail('formato', 'testo non decodificabile'); }
  let o;
  try { o = JSON.parse(json); } catch (_) { fail('formato', 'JSON non valido'); }
  return validateProgress(o);
}
