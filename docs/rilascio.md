# Guida alla fase di rilascio

Questa guida spiega, passo per passo e con parole semplici, cosa succede dal codice sul tuo computer all'app usata da una persona sconosciuta. È una bozza da usare mentre si impara; si aggiorna dopo il primo rilascio vero.

## L'idea in una frase

Rilasciare significa far arrivare **una versione precisa e controllata** del codice in un posto raggiungibile da tutti, in modo ripetibile e con la possibilità di tornare indietro.

## 1. Le tre parti coinvolte

| Parte | Cosa fa | Esempio per noi |
|---|---|---|
| **Repository** | Conserva il codice e la sua storia | GitHub, ramo `main` |
| **Server o hosting** | Mette i file a disposizione degli utenti | Cloudflare |
| **Servizi** | Dati e login | Supabase, Google |

## 2. Il percorso del codice

1. **Sviluppo:** si lavora su un ramo separato, mai direttamente su `main`.
2. **Pull request:** si chiede di unire il ramo a `main`. Qui partono i controlli automatici.
3. **Integrazione continua (CI):** GitHub Actions esegue in automatico controllo del codice, ricerca di segreti, audit delle dipendenze, build e test. Se uno fallisce, non si procede.
4. **Anteprima:** Cloudflare pubblica la modifica su un indirizzo temporaneo, così la provi come un utente vero prima di unirla.
5. **Merge su `main`:** il codice approvato entra nella versione ufficiale.
6. **Consegna continua (CD):** da `main` parte il rilascio automatico in produzione.
7. **Verifica dopo il rilascio (smoke test):** si apre l'app pubblica e si controlla il minimo (si carica, disegna un kanji, funziona il login).
8. **Monitoraggio:** si guardano errori e statistiche nei giorni successivi.

## 3. Cosa si prepara prima del primo rilascio (una tantum)

- **Account:** GitHub (già fatto), Cloudflare, Supabase, console Google per il login. **Li crei tu**, con la tua e-mail e l'autenticazione a due fattori.
- **Dominio:** lo compri e lo colleghi a Cloudflare (circa 10-15 € l'anno, da verificare).
- **Segreti:** chiavi e credenziali non vanno mai nel codice. Si inseriscono nelle impostazioni di Cloudflare e di GitHub come variabili.
- **Due ambienti Supabase:** prova e produzione.
- **Pagine legali:** informativa sulla privacy, cookie policy, Crediti con le licenze dei dati.

## 4. Il database e le sue modifiche

Quando cambia la struttura del database, la modifica si scrive in un file di **migrazione** nel repository, la si prova nell'ambiente di prova e poi la si applica in produzione. Mai a mano sul database vero. Così ogni modifica è tracciata e ripetibile.

## 5. Versioni e ritorno indietro (rollback)

- Ogni rilascio ha un **numero di versione** (per esempio 0.1.0) e una nota delle modifiche.
- Se qualcosa va storto, si **torna alla versione precedente** (Cloudflare conserva i rilasci passati) e poi si corregge con calma.
- Le modifiche al database sono più delicate: per questo si fanno piccole e compatibili con la versione precedente.

## 6. Cosa può andare storto (e come prevenirlo)

| Problema | Prevenzione |
|---|---|
| Un errore arriva in produzione | Test e anteprima prima del merge; rollback veloce |
| Segreto pubblicato per errore | Controllo gitleaks in CI; in caso di fuga, si cambia subito la chiave |
| Supabase gratuito in pausa | L'app funziona anche senza; controllo periodico; piano Pro se serve |
| Il login con Google smette di funzionare | Test periodico a mano; l'app resta usabile senza login |
| L'utente perde i progressi | Salvataggio locale, sincronizzazione, backup esportabile |
| Aggiornamento dei dati dei dizionari | Procedura di aggiornamento documentata (BKL-05) |

## 7. Dopo il rilascio

- **Statistiche** senza cookie: utenti, lingua del browser, paese (serve per la scelta delle traduzioni, ADR-0003).
- **Feedback:** un indirizzo e-mail o un modulo semplice.
- **Aggiornamenti periodici:** dipendenze e dati dei dizionari.

## 8. Glossario

- **CI/CD:** controlli e consegna automatici.
- **Ambiente:** copia separata del sistema (locale, anteprima, produzione).
- **Migrazione:** file che descrive una modifica al database.
- **Rollback:** ritorno alla versione precedente.
- **Smoke test:** controllo rapido dopo il rilascio.
- **Segreto:** chiave o password che non deve mai finire nel codice.
