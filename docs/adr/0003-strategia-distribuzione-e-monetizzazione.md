# ADR-0003 – Strategia di distribuzione e monetizzazione

| | |
|---|---|
| **Stato** | Accettata (approvata dall'autore il 26 novembre 2026) |
| **Data** | 26 novembre 2026 |
| **Collegato a** | ADR-0001 (separazione dati e codice), ADR-0002 (licenza) |

## Contesto

L'app serve prima di tutto allo studio personale dell'autore. Il progetto ha però anche un obiettivo dichiarato: **verificare se l'autore riesce a vendere un proprio prodotto**. Una sola copia venduta a una persona sconosciuta è considerata un risultato sufficiente; il reddito non è l'obiettivo.

Elementi noti:

- Il mercato delle app per kanji è affollato; esistono alternative gratuite con pubblicità.
- Nessun utente pagherebbe per una web app di questo tipo (valutazione dell'autore, che si pone come primo utente): sul web il valore percepito è basso.
- Su uno store, invece, l'acquisto una tantum di una piccola app è un comportamento diffuso.
- Le glosse di JMdict sono disponibili in inglese, tedesco, francese, russo, spagnolo, ungherese, sloveno e olandese, non in italiano.
- Google Play: l'account sviluppatore costa 25 $ una tantum. Per gli account personali creati dopo il 13 novembre 2023 serve un test chiuso con almeno 12 tester iscritti per 14 giorni continuativi prima di poter chiedere l'accesso alla produzione. Gli account di organizzazione ne sono esenti, ma richiedono un numero D-U-N-S.
- Le commissioni di Google Play e l'IVA riducono un incasso di 0,99 € a circa 0,65-0,70 € (stima, da verificare).

## Opzioni

| Opzione | Pro | Contro |
|---|---|---|
| **A. Solo web, gratuita con pubblicità** | Pubblicazione immediata; nessun costo di store. | Nessuna vendita: non risponde all'obiettivo. Incasso pubblicitario trascurabile con pochi utenti. |
| **B. Web con sblocco «Pro» a pagamento** | Un solo prodotto. | Scartata dall'autore: sul web nessuno pagherebbe. |
| **C. Web gratuita con pubblicità + app Android a pagamento senza pubblicità** | Il web fa da vetrina; la vendita avviene dove l'acquisto è abituale. | Più lavoro (wrapper Android, account Play, test chiuso). |
| **D. Solo Android a pagamento** | Prodotto unico e semplice. | Nessuna vetrina gratuita per farsi conoscere. |

## Decisione

Adottare l'**opzione C**, per fasi:

1. **Fase 1 – Web gratuita.** Pubblicazione online, con pubblicità solo se il consenso GDPR è gestito correttamente. Può essere necessario rinviare la pubblicità: i servizi pubblicitari possono rifiutare siti con poco contenuto. In ogni caso la pubblicità è una prova, non una fonte di reddito.
2. **Fase 2 – App Android a pagamento (circa 0,99 €), senza pubblicità**, con funzionamento offline. Riusa il front end tramite wrapper (PWA/TWA o Capacitor); il backend Java serve solo per login e sincronizzazione, e non è necessario per la prima vendita.
3. **Fase 3 – Traduzioni dei significati, guidate dai dati.** Al lancio l'interfaccia è in **inglese e italiano**, mentre i significati (glosse di JMdict e KANJIDIC) restano in inglese, perché l'italiano non esiste nei dati di partenza. Dopo il lancio si misura da dove arrivano gli utenti e si traduce per primo il mercato più favorevole (vedi sotto).

### Scelta delle lingue dopo il lancio

- **Segnali:** download per paese (Google Play Console per l'app, statistiche web rispettose della privacy per la web app) e **lingua del browser/dispositivo**, che è più indicativa del paese (un italiano all'estero resta italiano).
- **Soglia minima:** con pochi utenti i numeri sono rumore. Decidere solo dopo un campione minimo (fissato a 50 utenti attivi) e comunque non prima della revisione dei 3 mesi.
- **Candidate:** inglese (già presente), spagnolo, francese, tedesco, olandese (le lingue con glosse disponibili in JMdict), più l'italiano come variante nativa.
- **Italiano nativo:** prima tranche sui 2.136 kanji jōyō e circa 3.000 parole comuni, con bozza automatica e revisione a campione (stima: 15-20 ore). Le glosse tradotte sono un'opera derivata e vanno rilasciate in CC BY-SA 4.0 con i crediti dell'EDRDG (ADR-0001). Per ogni lingua vanno verificate la licenza e la copertura dei dati.

## Criteri di successo

Misurati su passi controllabili dall'autore, non sull'incasso:

| # | Criterio | Soglia |
|---|---|---|
| S1 | App web pubblicata e raggiungibile | Pubblica e usabile da chiunque |
| S2 | Utenti reali | 10 persone sconosciute la usano |
| S3 | Feedback | Almeno 1 messaggio o segnalazione da un utente |
| S4 | **Prima vendita** | **1 copia a una persona sconosciuta (obiettivo del progetto)** |

Si fissa una revisione 3 mesi dopo la pubblicazione della fase 1: continuare, cambiare direzione o chiudere. Un esito inferiore alle attese non è un fallimento personale: in una nicchia affollata pesano visibilità e distribuzione, che sono competenze diverse dallo sviluppo.

## Rischi e punti aperti

- **Test chiuso Google Play:** servono 12 tester per 14 giorni; pianificarli in anticipo (community di studio del giapponese, conoscenti).
- **Conformità:** consenso GDPR per la pubblicità, privacy policy, scheda «Crediti» con le licenze dei dati (ADR-0001/0002) obbligatoria prima di ogni pubblicazione.
- **Statistiche:** usare strumenti rispettosi della privacy, senza dati personali.
- **Prezzo:** 0,99 € è una prima ipotesi; da rivedere con i risultati.
- **Fiscale:** la vendita su store comporta obblighi fiscali per l'autore; da verificare con un professionista.

Nota: questo documento non è consulenza legale né fiscale.
