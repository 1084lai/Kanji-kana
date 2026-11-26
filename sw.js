// Service worker: dopo il primo caricamento l'app funziona senza rete.
// Per pubblicare una nuova versione cambia VERSION: i file vecchi vengono eliminati.
const VERSION = 'v1';
const CACHE = 'kanji-kana-' + VERSION;
const CORE = ['./', 'index.html', 'src/styles.css', 'src/main.js', 'src/data.js', 'src/util.js', 'src/draw.js',
  'src/app.js', 'src/progress.js', 'src/recognizer.js', 'src/romaji.js', 'src/reader.js', 'src/srs.js'];
const DATA = ['data/kanjivg-strokes.json', 'data/kanjidic-meta.json', 'data/jmdict-common.json', 'data/jmdict-words.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...CORE, ...DATA])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('kanji-kana-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/data/')) { // i dati cambiano solo con VERSION: prima la cache
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }
  // pagina e codice: prima la rete (così gli aggiornamenti arrivano), se manca la rete la cache
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
});
