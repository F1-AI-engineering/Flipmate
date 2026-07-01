# Security notes — FlipMate V10

## Stato sicurezza

- Auth gestita da Supabase.
- Password non salvate nel database applicativo.
- RLS Supabase invariata rispetto alle versioni precedenti.
- Aggiornamento massivo lavora sugli ID dei prodotti visibili e selezionati dall'utente autenticato; RLS limita comunque le righe al proprietario.
- Popup vendita aggiorna solo `status`, `sale_price`, `sale_date`, `profit`, `roi`.

## Rischi residui

- Premium ancora non protetto lato backend.
- Calcolo utile su prezzo venduto usa preset commissioni statici lato frontend.
- Per produzione, validare logiche economiche lato backend o funzione SQL.
- Nessuna funzione admin esposta nel frontend.

## Raccomandazioni prima della pubblicazione ampia

1. Test RLS con due utenti.
2. Test aggiornamento massivo su righe selezionate.
3. Test reset password.
4. Verifica Security Advisor Supabase.
5. Non esporre mai service role key.
