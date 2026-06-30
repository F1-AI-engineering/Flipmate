const STORAGE_KEYS = {
  params: 'flipmate_params_v1',
  rows: 'flipmate_rows_v1'
};

const DEFAULT_PARAMS = {
  ebayFeePct: 5.43,
  ebayFixedFee: 0.35,
  vintedBuyerFeePct: 5,
  vintedBuyerFixedFee: 0.70,
  defaultVintedShipping: 4.00,
  defaultBuyerShipping: 6.50,
  defaultRealShipping: 5.20,
  defaultPackCost: 0.50,
  defaultPromoPct: 0,
  defaultMarkupPct: 10,
  prudenceDiscountPct: 10,
  minProfit: 10,
  targetRoiPct: 25,
  liquidationDays: 45,
  budget: 500
};

const PARAM_DEFS = [
  ['ebayFeePct', 'Fee eBay %', 'Percentuale fee eBay sul totale incassato.'],
  ['ebayFixedFee', 'Fee fissa eBay €', 'Costo fisso per ordine.'],
  ['vintedBuyerFeePct', 'Fee acquisto Vinted %', 'Protezione acquisti stimata.'],
  ['vintedBuyerFixedFee', 'Fee fissa Vinted €', 'Costo fisso protezione acquisti.'],
  ['defaultVintedShipping', 'Spedizione Vinted default €', 'Costo medio spedizione quando compri.'],
  ['defaultBuyerShipping', 'Spedizione buyer eBay €', 'Quanto addebiti al compratore.'],
  ['defaultRealShipping', 'Spedizione reale tua €', 'Quanto paghi realmente per spedire.'],
  ['defaultPackCost', 'Imballo €', 'Costo scatola, pluriball, nastro.'],
  ['defaultPromoPct', 'Promo eBay %', 'Promozione annuncio se usata.'],
  ['defaultMarkupPct', 'Markup annuncio %', 'Quanto sopra il prezzo medio venduto.'],
  ['prudenceDiscountPct', 'Sconto prudenza %', 'Riduzione sul prezzo medio venduto per non sovrastimare.'],
  ['minProfit', 'Utile minimo €', 'Utile netto minimo per comprare.'],
  ['targetRoiPct', 'ROI target %', 'Rendimento minimo sul costo all-in.'],
  ['liquidationDays', 'Giorni liquidazione stock', 'Dopo quanti giorni segnalare lo stock.'],
  ['budget', 'Budget operativo €', 'Budget totale dedicato al flipping.']
];

const CATEGORIES = [
  {
    name: 'Action figure anime',
    tier: 'A',
    margin: '25-40%',
    risk: 'Medio',
    why: 'Piccole, spedibili, domanda alta, prezzo facilmente confrontabile.',
    searches: ['Banpresto Dragon Ball', 'Ichibansho', 'Figuarts', 'Grandista', 'King of Artist'],
    rules: ['Scatola presente', 'Foto reali', 'Personaggi forti', 'Prezzo almeno 35% sotto i venduti eBay']
  },
  {
    name: 'LEGO retired',
    tier: 'A',
    margin: '20-35%',
    risk: 'Basso/Medio',
    why: 'Mercato liquido, codici set chiari, domanda internazionale.',
    searches: ['LEGO Star Wars retired', 'LEGO Harry Potter', 'LEGO minifigure', 'LEGO set sigillato'],
    rules: ['Codice set visibile', 'Completo o sigillato', 'No lotti sfusi all’inizio']
  },
  {
    name: 'Videogiochi retro',
    tier: 'A',
    margin: '25-50%',
    risk: 'Medio',
    why: 'Nintendo, Pokémon, PS1/PS2 e horror hanno forte domanda.',
    searches: ['Nintendo DS Pokémon', '3DS', 'Game Boy', 'PS2 horror', 'Wii Mario'],
    rules: ['Custodia e manuale meglio', 'Test funzionamento', 'Titoli forti e riconoscibili']
  },
  {
    name: 'Carte Pokémon / One Piece',
    tier: 'A/B',
    margin: '30-60%',
    risk: 'Medio/Alto',
    why: 'Margine alto sui lotti, ma serve competenza per evitare fake e condizioni scarse.',
    searches: ['One Piece sealed', 'Pokémon promo', 'lotto Pokémon vintage', 'booster box'],
    rules: ['Foto fronte/retro', 'Niente costose non autenticate', 'Evita lotti di sole comuni']
  },
  {
    name: 'Manga / artbook',
    tier: 'B',
    margin: '25-45%',
    risk: 'Medio',
    why: 'Buoni margini su box, variant e prime edizioni se comprati in lotto.',
    searches: ['manga box', 'variant manga', 'artbook anime', 'prima edizione'],
    rules: ['Condizioni costa/copertina', 'Serie complete', 'Occhio al peso spedizione']
  },
  {
    name: 'Funko Pop rari',
    tier: 'B',
    margin: '30-50%',
    risk: 'Medio/Alto',
    why: 'Domanda buona ma mercato saturo. Funziona solo su vaulted o pezzi realmente rari.',
    searches: ['Funko vaulted', 'Funko chase', 'Funko exclusive'],
    rules: ['Box perfetto', 'Verifica venduti', 'Evita comuni sovrapprezzati']
  },
  {
    name: 'Gunpla / model kit',
    tier: 'B',
    margin: '20-40%',
    risk: 'Medio',
    why: 'Buono se sigillato, raro o fuori stock. Rischio pezzi mancanti se aperto.',
    searches: ['Gunpla Bandai sealed', 'MG Gundam', 'RG Gundam', 'HG limited'],
    rules: ['Preferisci sigillato', 'Verifica runner', 'Evita kit aperti non controllati']
  },
  {
    name: 'Board game / Kickstarter',
    tier: 'B',
    margin: '20-45%',
    risk: 'Medio',
    why: 'Alcuni fuori catalogo vendono bene, ma ingombrano e pesano.',
    searches: ['board game Kickstarter', 'gioco da tavolo fuori catalogo', 'espansione rara'],
    rules: ['Verifica completezza', 'Calcola bene spedizione', 'Meglio ritiri a mano']
  }
];

const DEMO_ROWS = [
  {
    id: crypto.randomUUID(), name: 'Banpresto Goku SSJ3 Match Makers', category: 'Action figure anime', status: 'Stock',
    buyCost: 24.70, listingPrice: 44.90, soldPrice: 0, buyerShipping: 6.50, realShipping: 5.20, packCost: 0.50, promoPct: 0,
    purchaseDate: new Date(Date.now() - 12 * 86400000).toISOString().slice(0,10), saleDate: '', notes: 'Box presente, foto buone.'
  },
  {
    id: crypto.randomUUID(), name: 'LEGO Star Wars minifigure lotto', category: 'LEGO retired', status: 'Venduto',
    buyCost: 31.00, listingPrice: 59.90, soldPrice: 55.00, buyerShipping: 6.50, realShipping: 5.20, packCost: 0.50, promoPct: 0,
    purchaseDate: new Date(Date.now() - 20 * 86400000).toISOString().slice(0,10), saleDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0,10), notes: 'Venduto con offerta.'
  }
];

let params = loadParams();
let rows = loadRows();
let lastCalc = null;

function euro(value) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return safe.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

function pct(value) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safe.toLocaleString('it-IT', { maximumFractionDigits: 1 })}%`;
}

function num(id) {
  return parseFloat(document.getElementById(id).value || '0') || 0;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function loadParams() {
  try { return { ...DEFAULT_PARAMS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.params) || '{}') }; }
  catch { return { ...DEFAULT_PARAMS }; }
}

function saveParams() {
  localStorage.setItem(STORAGE_KEYS.params, JSON.stringify(params));
}

function loadRows() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.rows) || '[]'); }
  catch { return []; }
}

function saveRows() {
  localStorage.setItem(STORAGE_KEYS.rows, JSON.stringify(rows));
}

function saleFee(totalCollected, salePrice, promoPct = 0) {
  const rate = params.ebayFeePct / 100;
  const promo = promoPct / 100;
  return totalCollected * rate + params.ebayFixedFee + salePrice * promo;
}

function profitForSale({ salePrice, buyCost, buyerShipping, realShipping, packCost, promoPct }) {
  const total = salePrice + buyerShipping;
  return total - saleFee(total, salePrice, promoPct) - buyCost - realShipping - packCost;
}

function roiForSale(profit, buyCost) {
  return buyCost > 0 ? profit / buyCost * 100 : 0;
}

function daysBetween(start, end) {
  if (!start) return 0;
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  if (Number.isNaN(s.getTime())) return 0;
  return Math.max(0, Math.round((e - s) / 86400000));
}

function vintedAllIn(itemPrice, shipping) {
  return itemPrice * (1 + params.vintedBuyerFeePct / 100) + params.vintedBuyerFixedFee + shipping;
}

function inverseVintedPrice(allIn, shipping) {
  return Math.max(0, (allIn - params.vintedBuyerFixedFee - shipping) / (1 + params.vintedBuyerFeePct / 100));
}

function requiredSalePrice({ buyCost, buyerShipping, realShipping, packCost, promoPct, targetProfit }) {
  const ebayRate = params.ebayFeePct / 100;
  const promoRate = promoPct / 100;
  const denominator = 1 - ebayRate - promoRate;
  if (denominator <= 0) return Infinity;
  return (targetProfit + params.ebayFixedFee + buyCost + realShipping + packCost - buyerShipping * (1 - ebayRate)) / denominator;
}

function maxBuyAllInForSale({ salePrice, buyerShipping, realShipping, packCost, promoPct, targetProfit }) {
  const total = salePrice + buyerShipping;
  return total - saleFee(total, salePrice, promoPct) - realShipping - packCost - targetProfit;
}

function targetProfitForCost(cost) {
  return Math.max(params.minProfit, cost * params.targetRoiPct / 100);
}

function runCalc() {
  const soldAvg = num('soldAvg');
  const vintedPrice = num('vintedPrice');
  const vintedShipping = num('vintedShipping');
  const buyerShipping = num('buyerShipping');
  const realShipping = num('realShipping');
  const packCost = num('packCost');
  const promoPct = num('promoPct');
  const markupPct = num('markupPct');

  const allIn = vintedAllIn(vintedPrice, vintedShipping);
  const fairValue = soldAvg * (1 - params.prudenceDiscountPct / 100);
  const listingPrice = soldAvg * (1 + markupPct / 100);
  const targetProfit = targetProfitForCost(allIn);
  const minOffer = requiredSalePrice({ buyCost: allIn, buyerShipping, realShipping, packCost, promoPct, targetProfit });
  const breakEven = requiredSalePrice({ buyCost: allIn, buyerShipping, realShipping, packCost, promoPct, targetProfit: 0 });
  const expectedProfit = profitForSale({ salePrice: fairValue, buyCost: allIn, buyerShipping, realShipping, packCost, promoPct });
  const expectedRoi = roiForSale(expectedProfit, allIn);
  const maxAllIn = maxBuyAllInForSale({ salePrice: fairValue, buyerShipping, realShipping, packCost, promoPct, targetProfit });
  const maxVinted = inverseVintedPrice(maxAllIn, vintedShipping);

  let decision = 'SCARTA';
  let css = 'skip';
  let reason = `Prezzo Vinted troppo alto. Max consigliato: ${euro(maxVinted)}.`;
  if (vintedPrice <= maxVinted && expectedProfit >= targetProfit) {
    decision = 'COMPRA'; css = 'buy';
    reason = `Margine coerente: utile stimato ${euro(expectedProfit)}, ROI ${pct(expectedRoi)}.`;
  } else if (vintedPrice <= maxVinted * 1.15) {
    decision = 'TRATTA'; css = 'negotiate';
    reason = `Se scende verso ${euro(maxVinted)}, il trade diventa interessante.`;
  }

  lastCalc = {
    name: document.getElementById('calcName').value.trim() || 'Prodotto senza nome',
    category: document.getElementById('calcCategory').value,
    soldAvg, vintedPrice, vintedShipping, buyerShipping, realShipping, packCost, promoPct,
    allIn, fairValue, listingPrice, minOffer, breakEven, expectedProfit, expectedRoi, maxVinted, targetProfit, decision, reason
  };

  document.getElementById('outAllIn').textContent = euro(allIn);
  document.getElementById('outFair').textContent = euro(fairValue);
  document.getElementById('outListing').textContent = euro(listingPrice);
  document.getElementById('outMinOffer').textContent = euro(minOffer);
  document.getElementById('outBreakEven').textContent = euro(breakEven);
  document.getElementById('outMaxBuy').textContent = euro(maxVinted);
  document.getElementById('outProfit').textContent = euro(expectedProfit);
  document.getElementById('outRoi').textContent = pct(expectedRoi);

  const verdict = document.getElementById('verdictBox');
  verdict.className = `verdict ${css}`;
  document.getElementById('decision').textContent = decision;
  document.getElementById('decisionReason').textContent = reason;
}

function renderParams() {
  const form = document.getElementById('paramsForm');
  form.innerHTML = PARAM_DEFS.map(([key, label, help]) => `
    <label>${label}
      <input type="number" step="0.01" data-param="${key}" value="${params[key]}">
      <small>${help}</small>
    </label>
  `).join('');

  form.querySelectorAll('[data-param]').forEach(input => {
    input.addEventListener('input', () => {
      params[input.dataset.param] = parseFloat(input.value || '0') || 0;
      saveParams();
      hydrateCalcDefaults(false);
      runCalc();
      renderDashboard();
      renderDatabase();
    });
  });
}

function hydrateCalcDefaults(overwrite = true) {
  if (overwrite) {
    setValue('vintedShipping', params.defaultVintedShipping);
    setValue('buyerShipping', params.defaultBuyerShipping);
    setValue('realShipping', params.defaultRealShipping);
    setValue('packCost', params.defaultPackCost);
    setValue('promoPct', params.defaultPromoPct);
    setValue('markupPct', params.defaultMarkupPct);
  }
}

function renderCategories() {
  const select = document.getElementById('calcCategory');
  select.innerHTML = CATEGORIES.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');

  const grid = document.getElementById('categoryCards');
  grid.innerHTML = CATEGORIES.map(c => `
    <article class="category-card">
      <span class="eyebrow">Tier ${c.tier} · ${c.margin}</span>
      <h3>${escapeHtml(c.name)}</h3>
      <p>${escapeHtml(c.why)}</p>
      <p><strong>Rischio:</strong> ${escapeHtml(c.risk)}</p>
      <ul>${c.rules.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      <p><strong>Cerca:</strong> ${c.searches.map(escapeHtml).join(', ')}</p>
    </article>
  `).join('');
}

function renderDatabase() {
  const tbody = document.getElementById('dbBody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="12" class="muted">Nessuna riga. Salva un calcolo o aggiungi una riga manuale.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(row => {
    const salePrice = row.status === 'Venduto' ? Number(row.soldPrice || 0) : Number(row.listingPrice || 0);
    const profit = profitForSale({
      salePrice,
      buyCost: Number(row.buyCost || 0),
      buyerShipping: Number(row.buyerShipping || params.defaultBuyerShipping),
      realShipping: Number(row.realShipping || params.defaultRealShipping),
      packCost: Number(row.packCost || params.defaultPackCost),
      promoPct: Number(row.promoPct || 0)
    });
    const roi = roiForSale(profit, Number(row.buyCost || 0));
    return `
      <tr data-id="${row.id}">
        <td><input data-field="name" value="${escapeAttr(row.name)}"></td>
        <td><select data-field="category">${CATEGORIES.map(c => `<option ${c.name === row.category ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></td>
        <td><select data-field="status"><option ${row.status === 'Stock' ? 'selected' : ''}>Stock</option><option ${row.status === 'Venduto' ? 'selected' : ''}>Venduto</option><option ${row.status === 'Liquidare' ? 'selected' : ''}>Liquidare</option></select></td>
        <td><input type="number" step="0.01" data-field="buyCost" value="${row.buyCost || 0}"></td>
        <td><input type="number" step="0.01" data-field="listingPrice" value="${row.listingPrice || 0}"></td>
        <td><input type="number" step="0.01" data-field="soldPrice" value="${row.soldPrice || 0}"></td>
        <td>${euro(profit)}</td>
        <td>${pct(roi)}</td>
        <td><input type="date" data-field="purchaseDate" value="${row.purchaseDate || ''}"></td>
        <td><input type="date" data-field="saleDate" value="${row.saleDate || ''}"></td>
        <td><input data-field="notes" value="${escapeAttr(row.notes || '')}"></td>
        <td><button class="btn small danger" data-delete="${row.id}">Elimina</button></td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', handleDbEdit);
    input.addEventListener('input', debounce(handleDbEdit, 350));
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      rows = rows.filter(r => r.id !== btn.dataset.delete);
      saveRows(); renderDatabase(); renderDashboard(); toast('Riga eliminata.');
    });
  });
}

function handleDbEdit(event) {
  const tr = event.target.closest('tr');
  const row = rows.find(r => r.id === tr.dataset.id);
  if (!row) return;
  const field = event.target.dataset.field;
  let value = event.target.value;
  if (['buyCost','listingPrice','soldPrice'].includes(field)) value = parseFloat(value || '0') || 0;
  row[field] = value;
  saveRows();
  renderDashboard();
}

function renderDashboard() {
  let revenue = 0;
  let profit = 0;
  let soldBuyCost = 0;
  let stockValue = 0;
  let soldCount = 0;
  let stockCount = 0;
  let daysSoldTotal = 0;

  rows.forEach(row => {
    const buyCost = Number(row.buyCost || 0);
    if (row.status === 'Venduto') {
      const salePrice = Number(row.soldPrice || 0);
      const rowProfit = profitForSale({
        salePrice,
        buyCost,
        buyerShipping: Number(row.buyerShipping || params.defaultBuyerShipping),
        realShipping: Number(row.realShipping || params.defaultRealShipping),
        packCost: Number(row.packCost || params.defaultPackCost),
        promoPct: Number(row.promoPct || 0)
      });
      revenue += salePrice;
      profit += rowProfit;
      soldBuyCost += buyCost;
      soldCount += 1;
      daysSoldTotal += daysBetween(row.purchaseDate, row.saleDate);
    } else {
      stockValue += buyCost;
      stockCount += 1;
    }
  });

  const roi = soldBuyCost > 0 ? profit / soldBuyCost * 100 : 0;
  document.getElementById('kpiRevenue').textContent = euro(revenue);
  document.getElementById('kpiProfit').textContent = euro(profit);
  document.getElementById('kpiRoi').textContent = pct(roi);
  document.getElementById('kpiStock').textContent = euro(stockValue);

  document.getElementById('performanceList').innerHTML = `
    <div><span>Pezzi venduti</span><strong>${soldCount}</strong></div>
    <div><span>Pezzi in stock</span><strong>${stockCount}</strong></div>
    <div><span>Budget residuo stimato</span><strong>${euro(params.budget - stockValue)}</strong></div>
    <div><span>Giorni medi vendita</span><strong>${soldCount ? Math.round(daysSoldTotal / soldCount) : 0}</strong></div>
  `;

  renderAlerts();
}

function renderAlerts() {
  const tbody = document.getElementById('alertsBody');
  const alerts = rows
    .filter(r => r.status !== 'Venduto')
    .map(r => {
      const salePrice = Number(r.listingPrice || 0);
      const profit = profitForSale({
        salePrice,
        buyCost: Number(r.buyCost || 0),
        buyerShipping: Number(r.buyerShipping || params.defaultBuyerShipping),
        realShipping: Number(r.realShipping || params.defaultRealShipping),
        packCost: Number(r.packCost || params.defaultPackCost),
        promoPct: Number(r.promoPct || 0)
      });
      const days = daysBetween(r.purchaseDate, '');
      const action = days >= params.liquidationDays ? 'Liquidare/scontare' : profit < params.minProfit ? 'Alzare prezzo o scartare' : 'Tenere online';
      return { ...r, profit, days, action };
    })
    .filter(r => r.days >= params.liquidationDays || r.profit < params.minProfit)
    .sort((a,b) => b.days - a.days)
    .slice(0, 8);

  if (!alerts.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">Nessun alert critico.</td></tr>`;
    return;
  }

  tbody.innerHTML = alerts.map(r => `
    <tr>
      <td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.category)}</td><td><span class="status-pill stock">${escapeHtml(r.status)}</span></td><td>${r.days}</td><td>${euro(r.profit)}</td><td>${escapeHtml(r.action)}</td>
    </tr>
  `).join('');
}

function saveCalcToDb() {
  if (!lastCalc) runCalc();
  const row = {
    id: crypto.randomUUID(),
    name: lastCalc.name,
    category: lastCalc.category,
    status: 'Stock',
    buyCost: round2(lastCalc.allIn),
    listingPrice: round2(lastCalc.listingPrice),
    soldPrice: 0,
    buyerShipping: lastCalc.buyerShipping,
    realShipping: lastCalc.realShipping,
    packCost: lastCalc.packCost,
    promoPct: lastCalc.promoPct,
    purchaseDate: new Date().toISOString().slice(0, 10),
    saleDate: '',
    notes: `${lastCalc.decision} · ${lastCalc.reason}`
  };
  rows.unshift(row);
  saveRows();
  renderDatabase();
  renderDashboard();
  toast('Salvato nel database.');
}

function addManualRow() {
  rows.unshift({
    id: crypto.randomUUID(), name: 'Nuovo prodotto', category: CATEGORIES[0].name, status: 'Stock',
    buyCost: 0, listingPrice: 0, soldPrice: 0, buyerShipping: params.defaultBuyerShipping,
    realShipping: params.defaultRealShipping, packCost: params.defaultPackCost, promoPct: 0,
    purchaseDate: new Date().toISOString().slice(0, 10), saleDate: '', notes: ''
  });
  saveRows(); renderDatabase(); renderDashboard(); toast('Riga aggiunta.');
}

function exportCsv() {
  const headers = ['Prodotto','Categoria','Status','Acquisto all-in','Prezzo listino','Prezzo vendita','Spedizione buyer','Spedizione reale','Imballo','Promo %','Utile netto','ROI %','Data acquisto','Data vendita','Giorni','Note'];
  const lines = [headers.join(';')];
  rows.forEach(r => {
    const salePrice = r.status === 'Venduto' ? Number(r.soldPrice || 0) : Number(r.listingPrice || 0);
    const profit = profitForSale({ salePrice, buyCost: Number(r.buyCost || 0), buyerShipping: Number(r.buyerShipping || params.defaultBuyerShipping), realShipping: Number(r.realShipping || params.defaultRealShipping), packCost: Number(r.packCost || params.defaultPackCost), promoPct: Number(r.promoPct || 0) });
    const roi = roiForSale(profit, Number(r.buyCost || 0));
    const values = [r.name, r.category, r.status, r.buyCost, r.listingPrice, r.soldPrice, r.buyerShipping, r.realShipping, r.packCost, r.promoPct, round2(profit), round2(roi), r.purchaseDate, r.saleDate, daysBetween(r.purchaseDate, r.saleDate), r.notes].map(csvCell);
    lines.push(values.join(';'));
  });
  downloadFile('flipmate_database.csv', lines.join('\n'), 'text/csv;charset=utf-8');
}

function exportJson() {
  const payload = { version: 1, exportedAt: new Date().toISOString(), params, rows };
  downloadFile('flipmate_backup.json', JSON.stringify(payload, null, 2), 'application/json');
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (!payload || !Array.isArray(payload.rows)) throw new Error('Formato non valido');
      rows = payload.rows;
      params = { ...DEFAULT_PARAMS, ...(payload.params || {}) };
      saveRows(); saveParams();
      renderParams(); hydrateCalcDefaults(true); runCalc(); renderDatabase(); renderDashboard();
      toast('Backup importato.');
    } catch (err) {
      toast('Import fallito: file JSON non valido.');
    }
  };
  reader.readAsText(file);
}

function copyCalc() {
  if (!lastCalc) runCalc();
  const text = [
    `Prodotto: ${lastCalc.name}`,
    `Decisione: ${lastCalc.decision}`,
    `Costo Vinted all-in: ${euro(lastCalc.allIn)}`,
    `Prezzo annuncio: ${euro(lastCalc.listingPrice)}`,
    `Offerta minima: ${euro(lastCalc.minOffer)}`,
    `Max prezzo Vinted: ${euro(lastCalc.maxVinted)}`,
    `Utile stimato: ${euro(lastCalc.expectedProfit)} / ROI ${pct(lastCalc.expectedRoi)}`
  ].join('\n');
  navigator.clipboard?.writeText(text).then(() => toast('Sintesi copiata.')).catch(() => toast('Copia non disponibile.'));
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const clean = String(value ?? '').replaceAll('"', '""');
  return `"${clean}"`;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.id === tabId));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetCalc() {
  setValue('calcName', '');
  setValue('soldAvg', 40);
  setValue('vintedPrice', 20);
  hydrateCalcDefaults(true);
  runCalc();
}

function initEvents() {
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  document.querySelectorAll('[data-tab-jump]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tabJump)));
  document.getElementById('jumpToCalc').addEventListener('click', () => switchTab('calculator'));
  document.getElementById('calcForm').addEventListener('input', runCalc);
  document.getElementById('saveFromCalc').addEventListener('click', saveCalcToDb);
  document.getElementById('copyCalc').addEventListener('click', copyCalc);
  document.getElementById('resetCalc').addEventListener('click', resetCalc);
  document.getElementById('resetParams').addEventListener('click', () => {
    params = { ...DEFAULT_PARAMS };
    saveParams(); renderParams(); hydrateCalcDefaults(true); runCalc(); renderDashboard(); renderDatabase(); toast('Parametri ripristinati.');
  });
  document.getElementById('addManual').addEventListener('click', addManualRow);
  document.getElementById('clearDb').addEventListener('click', () => {
    if (!confirm('Vuoi davvero svuotare il database locale?')) return;
    rows = []; saveRows(); renderDatabase(); renderDashboard(); toast('Database svuotato.');
  });
  document.getElementById('seedDemo').addEventListener('click', () => {
    rows = [...DEMO_ROWS, ...rows]; saveRows(); renderDatabase(); renderDashboard(); toast('Dati demo caricati.');
  });
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
  document.getElementById('exportJson').addEventListener('click', exportJson);
  document.getElementById('importJson').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) importJson(file);
    e.target.value = '';
  });
}

function init() {
  renderCategories();
  renderParams();
  hydrateCalcDefaults(true);
  initEvents();
  runCalc();
  renderDatabase();
  renderDashboard();
}

init();
