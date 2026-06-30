# FlipMate — Calcolatore Flip Vinted/eBay

FlipMate è una web app gratuita per calcolare margini, prezzi di vendita, offerte minime e ROI nel reselling online.

Pensata per side hustle / flipping leggero:

- calcolo costo Vinted all-in;
- prezzo annuncio consigliato;
- offerta minima accettabile;
- break-even;
- prezzo massimo d'acquisto;
- decisione COMPRA / TRATTA / SCARTA;
- database vendite in locale;
- dashboard KPI;
- export CSV per Excel;
- backup/import JSON.

## Demo locale

Non serve installare nulla.

Apri direttamente:

```text
index.html
```

Oppure pubblica il progetto con GitHub Pages.

## Pubblicazione GitHub Pages

Metodo semplice:

1. Crea un nuovo repository pubblico su GitHub, ad esempio `flipmate`.
2. Carica tutti i file di questa cartella nella root del repository.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Branch: `main`, folder: `/root`.
6. Salva.
7. GitHub genererà un link pubblico tipo:

```text
https://tuo-utente.github.io/flipmate/
```

## Stack

- HTML
- CSS
- JavaScript vanilla
- localStorage
- nessun backend
- nessuna dipendenza npm

## Struttura

```text
flipmate-vinted-ebay/
├── index.html
├── app.js
├── styles.css
├── manifest.webmanifest
├── privacy.html
├── terms.html
├── assets/
│   └── logo.svg
├── README.md
├── LICENSE
└── .gitignore
```

## Parametri economici di default

I parametri sono modificabili dalla schermata **Parametri**.

Default iniziali:

- fee eBay stimata: 5,43%;
- fee fissa eBay: 0,35 €;
- protezione acquisti Vinted stimata: 5% + 0,70 €;
- spedizione Vinted default: 4,00 €;
- spedizione addebitata al buyer eBay: 6,50 €;
- spedizione reale venditore: 5,20 €;
- imballo: 0,50 €;
- utile minimo: 10 €;
- ROI target: 25%.

Aggiorna sempre questi valori se le piattaforme cambiano commissioni o condizioni.

## Formula principale

```text
Utile netto = prezzo vendita + spedizione buyer - fee piattaforma - costo Vinted all-in - spedizione reale - imballo - promo
```

Costo Vinted all-in:

```text
Prezzo oggetto Vinted + fee Vinted + spedizione Vinted
```

Decisione:

```text
COMPRA = utile netto >= utile minimo e ROI >= target
TRATTA = vicino al prezzo massimo consigliato
SCARTA = margine insufficiente
```

## Monetizzazione possibile

Roadmap consigliata:

1. Pubblica gratuita su GitHub Pages.
2. Crea contenuti SEO: guide Vinted, eBay, LEGO, action figure, carte, videogiochi retro.
3. Aggiungi affiliate link per imballi, scatole, sleeve, bilance, stampanti etichette.
4. Aggiungi AdSense solo quando il traffico organico è sufficiente.
5. Fase premium futura:
   - account cloud;
   - storico prezzi;
   - alert occasioni;
   - scanner codice prodotto;
   - template annunci eBay;
   - stima venduti automatizzata.

## Privacy

La versione attuale non invia dati a server. Tutto è salvato nel browser dell'utente via `localStorage`.

## Disclaimer

Il tool è uno strumento di calcolo. Non garantisce vendite, margini o risultati fiscali. Ogni utente deve verificare commissioni, regole delle piattaforme, fiscalità e condizioni reali.

## Licenza

MIT.
