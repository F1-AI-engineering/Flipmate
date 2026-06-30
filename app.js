(() => {
  const DEFAULTS = {
    targetRoi: 25,
    minProfit: 10,
    soldDiscount: 10,
    listingMarkup: 8,
    minOfferDiscount: 5
  };

  const state = {
    user: null,
    mode: 'local',
    db: [],
    lastCalc: null,
    supabase: null,
    pendingSave: false
  };

  const $ = (id) => document.getElementById(id);
  const money = (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(n) ? n : 0);
  const pct = (n) => `${(Number.isFinite(n) ? n : 0).toFixed(1).replace('.', ',')}%`;
  const num = (id) => parseFloat($(id)?.value || '0') || 0;
  const safe = (s) => String(s || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add('hidden'), 3400);
  }

  function readInputs() {
    return {
      product_name: $('productName').value.trim() || 'Prodotto senza nome',
      category: $('category').value,
      sold_avg: num('soldAvg'),
      vinted_price: num('vintedPrice'),
      vinted_shipping: num('vintedShipping'),
      buyer_shipping: num('buyerShipping'),
      real_shipping: num('realShipping'),
      packaging_cost: num('packCost'),
      ebay_fee_pct: num('ebayFeePct'),
      regulatory_fee_pct: num('regPct'),
      ebay_fixed_fee: num('ebayFixed'),
      vinted_fee_pct: num('vintedPct'),
      vinted_fixed_fee: num('vintedFixed')
    };
  }

  function calculate() {
    const i = readInputs();
    const vintedProtection = i.vinted_price * (i.vinted_fee_pct / 100) + i.vinted_fixed_fee;
    const allIn = i.vinted_price + i.vinted_shipping + vintedProtection;
    const fair = i.sold_avg * (1 - DEFAULTS.soldDiscount / 100);
    const listing = fair * (1 + DEFAULTS.listingMarkup / 100);
    const minOffer = fair * (1 - DEFAULTS.minOfferDiscount / 100);
    const grossReceived = minOffer + i.buyer_shipping;
    const ebayFees = grossReceived * ((i.ebay_fee_pct + i.regulatory_fee_pct) / 100) + i.ebay_fixed_fee;
    const profit = grossReceived - ebayFees - allIn - i.real_shipping - i.packaging_cost;
    const roi = allIn > 0 ? (profit / allIn) * 100 : 0;
    const breakEven = allIn + i.real_shipping + i.packaging_cost + i.ebay_fixed_fee;
    const maxBuy = Math.max(0, (grossReceived - ebayFees - i.real_shipping - i.packaging_cost - DEFAULTS.minProfit - i.vinted_shipping - i.vinted_fixed_fee) / (1 + i.vinted_fee_pct / 100));

    let decision = 'SCARTA';
    let cls = 'reject';
    let reason = `Margine insufficiente: utile ${money(profit)} e ROI ${pct(roi)}.`;
    if (profit >= DEFAULTS.minProfit && roi >= DEFAULTS.targetRoi) {
      decision = 'COMPRA'; cls = 'buy'; reason = `Numeri buoni: utile sopra ${money(DEFAULTS.minProfit)} e ROI sopra ${DEFAULTS.targetRoi}%.`;
    } else if (profit > 0 && roi >= 10) {
      decision = 'TRATTA'; cls = 'negotiate'; reason = `Margine presente ma sotto target. Prova a pagare massimo ${money(maxBuy)}.`;
    }

    const result = {
      ...i,
      all_in_cost: allIn,
      fair_value: fair,
      listing_price: listing,
      min_offer: minOffer,
      break_even: breakEven,
      max_buy_price: maxBuy,
      profit,
      roi,
      decision,
      created_at: new Date().toISOString()
    };
    state.lastCalc = result;
    renderResult(result, cls, reason);
    return result;
  }

  function renderResult(r, cls, reason) {
    $('decision').textContent = r.decision;
    $('decisionReason').textContent = reason;
    const box = $('verdictBox');
    box.className = `verdict ${cls}`;
    $('outAllIn').textContent = money(r.all_in_cost);
    $('outFair').textContent = money(r.fair_value);
    $('outListing').textContent = money(r.listing_price);
    $('outMinOffer').textContent = money(r.min_offer);
    $('outBreakEven').textContent = money(r.break_even);
    $('outMaxBuy').textContent = money(r.max_buy_price);
    $('outProfit').textContent = money(r.profit);
    $('outRoi').textContent = pct(r.roi);
  }

  function isSupabaseReady() {
    return Boolean(window.FLIPMATE_SUPABASE_URL && window.FLIPMATE_SUPABASE_ANON_KEY && window.FLIPMATE_SUPABASE_URL.includes('supabase.co') && window.supabase);
  }

  async function initSupabase() {
    if (!isSupabaseReady()) {
      state.mode = 'local';
      $('kpiSource').textContent = 'Privato';
      return;
    }
    state.supabase = window.supabase.createClient(window.FLIPMATE_SUPABASE_URL, window.FLIPMATE_SUPABASE_ANON_KEY);
    state.mode = 'cloud';
    $('kpiSource').textContent = 'Cloud';
    const { data } = await state.supabase.auth.getSession();
    if (data?.session?.user) setUser(data.session.user);
    state.supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }

  function setUser(user) {
    state.user = user;
    if (user) {
      $('appPanel').classList.remove('hidden');
      $('accountStatus').textContent = `Accesso eseguito: ${user.email || 'utente locale'}.`;
      $('logoutBtn').classList.remove('hidden');
      closeAuth();
      loadDb();
      if (state.pendingSave) {
        state.pendingSave = false;
        saveCurrentCalc();
      }
    } else {
      $('accountStatus').textContent = 'Effettua accesso per visualizzare i tuoi dati salvati.';
      $('logoutBtn').classList.add('hidden');
    }
  }

  function localUsers() {
    return JSON.parse(localStorage.getItem('flipmate_users_v4') || '{}');
  }
  function saveLocalUsers(users) {
    localStorage.setItem('flipmate_users_v4', JSON.stringify(users));
  }
  function localKey() {
    return `flipmate_db_v4_${state.user?.id || state.user?.email || 'guest'}`;
  }

  async function signup() {
    const email = $('authEmail').value.trim().toLowerCase();
    const password = $('authPassword').value;
    if (!email || password.length < 8) return toast('Inserisci email e password di almeno 8 caratteri.');
    if (state.mode === 'cloud') {
      const { data, error } = await state.supabase.auth.signUp({ email, password });
      if (error) return toast(error.message);
      if (data.user) setUser(data.user);
      toast('Registrazione inviata. Se Supabase richiede conferma email, controlla la casella.');
    } else {
      const users = localUsers();
      users[email] = { email, created_at: new Date().toISOString() };
      saveLocalUsers(users);
      setUser({ id: email, email });
      toast('Registrazione completata.');
    }
  }

  async function login() {
    const email = $('authEmail').value.trim().toLowerCase();
    const password = $('authPassword').value;
    if (!email || password.length < 8) return toast('Inserisci email e password di almeno 8 caratteri.');
    if (state.mode === 'cloud') {
      const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
      if (error) return toast(error.message);
      setUser(data.user);
      toast('Accesso effettuato.');
    } else {
      const users = localUsers();
      if (!users[email]) users[email] = { email, created_at: new Date().toISOString() };
      saveLocalUsers(users);
      setUser({ id: email, email });
      toast('Accesso effettuato.');
    }
  }

  async function logout() {
    if (state.mode === 'cloud') await state.supabase.auth.signOut();
    setUser(null);
    state.db = [];
    renderDb();
    toast('Logout effettuato.');
  }

  function requireAuth(action) {
    if (state.user) return true;
    state.pendingSave = action === 'save';
    openAuth('signup');
    toast('Registrati gratis per usare database, dashboard ed export.');
    return false;
  }

  async function saveCurrentCalc() {
    const calc = state.lastCalc || calculate();
    if (!requireAuth('save')) return;
    const row = {
      product_name: calc.product_name,
      category: calc.category,
      source_platform: 'Vinted',
      purchase_price: calc.vinted_price,
      purchase_shipping: calc.vinted_shipping,
      buyer_shipping: calc.buyer_shipping,
      real_shipping: calc.real_shipping,
      packaging_cost: calc.packaging_cost,
      sold_avg_price: calc.sold_avg,
      all_in_cost: calc.all_in_cost,
      fair_value: calc.fair_value,
      listing_price: calc.listing_price,
      min_offer: calc.min_offer,
      break_even: calc.break_even,
      max_buy_price: calc.max_buy_price,
      profit: calc.profit,
      roi: calc.roi,
      decision: calc.decision,
      status: 'watchlist',
      notes: ''
    };

    if (state.mode === 'cloud') {
      const { error } = await state.supabase.from('products').insert(row);
      if (error) return toast(error.message);
      toast('Prodotto salvato nel cloud.');
    } else {
      const rows = JSON.parse(localStorage.getItem(localKey()) || '[]');
      rows.unshift({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row });
      localStorage.setItem(localKey(), JSON.stringify(rows));
      toast('Prodotto salvato nel DB.');
    }
    $('appPanel').classList.remove('hidden');
    await loadDb();
    document.getElementById('appPanel').scrollIntoView({ behavior: 'smooth' });
  }

  async function loadDb() {
    if (!state.user) return;
    if (state.mode === 'cloud') {
      const { data, error } = await state.supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) return toast(error.message);
      state.db = data || [];
    } else {
      state.db = JSON.parse(localStorage.getItem(localKey()) || '[]');
    }
    renderDb();
  }

  async function deleteRow(id) {
    if (!state.user) return;
    if (state.mode === 'cloud') {
      const { error } = await state.supabase.from('products').delete().eq('id', id);
      if (error) return toast(error.message);
    } else {
      const rows = state.db.filter(r => r.id !== id);
      localStorage.setItem(localKey(), JSON.stringify(rows));
    }
    await loadDb();
  }

  function renderDb() {
    const tbody = $('dbRows');
    if (!state.user) {
      tbody.innerHTML = '<tr><td colspan="9">Registrati o accedi per vedere il database.</td></tr>';
      updateKpis([]);
      return;
    }
    if (!state.db.length) {
      tbody.innerHTML = '<tr><td colspan="9">Nessun prodotto salvato.</td></tr>';
      updateKpis([]);
      return;
    }
    tbody.innerHTML = state.db.map(row => `
      <tr>
        <td>${new Date(row.created_at).toLocaleDateString('it-IT')}</td>
        <td>${safe(row.product_name)}</td>
        <td>${safe(row.category)}</td>
        <td>${money(row.all_in_cost)}</td>
        <td>${money(row.listing_price)}</td>
        <td class="${row.profit >= 0 ? 'positive' : 'negative'}">${money(row.profit)}</td>
        <td>${pct(row.roi)}</td>
        <td>${safe(row.decision)}</td>
        <td><button class="btn small danger" data-delete-id="${row.id}">Elimina</button></td>
      </tr>
    `).join('');
    updateKpis(state.db);
  }

  function updateKpis(rows) {
    const totalProfit = rows.reduce((s, r) => s + Number(r.profit || 0), 0);
    const avgRoi = rows.length ? rows.reduce((s, r) => s + Number(r.roi || 0), 0) / rows.length : 0;
    $('kpiItems').textContent = rows.length;
    $('kpiProfit').textContent = money(totalProfit);
    $('kpiRoi').textContent = pct(avgRoi);
    $('kpiSource').textContent = state.mode === 'cloud' ? 'Cloud' : 'Privato';
  }

  function toCsv(rows) {
    const headers = ['created_at','product_name','category','source_platform','purchase_price','purchase_shipping','all_in_cost','sold_avg_price','listing_price','min_offer','profit','roi','decision','status'];
    const clean = (v) => `"${String(v ?? '').replaceAll('"','""')}"`;
    return [headers.join(';'), ...rows.map(r => headers.map(h => clean(r[h])).join(';'))].join('\n');
  }

  function downloadFile(name, content, type = 'text/csv;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSingle() {
    const calc = state.lastCalc || calculate();
    if (!requireAuth('export')) return;
    downloadFile('flipmate-calcolo.csv', toCsv([{ ...calc, sold_avg_price: calc.sold_avg, purchase_price: calc.vinted_price, purchase_shipping: calc.vinted_shipping, source_platform: 'Vinted', status: 'simulation' }]));
  }

  function exportDb() {
    if (!requireAuth('export')) return;
    downloadFile('flipmate-database.csv', toCsv(state.db));
  }

  function copySummary() {
    const r = state.lastCalc || calculate();
    const text = `FlipMate: ${r.product_name}\nDecisione: ${r.decision}\nCosto all-in: ${money(r.all_in_cost)}\nPrezzo annuncio: ${money(r.listing_price)}\nOfferta minima: ${money(r.min_offer)}\nUtile netto: ${money(r.profit)}\nROI: ${pct(r.roi)}\nMax prezzo Vinted: ${money(r.max_buy_price)}`;
    navigator.clipboard?.writeText(text);
    toast('Sintesi copiata.');
  }

  function resetCalculator() {
    $('productName').value = 'Banpresto figure';
    $('category').value = 'Action figure';
    $('soldAvg').value = 40;
    $('vintedPrice').value = 20;
    $('vintedShipping').value = 4;
    $('buyerShipping').value = 6.5;
    $('realShipping').value = 5.2;
    $('packCost').value = 0.5;
    $('ebayFeePct').value = 5;
    $('regPct').value = 0.43;
    $('ebayFixed').value = 0.35;
    $('vintedPct').value = 5;
    $('vintedFixed').value = 0.70;
    calculate();
  }

  function openAuth(mode = 'signup') {
    $('authModal').classList.remove('hidden');
    $('authTitle').textContent = mode === 'login' ? 'Accedi' : 'Registrati gratis';
  }
  function closeAuth() { $('authModal').classList.add('hidden'); }

  function bindEvents() {
    document.querySelectorAll('[data-scroll-target]').forEach(btn => {
      btn.addEventListener('click', () => document.getElementById(btn.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' }));
    });
    document.querySelectorAll('[data-auth-open]').forEach(btn => btn.addEventListener('click', () => openAuth(btn.dataset.authOpen)));
    document.querySelectorAll('#calculatorForm input,#calculatorForm select').forEach(el => el.addEventListener('input', calculate));
    $('resetCalculator').addEventListener('click', resetCalculator);
    $('saveToDb').addEventListener('click', saveCurrentCalc);
    $('copySummary').addEventListener('click', copySummary);
    $('exportSingleCsv').addEventListener('click', exportSingle);
    $('exportDbCsv').addEventListener('click', exportDb);
    $('refreshDb').addEventListener('click', loadDb);
    $('clearLocalDb').addEventListener('click', () => {
      if (state.mode === 'cloud') return toast('In cloud elimina le singole righe dalla tabella.');
      if (!state.user) return;
      localStorage.removeItem(localKey());
      loadDb();
    });
    $('signupBtn').addEventListener('click', signup);
    $('loginBtn').addEventListener('click', login);
    $('logoutBtn').addEventListener('click', logout);
    $('closeAuth').addEventListener('click', closeAuth);
    $('authModal').addEventListener('click', (e) => { if (e.target.id === 'authModal') closeAuth(); });
    $('dbRows').addEventListener('click', e => {
      const id = e.target?.dataset?.deleteId;
      if (id) deleteRow(id);
    });
  }

  async function init() {
    bindEvents();
    calculate();
    await initSupabase();
    renderDb();
    const video = $('demoVideo');
    if (video) {
      video.muted = true;
      video.play?.().catch(() => {});
    }
  }

  init();
})();
