# FlipMate V10

Versione V10 del prototipo FlipMate.

## Novità principali

- Grafici dashboard rivisti: barre con griglia, torta con legenda, linea con indicatori e card più leggibili.
- Delta confronto nascosto di default: l'utente lo abilita con l'interruttore "Mostra Delta confronto".
- Database con selezione multipla tramite checkbox riga per riga.
- Checkbox in intestazione per selezionare tutte le righe filtrate.
- Aggiornamento massivo solo dei prodotti selezionati.
- Se lo stato passa a "Venduto", viene aperto un popup obbligatorio per inserire il prezzo reale di vendita.
- Nel popup vendita si vedono data, descrizione, categoria, costo, prezzo vecchio, prezzo nuovo e utile nuovo aggiornato live.
- Aggiornamento singolo riga mantenuto.

## Supabase

Non sono richieste nuove migrazioni se arrivi da V9 funzionante.

Campi usati:

- `status`
- `sale_price`
- `sale_date`
- `profit`
- `roi`

## Caricamento GitHub

1. Estrai lo ZIP.
2. Carica/sovrascrivi i file nel repository.
3. Non sovrascrivere `supabase-config.js` se contiene già URL e chiave pubblica.
4. Commit consigliato: `FlipMate V10 dashboard and bulk sales update`.

## Test consigliati

1. Dashboard: Delta nascosto di default.
2. Attiva Delta: compaiono anno/mese confronto e KPI Delta.
3. Database: seleziona solo alcune righe e aggiorna stato non-venduto.
4. Database: seleziona righe e imposta Venduto.
5. Popup vendita: modifica prezzi e verifica utile live.
6. Conferma: controlla su Supabase che `sale_price`, `sale_date`, `profit`, `roi` siano aggiornati.
