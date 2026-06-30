# FlipMate V6 — Auth, stock tracker, filtri e premium analytics

FlipMate è una web app statica collegata a Supabase per calcolare margini, salvare stock/vendite e analizzare performance per reselling online.

## Novità V6

- Salvataggio prodotto consentito solo con stato `In stock`.
- Aggiornamento stato direttamente dal Database: `In stock`, `In vendita`, `Venduto`, `Archiviato`.
- Filtri database per:
  - modalità analisi;
  - categoria;
  - stato;
  - prezzo vendita min/max;
  - utile min/max;
  - costo acquisto min/max.
- Export CSV filtrato.
- Dashboard con grafici:
  - ricavi lordi venduti;
  - vendita netta stimata;
  - margine per categoria;
  - trend utile mensile;
  - classifica categorie.
- Supporto modalità operative:
  - Solo Vinted;
  - Solo eBay;
  - Vinted + eBay.

## Deploy

1. Carica i file in root del repository GitHub Pages.
2. Mantieni il file `supabase-config.js` con le tue chiavi pubbliche Supabase.
3. Non caricare mai la `service_role key`.
4. Se arrivi da V5, non serve migrazione obbligatoria: la V6 usa colonne già presenti in `products`.

## Test consigliati

1. Login utente A.
2. Prova a salvare prodotto con stato `Da valutare`: deve dare errore.
3. Imposta stato `In stock`: deve salvare.
4. Vai nel Database e cambia stato in `In vendita` o `Venduto`.
5. Verifica Dashboard e grafici.
6. Login utente B e verifica che non veda dati utente A.

## Sicurezza

- Password gestite da Supabase Auth.
- RLS richiesta su `products` e `profiles`.
- Ogni utente vede solo le proprie righe.
- Export CSV protetto contro CSV formula injection.
- Premium/pagamenti restano da implementare con backend/Stripe per produzione.
