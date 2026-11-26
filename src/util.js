// Funzioni di servizio condivise dalle schede.
export const $ = id => document.getElementById(id);

export async function copy(text, btn, failLabel = 'Copia a mano') {
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copiato ✓'; }
  catch (_) { btn.textContent = failLabel; }
  setTimeout(() => btn.textContent = old, 1400);
}
