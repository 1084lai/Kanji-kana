# ADR-0001 – Separare i dati dal codice

| | |
|---|---|
| **Stato** | Accettata (approvata dall'autore il 26 novembre 2026) |
| **Data** | 26 novembre 2026 |
| **Collegato a** | OSS-06, OSS-09, BKL-01, BKL-02 |

## Contesto

L'app è un unico `index.html` di 6,4 MB che contiene sia il codice (circa 70 KB) sia tre blocchi di dati: tratti dei kanji (KanjiVG, KANJIDIC), e due indici del dizionario (JMdict). Questi dati hanno licenze proprie con obbligo di attribuzione e di «share-alike»: KanjiVG è CC BY-SA 3.0, JMdict e KANJIDIC sono CC BY-SA 4.0 secondo l'EDRDG. Con dati e codice nello stesso file non è chiaro dove finisca la parte soggetta a quelle licenze, e il file è difficile da testare e da rivedere.

## Decisione

Separare il progetto in tre parti:

1. **Dati**: file distinti in una cartella `data/` (per esempio `kanji.json`, `jdict.json`, `jw.json`), ciascuno con l'indicazione della fonte e della licenza.
2. **Logica**: moduli di codice senza interfaccia (riconoscimento dei kanji, conversione romaji, pianificatore delle flashcard), testabili da soli.
3. **Interfaccia**: pagina e fogli di stile che caricano dati e logica.

I dati vengono caricati all'avvio o alla prima necessità e messi in cache dal browser; il comportamento offline si garantisce con un service worker (decisione da trattare a parte).

## Alternative considerate

- **Lasciare il file unico**: nessun lavoro, ma licenze poco chiare, test difficili e caricamento lento a ogni modifica.
- **Dati in un database lato server**: inutile per dati che non cambiano e va contro il funzionamento offline.

## Conseguenze

- Le licenze dei dati si applicano ai soli file in `data/`; il codice può avere una licenza propria (ADR-0002).
- I test automatici possono verificare la logica senza caricare l'interfaccia.
- Il primo caricamento richiede più richieste di rete, mitigabili con cache e compressione.
- Serve una scheda «Crediti» (BKL-01) e un testo di licenza accanto ai dati.

Nota: questo documento descrive scelte tecniche e non è consulenza legale.

## Attuazione (26 novembre 2026)

- I dati sono in `data/` (quattro file, uno per fonte e licenza), con [data/README.md](../../data/README.md) che ne descrive formato e aggiornamento.
- Il codice è in `src/` come moduli: la logica senza interfaccia (`romaji.js`, `reader.js`, `recognizer.js`, `srs.js`) è separata dall'interfaccia (`draw.js`, `app.js`) ed è coperta da test automatici.
- Il funzionamento offline è affidato a un service worker (`sw.js`).
- Restano da fare: aggiornamento automatico dei dati (BKL-05) e migrazione a TypeScript con Vite ([ADR-0004](0004-stack-e-hosting-primo-rilascio.md)).
