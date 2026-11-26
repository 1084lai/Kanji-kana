# Kanji-kana

Kanji-kana è un helper per imparare il giapponese. Riunisce strumenti utili per lo studio della lingua:

- riconoscimento dei kanji;
- tabelle di riferimento per i diversi alfabeti giapponesi;
- traduzione da romaji a kana;
- flash card in stile Anki per memorizzare vocaboli, kanji e kana.

L'obiettivo è rendere più semplice esercitarsi e consultare le basi della scrittura giapponese in un unico posto.

## Funzioni

| Scheda | Cosa fa |
|---|---|
| **Disegna** | Riconosce un kanji disegnato a mano (circa 6.400 kanji) e ne mostra significati, letture, tratti e livello JLPT. |
| **Kana** | Tabelle di hiragana e katakana (suoni base, dakuten, yōon, suoni stranieri) con romaji e composizione di parole. |
| **Romaji** | Conversione romaji → kana e kanji, e kana → romaji. |
| **Leggi** | Analizza un testo giapponese: furigana, significati, coniugazioni e glossario. |
| **Carte** | Flashcard a ripetizione dilazionata (kana, kanji N5-N1, vocabolario N5-N2, carte personali) con backup dei progressi. |

Dopo il primo caricamento l'app funziona anche senza rete (service worker); i progressi restano nel browser.

## Come provarla

Serve un piccolo server locale (i dati si caricano con `fetch`, quindi aprire `index.html` con doppio clic non basta):

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Struttura

```
index.html        struttura della pagina
src/              codice (moduli ES): logica senza interfaccia e schede
data/             dati di terze parti, con licenze proprie (vedi data/README.md)
sw.js             service worker per l'uso senza rete
tests/unit/       test sulla logica (Node)
tests/e2e/        test nel browser (Playwright)
docs/             analisi, decisioni (ADR), test book, guida al rilascio
```

## Verifiche

```bash
npm install
npm run lint                    # controllo del codice
npm test                        # test sulla logica
python3 scripts/check_traceability.py   # ogni requisito ha almeno un test
npx playwright install chromium && npx playwright test   # test nel browser
```

## Stato del progetto

Versione iniziale, in fase di analisi e messa in qualità. I documenti sono in [`docs/`](docs/):

- [Analisi funzionale "as-is"](docs/analisi-funzionale.md): requisiti ricostruiti dal codice, criteri di accettazione e punti aperti.
- Decisioni di progetto (ADR): [separare dati e codice](docs/adr/0001-separare-dati-e-codice.md) e [licenza del codice](docs/adr/0002-licenza-del-codice.md), entrambe accettate; [strategia di distribuzione e monetizzazione](docs/adr/0003-strategia-distribuzione-e-monetizzazione.md), accettata; [stack e hosting del primo rilascio](docs/adr/0004-stack-e-hosting-primo-rilascio.md), accettata. Vedi anche [analisi tecnica](docs/analisi-tecnica.md), [guida al rilascio](docs/rilascio.md) e [test book](docs/test-book.md).

Prossime tappe: pubblicazione online (Cloudflare), login con Google e sincronizzazione dei progressi (Supabase), interfaccia in inglese e italiano, migrazione a TypeScript con Vite. Il [test book](docs/test-book.md) elenca i casi di test e i difetti noti.

## Crediti e licenze dei dati

L'app incorpora dati di terze parti, che richiedono attribuzione:

- **KanjiVG** (forma e tratti dei kanji): © Ulrich Apel, licenza [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- **KANJIDIC** e **JMdict** (significati, letture e vocabolario): © Electronic Dictionary Research and Development Group (EDRDG), usati secondo la [licenza dell'EDRDG](https://www.edrdg.org/edrdg/licence.html).

Il codice è rilasciato con licenza MIT ([LICENSE](LICENSE), [ADR-0002](docs/adr/0002-licenza-del-codice.md)). I dati, separati dal codice in `data/` ([ADR-0001](docs/adr/0001-separare-dati-e-codice.md)), restano sotto le licenze indicate sopra: vedi [NOTICE](NOTICE.md) e [data/README.md](data/README.md). L'app mostra le stesse attribuzioni nella scheda «Crediti».
