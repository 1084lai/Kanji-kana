# Analisi tecnica – primo rilascio web

| | |
|---|---|
| **Versione** | 0.1 |
| **Data** | 26 novembre 2026 |
| **Stato** | Approvata dall'autore il 26 novembre 2026 |
| **Parte da** | [Analisi funzionale as-is](analisi-funzionale.md), ADR-0001, ADR-0002, ADR-0003 |
| **Obiettivo** | Pubblicare la web app (fase 1 di ADR-0003) spendendo il meno possibile |

## 1. Ambito

La fase 1 pubblica la web app gratuita. Restano fuori: l'app Android, le traduzioni dei significati e la riscrittura in Java (fasi successive, vedi ADR-0003).

Requisiti guida:

- **Costo vicino a zero** finché gli utenti sono pochi.
- **L'app funziona offline e senza login.** Il login serve solo a salvare i progressi in cloud e a ritrovarli su più dispositivi.
- **I dati personali sono minimi** (solo e-mail dell'account Google e progressi di studio).
- **Interfaccia in inglese e italiano** al lancio; significati in inglese.

## 2. Architettura proposta

```
 Browser (PWA, offline)
   ├─ HTML + JS + CSS            ← servito da Cloudflare (file statici)
   ├─ data/*.json (kanji, dizionari) ← file statici, in cache locale
   ├─ localStorage / IndexedDB   ← progressi sempre salvati sul dispositivo
   └─ (opzionale, dopo il login) ──► Supabase: Auth (Google) + Postgres (progressi)
```

Scelte principali:

| Tema | Scelta | Motivo |
|---|---|---|
| Hosting | Cloudflare, file statici | Le richieste a file statici sono gratuite e illimitate; non serve un server. |
| Backend | Solo Supabase (Auth + Postgres con Row Level Security) | Nessun codice server da scrivere né da mantenere nella prima versione. |
| Front end | TypeScript senza framework pesante (build con Vite) | L'app è già una singola applicazione lato client; Next.js aggiungerebbe un server inutile in questa fase. |
| Offline | Service worker + cache dei file `data/` | L'app resta usabile senza rete; da decidere in dettaglio (ADR-0001). |
| Progressi | Salvati prima in locale, poi sincronizzati se c'è il login | L'utente anonimo non perde nulla; il login aggiunge solo la sincronizzazione. |

La scelta di stack e hosting va formalizzata in **ADR-0004** (proposta).

## 3. Modello dei dati (Supabase)

Una sola tabella per i progressi, con una riga per utente:

| Colonna | Tipo | Note |
|---|---|---|
| `user_id` | uuid, chiave primaria | Riferimento a `auth.users`; cancellazione a cascata. |
| `flashcards` | jsonb | Stato delle carte (come `fc_v1` oggi). |
| `known` | jsonb | Parole segnate come note (come `kn_known_v1`). |
| `schema_version` | int | Per migrare il formato in futuro. |
| `updated_at` | timestamptz | Per la sincronizzazione. |

**Sicurezza (Row Level Security):** ogni utente può leggere e scrivere solo la riga con il proprio `user_id`. Vale come requisito e va coperto da test dedicati.

## 4. Sincronizzazione e conflitti

- Si sincronizza **dopo il login e all'avvio**, poi a intervalli e quando l'utente chiude l'app.
- **Conflitto semplice:** vince la versione con `updated_at` più recente, per singola carta (non per l'intero archivio), così lo studio fatto offline su due dispositivi non si cancella a vicenda.
- Il **backup in Base64** esistente resta come via di fuga e viene validato in lettura (osservazione OSS-02 dell'analisi funzionale).
- Da decidere e testare: cosa succede alla prima connessione, quando esistono già progressi locali e progressi in cloud.

## 5. Autenticazione

- Solo **Google** (OAuth gestito da Supabase). Nessuna password da conservare.
- Le credenziali (ID e segreto del client Google) le crei tu nelle console di Google e di Supabase; non entrano mai nel repository.
- La chiave pubblica di Supabase (`anon`) è pensata per stare nel front end; la chiave `service_role` non va mai nel codice dell'app.
- Il login è **opzionale**: senza login, l'app funziona come oggi.

## 6. Pubblicità e consenso

- Prima di caricare qualunque script pubblicitario serve il **consenso GDPR** (banner di scelta). Senza consenso non si carica nulla.
- Il servizio pubblicitario può rifiutare un sito con poco contenuto; per questo la pubblicità è dopo il primo rilascio, non nel primo giorno.
- Servono **informativa sulla privacy**, **cookie policy** e la **scheda Crediti** con le licenze dei dati (BKL-01).
- Le statistiche d'uso usano uno strumento senza cookie e senza dati personali.

## 7. Sicurezza (minimo per il rilascio)

| Rischio | Contromisura |
|---|---|
| Segreti nel repository | Controllo con gitleaks in CI; i segreti stanno solo nelle variabili d'ambiente. |
| Script e dipendenze vulnerabili | `npm audit` e Semgrep in CI. |
| Iniezione di codice nella pagina | Si evita `innerHTML` con dati esterni; si aggiunge una Content-Security-Policy dopo la separazione dei file. |
| Accesso ai dati di altri utenti | Row Level Security più test automatici. |
| Ripristino di un backup malevolo | Validazione dello schema in lettura (OSS-02). |
| Consenso e privacy | Vedi sezione 6. |

## 8. Ambienti e consegna

| Ambiente | Scopo | Dove |
|---|---|---|
| Locale | Sviluppo | Computer dell'autore, Supabase in locale o progetto di prova |
| Anteprima | Una pagina di prova per ogni modifica (pull request) | Cloudflare, indirizzo temporaneo |
| Produzione | Utenti reali | Cloudflare con dominio proprio, Supabase di produzione |

Si tengono **due progetti Supabase separati** (prova e produzione), così i test non toccano i dati reali (il piano gratuito ne consente due).

**Pipeline (GitHub Actions):** ad ogni modifica si eseguono controllo del codice, controllo dei segreti, audit delle dipendenze, build e test (prima statici, poi Playwright). Il rilascio in produzione parte solo dal ramo `main` quando i controlli passano.

I test con login Google reale non si automatizzano: si usa un utente di prova nell'ambiente di test o si simula il login.

## 9. Costi attesi (fase 1)

| Voce | Costo |
|---|---|
| Hosting Cloudflare (file statici) | 0 € |
| Supabase piano gratuito | 0 € (limiti: 0,5 GB di database, 5 GB di traffico, 50.000 utenti attivi al mese) |
| Dominio | circa 10-15 € l'anno (stima; da verificare) |
| Account sviluppatore Google Play (fase 2) | 25 $ una tantum |

**Rischio operativo principale:** un progetto Supabase gratuito viene messo in pausa dopo una settimana con poca attività e resta spento finché non lo riattivi a mano. Contromisure: l'app funziona anche senza Supabase (login e sincronizzazione sono opzionali, quindi un'interruzione non rompe lo studio); si prepara un controllo periodico che genera attività; se l'app prende piede, si passa al piano Pro (circa 25 $ al mese), che non viene mai messo in pausa.

## 10. Piano di rilascio (sintesi)

1. Separare dati e codice e aggiungere la scheda Crediti (ADR-0001, BKL-01/02/05).
2. Aggiungere il livello di traduzione dell'interfaccia (en/it).
3. Impostare il repository per la consegna automatica (CI, anteprime).
4. Creare i progetti Supabase (prova e produzione) e il login Google.
5. Implementare sincronizzazione e test (static + Playwright).
6. Pubblicare su un indirizzo di anteprima e provarlo con 3-5 persone.
7. Collegare il dominio, pubblicare in produzione, attivare le statistiche.
8. Solo dopo: pubblicità.

La guida dettagliata alla fase di rilascio è nel documento [rilascio.md](rilascio.md).

## 11. Punti aperti

- Conferma dello stack front end (TypeScript senza framework) con ADR-0004.
- Scelta del dominio e del servizio per le statistiche senza cookie.
- Strategia della cache offline e dimensione dei dati (l'app oggi è un unico file di circa 6,4 MB).
- Fonte delle frasi d'esempio (BKL-04).
- Gestione della cancellazione dell'account e dei dati (diritto GDPR).

## 12. Fonti verificate il 26 novembre 2026

- Cloudflare, prezzi di Pages: <https://developers.cloudflare.com/pages/functions/pricing/>
- Supabase, pausa dei progetti gratuiti: <https://supabase.com/docs/guides/platform/free-project-pausing>

I limiti dei piani gratuiti cambiano nel tempo e vanno ricontrollati prima del rilascio.
