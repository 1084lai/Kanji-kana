// Pianificatore di ripetizione dilazionata (stile Anki).
const dayNum = t => Math.floor((t - new Date().getTimezoneOffset() * 60000) / 86400000);
const STEPS = [1, 10];
function sched(c, rating, now){
  let [s, d, iv, ef, lp, rp, st] = c; rp++;
  const today = dayNum(now);
  if (s === 0 || s === 1){
    if (s === 0) st = 0;
    if (rating === 1){ st = 0; s = 1; d = now + STEPS[0] * 60000; }
    else if (rating === 2){ s = 1; d = now + (st === 0 ? 6 : STEPS[Math.min(st, STEPS.length - 1)]) * 60000; }
    else if (rating === 3){ if (st + 1 < STEPS.length){ st++; s = 1; d = now + STEPS[st] * 60000; } else { s = 2; iv = iv > 0 ? iv : 1; d = today + iv; st = 0; } }
    else { s = 2; iv = iv > 0 ? iv + 1 : 4; d = today + iv; st = 0; }
  } else {
    if (rating === 1){ lp++; ef = Math.max(1.3, ef - 0.2); iv = Math.max(1, Math.round(iv * 0.5)); s = 1; st = 0; d = now + 10 * 60000; }
    else if (rating === 2){ ef = Math.max(1.3, ef - 0.15); iv = Math.max(iv + 1, Math.round(iv * 1.2)); d = today + iv; }
    else if (rating === 3){ iv = Math.max(iv + 1, Math.round(iv * ef)); d = today + iv; }
    else { ef += 0.15; iv = Math.max(iv + 2, Math.round(iv * ef * 1.3)); d = today + iv; }
  }
  return [s, d, iv, Math.round(ef * 100) / 100, lp, rp, st];
}
function fmtIv(ns, now){
  if (ns[0] === 1){ const m = Math.max(1, Math.round((ns[1] - now) / 60000)); return m < 60 ? m + ' min' : Math.round(m / 60) + ' h'; }
  const d = ns[2]; return d < 31 ? d + (d === 1 ? ' giorno' : ' giorni') : d < 365 ? Math.round(d / 30) + ' mesi' : (d / 365).toFixed(1).replace('.0', '') + ' anni';
}
export {STEPS, dayNum, fmtIv, sched};
