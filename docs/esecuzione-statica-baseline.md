# Esecuzione statica di partenza (baseline)

| | |
|---|---|
| **Data** | 26 novembre 2026 |
| **Oggetto** | `index.html` attuale (logica alle righe 251-1388), commit `a6cdefb` |
| **Esito complessivo** | 36 TC con parte statica eseguiti: 30 superati, 6 falliti; 15 difetti registrati ([test book](test-book.md), sezione 5) |

## Metodo e limiti

- **Lettura del codice** di Disegna, Kana, Romaji, Leggi (tokenizzazione e pannello), Carte e salvataggio, con funzione e riga per ogni verdetto.
- **Controllo di supporto in Node:** ho eseguito le funzioni pure (conversione romaji-kana, tokenizzazione di Leggi, conversione in scrittura mista) estraendole senza modifiche dalla pagina e usando i dati reali dei dizionari. Serve a verificare ciò che la lettura da sola non dimostra; **non sostituisce** i test nel browser.
- **Non eseguito in questa passata:** TC-LEG-02, -05, -06 (furigana, parole note, glossario: pannello e renderizzazione non letti per intero), TC-ROM-06, i TC non funzionali di misura (NFR-02…06) e tutti i TC dei requisiti nuovi, che non esistono ancora nell'app. «Superato» per un TC con più livelli significa solo che la parte statica regge; restano i livelli E, M e Q.
- Nessun file dell'app è stato modificato.

## Risultati principali

**Cosa regge.** Il riconoscitore, il pianificatore delle carte (passi di 1 e 10 minuti, primo intervallo di 1 giorno, 4 con «Facile», fattore 2,5 con minimo 1,3, lapsus), il limite giornaliero delle nuove carte, l'annullamento dell'ultima risposta, il salvataggio con avviso, il backup, il doppio tocco per azzerare, le particelle in scrittura mista («watashi wa gakkou de benkyou shimasu» → 私は学校で勉強します) e la forma base 食べる per 食べました. Nel codice non ci sono richieste di rete oltre ai tre link a Jisho, e tutti gli `innerHTML` assegnano testo fisso, mai dati esterni.

**Cosa non regge.**

1. **DEF-01 (P2) «konnichiwa» / こんにちは.** L'app dà こんにちわ da romaji e «konnichiha» da kana. I criteri approvati nell'analisi funzionale chiedono こんにちは e «konnichiwa». Qui serve una tua decisione: correggere il codice (eccezioni per こんにちは e こんばんは, che sono le parole in cui は si legge «wa») oppure rettificare i criteri. Io propongo la correzione del codice.
2. **DEF-02 (P2) «nn».** Scritto come ん da solo o prima di una consonante dà due ん («kannji» → かんんじ).
3. **DEF-04 (P2) Backup e caricamento non validati** (OSS-02). Si risolve con la validazione della versione 1.0.
4. **DEF-11 (P2) Nessuna Content-Security-Policy.** Atteso; si risolve con la separazione dei file.
5. **DEF-14 (P1 per il rilascio) Frase d'esempio** di Leggi tratta con ogni probabilità da un'opera protetta (BKL-04): va sostituita prima di pubblicare.
6. Gli altri difetti sono P3 (messaggi fuorvianti, annullamento tra mazzi, carte inverse ambigue, tasto Indietro, classifica del dizionario: «kanji» → 幹事): elencati nel registro.

## Prossimi passi proposti

1. Tua decisione su DEF-01.
2. Completare la parte statica dei TC non eseguiti (LEG-02, -05, -06, ROM-06).
3. Con la separazione di dati e codice (ADR-0001), trasformare i controlli in Node in test automatici (livello U) e scrivere i test Playwright (livello E).
4. Correggere i difetti in ordine di priorità, ripetendo ogni volta i TC collegati.
