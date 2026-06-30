# Security — FlipMate

## Principi

1) Non salvare password nel codice frontend.
2) Usare Supabase Auth per login e registrazione.
3) Usare Row Level Security su ogni tabella utente.
4) Usare solo la `anon public key` nel frontend.
5) Non pubblicare mai la `service_role key`.
6) Non raccogliere dati sensibili non necessari.
7) Non fare scraping automatico non autorizzato.
8) Validare input lato frontend e proteggere l'accesso lato database con RLS.

## Produzione

Per produzione vera valutare:

1) dominio custom;
2) hosting con security headers;
3) cookie banner se inserisci advertising o tracking;
4) Stripe per pagamenti premium;
5) logging errori;
6) backup database;
7) privacy policy rivista legalmente.

## Segnalazioni

Apri una issue GitHub senza includere dati personali o segreti.
