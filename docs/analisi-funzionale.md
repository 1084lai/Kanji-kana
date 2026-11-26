# Analisi funzionale "as-is" – Kanji e kana

| | |
|---|---|
| **Versione documentata** | `index.html` presente nel repository (pagina unica, 6,4 MB) |
| **Data** | 26 novembre 2026 |
| **Metodo** | Ricostruzione dal codice sorgente (lettura statica). Nessuna esecuzione dell'app. |
| **Stato** | Bozza per revisione dell'autore. I requisiti descrivono ciò che il codice fa oggi, non ciò che dovrebbe fare. |

## 1. Scopo e contesto

Kanji e kana è uno strumento web per chi studia giapponese. Riunisce in un'unica pagina il riconoscimento dei kanji scritti a mano, le tabelle dei kana, la conversione romaji ⇄ kana, un lettore di testi con furigana e le flashcard a ripetizione dilazionata. Funziona interamente nel browser, senza server e senza rete.

**Obiettivo del prodotto.** Rendere più semplice esercitarsi e consultare le basi della scrittura giapponese in un unico posto.

**Utenti.** Un solo tipo di utente: lo studente di giapponese, di lingua italiana, di livello principiante-intermedio, che usa soprattutto il telefono (layout largo al massimo 520 px, interazione touch).

**Fuori ambito (oggi).** Account e login, sincronizzazione tra dispositivi, database lato server, traduzione automatica di frasi, sintesi vocale, significati in italiano (i dizionari sono in inglese), ordine dei tratti guidato.

## 2. Dati e dipendenze

| Dato | Origine dichiarata | Contenuto | Dimensione indicativa |
|---|---|---|---|
| `db` | KanjiVG, KANJIDIC | 6.395 kanji: tratti campionati a 10 punti e metadati (significati, letture on/kun, numero di tratti, livello JLPT, grado scolastico) | ~2,9 MB |
| `jdict` | JMdict | 22.787 letture in hiragana con le scritture possibili (usato per la conversione hiragana → kanji) | ~0,9 MB |
| `jw` | JMdict | 32.009 scritture con lettura, frequenza, significati in inglese e categoria grammaticale | ~2,6 MB |

I dati sono incorporati nel file come blocchi JSON. L'app non effettua richieste di rete: l'unico riferimento esterno è il collegamento a Jisho.org, aperto dall'utente in una nuova scheda.

Il browser salva due chiavi in `localStorage`:

- `fc_v1`: progressi delle flashcard, impostazioni, carte personalizzate;
- `kn_known_v1`: parole segnate come già note nella scheda Leggi.

## 3. Requisiti funzionali

I requisiti hanno identificatori stabili (REQ-…) usati poi dal test book. Per ciascuno è indicato il criterio di accettazione in formato Dato / Quando / Allora.

### 3.1 Scheda Disegna – riconoscimento dei kanji

| ID | Requisito | Criterio di accettazione |
|---|---|---|
| REQ-DIS-01 | L'utente disegna uno o più tratti su una tela quadrata con mouse, dito o penna. Una croce tratteggiata fa da guida; il messaggio iniziale scompare al primo tratto. | **Dato** una tela vuota, **quando** l'utente appoggia il dito e lo muove, **allora** compare il tratto e il messaggio iniziale non è più visibile. |
| REQ-DIS-02 | Dopo ogni tratto (120 ms dopo il rilascio) l'app confronta il disegno con i kanji noti e mostra fino a 14 candidati ordinati per somiglianza. Il primo è selezionato in automatico. | **Dato** un kanji disegnato con il numero di tratti corretto, **quando** l'utente solleva il dito, **allora** compaiono i candidati e il dettaglio del primo. |
| REQ-DIS-03 | I tratti molto corti (sotto il 1% del lato della tela, minimo 2 px) sono ignorati, tranne quando è l'unico tratto. Un tocco senza movimento conta come tratto breve. | **Dato** uno sfioramento involontario accanto al kanji, **quando** il riconoscimento parte, **allora** lo sfioramento non altera i risultati. |
| REQ-DIS-04 | «Annulla tratto» toglie l'ultimo tratto e ricalcola; «Cancella» svuota la tela. Entrambi sono disabilitati senza tratti. Con zero tratti i risultati e il dettaglio spariscono. | **Dato** tre tratti disegnati, **quando** l'utente preme «Annulla tratto», **allora** restano due tratti e i risultati si aggiornano. |
| REQ-DIS-05 | Il dettaglio mostra il kanji grande, i significati (in inglese), le letture on e kun, il numero di tratti, il livello JLPT e il grado scolastico (elementare 1-6, jōyō, uso nei nomi). | **Dato** un kanji selezionato con livello JLPT noto, **allora** compare l'etichetta «JLPT N…». |
| REQ-DIS-06 | «Aggiungi al testo» accoda il kanji al campo di testo composto e svuota la tela. Il campo è modificabile, ha «Copia» e un tasto per cancellare l'ultimo carattere, e un collegamento che cerca il testo su Jisho. | **Dato** un kanji selezionato, **quando** l'utente preme «Aggiungi al testo», **allora** il campo contiene il kanji e la tela è vuota. |
| REQ-DIS-07 | Dal dettaglio l'utente può copiare il kanji, aprirlo su Jisho (nuova scheda con `noopener`) o aggiungerlo come flashcard a «Le mie carte». | **Dato** un kanji selezionato, **quando** preme «+ Flashcard», **allora** la carta compare in «Le mie carte» e un secondo tentativo non crea duplicati. |
| REQ-DIS-08 | Il titolo mostra quanti kanji l'app sa riconoscere. | **Allora** il contatore coincide con il numero di kanji presenti nei dati (6.395 nella versione attuale). |

### 3.2 Scheda Kana

| ID | Requisito | Criterio di accettazione |
|---|---|---|
| REQ-KAN-01 | Le tabelle mostrano suoni base (gojūon), dakuten, handakuten, yōon e suoni stranieri, con il romaji Hepburn sotto ogni kana. | **Dato** la scheda aperta, **allora** compaiono le cinque sezioni con le relative righe. |
| REQ-KAN-02 | Un selettore alterna Hiragana e Katakana; le tabelle e i caratteri si aggiornano. | **Quando** l'utente sceglie Katakana, **allora** ogni cella mostra il carattere katakana corrispondente. |
| REQ-KAN-03 | Toccando un kana lo si aggiunge a un campo di composizione; sotto compare la lettura in romaji; sono disponibili «Copia» e cancellazione dell'ultimo carattere. | **Dato** i kana こ・ん・に・ち・は toccati in ordine, **allora** il romaji mostrato è «konnichiwa». |
| REQ-KAN-04 | Una sezione espandibile spiega dakuten, handakuten, yōon, sokuon, vocali lunghe, ん, particelle e suoni stranieri. | **Allora** la sezione è presente e leggibile. |

### 3.3 Scheda Romaji – conversione

| ID | Requisito | Criterio di accettazione |
|---|---|---|
| REQ-ROM-01 | In modalità Romaji → Kana, mentre l'utente scrive, compaiono in tempo reale la scrittura in hiragana e in katakana. | **Dato** «konnichiwa», **allora** l'hiragana è こんにちは. |
| REQ-ROM-02 | Sono accettate le varianti si/shi, ti/chi, tu/tsu, hu/fu, zi/ji, sya/sha, tya/cha, ja/zya/jya e i piccoli (xa, la, xtu…). | **Dato** «tya», **allora** si ottiene ちゃ. |
| REQ-ROM-03 | La consonante doppia (e «tch») produce っ; ん si ottiene con «n», «nn» o «n'»; le vocali lunghe si ottengono con il macron o con la vocale ripetuta; il segno «-» produce ー. | **Dato** «gakkou», **allora** si ottiene がっこう; **dato** «rāmen», **allora** in katakana si ottiene ラーメン. |
| REQ-ROM-04 | Il testo è convertito anche in kanji e kana misti, tramite segmentazione a costo minimo sul dizionario. Le parole con alternative (omofoni, katakana) sono evidenziate con un tratteggio e l'utente può scegliere un'altra scrittura. Una «wa» o una «e» isolate tra spazi sono lette come particelle は e へ. | **Dato** «watashi wa gakkou de benkyou shimasu», **allora** compare la frase in scrittura mista con le particelle は e で. |
| REQ-ROM-05 | In modalità Kana → Romaji, l'input in hiragana o katakana è reso in romaji Hepburn, con macron per le vocali lunghe in katakana, raddoppio per っ e «n'» davanti a vocale. | **Dato** «ラーメン», **allora** il romaji è «rāmen». |
| REQ-ROM-06 | Sono disponibili esempi rapidi cliccabili e «Copia» per ogni risultato. | **Quando** l'utente tocca un esempio, **allora** il campo si riempie e i risultati si aggiornano. |

### 3.4 Scheda Leggi – lettore di testi

| ID | Requisito | Criterio di accettazione |
|---|---|---|
| REQ-LEG-01 | L'utente incolla un testo giapponese (anche su più righe) e l'app lo divide in parole in tempo reale, distinguendo parole, katakana, kanji non riconosciuti, sequenze di hiragana non riconosciute e punteggiatura. | **Dato** una frase con particelle e kanji, **allora** ogni parola è un elemento selezionabile. |
| REQ-LEG-02 | Sopra i kanji compare il furigana, allineato ai singoli caratteri. Tre modalità: tutti, solo le parole nuove, nessuno. Un'opzione aggiunge il romaji sotto ogni parola. | **Dato** la modalità «Solo nuove», **quando** una parola è segnata come nota, **allora** perde il furigana. |
| REQ-LEG-03 | Toccando una parola si apre un pannello con lettura, romaji, categoria grammaticale, significati in inglese, alternative selezionabili, dati dei singoli kanji e, per le forme flesse, la forma base con l'etichetta della coniugazione. | **Dato** «食べました», **allora** il pannello indica la forma base 食べる e «forma cortese passata». |
| REQ-LEG-04 | Per circa 120 particelle e forme grammaticali comuni il pannello mostra una nota in italiano. | **Dato** «は» come particella, **allora** la nota spiega che si legge «wa». |
| REQ-LEG-05 | «La conosco già» segna la parola come nota, la attenua e la salva nel browser (`kn_known_v1`). La scelta si annulla toccando di nuovo. | **Dato** una parola segnata, **quando** la pagina viene ricaricata, **allora** la parola risulta ancora nota. |
| REQ-LEG-06 | Il glossario elenca le parole del testo (senza particelle e forme grammaticali), ognuna con una casella «conosco», e mostra il conteggio totale e delle nuove. Si può copiare in formato testo tabulato, aggiungere le nuove alle flashcard o azzerare le parole note. | **Dato** un testo con N parole non note, **quando** l'utente preme «Aggiungi le nuove alle flashcard», **allora** il messaggio indica quante carte sono state create. |
| REQ-LEG-07 | Sono disponibili un pulsante «Esempio», che precompila una frase, e «Pulisci». | **Quando** l'utente preme «Pulisci», **allora** testo e analisi spariscono. |

### 3.5 Scheda Carte – flashcard a ripetizione dilazionata

| ID | Requisito | Criterio di accettazione |
|---|---|---|
| REQ-CAR-01 | Mazzi predefiniti: Hiragana, Katakana, Kanji N5-N1, Vocabolario N5-N2, Le mie carte. Ogni mazzo mostra le carte nuove, in apprendimento e da ripassare, e il pulsante «Studia», «Fatto» o «Vuoto». | **Dato** un mazzo senza progressi, **allora** le nuove carte mostrate non superano il limite giornaliero. |
| REQ-CAR-02 | Lo studio mostra il fronte; «Mostra risposta» rivela il retro; quattro pulsanti (Ancora, Difficile, Bene, Facile) indicano l'intervallo successivo. Scorciatoie: spazio o Invio per mostrare e dare «Bene», tasti 1-4 per valutare. | **Dato** una carta mostrata, **quando** si preme 3, **allora** si registra «Bene» e compare la carta successiva. |
| REQ-CAR-03 | Il pianificatore usa passi di apprendimento di 1 e 10 minuti, primo intervallo di 1 giorno (4 giorni con «Facile»), fattore di facilità iniziale 2,5 con minimo 1,3, e gestisce i lapsus (intervallo dimezzato, ritorno all'apprendimento). | **Dato** una carta nuova, **quando** si risponde «Ancora», **allora** torna tra 1 minuto. |
| REQ-CAR-04 | Il numero di carte nuove al giorno per mazzo è configurabile (da 0 a 200, predefinito 10) e il conteggio si azzera al cambio di giorno. | **Dato** limite 10, **quando** si studiano 10 carte nuove, **allora** l'11ª non viene proposta fino al giorno dopo. |
| REQ-CAR-05 | «Annulla» ripristina lo stato della sola ultima risposta. | **Dato** una risposta appena data, **quando** si preme annulla, **allora** la carta torna come prima. |
| REQ-CAR-06 | Per i mazzi di kana, un'opzione inverte la carta: davanti il romaji, da indovinare il kana. | **Quando** l'opzione è attiva, **allora** il fronte mostra il romaji. |
| REQ-CAR-07 | Si possono creare carte a mano (fronte e retro) e aggiungere carte da Disegna e da Leggi. Non sono ammessi duplicati. | **Dato** una carta già presente, **quando** si tenta di aggiungerla di nuovo, **allora** compare «Già nelle carte». |
| REQ-CAR-08 | I progressi sono salvati nel browser (`fc_v1`). Se il salvataggio non è possibile, compare un avviso. | **Dato** uno storage non disponibile, **allora** è visibile l'avviso di mancato salvataggio. |
| REQ-CAR-09 | Il backup è un testo (JSON codificato in Base64) che si copia e si ripristina incollandolo. «Azzera tutti i progressi» richiede una seconda pressione entro 3 secondi. | **Dato** un backup valido, **quando** si ripristina, **allora** i progressi tornano allo stato salvato. |

### 3.6 Requisiti trasversali

| ID | Requisito |
|---|---|
| REQ-TRA-01 | Cinque schede (Disegna, Kana, Romaji, Leggi, Carte) con navigazione tramite pulsanti e indirizzo (`#disegna`, `#kana`, …). |
| REQ-TRA-02 | Funzionamento offline: dati incorporati, nessuna richiesta di rete oltre ai collegamenti a Jisho. |
| REQ-TRA-03 | Tema chiaro o scuro automatico, secondo la preferenza del sistema. |
| REQ-TRA-04 | Interfaccia adatta al telefono, con interazione touch e puntatore su tela (`touch-action: none`). |
| REQ-TRA-05 | Interfaccia in italiano; significati dei dizionari in inglese. |
| REQ-TRA-06 | Un modo semplice per copiare risultati negli appunti, con messaggio alternativo se la clipboard non è disponibile. |

## 4. Requisiti non funzionali (stato attuale e obiettivi da definire)

| ID | Area | Stato attuale | Da definire |
|---|---|---|---|
| NFR-01 | Privacy | Nessun dato lascia il dispositivo; i progressi restano nel browser. | Informativa se si introduce il login Google. |
| NFR-02 | Prestazioni | Il riconoscimento usa due passate (4 punti poi 10 punti) e rivaluta al massimo 250 candidati. L'avvio decodifica i dati dei kanji; gli altri due blocchi JSON sono letti alla prima necessità. | Soglie misurabili: tempo di riconoscimento e tempo di primo caricamento su un telefono di fascia media. |
| NFR-03 | Dimensione | 6,4 MB in un unico file. | Obiettivo di peso e strategia di caricamento (file separati, compressione, cache). |
| NFR-04 | Compatibilità | Richiede Pointer Events; usa `getCoalescedEvents` e la clipboard con alternativa. | Browser e versioni supportati. |
| NFR-05 | Accessibilità | Non verificata. La tela non ha alternativa testuale e le schede non usano ruoli ARIA. | Obiettivo (per esempio WCAG 2.2 AA) e test con axe. |
| NFR-06 | Font | Dipende dai font giapponesi del sistema (Hiragino, Noto, Yu Gothic, Meiryo). | Comportamento su sistemi senza font giapponese. |
| NFR-07 | Licenze | Crediti presenti nelle note dell'app. | Pagina dei crediti completa e licenza del progetto (vedi osservazione OSS-06). |

## 5. Osservazioni emerse dalla lettura del codice

Non sono errori accertati: sono punti da verificare nel test book.

| ID | Osservazione | Perché conta |
|---|---|---|
| OSS-01 | I progressi sono legati al browser e al dominio: cambiare indirizzo li azzera. | Rilevante per la pubblicazione e per una futura sincronizzazione. |
| OSS-02 | Il backup usa le funzioni `escape` e `unescape` (deprecate). Il ripristino sovrascrive i dati attuali senza conferma e senza validare la struttura oltre al formato JSON. | Rischio di perdita di dati con un backup errato. |
| OSS-03 | Nel convertitore romaji compaiono intervalli di caratteri che nel testo risultano vuoti, probabilmente caratteri Unicode a uso privato per marcare le vocali lunghe. | Servono test mirati sulle vocali lunghe (ou, oo, macron). |
| OSS-04 | Se non c'è altro da fare, il pianificatore propone una carta in apprendimento non ancora scaduta. | Da confermare come comportamento voluto. |
| OSS-05 | I testi inseriti dall'utente sono mostrati con `textContent`, quindi il rischio di XSS appare basso, ma non c'è una Content-Security-Policy. | Da verificare con analisi statica; mitigabile con una CSP. |
| OSS-06 | Dati e licenze: KanjiVG è CC BY-SA 3.0; KANJIDIC e JMdict sono dell'EDRDG, che richiede attribuzione. Il file incorpora questi dati. | Prima di pubblicare servono crediti visibili e una scelta consapevole della licenza del progetto. |
| OSS-07 | L'esempio della scheda Leggi sembra una frase tratta da un'opera protetta. | Meglio sostituirla con una frase originale o di pubblico dominio. |
| OSS-08 | Il riconoscimento tollera tratti storti ma dipende dal numero di tratti. | Limite noto, già dichiarato nell'app; va misurata l'accuratezza. |
| OSS-09 | Un solo file con dati e codice rende difficili test e revisione. | Candidato a un refactoring: separare dati, logica pura (riconoscimento, romaji, pianificatore) e interfaccia. |

## 6. Prossimi passi

1. **Revisione** di questa analisi da parte dell'autore: conferma o correzione dei requisiti.
2. **Analisi tecnica** (architettura, modello dati, contratto API, strategia di sincronizzazione, sicurezza).
3. **Test book** con casi TC-… collegati a ciascun REQ, matrice di tracciabilità, esecuzione statica sul codice e poi Playwright.
4. **Decisioni** da registrare come ADR: stack di destinazione, hosting, autenticazione.
