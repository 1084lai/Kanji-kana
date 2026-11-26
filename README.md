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

L'app funziona offline: i dati sono incorporati nella pagina e i progressi restano nel browser.

## Come provarla

L'app è un'unica pagina, `index.html`. Si può aprire direttamente nel browser, oppure servirla in locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Stato del progetto

Versione iniziale, in fase di analisi e messa in qualità. I documenti sono in [`docs/`](docs/):

- [Analisi funzionale "as-is"](docs/analisi-funzionale.md): requisiti ricostruiti dal codice, criteri di accettazione e punti aperti.
- Decisioni di progetto (ADR): [separare dati e codice](docs/adr/0001-separare-dati-e-codice.md) e [licenza del codice](docs/adr/0002-licenza-del-codice.md), entrambe accettate; [strategia di distribuzione e monetizzazione](docs/adr/0003-strategia-distribuzione-e-monetizzazione.md), in stato proposta.

Prossime tappe: analisi tecnica, test book con casi tracciati ai requisiti, test automatici con Playwright, pubblicazione online e, più avanti, login e sincronizzazione dei progressi.

## Crediti e licenze dei dati

L'app incorpora dati di terze parti, che richiedono attribuzione:

- **KanjiVG** (forma e tratti dei kanji): © Ulrich Apel, licenza [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- **KANJIDIC** e **JMdict** (significati, letture e vocabolario): © Electronic Dictionary Research and Development Group (EDRDG), usati secondo la [licenza dell'EDRDG](https://www.edrdg.org/edrdg/licence.html).

La licenza scelta per il codice è la MIT ([ADR-0002](docs/adr/0002-licenza-del-codice.md)). Verrà applicata con la separazione tra dati e codice ([ADR-0001](docs/adr/0001-separare-dati-e-codice.md)): i dati restano sotto le licenze indicate sopra.
