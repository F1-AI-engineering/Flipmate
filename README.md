# FlipMate V3 — Reselling Margin Calculator

Web app statica GitHub Pages ready per calcolare margini nel reselling online.

## Novità V3

- Landing page pubblica.
- Video demo con autoplay silenzioso (`autoplay muted loop playsinline`).
- Calcolatore Free visibile senza registrazione.
- Registrazione gratuita demo richiesta per:
  - database vendite;
  - dashboard KPI;
  - salvataggio prodotto;
  - export CSV;
  - backup/import JSON.
- Parametri Free modificabili:
  - prezzi;
  - commissioni;
  - spedizioni;
  - imballi.
- Parametri Premium demo bloccati:
  - ROI minimo;
  - utile minimo;
  - markup;
  - sconto offerta;
  - giorni liquidazione;
  - strategie avanzate categoria.

## Deploy su GitHub Pages

1. Crea un repository pubblico, per esempio `flipmate`.
2. Carica nella root del repository questi file estratti, non lo ZIP:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `privacy.html`
   - `terms.html`
   - `manifest.webmanifest`
   - cartella `assets/`
3. Vai in `Settings → Pages`.
4. Source: `Deploy from a branch`.
5. Branch: `main`, folder: `/root`.
6. Salva.

## Nota tecnica

Questa versione non ha backend. La registrazione è demo locale: i dati vengono salvati nel `localStorage` del browser. Quindi ogni utente ha un database privato nel proprio browser/dispositivo.

Per rendere login, Premium e dati multi-device reali servono:

- Supabase Auth;
- Supabase Database;
- Stripe per pagamenti;
- hosting tipo Vercel/Netlify.

## Licenza

MVP dimostrativo. Evitare uso di loghi ufficiali Vinted/eBay e non presentare l'app come affiliata o ufficiale.
