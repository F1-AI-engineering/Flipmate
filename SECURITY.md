# Security notes — FlipMate V9

## Attivo

- Supabase Auth per login, registrazione e reset password.
- Password non salvate nel database applicativo.
- Supabase RLS per separazione dati utente.
- CSV injection mitigation già presente in export.
- Nessuna service role key nel frontend.
- Reset password via email sicura.

## Attenzione

- I preset commissioni sono file statici pubblici: non contengono dati sensibili.
- Le funzioni premium sono sbloccate lato UI per test completo. Per monetizzazione reale serve controllo piano lato backend/Supabase/Stripe.
- Recupero password via solo username non implementato per evitare enumerazione account; serve Edge Function dedicata.

## Prima di ADV pubblico

- Aggiornare privacy/cookie policy.
- Collegare eventuale analytics/advertising solo con gestione consenso.
- Bloccare premium lato server.
- Testare RLS con almeno due account diversi.
