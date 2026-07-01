# FlipMate Security Notes

## Architettura

- Frontend statico su GitHub Pages.
- Auth e database su Supabase.
- Password gestite da Supabase Auth.
- Dati prodotti in tabella `public.products`.
- RLS attiva: ogni utente deve leggere/modificare solo i propri prodotti.
