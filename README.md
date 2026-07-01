# FlipMate V9

Web app statica GitHub Pages + Supabase per calcolare margini, gestire stock e leggere analytics per reselling Vinted/eBay.

## Novità V9

- Home ripulita da note interne.
- KPI top rinominati con gergo comune:
  - Pezzi in stock
  - Capitale investito
  - Valore stock stimato
  - Utile potenziale
  - Utile realizzato anno
- Dashboard con Anno / Mese / Periodo / Confronto e Delta.
- Preset commissioni e costi medi aggiornabili da `config/marketplace-fees.json`.
- Grafici aggiunti:
  - barre ricavi lordi vs vendite nette
  - barre margine per categoria
  - torta composizione stock
  - linea trend utile mensile con indicatori
- Numeri negativi in rosso.
- Impostazioni spostate nel menu utente.
- Navigazione mobile migliorata con menu a tendina.
- Funzioni sbloccate lato UI per test completo.

## Configurazione commissioni

Modifica `config/marketplace-fees.json` per aggiornare i default distribuiti agli utenti al refresh.

## Deploy

1. Carica tutto nella root del repository GitHub Pages.
2. Non sovrascrivere `supabase-config.js` già configurato.
3. Verifica che siano presenti:
   - `index.html`
   - `login.html`
   - `signup.html`
   - `reset-request.html`
   - `reset-password.html`
   - `app.html`
   - `app.js`
   - `styles.css`
   - `config/marketplace-fees.json`

## Supabase

Nessuna nuova migrazione obbligatoria rispetto alla V7/V8 funzionante.
