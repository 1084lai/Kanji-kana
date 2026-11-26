# Test book

| | |
|---|---|
| **Versione** | 0.1 (bozza) |
| **Data** | 26 novembre 2026 |
| **Stato** | Da approvare dall'autore; esecuzione statica di partenza eseguita in parte (vedi [rapporto](esecuzione-statica-baseline.md)) |
| **Si basa su** | [Analisi funzionale](analisi-funzionale.md) (REQ-DIS, KAN, ROM, LEG, CAR, TRA, NFR) e [Analisi tecnica](analisi-tecnica.md) (requisiti nuovi della sezione 2) |

## 1. Strategia

Ogni caso di test (TC) è collegato a un requisito (REQ). Un requisito senza almeno un TC non è accettabile.

I TC si eseguono in tre momenti, dal meno al più costoso:

| Livello | Sigla | Cosa si fa | Quando |
|---|---|---|---|
| **Esecuzione statica** | S | Si legge il codice e si dimostra, indicando funzione e riga, che il comportamento atteso segue dal codice. Si cercano anche difetti, senza lanciare l'app. | Prima di toccare il codice (baseline) e dopo ogni modifica |
| **Test automatici sulla logica** | U | Test su funzioni pure (conversione romaji-kana, segmentazione, flessione, pianificatore, riconoscitore) | Dopo la separazione di dati e codice (ADR-0001) |
| **Test nel browser** | E | Playwright su Chromium, Firefox e WebKit, con viewport da telefono e da computer | In CI a ogni pull request |
| **Prova manuale** | M | Prova su telefono reale, tocco e font giapponesi, login Google vero | Prima di ogni rilascio |
| **Sicurezza e qualità** | Q | Analisi statica (ESLint, Semgrep), `npm audit`, ricerca di segreti (gitleaks), controllo accessibilità (axe) | In CI a ogni pull request |

**Il login Google reale non si automatizza.** In CI si usa un utente di prova nell'ambiente di prova (Supabase di test) oppure si simula la sessione; il flusso reale si prova a mano (M).

### Priorità

- **P1:** se fallisce, non si rilascia (perdita di dati, sicurezza, funzione principale).
- **P2:** va corretto prima del rilascio, salvo deroga scritta.
- **P3:** può restare come difetto noto.

### Stati

*Da eseguire · Superato · Fallito · Bloccato · Non applicabile.*

### Criteri

- **Ingresso:** requisiti approvati; ambiente descritto; dati di prova pronti.
- **Uscita per il rilascio:** tutti i P1 superati; nessun difetto P1 o P2 aperto; difetti P3 elencati; i test E passano su tre browser.

### Dati di prova

| Codice | Contenuto |
|---|---|
| D1 | Frase «watashi wa gakkou de benkyou shimasu» |
| D2 | Parole: «konnichiwa», «tya», «gakkou», «rāmen», «ラーメン» |
| D3 | Testo con particelle e kanji: 私は学校で勉強します。 |
| D4 | Forma flessa 食べました |
| D5 | Backup valido; backup con JSON alterato; backup di una versione di schema futura |
| D6 | Due utenti di prova A e B nell'ambiente di prova Supabase |
| D7 | Kanji di prova con numero di tratti noto (per esempio 日, 山, 水) |

## 2. Requisiti nuovi per la versione 1.0

Questi requisiti nascono dall'analisi tecnica e dalle decisioni ADR-0001…0004. Vanno aggiunti all'analisi funzionale alla prossima revisione.

| ID | Requisito |
|---|---|
| REQ-ACC-01 | Il login è facoltativo: senza login l'app offre tutte le funzioni di studio e salva i progressi nel dispositivo. |
| REQ-ACC-02 | L'utente può accedere con Google e uscire; dopo l'accesso compare lo stato di sincronizzazione. |
| REQ-ACC-03 | La sessione persiste dopo il ricaricamento; un errore o un annullamento del login non blocca l'app e mostra un messaggio chiaro. |
| REQ-SYN-01 | Al primo accesso, i progressi locali e quelli in cloud sono uniti per singola carta: vince la modifica più recente (`updated_at`). Nessuna carta viene persa. |
| REQ-SYN-02 | Le modifiche fatte offline sono inviate al ritorno della connessione. |
| REQ-SYN-03 | Un backup è validato prima del ripristino: un formato non valido o di versione futura è rifiutato con un messaggio e senza toccare i progressi esistenti. |
| REQ-SEC-01 | Un utente autenticato legge e scrive solo la propria riga; un utente non autenticato non accede a nulla. |
| REQ-SEC-02 | Nel repository e nei file pubblicati non compaiono segreti né la chiave `service_role`. |
| REQ-SEC-03 | Esiste una Content-Security-Policy; nessun dato esterno è inserito con `innerHTML`. |
| REQ-PRI-01 | Informativa privacy e cookie raggiungibili dall'app; nessuno script pubblicitario o di analisi con cookie parte prima del consenso. |
| REQ-PRI-02 | L'utente può cancellare account e dati cloud; i dati locali restano sotto il suo controllo. |
| REQ-CRE-01 | Una scheda «Crediti» elenca KanjiVG, KANJIDIC, JMdict (EDRDG) con autori, licenza e link; la licenza del codice è indicata. |
| REQ-I18N-01 | L'interfaccia è disponibile in italiano e inglese; la lingua iniziale segue il browser, è modificabile e viene ricordata. |
| REQ-I18N-02 | Nessun testo dell'interfaccia è scritto nel codice: tutto viene dai file di lingua. |
| REQ-OFF-01 | Dopo il primo caricamento l'app funziona senza rete (service worker e cache dei dati). |

## 3. Casi di test

### 3.1 Disegna

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-DIS-01 | REQ-DIS-01 | P1 | S, E | Tela vuota; disegna un tratto con puntatore | Compare il tratto; il messaggio iniziale scompare | Superato (S, E) |
| TC-DIS-02 | REQ-DIS-02 | P1 | S, E | Disegna D7 (日) con tratti corretti; solleva il dito | Entro 120 ms dal rilascio partono i risultati; fino a 14 candidati; il primo è selezionato; 日 compare tra i primi | Superato (S, E, U) |
| TC-DIS-03 | REQ-DIS-03 | P2 | S, U | Disegna 山, poi uno sfioramento sotto l'1% del lato | Lo sfioramento è ignorato; risultati invariati | Superato (S, U) |
| TC-DIS-04 | REQ-DIS-03 | P3 | S, U | Un solo tocco senza movimento su tela vuota | Conta come unico tratto, nessun errore | S: Superato; resto da eseguire |
| TC-DIS-05 | REQ-DIS-04 | P1 | S, E | Tre tratti → «Annulla tratto» | Restano due tratti; risultati ricalcolati | S: Superato; E: parziale (annulla fino a zero tratti) |
| TC-DIS-06 | REQ-DIS-04 | P2 | S, E | Con zero tratti | «Annulla tratto» e «Cancella» disabilitati; risultati e dettaglio assenti | Superato (S, E) |
| TC-DIS-07 | REQ-DIS-05 | P2 | S, E | Seleziona un kanji con JLPT noto | Dettaglio con significati, on/kun, tratti, «JLPT N…», grado scolastico | S: Superato; resto da eseguire |
| TC-DIS-08 | REQ-DIS-06 | P2 | S, E | «Aggiungi al testo» | Il kanji è nel campo; la tela è vuota; «Copia» e cancellazione ultimo carattere funzionano; il link Jisho cerca il testo | S: Superato; resto da eseguire |
| TC-DIS-09 | REQ-DIS-07 | P1 | S, E | «+ Flashcard» due volte sullo stesso kanji | Una sola carta in «Le mie carte»; link Jisho in nuova scheda con `noopener` | S: Superato; resto da eseguire |
| TC-DIS-10 | REQ-DIS-08 | P3 | S, E | Apri la scheda | Il contatore nel titolo è uguale al numero di kanji nei dati (6.395) | Superato (S, E) |

### 3.2 Kana

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-KAN-01 | REQ-KAN-01 | P2 | S, E | Apri la scheda Kana | Cinque sezioni (gojūon, dakuten, handakuten, yōon, suoni stranieri), con romaji Hepburn sotto ogni kana | S: Superato; resto da eseguire |
| TC-KAN-02 | REQ-KAN-02 | P2 | S, E | Scegli Katakana | Ogni cella mostra il katakana corrispondente | S: Superato; resto da eseguire |
| TC-KAN-03 | REQ-KAN-03 | P1 | S, U, E | Tocca こ・ん・に・ち・は | Romaji mostrato «konnichiwa»; «Copia» e cancella ultimo funzionano | Superato (S, U, E); DEF-01 chiuso |
| TC-KAN-04 | REQ-KAN-04 | P3 | S, E | Apri la sezione di spiegazione | Presente e leggibile | S: Superato; resto da eseguire |

### 3.3 Romaji

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-ROM-01 | REQ-ROM-01 | P1 | S, U, E | Scrivi «konnichiwa» in modalità Romaji → Kana | Hiragana こんにちは, aggiornato mentre si scrive; katakana in parallelo | Superato (S, U, E); DEF-01 chiuso |
| TC-ROM-02 | REQ-ROM-02 | P2 | S, U | «tya», «si», «shi», «tu», «hu», «zi», «sya», «xtu» | ちゃ, し, し, つ, ふ, じ, しゃ, っ | Superato (S, U) |
| TC-ROM-03 | REQ-ROM-03 | P1 | S, U | «gakkou», «rāmen» (katakana), «nn», «n'», «-» | がっこう; ラーメン; ん; ん; ー | Superato (S, U); DEF-02 chiuso |
| TC-ROM-04 | REQ-ROM-04 | P1 | S, U, E | D1 | Frase in scrittura mista, particelle は e で, parole con alternative evidenziate e scelta di un'altra scrittura | Superato (S, U, E) |
| TC-ROM-05 | REQ-ROM-05 | P1 | S, U | «ラーメン» in modalità Kana → Romaji | «rāmen»; っ raddoppia; «n'» davanti a vocale | Superato (S, U) |
| TC-ROM-06 | REQ-ROM-06 | P3 | S, E | Tocca un esempio rapido e «Copia» | Campo riempito, risultati aggiornati, testo copiato | Da eseguire |

### 3.4 Leggi

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-LEG-01 | REQ-LEG-01 | P1 | S, U, E | Incolla D3 su più righe | Ogni parola è un elemento selezionabile; categorie (parole, katakana, kanji ignoti, hiragana ignoto, punteggiatura) distinte | Superato (S, U, E) |
| TC-LEG-02 | REQ-LEG-02 | P1 | S, E | Modalità «Tutti», «Solo nuove», «Nessuno»; opzione romaji | Furigana allineato ai caratteri; in «Solo nuove» una parola nota perde il furigana; romaji sotto ogni parola | Da eseguire |
| TC-LEG-03 | REQ-LEG-03 | P1 | S, U, E | Tocca D4 (食べました) | Pannello con lettura, romaji, categoria, significati, forma base 食べる e «forma cortese passata» | Superato (S, U, E) |
| TC-LEG-04 | REQ-LEG-04 | P3 | S, E | Tocca «は» come particella | Nota in italiano che spiega la lettura «wa» | S: Superato; resto da eseguire |
| TC-LEG-05 | REQ-LEG-05 | P1 | S, E | «La conosco già» su una parola; ricarica; tocca di nuovo | Dopo il ricaricamento resta nota; tocco di nuovo la annulla; salvata in `kn_known_v1` | Da eseguire |
| TC-LEG-06 | REQ-LEG-06 | P2 | S, E | Glossario di un testo con N parole non note; «Aggiungi le nuove alle flashcard» | Messaggio col numero di carte create; conteggi corretti; copia tabulata; azzeramento delle note | Da eseguire |
| TC-LEG-07 | REQ-LEG-07 | P3 | S, E | «Esempio», «Pulisci» | Frase precompilata; testo e analisi spariscono | Superato (S, E); DEF-14 chiuso |

### 3.5 Carte

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-CAR-01 | REQ-CAR-01 | P1 | S, E | Apri le carte senza progressi | Mazzi predefiniti con conteggi nuove/apprendimento/ripasso; nuove ≤ limite giornaliero; stato «Studia/Fatto/Vuoto» | S: Superato; resto da eseguire |
| TC-CAR-02 | REQ-CAR-02 | P1 | S, E | Mostra risposta; tasto 3; Spazio/Invio | Rivelazione, «Bene», carta successiva; intervalli sui quattro pulsanti | S: Superato; resto da eseguire |
| TC-CAR-03 | REQ-CAR-03 | P1 | S, U | Carta nuova: «Ancora»; poi sequenze «Bene» e «Facile»; lapsus | «Ancora» → 1 min; passi 1 e 10 min; primo intervallo 1 giorno (4 con «Facile»); EF iniziale 2,5, minimo 1,3; lapsus dimezza l'intervallo | Superato (S, U) |
| TC-CAR-04 | REQ-CAR-04 | P2 | S, U, E | Limite 10; studia 10 nuove; cambia giorno | L'11ª non è proposta; il giorno dopo il conteggio si azzera; valori ammessi 0-200 | S: Superato; resto da eseguire |
| TC-CAR-05 | REQ-CAR-05 | P2 | S, U, E | Rispondi e premi annulla | Stato della carta ripristinato com'era | Superato (S, U, E); DEF-07 chiuso |
| TC-CAR-06 | REQ-CAR-06 | P3 | S, E | Opzione inverti su un mazzo di kana | Fronte con romaji | Superato (S, U); DEF-08 chiuso |
| TC-CAR-07 | REQ-CAR-07 | P2 | S, E | Carta manuale; da Disegna e Leggi; duplicato | Carte create; al duplicato compare «Già nelle carte» | Superato (S, E); DEF-05 e DEF-06 chiusi |
| TC-CAR-08 | REQ-CAR-08 | P1 | S, E | Progressi dopo ricaricamento; storage non disponibile | Progressi in `fc_v1` ricaricati; con storage bloccato compare l'avviso | Superato (S, E) |
| TC-CAR-09 | REQ-CAR-09 | P1 | S, E | Esporta e ripristina un backup valido; «Azzera» una volta e due volte entro 3 secondi | Progressi tornati allo stato salvato; con una sola pressione non si azzera; con la seconda entro 3 secondi sì | S: Superato; resto da eseguire |

### 3.6 Trasversali e non funzionali

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-TRA-01 | REQ-TRA-01 | P2 | S, E | Cambia scheda con pulsanti e con `#disegna`, `#kana`… | Le cinque schede si aprono; l'indirizzo è coerente; il ricaricamento riapre la scheda | Superato (S, E); DEF-10 chiuso |
| TC-TRA-02 | REQ-TRA-02 | P1 | S, E | Controlla le richieste di rete in uso normale | Nessuna richiesta oltre ai link a Jisho (nella versione 1.0: solo quelle attese, vedi TC-ACC e TC-PRI) | Superato (S, E) |
| TC-TRA-03 | REQ-TRA-03 | P3 | E | Emula tema chiaro e scuro | Colori coerenti e leggibili in entrambi | S: Superato; resto da eseguire |
| TC-TRA-04 | REQ-TRA-04 | P1 | E, M | Viewport da telefono; tocco e penna sulla tela | Layout usabile; la pagina non scorre durante il disegno (`touch-action: none`) | S: Superato; resto da eseguire |
| TC-TRA-05 | REQ-TRA-05 | P3 | S | Cerca testi in italiano e significati in inglese | Interfaccia in italiano; dizionari in inglese | S: Superato; resto da eseguire |
| TC-TRA-06 | REQ-TRA-06 | P3 | E | «Copia» con clipboard disponibile e bloccata | Testo copiato oppure messaggio alternativo | S: Superato; resto da eseguire |
| TC-NFR-01 | NFR-01 | P1 | S, E | Con login disattivato, controlla ciò che esce dal dispositivo | Nessun dato personale esce; con login solo l'account e la tabella `progress` | Superato (S, E) |
| TC-NFR-02 | NFR-02 | P2 | E, M | Misura riconoscimento e primo caricamento su telefono di fascia media | Soglie da fissare dopo la prima misura (obiettivo iniziale: da definire) | Da eseguire |
| TC-NFR-03 | NFR-03 | P2 | Q | Misura il peso trasferito al primo caricamento | Obiettivo da fissare dopo la separazione dei dati | Da eseguire |
| TC-NFR-04 | NFR-04 | P2 | E | Chromium, Firefox, WebKit | Le funzioni principali funzionano nei tre | Da eseguire |
| TC-NFR-05 | NFR-05 | P2 | Q | Scansione axe sulle cinque schede | Nessuna violazione critica; obiettivo WCAG 2.2 AA da confermare | Da eseguire |
| TC-NFR-06 | NFR-06 | P3 | M | Sistema senza font giapponesi | Comportamento documentato; nessuna schermata illeggibile senza avviso | Da eseguire |
| TC-NFR-07 | NFR-07 | P1 | S, E | Apri la scheda Crediti | Vedi TC-CRE | Superato (S, E) |

### 3.7 Account, sincronizzazione, sicurezza, privacy, crediti, lingue, offline

| TC | REQ | Pri | Liv. | Passi | Esito atteso | Stato |
|---|---|---|---|---|---|---|
| TC-ACC-01 | REQ-ACC-01 | P1 | E | Usa tutte le schede senza accedere | Tutto funziona; progressi salvati in locale | Da eseguire |
| TC-ACC-02 | REQ-ACC-02 | P1 | M | «Accedi con Google» con account reale; poi esci | Accesso riuscito, stato di sincronizzazione visibile; dopo l'uscita l'app torna in modalità locale | Da eseguire |
| TC-ACC-03 | REQ-ACC-03 | P2 | E, M | Ricarica dopo il login; annulla il login a metà; blocca la rete durante il login | Sessione mantenuta; in caso di annullamento o errore, messaggio chiaro e app usabile | Da eseguire |
| TC-SYN-01 | REQ-SYN-01 | P1 | E | Utente A con 5 carte locali e 8 in cloud, con 3 in comune | Dopo il primo accesso le carte sono l'unione; per le 3 in comune vince `updated_at` più recente; nessuna perdita | Da eseguire |
| TC-SYN-02 | REQ-SYN-02 | P1 | E | Offline, studia 5 carte; torna online | Le modifiche arrivano nel cloud e si ritrovano da un altro dispositivo | Da eseguire |
| TC-SYN-03 | REQ-SYN-03 | P1 | U, E | D5: backup valido, alterato, di versione futura | Il valido si ripristina; gli altri sono rifiutati con messaggio e i progressi non cambiano | Superato (U, E); DEF-04 chiuso |
| TC-SEC-01 | REQ-SEC-01 | P1 | E | D6: A scrive la sua riga; B tenta di leggere, modificare e cancellare la riga di A; utente anonimo tenta tutte le operazioni | B e anonimo: nessun dato letto né modificato (0 righe o errore) | Da eseguire |
| TC-SEC-02 | REQ-SEC-02 | P1 | Q | gitleaks sul repository e sui file pubblicati; ricerca di `service_role` | Nessun segreto; nessuna chiave `service_role` | Da eseguire |
| TC-SEC-03 | REQ-SEC-03 | P2 | S, Q | Semgrep sull'uso di `innerHTML`; verifica dell'intestazione CSP | Nessun inserimento di dati esterni con `innerHTML`; CSP presente e senza `unsafe-inline` per gli script (dopo la separazione) | CSP presente e verificata (E); Semgrep in CI da eseguire; DEF-11 chiuso |
| TC-PRI-01 | REQ-PRI-01 | P1 | E | Primo avvio senza consenso; controlla le richieste di rete | Nessuno script pubblicitario o di analisi con cookie; informativa e cookie policy raggiungibili; con consenso negato nulla parte | Da eseguire |
| TC-PRI-02 | REQ-PRI-02 | P1 | E, M | Utente di prova: «Cancella account e dati» | Riga in `progress` e utente rimossi; i dati locali restano finché l'utente non li azzera | Da eseguire |
| TC-CRE-01 | REQ-CRE-01 | P1 | S, E | Apri «Crediti» | KanjiVG, KANJIDIC, JMdict con autori, licenze (CC BY-SA) e link; licenza del codice (MIT) | Superato (S, E) |
| TC-I18N-01 | REQ-I18N-01 | P1 | E | Browser in italiano, poi in inglese, poi cambio manuale; ricarica | Lingua iniziale dal browser; cambio immediato; scelta ricordata | Da eseguire |
| TC-I18N-02 | REQ-I18N-02 | P2 | S, Q | Cerca stringhe di interfaccia nel codice | Nessuna stringa visibile all'utente fuori dai file di lingua; ogni chiave presente in entrambe le lingue | Da eseguire |
| TC-OFF-01 | REQ-OFF-01 | P1 | E, M | Primo caricamento; spegni la rete; ricarica e usa Disegna, Leggi e Carte | L'app si carica e funziona offline | E: Superato; M da eseguire |

## 4. Verifica statica di partenza (baseline)

Prima di modificare il codice si eseguono **tutti i TC con livello S** sull'app attuale (`index.html`, righe 251-1388). Per ogni TC si annotano funzione, riga e conclusione. I difetti trovati diventano voci in un registro (sezione 5), con priorità e collegamento al TC e alla osservazione OSS corrispondente.

## 5. Registro dei difetti

| ID | TC | Descrizione | Pri | Stato |
|---|---|---|---|---|
| DEF-01 | TC-ROM-01, TC-KAN-03 | «konnichiwa» dà こんにちわ e こんにちは dà «konnichiha»: l'app traslittera senza riconoscere la lettura particolare di は in questa parola. I criteri dell'analisi funzionale chiedono こんにちは e «konnichiwa». | P2 | Chiuso il 26 novembre 2026: eccezioni per こんにちは e こんばんは, con test |
| DEF-02 | TC-ROM-03 | «nn» produce due ん; il requisito dice che «nn» dà ん. Esempio: «kannji» → かんんじ (atteso かんじ). | P2 | Chiuso il 26 novembre 2026: «nn» = ん se non segue vocale o y, con test |
| DEF-03 | TC-ROM-04 | «kanji» in scrittura mista dà 幹事 invece di 漢字: la classifica del dizionario non favorisce la parola più comune. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-04 | TC-SYN-03 | Il ripristino del backup e il caricamento da `localStorage` non validano la struttura dei dati (OSS-02); un salvataggio corrotto mostra l'avviso «salvataggio non possibile», che è il messaggio sbagliato, e il salvataggio successivo lo sovrascrive. | P2 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-05 | TC-DIS-09 | In Disegna «+ Flashcard» mostra «Aggiunta ✓» anche se la carta esiste già (il messaggio «Già nelle carte» c'è solo in Leggi). | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-06 | TC-CAR-07 | Le carte manuali hanno un id con `Date.now()`: i duplicati sono ammessi, contro il requisito. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-07 | TC-CAR-05 | L'annullamento resta attivo uscendo dal mazzo: in un altro mazzo mostra «Hai finito per ora» anche se ci sono carte. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-08 | TC-CAR-06 | Carte inverse ambigue: じ/ぢ (ji) e ず/づ (zu) hanno lo stesso fronte. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-09 | TC-DIS-01, TC-TRA-04 | La tela non filtra per `pointerId` (tocchi multipli, palmo) e i tratti non sono riscalati se la finestra cambia dimensione o si ruota il telefono. Da confermare con Playwright. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-10 | TC-TRA-01 | Il tab si legge dall'indirizzo solo al caricamento; manca l'ascolto di `hashchange` (il tasto Indietro non cambia scheda). | P3 | Chiuso il 26 novembre 2026: ascolto di `hashchange`, con test |
| DEF-11 | TC-SEC-03 | Nessuna Content-Security-Policy. Atteso per la versione attuale; da risolvere dopo la separazione dei file. | P2 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-12 | TC-LEG-05 | `saveKnown` ignora in silenzio gli errori di salvataggio (a differenza dei progressi delle carte). | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-13 | TC-ROM-01 | I segnaposto dei macron sono caratteri invisibili dell'area privata (U+E001-E005); è voluto (OSS-03), ma fragile per la manutenzione. | P3 | Chiuso il 26 novembre 2026: corretto, con test |
| DEF-14 | TC-LEG-07 | La frase d'esempio di «Esempio» proviene con ogni probabilità da un'opera protetta (OSS-07, BKL-04). | P1 per il rilascio | Chiuso il 26 novembre 2026: frase originale, con test |
| DEF-15 | — | Codice morto: `maxLen` inutilizzato in `prepare`, condizione `!true` in `renderDecks`. | P3 | Chiuso il 26 novembre 2026: corretto, con test |

## 6. Tracciabilità

Ogni REQ dell'analisi funzionale e della sezione 2 compare almeno una volta nella colonna «REQ» delle tabelle della sezione 3. Il controllo è automatico (script nel repository) e fa parte della CI.
