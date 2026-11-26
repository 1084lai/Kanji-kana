# ADR-0004 – Stack e hosting del primo rilascio

| | |
|---|---|
| **Stato** | Proposta (da approvare dall'autore) |
| **Data** | 26 novembre 2026 |
| **Collegato a** | Analisi tecnica, ADR-0001, ADR-0003 |

## Contesto

L'obiettivo è pubblicare la web app spendendo il meno possibile. L'applicazione oggi è lato client (disegno, dizionari e carte girano nel browser) e deve funzionare offline. Servono solo login e salvataggio dei progressi in cloud. L'autore vuole rimanere indipendente dal linguaggio: la riscrittura in Java resta possibile in seguito.

## Opzioni

| Opzione | Pro | Contro |
|---|---|---|
| **A. File statici su Cloudflare + Supabase (Auth e database), front end in TypeScript con Vite** | Costo zero iniziale; nessun server da gestire; una sola parte dinamica (Supabase). | Si dipende dal piano gratuito di Supabase (pausa dopo inattività). |
| **B. Next.js su Cloudflare + Supabase** | Pagine renderizzate lato server, utile per SEO. | Aggiunge un server e una complessità che oggi non servono; le funzioni lato server pesano sul limite giornaliero. |
| **C. Backend Java (Spring Boot) subito** | Competenza già presente. | Serve un server a pagamento; più lavoro prima di pubblicare; contraddice l'obiettivo di costo e velocità. |

## Decisione

Adottare l'**opzione A**. Per l'hosting si usano i file statici su Cloudflare. Cloudflare indica oggi Workers Static Assets come scelta per i nuovi progetti, mentre Pages continua a funzionare: la scelta definitiva si fa in fase di impostazione, dopo aver controllato la documentazione corrente. Il login e i progressi usano Supabase con Row Level Security. Il backend Java resta una possibilità futura (ADR-0003, fase 2).

## Conseguenze

- L'app resta utilizzabile anche se Supabase è fermo (login opzionale).
- La pubblicità, i testi legali e i Crediti sono lavoro a parte (analisi tecnica, sezione 6).
- Se l'app cresce, il passaggio a un piano a pagamento di Supabase o a un backend proprio è possibile senza riscrivere il front end.
