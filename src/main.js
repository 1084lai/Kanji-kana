// Punto di ingresso: carica i dati, poi avvia le schede.
import {loadAll} from './data.js';

const box = document.getElementById('loading');
try {
  await loadAll();
  await import('./draw.js');
  await import('./app.js');
  if (box) box.remove();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
} catch (e) {
  console.error(e);
  if (box) box.textContent = 'Impossibile caricare i dati. Apri l\'app da un server locale (vedi README).';
}
