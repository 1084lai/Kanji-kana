# Dati

I file di questa cartella sono **dati di terze parti** in formato compatto. Non sono coperti dalla licenza MIT del codice: hanno la licenza della loro fonte (vedi [NOTICE](../NOTICE.md)). Sono versioni **modificate** (selezionate e ricodificate) degli originali e restano sotto CC BY-SA.

| File | Fonte | Licenza | Contenuto |
|---|---|---|---|
| `kanjivg-strokes.json` | [KanjiVG](https://kanjivg.tagaini.net/), © Ulrich Apel | CC BY-SA 3.0 | Tratti di 6.395 kanji, ricampionati a 10 punti per tratto |
| `kanjidic-meta.json` | [KANJIDIC](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project), © EDRDG | CC BY-SA 4.0 | Significati (inglese), letture on/kun, numero di tratti, livello JLPT, grado scolastico |
| `jmdict-common.json` | [JMdict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project), © EDRDG | CC BY-SA 4.0 | 22.787 voci comuni per la conversione hiragana → kanji |
| `jmdict-words.json` | JMdict, © EDRDG | CC BY-SA 4.0 | 32.009 voci con lettura, priorità, significati in inglese e categoria grammaticale |

## Formato

- **`kanjivg-strokes.json`**: `{idx, np, blob}`. `idx` è un elenco di `[carattere, numero di tratti, comune (0/1)]`; `np` è il numero di punti per tratto (10); `blob` è un testo in base64: per ogni kanji e ogni tratto, `np` coppie di byte (x, y), con coordinate pari al valore del byte diviso per 2.
- **`kanjidic-meta.json`**: oggetto `{carattere: {m: significati, o: letture on, k: letture kun, n: tratti, j: livello JLPT (N5=5 … N1=1) o null, g: grado scolastico o null}}`.
- **`jmdict-common.json`**: `{lettura in hiragana: [[scrittura, priorità, tipo]]}`; `tipo` indica verbo (valore vero) o aggettivo in -い (2) per la generazione delle forme flesse.
- **`jmdict-words.json`**: `{scrittura: [[lettura, priorità, significati separati da "; ", categoria grammaticale]]}`.

Le funzioni che li leggono sono in `src/data.js` (caricamento), `src/recognizer.js` (`decodeDB`) e `src/reader.js`.

## Aggiornamento dei dati (BKL-05)

L'EDRDG richiede che il software che incorpora JMdict e KANJIDIC abbia un processo per aggiornarli regolarmente alle versioni più recenti.

**Stato attuale: il processo non è ancora automatizzato.** I quattro file sono stati generati da una versione dei dati originali di cui **non è stata registrata la data**, e lo script che li ha prodotti non è nel repository. Per chiudere il punto serve:

1. Scrivere uno script di generazione (`tools/build-data`) che scarichi le ultime versioni di JMdict, KANJIDIC2 e KanjiVG e produca i quattro file nel formato sopra descritto.
2. Registrare la data e la versione delle fonti in un file `data/VERSION.json`.
3. Eseguire i test (`npm test`, `npx playwright test`) sui nuovi dati: il numero di kanji e i test di riconoscimento devono continuare a passare.
4. Aggiornare `VERSION` in `sw.js` (così la cache dei dispositivi si rinnova) e la data nella scheda «Crediti».
5. Ripetere almeno ogni trimestre.

Prima di aggiungere significati in altre lingue (italiano compreso) si controlla la licenza di ciascun gruppo di traduzioni: nel file JMdict le glosse in lingue diverse dall'inglese hanno titolari e condizioni propri.
