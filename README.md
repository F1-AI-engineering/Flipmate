# FlipMate V7 — Multilingual responsive SaaS MVP

FlipMate è una web app statica GitHub Pages collegata a Supabase Auth + Postgres.

## Novità V7

- Selettore lingua Italiano / Inglese.
- Video demo italiano e video demo inglese (`assets/demo-it.mp4`, `assets/demo-en.mp4`).
- Layout responsive per desktop, tablet e smartphone.
- Login e registrazione separati:
  - `login.html`
  - `signup.html`
  - `app.html`
- Home interna app con sole caselle analytics.
- Dashboard separata con caselle KPI + grafici.
- KPI globali in alto in tutte le sezioni app:
  - Pezzi in stock
  - Costi sostenuti
  - Vendita probabile
  - Vendita netta
  - Utile
- Database con filtri e aggiornamento stato singolo prodotto.
- Pulsante “Aggiorna tutto” per impostare uno stato su tutti i prodotti filtrati.
- Categorie più generali:
  - Action figure
  - LEGO
  - Carte collezionabili
  - Videogiochi
  - Manga e artbook
  - Vestiti
  - Cosmetici
  - Libri
  - Oggetti comuni
  - Vintage
  - Elettronica
  - Altro

## File principali

- `index.html` — landing pubblica.
- `signup.html` — pagina registrazione.
- `login.html` — pagina accesso.
- `app.html` — area app dopo login.
- `app.js` — logica auth, calcolo, database, lingua, dashboard.
- `styles.css` — UI responsive.
- `supabase-config.js` — URL e chiave pubblica Supabase.
- `sql/` — script Supabase già usati nelle versioni precedenti.

## Migrazione Supabase

Se arrivi da V6 funzionante, non serve una nuova migrazione obbligatoria.
La V7 usa le stesse colonne `products` e `profiles`.

## Deploy GitHub Pages

1. Estrai lo ZIP.
2. Carica i file nella root del repository.
3. Mantieni il tuo `supabase-config.js` con URL e chiave pubblica.
4. Commit.
5. GitHub Pages aggiorna il sito.

## Test minimo

1. Apri `index.html` online.
2. Cambia lingua in EN e verifica cambio video.
3. Fai una prova gratuita.
4. Registrati su `signup.html`.
5. Entra in `app.html`.
6. Salva prodotto solo con stato `In stock`.
7. Vai in Database.
8. Filtra prodotti.
9. Usa `Aggiorna tutto` sui prodotti filtrati.
10. Vai in Home e Dashboard e verifica KPI/grafici.
