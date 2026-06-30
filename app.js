(() => {
  const $ = (id) => document.getElementById(id);
  const page = document.body?.dataset?.page || 'landing';
  const fmt = (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(+n) ? +n : 0);
  const pct = (n) => `${(Number.isFinite(+n) ? +n : 0).toFixed(1).replace('.', ',')}%`;
  const num = (id) => parseFloat($(id)?.value || '0') || 0;
  const val = (id) => $(id)?.value || '';
  const toast = (msg) => {
    const t = $('toast');
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.add('hidden'), 4200);
  };

  function csvSafe(value) {
    const s = String(value ?? '').replace(/\r?\n/g, ' ').trim();
    const hardened = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${hardened.replace(/"/g, '""')}"`;
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map(r => r.map(csvSafe).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function modeLabel(mode) {
    return ({ vinted: 'Solo Vinted', ebay: 'Solo eBay', vinted_ebay: 'Vinted + eBay' })[mode] || 'Vinted + eBay';
  }

  function statusLabel(status) {
    return ({ watchlist:'Da valutare', in_stock:'In stock', listed:'In vendita', sold:'Venduto', archived:'Archiviato' })[status] || status || 'Da valutare';
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function calculate(input) {
    const mode = input.mode || 'vinted_ebay';
    const purchasePrice = +input.purchasePrice || 0;
    const purchaseShipping = +input.purchaseShipping || 0;
    const salePrice = +input.salePrice || 0;
    const buyerShipping = +input.buyerShipping || 0;
    const realShipping = +input.realShipping || 0;
    const packCost = +input.packCost || 0;
    const ebayFeePct = +input.ebayFeePct || 0;
    const regPct = +input.regPct || 0;
    const ebayFixed = +input.ebayFixed || 0;
    const vintedPct = +input.vintedPct || 0;
    const vintedFixed = +input.vintedFixed || 0;
    const targetRoi = 25;
    const minProfit = 10;

    const vintedBuyingFee = mode === 'vinted_ebay' ? purchasePrice * vintedPct / 100 + vintedFixed : 0;
    const allIn = purchasePrice + purchaseShipping + vintedBuyingFee + packCost;

    const isEbaySale = mode === 'ebay' || mode === 'vinted_ebay';
    const grossReceived = salePrice + (isEbaySale ? buyerShipping : 0);
    const ebayFees = isEbaySale ? grossReceived * (ebayFeePct + regPct) / 100 + ebayFixed : 0;
    const profit = grossReceived - ebayFees - purchasePrice - purchaseShipping - vintedBuyingFee - realShipping - packCost;
    const roi = allIn > 0 ? (profit / allIn) * 100 : 0;

    const fair = salePrice * 0.9;
    const listing = mode === 'vinted' ? salePrice : salePrice * 1.08;
    const minOffer = mode === 'vinted' ? salePrice * 0.93 : salePrice * 0.95;
    const breakEven = salePrice - profit;
    const maxBuy = Math.max(0, purchasePrice + profit - Math.max(minProfit, allIn * targetRoi / 100));

    let decision = 'SCARTA';
    let reason = 'Margine sotto soglia.';
    if (profit >= minProfit && roi >= targetRoi) {
      decision = 'COMPRA';
      reason = 'Utile e ROI sopra target.';
    } else if (profit > 0 && roi > 10) {
      decision = 'TRATTA';
      reason = 'Margine positivo ma serve prezzo migliore.';
    }

    const netSale = profit + allIn - packCost;
    return { allIn, fair, listing, minOffer, breakEven, maxBuy, profit, roi, decision, reason, mode, salePrice, grossReceived, ebayFees, vintedBuyingFee, netSale };
  }

  function landingInit() {
    const start = () => {
      const leadMode = val('leadMode');
      const payload = {
        mode: leadMode,
        productName: val('leadProductName'),
        category: val('leadCategory'),
        purchasePrice: num('leadPurchasePrice'),
        purchaseShipping: num('leadPurchaseShipping'),
        salePrice: num('leadSalePrice'),
        realShipping: num('leadRealShipping'),
        packCost: num('leadPackCost'),
        buyerShipping: leadMode === 'vinted' ? 0 : 6.5,
        ebayFeePct: leadMode === 'vinted' ? 0 : 5,
        regPct: leadMode === 'vinted' ? 0 : 0.43,
        ebayFixed: leadMode === 'vinted' ? 0 : 0.35,
        vintedPct: leadMode === 'vinted_ebay' ? 5 : 0,
        vintedFixed: leadMode === 'vinted_ebay' ? 0.70 : 0
      };
      sessionStorage.setItem('flipmate_pending_calc', JSON.stringify(payload));
      location.href = 'app.html?auth=signup&pending=1';
    };
    $('startFreeTrial')?.addEventListener('click', start);
    $('startFreeTrial2')?.addEventListener('click', start);
  }

  let supabase = null;
  let session = null;
  let profile = null;
  let dbCache = [];
  let filteredDbCache = [];

  function ensureSupabase() {
    const url = window.FLIPMATE_SUPABASE_URL;
    const key = window.FLIPMATE_SUPABASE_ANON_KEY;
    if (!url || !key || !window.supabase) return null;
    return window.supabase.createClient(url, key);
  }

  async function appInit() {
    supabase = ensureSupabase();
    if (!supabase) {
      $('authGate')?.classList.remove('hidden');
      toast('Supabase non configurato: account e database non disponibili.');
      return;
    }

    bindAppEvents();
    const { data } = await supabase.auth.getSession();
    session = data.session;
    if (!session) showAuthGate(); else await showApp();

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session = newSession;
      if (session) await showApp(); else showAuthGate();
    });
  }

  function showAuthGate() {
    $('authGate')?.classList.remove('hidden');
    $('appShell')?.classList.add('hidden');
    $('accountButton')?.classList.add('hidden');
    const pending = getPendingCalc();
    if (pending) {
      $('pendingTitle').textContent = `Calcolo in attesa: ${pending.productName || 'Prodotto'}`;
      $('pendingText').textContent = `Modalità: ${modeLabel(pending.mode)}. Registrati o accedi per vedere il risultato completo.`;
      if ($('authPurpose')) $('authPurpose').value = pending.mode || 'vinted_ebay';
    }
  }

  async function showApp() {
    $('authGate')?.classList.add('hidden');
    $('appShell')?.classList.remove('hidden');
    $('accountButton')?.classList.remove('hidden');
    await loadProfile();
    await applyProfileToUi();
    applyPendingCalc();
    renderCalculation();
    await loadDb();
    showSection('dashboard');
  }

  function getPendingCalc() {
    try { return JSON.parse(sessionStorage.getItem('flipmate_pending_calc') || 'null'); } catch { return null; }
  }

  function fillFormFromPayload(p) {
    if (!p) return;
    const map = {
      analysisMode:p.mode,
      productName:p.productName,
      category:p.category,
      purchasePrice:p.purchasePrice,
      purchaseShipping:p.purchaseShipping,
      salePrice:p.salePrice,
      realShipping:p.realShipping,
      packCost:p.packCost,
      buyerShipping:p.buyerShipping,
      ebayFeePct:p.ebayFeePct,
      regPct:p.regPct,
      ebayFixed:p.ebayFixed,
      vintedPct:p.vintedPct,
      vintedFixed:p.vintedFixed
    };
    Object.entries(map).forEach(([id,v]) => { if ($(id) && v !== undefined && v !== null) $(id).value = v; });
    if ($('status')) $('status').value = 'in_stock';
  }

  function applyPendingCalc() {
    const pending = getPendingCalc();
    if (!pending) return;
    fillFormFromPayload(pending);
    sessionStorage.removeItem('flipmate_pending_calc');
    showSection('calculator');
    toast('Risultato della prova caricato. Per salvarlo, lo stato deve essere In stock.');
  }

  async function loadProfile() {
    const user = session?.user;
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (error || !data) {
      const fallbackUsername = user.email?.split('@')[0] || 'utente';
      const purpose = val('authPurpose') || 'vinted_ebay';
      const insert = { user_id: user.id, username: fallbackUsername, purpose, plan: 'free' };
      const res = await supabase.from('profiles').insert(insert).select('*').single();
      profile = res.data || insert;
    } else {
      profile = data;
    }
  }

  async function applyProfileToUi() {
    const user = session?.user;
    const name = profile?.username || user?.email?.split('@')[0] || 'Account';
    if ($('accountButton')) $('accountButton').textContent = name;
    if ($('welcomeTitle')) $('welcomeTitle').textContent = `Ciao, ${name}`;
    if ($('accountStatus')) $('accountStatus').textContent = `Account: ${user?.email || ''}. Piano: ${profile?.plan || 'free'}.`;
    if ($('profilePurpose')) $('profilePurpose').value = profile?.purpose || 'vinted_ebay';
    if ($('analysisMode')) $('analysisMode').value = profile?.purpose || 'vinted_ebay';
    if ($('profileUsername')) $('profileUsername').value = name;
    if ($('profileEmail')) $('profileEmail').value = user?.email || '';
    if ($('planStatus')) $('planStatus').textContent = `Piano attuale: ${(profile?.plan || 'free').toUpperCase()}`;
    applyModeFields();
  }

  function currentInput() {
    return {
      mode: val('analysisMode'),
      productName: val('productName'),
      category: val('category'),
      status: val('status'),
      purchasePrice: num('purchasePrice'),
      purchaseShipping: num('purchaseShipping'),
      vintedPct: num('vintedPct'),
      vintedFixed: num('vintedFixed'),
      salePrice: num('salePrice'),
      buyerShipping: num('buyerShipping'),
      realShipping: num('realShipping'),
      packCost: num('packCost'),
      ebayFeePct: num('ebayFeePct'),
      regPct: num('regPct'),
      ebayFixed: num('ebayFixed'),
      notes: val('notes')
    };
  }

  function renderCalculation() {
    if (!$('decision')) return null;
    const input = currentInput();
    const out = calculate(input);
    $('decision').textContent = out.decision;
    $('decisionReason').textContent = out.reason;
    $('outAllIn').textContent = fmt(out.allIn);
    $('outFair').textContent = fmt(out.fair);
    $('outListing').textContent = fmt(out.listing);
    $('outMinOffer').textContent = fmt(out.minOffer);
    $('outBreakEven').textContent = fmt(out.breakEven);
    $('outMaxBuy').textContent = fmt(out.maxBuy);
    $('outProfit').textContent = fmt(out.profit);
    $('outRoi').textContent = pct(out.roi);
    return { input, out };
  }

  function applyModeFields() {
    const mode = val('analysisMode') || 'vinted_ebay';
    document.querySelectorAll('[data-mode-field="ebaySell"]').forEach(el => el.classList.toggle('hidden', mode === 'vinted'));
    document.querySelectorAll('[data-mode-field="vintedBuy"]').forEach(el => el.classList.toggle('hidden', mode !== 'vinted_ebay'));
    if (mode === 'vinted') {
      ['buyerShipping','ebayFeePct','regPct','ebayFixed','vintedPct','vintedFixed'].forEach(id => { if ($(id)) $(id).value = 0; });
    }
    if (mode === 'ebay') {
      ['vintedPct','vintedFixed'].forEach(id => { if ($(id)) $(id).value = 0; });
    }
    renderCalculation();
  }

  async function signUp() {
    const email = val('authEmail');
    const password = val('authPassword');
    if (!email || !password) return toast('Inserisci email e password.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return toast(error.message);
    session = data.session;
    if (!session) return toast('Registrazione creata. Controlla eventuale email di conferma, poi accedi.');
    await upsertProfile();
    toast('Registrazione completata.');
    await showApp();
  }

  async function login() {
    const email = val('authEmail');
    const password = val('authPassword');
    if (!email || !password) return toast('Inserisci email e password.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message);
    session = data.session;
    toast('Accesso eseguito.');
    await showApp();
  }

  async function upsertProfile() {
    const user = session?.user;
    if (!user) return;
    const username = val('authUsername') || user.email?.split('@')[0] || 'utente';
    const purpose = val('authPurpose') || 'vinted_ebay';
    const { error } = await supabase.from('profiles').upsert({ user_id:user.id, username, purpose, plan:'free' });
    if (error) toast(`Profilo non salvato: ${error.message}`);
  }

  async function saveProduct() {
    if (!session) return showAuthGate();
    const calc = renderCalculation();
    if (!calc) return;
    const { input, out } = calc;

    if (input.status !== 'in_stock') {
      return toast('Errore: per aggiungere un prodotto al database devi selezionare Stato = In stock. Gli altri stati si aggiornano dopo dal Database.');
    }

    const row = {
      product_name: input.productName || 'Prodotto',
      category: input.category,
      source_platform: input.mode,
      analysis_mode: input.mode,
      status: 'in_stock',
      purchase_price: input.purchasePrice,
      purchase_shipping: input.purchaseShipping,
      buyer_shipping: input.buyerShipping,
      real_shipping: input.realShipping,
      packaging_cost: input.packCost,
      sold_avg_price: input.salePrice,
      all_in_cost: out.allIn,
      fair_value: out.fair,
      listing_price: out.listing,
      min_offer: out.minOffer,
      break_even: out.breakEven,
      max_buy_price: out.maxBuy,
      profit: out.profit,
      roi: out.roi,
      decision: out.decision,
      sale_price: null,
      sale_date: null,
      notes: input.notes
    };
    const { error } = await supabase.from('products').insert(row);
    if (error) return toast(`Errore salvataggio: ${error.message}`);
    toast('Prodotto aggiunto allo stock.');
    await loadDb();
    showSection('database');
  }

  async function loadDb() {
    if (!session) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending:false });
    if (error) return toast(`Errore caricamento DB: ${error.message}`);
    dbCache = data || [];
    applyFilters();
    renderKpis();
    renderAnalytics();
  }

  function productSaleValue(row) {
    return +(row.sale_price ?? row.listing_price ?? row.sold_avg_price ?? 0) || 0;
  }

  function readRange(minId, maxId) {
    const minRaw = $(minId)?.value;
    const maxRaw = $(maxId)?.value;
    return {
      min: minRaw === '' || minRaw == null ? -Infinity : parseFloat(minRaw),
      max: maxRaw === '' || maxRaw == null ? Infinity : parseFloat(maxRaw)
    };
  }

  function applyFilters() {
    const mode = val('filterMode') || 'all';
    const category = val('filterCategory') || 'all';
    const status = val('filterStatus') || 'all';
    const sale = readRange('filterSaleMin', 'filterSaleMax');
    const profit = readRange('filterProfitMin', 'filterProfitMax');
    const cost = readRange('filterCostMin', 'filterCostMax');

    filteredDbCache = dbCache.filter(row => {
      const rowMode = row.analysis_mode || row.source_platform || 'vinted_ebay';
      const rowSale = productSaleValue(row);
      const rowProfit = +row.profit || 0;
      const rowCost = +row.all_in_cost || +row.purchase_price || 0;
      if (mode !== 'all' && rowMode !== mode) return false;
      if (category !== 'all' && row.category !== category) return false;
      if (status !== 'all' && row.status !== status) return false;
      if (rowSale < sale.min || rowSale > sale.max) return false;
      if (rowProfit < profit.min || rowProfit > profit.max) return false;
      if (rowCost < cost.min || rowCost > cost.max) return false;
      return true;
    });
    renderDb();
  }

  function resetFilters() {
    ['filterMode','filterCategory','filterStatus'].forEach(id => { if ($(id)) $(id).value = 'all'; });
    ['filterSaleMin','filterSaleMax','filterProfitMin','filterProfitMax','filterCostMin','filterCostMax'].forEach(id => { if ($(id)) $(id).value = ''; });
    applyFilters();
  }

  function renderDb() {
    const body = $('dbRows');
    if (!body) return;
    body.innerHTML = '';
    if ($('filterCount')) $('filterCount').textContent = `${filteredDbCache.length} prodotti visualizzati su ${dbCache.length}`;
    if (!filteredDbCache.length) {
      body.innerHTML = '<tr><td colspan="11">Nessun prodotto trovato con questi filtri.</td></tr>';
      return;
    }

    filteredDbCache.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(row.created_at).toLocaleDateString('it-IT')}</td>
        <td>${escapeHtml(row.product_name)}</td>
        <td>${modeLabel(row.analysis_mode || row.source_platform)}</td>
        <td>${escapeHtml(row.category || '')}</td>
        <td>
          <select class="table-select" data-status-select="${row.id}">
            <option value="in_stock" ${row.status === 'in_stock' ? 'selected' : ''}>In stock</option>
            <option value="listed" ${row.status === 'listed' ? 'selected' : ''}>In vendita</option>
            <option value="sold" ${row.status === 'sold' ? 'selected' : ''}>Venduto</option>
            <option value="archived" ${row.status === 'archived' ? 'selected' : ''}>Archiviato</option>
          </select>
        </td>
        <td>${fmt(row.all_in_cost || row.purchase_price)}</td>
        <td>${fmt(productSaleValue(row))}</td>
        <td>${fmt(row.profit)}</td>
        <td>${pct(row.roi)}</td>
        <td>${escapeHtml(row.decision || '')}</td>
        <td>
          <div class="row-actions">
            <button class="btn small" data-update-status="${row.id}">Aggiorna</button>
            <button class="btn small danger" data-delete="${row.id}">Elimina</button>
          </div>
        </td>`;
      body.appendChild(tr);
    });

    body.querySelectorAll('[data-update-status]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-update-status');
      const select = body.querySelector(`[data-status-select="${id}"]`);
      const newStatus = select?.value || 'in_stock';
      await updateProductStatus(id, newStatus);
    }));

    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete');
      const ok = confirm('Eliminare definitivamente questo prodotto dal database?');
      if (!ok) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return toast(error.message);
      toast('Riga eliminata.');
      await loadDb();
    }));
  }

  async function updateProductStatus(id, status) {
    const payload = { status };
    if (status === 'sold') {
      const row = dbCache.find(x => x.id === id);
      payload.sale_date = row?.sale_date || new Date().toISOString().slice(0, 10);
      payload.sale_price = row?.sale_price || row?.sold_avg_price || row?.listing_price || null;
    }
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) return toast(`Errore aggiornamento stato: ${error.message}`);
    toast(`Stato aggiornato: ${statusLabel(status)}.`);
    await loadDb();
  }

  function renderKpis() {
    const items = dbCache.length;
    const stock = dbCache.filter(x => ['in_stock','listed'].includes(x.status)).length;
    const sold = dbCache.filter(x => x.status === 'sold');
    const profit = dbCache.reduce((a,b) => a + (+b.profit || 0), 0);
    const avgRoi = items ? dbCache.reduce((a,b) => a + (+b.roi || 0), 0) / items : 0;
    const gross = sold.reduce((a,b) => a + productSaleValue(b), 0);
    const net = sold.reduce((a,b) => a + netSaleValue(b), 0);
    const top = topCategoryByMargin();
    const sellThrough = items ? (sold.length / items) * 100 : 0;

    if ($('kpiItems')) $('kpiItems').textContent = items;
    if ($('kpiStock')) $('kpiStock').textContent = stock;
    if ($('kpiProfit')) $('kpiProfit').textContent = fmt(profit);
    if ($('kpiRoi')) $('kpiRoi').textContent = pct(avgRoi);
    if ($('kpiGrossRevenue')) $('kpiGrossRevenue').textContent = fmt(gross);
    if ($('kpiNetSales')) $('kpiNetSales').textContent = fmt(net);
    if ($('kpiTopCategory')) $('kpiTopCategory').textContent = top?.category || '—';
    if ($('kpiSellThrough')) $('kpiSellThrough').textContent = pct(sellThrough);
  }

  function netSaleValue(row) {
    return (+row.profit || 0) + (+row.all_in_cost || 0) - (+row.packaging_cost || 0);
  }

  function topCategoryByMargin() {
    const map = new Map();
    dbCache.forEach(row => {
      const cat = row.category || 'Altro';
      const curr = map.get(cat) || { category: cat, profit: 0, count: 0, revenue: 0 };
      curr.profit += +row.profit || 0;
      curr.revenue += productSaleValue(row);
      curr.count += 1;
      map.set(cat, curr);
    });
    return [...map.values()].sort((a,b) => b.profit - a.profit)[0] || null;
  }

  function exportCurrentCsv() {
    const calc = renderCalculation();
    if (!calc) return;
    const { input, out } = calc;
    downloadCsv('flipmate-prodotto.csv', [
      ['prodotto','modalita','categoria','stato','costo_all_in','prezzo_annuncio','offerta_minima','break_even','utile','roi','decisione'],
      [input.productName, modeLabel(input.mode), input.category, statusLabel(input.status), out.allIn, out.listing, out.minOffer, out.breakEven, out.profit, out.roi, out.decision]
    ]);
  }

  function exportDbCsv() {
    const source = filteredDbCache.length ? filteredDbCache : dbCache;
    const rows = [['data','prodotto','modalita','categoria','stato','costo_acquisto','prezzo_vendita','utile','roi','decisione','note']];
    source.forEach(r => rows.push([
      r.created_at,
      r.product_name,
      modeLabel(r.analysis_mode || r.source_platform),
      r.category,
      statusLabel(r.status),
      r.all_in_cost,
      productSaleValue(r),
      r.profit,
      r.roi,
      r.decision,
      r.notes
    ]));
    downloadCsv('flipmate-database-filtrato.csv', rows);
  }

  function showSection(name) {
    ['calculator','database','dashboard','settings'].forEach(s => $(s + 'Section')?.classList.toggle('hidden', s !== name));
    if (name === 'dashboard') renderAnalytics();
    if (name === 'database') applyFilters();
  }

  function chartClear(canvas) {
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9fb0c7';
    ctx.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
    return ctx;
  }

  function drawNoData(canvasId, text='Nessun dato disponibile') {
    const canvas = $(canvasId);
    const ctx = chartClear(canvas);
    if (!ctx) return;
    ctx.fillText(text, 24, 44);
  }

  function drawBarChart(canvasId, data, formatter = fmt) {
    const canvas = $(canvasId);
    const ctx = chartClear(canvas);
    if (!ctx) return;
    if (!data.length || data.every(d => !d.value)) return drawNoData(canvasId);
    const w = canvas.width;
    const h = canvas.height;
    const pad = 46;
    const max = Math.max(...data.map(d => Math.abs(d.value)), 1);
    const barW = Math.max(28, (w - pad * 2) / data.length * 0.58);
    data.forEach((d, i) => {
      const x = pad + i * ((w - pad * 2) / data.length) + barW * 0.25;
      const bh = Math.max(4, Math.abs(d.value) / max * (h - pad * 2));
      const y = h - pad - bh;
      const grad = ctx.createLinearGradient(0, y, 0, h - pad);
      grad.addColorStop(0, '#4ee6a8');
      grad.addColorStop(1, '#33baff');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, bh);
      ctx.fillStyle = '#f5f7fb';
      ctx.fillText(formatter(d.value), x, Math.max(18, y - 8));
      ctx.fillStyle = '#9fb0c7';
      ctx.fillText(String(d.label).slice(0, 14), x, h - 18);
    });
  }

  function drawLineChart(canvasId, data) {
    const canvas = $(canvasId);
    const ctx = chartClear(canvas);
    if (!ctx) return;
    if (data.length < 2) return drawNoData(canvasId, 'Servono almeno 2 periodi per vedere il trend');
    const w = canvas.width;
    const h = canvas.height;
    const pad = 46;
    const max = Math.max(...data.map(d => d.value), 1);
    const min = Math.min(...data.map(d => d.value), 0);
    const range = Math.max(max - min, 1);
    const point = (d, i) => ({
      x: pad + i * ((w - pad * 2) / (data.length - 1)),
      y: h - pad - ((d.value - min) / range) * (h - pad * 2)
    });
    ctx.strokeStyle = '#4ee6a8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const p = point(d, i);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    data.forEach((d, i) => {
      const p = point(d, i);
      ctx.fillStyle = '#33baff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9fb0c7';
      ctx.fillText(d.label, p.x - 18, h - 18);
      ctx.fillStyle = '#f5f7fb';
      ctx.fillText(fmt(d.value), p.x - 22, p.y - 12);
    });
  }

  function renderAnalytics() {
    if (!$('revenueChart')) return;
    const sold = dbCache.filter(x => x.status === 'sold');
    const gross = sold.reduce((a,b) => a + productSaleValue(b), 0);
    const net = sold.reduce((a,b) => a + netSaleValue(b), 0);
    drawBarChart('revenueChart', [
      { label: 'Ricavi lordi', value: gross },
      { label: 'Vendita netta', value: net }
    ]);

    const categories = new Map();
    dbCache.forEach(row => {
      const cat = row.category || 'Altro';
      const curr = categories.get(cat) || { label: cat, value: 0, count: 0, revenue: 0 };
      curr.value += +row.profit || 0;
      curr.revenue += productSaleValue(row);
      curr.count += 1;
      categories.set(cat, curr);
    });
    const catData = [...categories.values()].sort((a,b) => b.value - a.value).slice(0, 6);
    drawBarChart('categoryMarginChart', catData);
    renderCategoryRanking(catData);

    const monthly = new Map();
    dbCache.forEach(row => {
      const dt = new Date(row.sale_date || row.created_at);
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      const curr = monthly.get(key) || 0;
      monthly.set(key, curr + (+row.profit || 0));
    });
    const trend = [...monthly.entries()].sort(([a],[b]) => a.localeCompare(b)).slice(-8).map(([label, value]) => ({ label: label.slice(5), value }));
    drawLineChart('profitTrendChart', trend);
  }

  function renderCategoryRanking(data) {
    const box = $('categoryRanking');
    if (!box) return;
    if (!data.length) {
      box.innerHTML = '<p class="fineprint">Salva prodotti per vedere le categorie migliori.</p>';
      return;
    }
    box.innerHTML = data.map((d, i) => `
      <div class="ranking-row">
        <span>${i + 1}</span>
        <strong>${escapeHtml(d.label)}</strong>
        <em>${fmt(d.value)} margine · ${d.count} prodotti</em>
      </div>`).join('');
  }

  async function saveProfileSettings() {
    const user = session?.user;
    if (!user) return;
    const username = val('profileUsername') || user.email?.split('@')[0];
    const purpose = val('profilePurpose') || 'vinted_ebay';
    const { data, error } = await supabase.from('profiles').upsert({ user_id:user.id, username, purpose, plan:profile?.plan || 'free' }).select('*').single();
    if (error) return toast(error.message);
    profile = data;
    await applyProfileToUi();
    toast('Profilo aggiornato.');
  }

  async function changeEmail() {
    const email = val('newEmail');
    if (!email) return toast('Inserisci nuova email.');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return toast(error.message);
    toast('Richiesta cambio email inviata. Controlla la posta.');
  }

  async function resetPassword() {
    const email = session?.user?.email || val('authEmail');
    if (!email) return toast('Email non disponibile.');
    const redirectTo = location.origin + location.pathname;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return toast(error.message);
    toast('Email reset password inviata.');
  }

  function resetCalculator() {
    ['productName','purchasePrice','purchaseShipping','salePrice','buyerShipping','realShipping','packCost','notes'].forEach(id => { if ($(id)) $(id).value = id === 'productName' ? '' : ''; });
    if ($('status')) $('status').value = 'watchlist';
    renderCalculation();
  }

  function bindAppEvents() {
    $('signupBtn')?.addEventListener('click', signUp);
    $('loginBtn')?.addEventListener('click', login);
    $('logoutBtn')?.addEventListener('click', async () => { await supabase.auth.signOut(); toast('Logout eseguito.'); });
    $('saveToDb')?.addEventListener('click', saveProduct);
    $('refreshDb')?.addEventListener('click', loadDb);
    $('exportDbCsv')?.addEventListener('click', exportDbCsv);
    $('exportSingleCsv')?.addEventListener('click', exportCurrentCsv);
    $('copySummary')?.addEventListener('click', async () => {
      const c = renderCalculation();
      if (!c) return;
      await navigator.clipboard.writeText(`${c.input.productName}: ${c.out.decision}, utile ${fmt(c.out.profit)}, ROI ${pct(c.out.roi)}`);
      toast('Sintesi copiata.');
    });
    $('analysisMode')?.addEventListener('change', applyModeFields);
    $('savePurpose')?.addEventListener('click', saveProfileSettings);
    $('saveProfile')?.addEventListener('click', saveProfileSettings);
    $('changeEmail')?.addEventListener('click', changeEmail);
    $('resetPassword')?.addEventListener('click', resetPassword);
    $('accountButton')?.addEventListener('click', () => showSection('settings'));
    $('resetCalculator')?.addEventListener('click', resetCalculator);
    $('applyFilters')?.addEventListener('click', applyFilters);
    $('resetFilters')?.addEventListener('click', resetFilters);
    ['filterMode','filterCategory','filterStatus','filterSaleMin','filterSaleMax','filterProfitMin','filterProfitMax','filterCostMin','filterCostMax'].forEach(id => {
      $(id)?.addEventListener('input', applyFilters);
      $(id)?.addEventListener('change', applyFilters);
    });
    document.querySelectorAll('[data-app-section]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.appSection)));
    document.querySelectorAll('#calculatorForm input,#calculatorForm select,#calculatorForm textarea').forEach(el => { el.addEventListener('input', renderCalculation); el.addEventListener('change', renderCalculation); });
    $('profilePurpose')?.addEventListener('change', () => { if ($('analysisMode')) { $('analysisMode').value = val('profilePurpose'); applyModeFields(); } });
  }

  if (page === 'landing') landingInit();
  if (page === 'app') appInit();
})();
