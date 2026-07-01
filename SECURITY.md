# FlipMate Security Notes

## Architettura

- Frontend statico su GitHub Pages.
- Auth e database su Supabase.
- Password gestite da Supabase Auth.
- Dati prodotti in tabella `public.products`.
- RLS attiva: ogni utente deve leggere/modificare solo i propri prodotti.

## Regole

- Non inserire mai `service_role` o secret key nel frontend.
- Nel frontend usare solo publishable / anon key.
- Non salvare password in localStorage o nel database.
- CSV export protetto da formula injection base.
- Premium reale non deve essere protetto solo da JavaScript: servirà controllo lato backend/database.

## Checklist prima di ADV pubblico

- Verificare RLS con due utenti diversi.
- Verificare email/password policy Supabase.
- Aggiornare privacy/cookie se si aggiungono analytics o advertising.
- Collegare pagamenti solo tramite provider sicuro tipo Stripe Customer Portal.
