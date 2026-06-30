# FlipMate V4 — Ad-ready landing + Supabase sandbox

FlipMate è una web app statica per calcolare margini, ROI e prezzo minimo nel reselling online.

## Funzioni

- Landing page pronta per traffico/ADV
- Calcolatore free senza registrazione
- Registrazione richiesta per database, dashboard ed export CSV
- Modalità locale fallback tramite localStorage
- Modalità cloud sandbox tramite Supabase Auth + Postgres + Row Level Security
- SQL schema incluso
- Query admin incluse
- Privacy, Terms e Security incluse

## Struttura file

```text
index.html
styles.css
app.js
supabase-config.js
manifest.webmanifest
privacy.html
terms.html
SECURITY.md
sql/supabase_schema.sql
sql/admin_queries.sql
assets/logo.svg
assets/demo.mp4
```

## Pubblicazione GitHub Pages

1) Crea o apri il repository GitHub.
2) Carica tutti i file nella root del repository.
3) Vai su `Settings > Pages`.
4) Source: `Deploy from a branch`.
5) Branch: `main`.
6) Folder: `/root`.
7) Salva.

## Setup Supabase sandbox

1) Vai su Supabase e crea un nuovo progetto.
2) Vai su `SQL Editor`.
3) Incolla ed esegui `sql/supabase_schema.sql`.
4) Vai su `Project Settings > API`.
5) Copia `Project URL`.
6) Copia `anon public key`.
7) Apri `supabase-config.js`.
8) Incolla i due valori:

```js
window.FLIPMATE_SUPABASE_URL = 'https://xxxx.supabase.co';
window.FLIPMATE_SUPABASE_ANON_KEY = 'ey...';
```

9) Non inserire mai la `service_role key` nel frontend.
10) Carica il file aggiornato su GitHub.

## Dove vedere dati utenti

1) Vai su Supabase.
2) Apri il progetto.
3) Vai su `Authentication > Users` per vedere utenti registrati.
4) Vai su `Table Editor > products` per vedere i prodotti salvati.
5) Vai su `SQL Editor` ed esegui `sql/admin_queries.sql` per statistiche aggregate.

## Sicurezza

- Password gestite da Supabase Auth.
- Database protetto da Row Level Security.
- Ogni utente può leggere/scrivere solo le proprie righe.
- Il frontend usa solo anon public key.
- Service role key esclusa dal codice pubblico.

## Monetizzazione futura

1) SEO pages.
2) Affiliate link per strumenti da reseller.
3) AdSense dopo contenuti e traffico.
4) Premium reale con Stripe + Supabase.
