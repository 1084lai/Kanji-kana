# ADR-0002 – Licenza del codice

| | |
|---|---|
| **Stato** | Accettata (approvata dall'autore il 26 novembre 2026): MIT per il codice |
| **Data** | 26 novembre 2026 |
| **Collegato a** | OSS-06, BKL-03 |

## Contesto

Il repository non ha ancora una licenza: senza, gli altri non possono legalmente riusare il codice. I dati incorporati sono sotto licenze CC BY-SA (KanjiVG 3.0; JMdict e KANJIDIC 4.0). L'EDRDG precisa che il software che usa i suoi file non è obbligato a essere open source; l'obbligo di share-alike riguarda i dati modificati o derivati. Il progetto serve anche come lavoro da mostrare a chi seleziona il personale.

## Opzioni

| Opzione | Pro | Contro |
|---|---|---|
| **MIT** | Molto semplice e diffusa; riconosciuta subito da chi legge il repository; nessun vincolo per chi riusa il codice. | Nessuna protezione contro chi riusa il codice senza restituire modifiche. |
| **Apache-2.0** | Come MIT, con concessione esplicita dei brevetti. | Testo più lungo; per un progetto piccolo il vantaggio è limitato. |
| **GPL-3.0 / AGPL-3.0** | Obbliga chi riusa il codice a restare open source. | Più restrittiva; può scoraggiare il riuso; con l'AGPL pesa anche sull'uso via rete. |

## Decisione

Adottare **MIT per il codice**, tenendo i **dati in file separati** con la loro licenza (ADR-0001) e un file `NOTICE` o una scheda «Crediti» che elenchi fonti, autori, licenze e link. Questa scelta è subordinata ad ADR-0001: finché dati e codice sono nello stesso file, la licenza va dichiarata come «in definizione».

## Da verificare prima di confermare

- Che la separazione dei dati sia effettivamente fatta.
- Se l'autore preferisce una licenza copyleft per ragioni personali.
- Un parere legale, se il progetto avrà un uso commerciale.

Nota: questo documento non è consulenza legale.
