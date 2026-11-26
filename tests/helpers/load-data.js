// Carica i file di data/ nel modulo dei dati (per i test in Node, senza browser).
import {readFileSync} from 'node:fs';
import {DATA, KMETA} from '../../src/data.js';

const read = f => JSON.parse(readFileSync(new URL('../../data/' + f, import.meta.url), 'utf8'));

if (!DATA.db) {
  const meta = read('kanjidic-meta.json');
  DATA.db = {...read('kanjivg-strokes.json'), meta};
  Object.assign(KMETA, meta);
  DATA.jdict = read('jmdict-common.json');
  DATA.jw = read('jmdict-words.json');
}
export {DATA, KMETA};
