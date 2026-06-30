(() => {
  const $ = (id) => document.getElementById(id);
  const page = document.body?.dataset?.page || 'landing';
  const fmt = (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(+n) ? +n : 0);
  const pct = (n) => `${(Number.isFinite(+n) ? +n : 0).toFixed(1).replace('.', ',')}%`;
  const num = (id) => parseFloat($(id)?.value || '0') || 0;
  const val = (id) => $(id)?.value || '';
  const toast = (msg) => { const t = $('toast'); if (!t) return alert(msg); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => t.classList.add('hidden'), 3800); };

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
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function modeLabel(mode) {
    return ({ vinted: 'Solo Vinted', ebay: 'Solo eBay', vinted_ebay: 'Vinted + eBay' })[mode] || 'Vinted + eBay';
  }

  function statusLabel(status) {
    return ({ watchlist:'Da valutare', in_stock:'In stock', listed:'In vendita', sold:'Venduto', archived:'Archiviato' })[status] || status || 'Da valutare';
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

    const grossReceived = salePrice + (mode === 'ebay' || mode === 'vinted_ebay' ? buyerShipping : 0);
    const ebayFees = (mode === 'ebay' || mode === 'vinted_ebay') ? grossReceived * (ebayFeePct + regPct) / 100 + ebayFixed : 0;
    const shippingCost = realShipping;
    const profit = salePrice + ((mode === 'ebay' || mode === 'vinted_ebay') ? buyerShipping : 0) - ebayFees - purchasePrice - purchaseShipping - vintedBuyingFee - shippingCost - packCost;
    const roi = allIn > 0 ? (profit / allIn) * 100 : 0;

    const fair = salePrice * 0.9;
    const listing = mode === 'vinted' ? salePrice : salePrice * 1.08;
    const minOffer = mode === 'vinted' ? salePrice * 0.93 : salePrice * 0.95;
    const breakEven = salePrice - profit;
    const maxBuy = Math.max(0, purchasePrice + profit - Math.max(minProfit, allIn * targetRoi / 100));

    let decision = 'SCARTA';
    let reason = 'Margine sotto soglia.';
    if (profit >= minProfit && roi >= targetRoi) { decision = 'COMPRA'; reason = 'Utile e ROI sopra target.'; }
    else if (profit > 0 && roi > 10) { decision = 'TRATTA'; reason = 'Margine positivo ma serve prezzo migliore.'; }
    return { allIn, fair, listing, minOffer, breakEven, maxBuy, profit, roi, decision, reason, mode, salePrice };
  }

  function landingInit() {
    const start = () => {
      const payload = {
        mode: val('leadMode'),
        productName: val('leadProductName'),
        category: val('leadCategory'),
        purchasePrice: num('leadPurchasePrice'),
        purchaseShipping: num('leadPurchaseShipping'),
        salePrice: num('leadSalePrice'),
        realShipping: num('leadRealShipping'),
        packCost: num('leadPackCost'),
        buyerShipping: val('leadMode') === 'vinted' ? 0 : 6.5,
        ebayFeePct: val('leadMode') === 'vinted' ? 0 : 5,
        regPct: val('leadMode') === 'vinted' ? 0 : 0.43,
        ebayFixed: val('leadMode') === 'vinted' ? 0 : 0.35,
        vintedPct: val('leadMode') === 'vinted_ebay' ? 5 : 0,
        vintedFixed: val('leadMode') === 'vinted_ebay' ? 0.70 : 0
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
      $('authPurpose').value = pending.mode || 'vinted_ebay';
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
  }

  function getPendingCalc() {
    try { return JSON.parse(sessionStorage.getItem('flipmate_pending_calc') || 'null'); } catch { return null; }
  }

  function fillFormFromPayload(p) {
    if (!p) return;
    const map = {
      analysisMode:p.mode, productName:p.productName, category:p.category, purchasePrice:p.purchasePrice,
      purchaseShipping:p.purchaseShipping, salePrice:p.salePrice, realShipping:p.realShipping, packCost:p.packCost,
      buyerShipping:p.buyerShipping, ebayFeePct:p.ebayFeePct, regPct:p.regPct, ebayFixed:p.ebayFixed,
      vintedPct:p.vintedPct, vintedFixed:p.vintedFixed
    };
    Object.entries(map).forEach(([id,v]) => { if ($(id) && v !== undefined && v !== null) $(id).value = v; });
  }

  function applyPendingCalc() {
    const pending = getPendingCalc();
    if (!pending) return;
    fillFormFromPayload(pending);
    sessionStorage.removeItem('flipmate_pending_calc');
    showSection('calculator');
    toast('Risultato della prova caricato. Ora puoi salvarlo nel database.');
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
    } else profile = data;
  }

  async function applyProfileToUi() {
    const user = session?.user;
    const name = profile?.username || user?.email?.split('@')[0] || 'Account';
    $('accountButton').textContent = name;
    $('welcomeTitle').textContent = `Ciao, ${name}`;
    $('accountStatus').textContent = `Accesso eseguito come ${user?.email || ''}. Piano: ${profile?.plan || 'free'}.`;
    $('profilePurpose').value = profile?.purpose || 'vinted_ebay';
    $('analysisMode').value = profile?.purpose || 'vinted_ebay';
    $('profileUsername').value = name;
    $('profileEmail').value = user?.email || '';
    $('planStatus').textContent = `Piano attuale: ${(profile?.plan || 'free').toUpperCase()}`;
    applyModeFields();
  }

  function currentInput() {
    return {
      mode: val('analysisMode'), productName: val('productName'), category: val('category'), status: val('status'),
      purchasePrice: num('purchasePrice'), purchaseShipping: num('purchaseShipping'), vintedPct: num('vintedPct'), vintedFixed: num('vintedFixed'),
      salePrice: num('salePrice'), buyerShipping: num('buyerShipping'), realShipping: num('realShipping'), packCost: num('packCost'),
      ebayFeePct: num('ebayFeePct'), regPct: num('regPct'), ebayFixed: num('ebayFixed'), notes: val('notes')
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
    const email = val('authEmail'); const password = val('authPassword');
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
    const email = val('authEmail'); const password = val('authPassword');
    if (!email || !password) return toast('Inserisci email e password.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message);
    session = data.session;
    toast('Accesso eseguito.');
    await showApp();
  }

  async function upsertProfile() {
    const user = session?.user; if (!user) return;
    const username = val('authUsername') || user.email?.split('@')[0] || 'utente';
    const purpose = val('authPurpose') || 'vinted_ebay';
    const { error } = await supabase.from('profiles').upsert({ user_id:user.id, username, purpose, plan:'free' });
    if (error) toast(`Profilo non salvato: ${error.message}`);
  }

  async function saveProduct() {
    if (!session) return showAuthGate();
    const calc = renderCalculation(); if (!calc) return;
    const { input, out } = calc;
    const row = {
      product_name: input.productName || 'Prodotto', category: input.category, source_platform: input.mode,
      analysis_mode: input.mode, status: input.status || 'watchlist', purchase_price: input.purchasePrice,
      purchase_shipping: input.purchaseShipping, buyer_shipping: input.buyerShipping, real_shipping: input.realShipping,
      packaging_cost: input.packCost, sold_avg_price: input.salePrice, all_in_cost: out.allIn, fair_value: out.fair,
      listing_price: out.listing, min_offer: out.minOffer, break_even: out.breakEven, max_buy_price: out.maxBuy,
      profit: out.profit, roi: out.roi, decision: out.decision, sale_price: input.status === 'sold' ? input.salePrice : null, notes: input.notes
    };
    const { error } = await supabase.from('products').insert(row);
    if (error) return toast(`Errore salvataggio: ${error.message}`);
    toast('Prodotto salvato nel database.');
    await loadDb();
  }

  async function loadDb() {
    if (!session) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending:false });
    if (error) return toast(`Errore caricamento DB: ${error.message}`);
    dbCache = data || [];
    renderDb(); renderKpis();
  }

  function renderDb() {
    const body = $('dbRows'); if (!body) return;
    body.innerHTML = '';
    if (!dbCache.length) { body.innerHTML = '<tr><td colspan="11">Nessun prodotto salvato.</td></tr>'; return; }
    dbCache.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(row.created_at).toLocaleDateString('it-IT')}</td>
        <td>${escapeHtml(row.product_name)}</td>
        <td>${modeLabel(row.analysis_mode || row.source_platform)}</td>
        <td>${escapeHtml(row.category || '')}</td>
        <td><span class="status-pill">${statusLabel(row.status)}</span></td>
        <td>${fmt(row.all_in_cost)}</td>
        <td>${fmt(row.listing_price || row.sold_avg_price)}</td>
        <td>${fmt(row.profit)}</td>
        <td>${pct(row.roi)}</td>
        <td>${escapeHtml(row.decision || '')}</td>
        <td><button class="btn small danger" data-delete="${row.id}">Elimina</button></td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete');
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return toast(error.message);
      toast('Riga eliminata.'); await loadDb();
    }));
  }

  function renderKpis() {
    const items = dbCache.length;
    const stock = dbCache.filter(x => ['in_stock','listed'].includes(x.status)).length;
    const profit = dbCache.reduce((a,b) => a + (+b.profit || 0), 0);
    const avgRoi = items ? dbCache.reduce((a,b) => a + (+b.roi || 0), 0) / items : 0;
    if ($('kpiItems')) $('kpiItems').textContent = items;
    if ($('kpiStock')) $('kpiStock').textContent = stock;
    if ($('kpiProfit')) $('kpiProfit').textContent = fmt(profit);
    if ($('kpiRoi')) $('kpiRoi').textContent = pct(avgRoi);
  }

  function escapeHtml(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function exportCurrentCsv() {
    const calc = renderCalculation(); if (!calc) return;
    const { input, out } = calc;
    downloadCsv('flipmate-prodotto.csv', [
      ['prodotto','modalita','categoria','costo_all_in','prezzo_annuncio','offerta_minima','break_even','utile','roi','decisione'],
      [input.productName, modeLabel(input.mode), input.category, out.allIn, out.listing, out.minOffer, out.breakEven, out.profit, out.roi, out.decision]
    ]);
  }

  function exportDbCsv() {
    const rows = [['data','prodotto','modalita','categoria','stato','costo_all_in','prezzo_annuncio','utile','roi','decisione','note']];
    dbCache.forEach(r => rows.push([r.created_at, r.product_name, modeLabel(r.analysis_mode || r.source_platform), r.category, statusLabel(r.status), r.all_in_cost, r.listing_price, r.profit, r.roi, r.decision, r.notes]));
    downloadCsv('flipmate-database.csv', rows);
  }

  function showSection(name) {
    ['calculator','database','dashboard','settings'].forEach(s => $(s + 'Section')?.classList.toggle('hidden', s !== name));
  }

  async function saveProfileSettings() {
    const user = session?.user; if (!user) return;
    const username = val('profileUsername') || user.email?.split('@')[0];
    const purpose = val('profilePurpose') || 'vinted_ebay';
    const { data, error } = await supabase.from('profiles').upsert({ user_id:user.id, username, purpose, plan:profile?.plan || 'free' }).select('*').single();
    if (error) return toast(error.message);
    profile = data; await applyProfileToUi(); toast('Profilo aggiornato.');
  }

  async function changeEmail() {
    const email = val('newEmail'); if (!email) return toast('Inserisci nuova email.');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return toast(error.message);
    toast('Richiesta cambio email inviata. Controlla la posta.');
  }

  async function resetPassword() {
    const email = session?.user?.email || val('authEmail'); if (!email) return toast('Email non disponibile.');
    const redirectTo = location.origin + location.pathname;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return toast(error.message);
    toast('Email reset password inviata.');
  }

  function resetCalculator() {
    ['productName','purchasePrice','purchaseShipping','salePrice','buyerShipping','realShipping','packCost','notes'].forEach(id => { if ($(id)) $(id).value = id === 'productName' ? '' : ''; });
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
    $('copySummary')?.addEventListener('click', async () => { const c = renderCalculation(); if (!c) return; await navigator.clipboard.writeText(`${c.input.productName}: ${c.out.decision}, utile ${fmt(c.out.profit)}, ROI ${pct(c.out.roi)}`); toast('Sintesi copiata.'); });
    $('analysisMode')?.addEventListener('change', applyModeFields);
    $('savePurpose')?.addEventListener('click', saveProfileSettings);
    $('saveProfile')?.addEventListener('click', saveProfileSettings);
    $('changeEmail')?.addEventListener('click', changeEmail);
    $('resetPassword')?.addEventListener('click', resetPassword);
    $('accountButton')?.addEventListener('click', () => showSection('settings'));
    $('resetCalculator')?.addEventListener('click', resetCalculator);
    document.querySelectorAll('[data-app-section]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.appSection)));
    document.querySelectorAll('#calculatorForm input,#calculatorForm select,#calculatorForm textarea').forEach(el => el.addEventListener('input', renderCalculation));
    $('profilePurpose')?.addEventListener('change', () => { if ($('analysisMode')) { $('analysisMode').value = val('profilePurpose'); applyModeFields(); } });
  }

  if (page === 'landing') landingInit();
  if (page === 'app') appInit();
})();
