// Caricamento dei dati (cartella data/). Ogni file ha la sua fonte e licenza: vedi data/README.md.
export const DATA = {db: null, jdict: null, jw: null};
export const KMETA = {};

export async function loadAll(base = 'data/') {
  const get = async f => {
    const r = await fetch(base + f);
    if (!r.ok) throw new Error(f + ': ' + r.status);
    return r.json();
  };
  const [strokes, meta, jdict, jw] = await Promise.all([
    get('kanjivg-strokes.json'), get('kanjidic-meta.json'),
    get('jmdict-common.json'), get('jmdict-words.json')
  ]);
  DATA.db = {...strokes, meta};
  Object.assign(KMETA, meta);
  DATA.jdict = jdict;
  DATA.jw = jw;
}
