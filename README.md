# FlipMate V2 — Reselling Margin Calculator

Web app statica GitHub Pages-ready per calcolare margini di flipping/reselling e tracciare vendite.

## Cosa cambia nella V2

- Landing page pubblica con intro commerciale.
- Video demo locale in `assets/demo.mp4`.
- CTA **Prova gratis**.
- Registrazione demo locale.
- Database privato su browser tramite `localStorage`.
- Parametri **Free**: prezzi, commissioni, spedizioni, imballi.
- Parametri **Premium demo**: ROI minimo, utile minimo, markup, sconti, giorni liquidazione, strategie avanzate.
- Dashboard KPI, database vendite, export CSV e backup JSON.

## Importante: database privato o condiviso?

Questa versione non ha backend. Ogni utente che apre il link ha un database separato e privato sul proprio browser/dispositivo.

Quindi:

- Utente A non vede i dati di Utente B.
- Cambiando browser o PC, i dati non seguono l’utente.
- Pulendo cache/localStorage, i dati possono sparire.

Per avere account veri, DB condiviso tra dispositivi e premium reale servono:

- Supabase/Firebase per Auth e Database.
- Stripe/Lemon Squeezy/Paddle per pagamenti.
- Backend o serverless functions per validare abbonamenti.

## Deploy su GitHub Pages

1. Crea repository pubblico, es. `flipmate`.
2. Carica tutti i file nella root del repository.
3. Vai su `Settings > Pages`.
4. Source: `Deploy from a branch`.
5. Branch: `main`, folder: `/root`.
6. Salva e apri il link generato.

## Struttura

```text
index.html
styles.css
app.js
privacy.html
terms.html
manifest.webmanifest
assets/logo.svg
assets/demo.mp4
```

## Roadmap monetizzazione

1. Validazione gratuita con utenti reali.
2. Landing SEO e articoli verticali.
3. Affiliate link per imballi e strumenti da seller.
4. Backend account cloud.
5. Premium con pagamenti reali.
6. AdSense solo dopo traffico.

## Disclaimer

FlipMate non è affiliata a Vinted, eBay o altri marketplace. Le fee devono essere verificate dall’utente. Lo strumento non garantisce profitti.
