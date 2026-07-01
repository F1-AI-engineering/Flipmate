(() => {
  const $ = (id) => document.getElementById(id);
  const page = document.body?.dataset?.page || 'landing';
  const FALLBACK_LANG = 'it';

  const I18N = {
    it: {
      common:{lang:'Lingua', reset:'Reset', refresh:'Aggiorna'},
      nav:{home:'Home', features:'Funzioni', usecases:'Uso', pricing:'Prezzi', login:'Accedi', signup:'Registrati', try:'Prova gratis'},
      modes:{vinted:'Solo Vinted', ebay:'Solo eBay', vinted_ebay:'Vinted + eBay'},
      status:{watchlist:'Da valutare', in_stock:'In stock', listed:'In vendita', sold:'Venduto', archived:'Archiviato'},
      categories:{action_figures:'Action figure', lego:'LEGO', collectible_cards:'Carte collezionabili', videogames:'Videogiochi', manga_artbooks:'Manga e artbook', clothes:'Vestiti', cosmetics:'Cosmetici', books:'Libri', common_items:'Oggetti comuni', vintage:'Vintage', electronics:'Elettronica', other:'Altro'},
      fields:{purpose:'Finalità', productName:'Nome prodotto', category:'Categoria', purchasePrice:'Prezzo acquisto', purchaseShipping:'Spedizione acquisto', salePrice:'Prezzo vendita stimato', realShipping:'Spedizione reale tua', packCost:'Costo imballo', email:'Email', password:'Password', username:'Nome utente', analysisMode:'Modalità analisi', status:'Stato', vintedPct:'Protezione Vinted %', vintedFixed:'Protezione Vinted fissa €', buyerShipping:'Spedizione pagata dal buyer', ebayFeePct:'Commissione eBay %', regPct:'Tariffa regolatoria %', ebayFixed:'Fee fissa eBay €', targetRoi:'ROI target', minProfit:'Utile minimo', notes:'Note', newEmail:'Nuova email', mode:'Modalità'},
      landing:{eyebrow:'Calcolatore + stock tracker', h1:'Prima di comprare o vendere, verifica margine, ROI e stock.', p:'FlipMate aiuta chi vende su Vinted, eBay o entrambi a calcolare il margine reale e tenere traccia di prodotti, stock, vendite ed export CSV.', trust1:'✓ Prova guidata', trust2:'✓ Registrazione gratuita', trust3:'✓ DB cloud', trust4:'✓ Vinted / eBay / entrambi', videoLabel:'Video demo', outputTitle:'Output dopo registrazione', output1:'Compra / Tratta / Scarta', output2:'Utile netto e ROI', output3:'Salvataggio stock', freeEyebrow:'Prova gratuita', freeTitle:'Inserisci i dati. Per vedere il risultato, registrati gratis.', freeText:'La prova raccoglie solo i dati essenziali. Il risultato completo e il salvataggio nel database sono disponibili dopo login.', step1:'Step 1', analysisQuestion:'Che analisi vuoi fare?', seeResult:'Vedi risultato gratis', haveAccount:'Ho già un account', lockTitle:'Risultato protetto', lockText:'Per vedere utile netto, ROI, decisione e salvare il prodotto nel database devi creare un account gratuito.', lock1:'Database personale e separato per utente', lock2:'Export CSV dopo login', lock3:'Modalità Vinted, eBay o Vinted + eBay', registerContinue:'Registrati e continua', featuresTitle:'Da calcolatore a mini gestionale stock', feat1Title:'Margine reale', feat1Text:'Calcola costo all-in, commissioni, spedizione, imballo, utile e ROI.', feat2Title:'Stock tracker', feat2Text:'Segui prodotti in stock, in vendita, venduti o archiviati.', feat3Title:'Tre modalità', feat3Text:'Solo Vinted, solo eBay o Vinted + eBay con campi adattivi.', feat4Title:'Database cloud', feat4Text:'Ogni account vede solo i propri dati; l’admin li consulta da Supabase.', feat5Title:'Export CSV', feat5Text:'Scarica il database per Excel, reporting e controllo vendite.', feat6Title:'Premium-ready', feat6Text:'Spazio per piani avanzati, pagamenti, alert e dashboard evolute.', useTitle:'Scegli come usi FlipMate', useVinted:'Gestione stock e vendite per chi compra/vende direttamente su Vinted.', useEbay:'Calcolo margine includendo commissioni, spedizioni e prezzo minimo eBay.', useBoth:'Modello per chi compra su Vinted e rivende su eBay con margine target.', pricingTitle:'Gratis per partire, premium per scalare', free1:'Calcolatore', free2:'Registrazione', free3:'Database prodotti', free4:'Export CSV', premium1:'Analytics avanzate', premium2:'Trend margine', premium3:'Pagamenti', premium4:'Alert stock'},
      auth:{loginEyebrow:'Accesso', loginTitle:'Accedi al tuo database FlipMate', loginText:'Entra per gestire stock, vendite, dashboard ed export CSV.', noAccount:'Non hai un account?', forgotPassword:'Password dimenticata?', signupEyebrow:'Registrazione gratuita', signupTitle:'Crea il tuo spazio stock e vendite', signupText:'Dopo la registrazione vedrai il risultato della prova e potrai salvare prodotti nel database.', haveAccount:'Hai già un account?', passwordNote:'Le password sono gestite da Supabase Auth. FlipMate non salva password nel database prodotti.'},
      app:{navHome:'Home', navCalculator:'Calcolatore', navDatabase:'Database', navDashboard:'Dashboard', navSettings:'Impostazioni', areaEyebrow:'Area app', savePurpose:'Salva finalità'},
      home:{title:'Panoramica rapida', subtitle:'Le caselle mostrano stock, costi, vendita probabile, vendita netta e utile. I grafici completi sono nella Dashboard.', addProduct:'Aggiungi prodotto', openDb:'Apri database', openDashboard:'Vai alla dashboard'},
      kpi:{stockPieces:'Pezzi in stock', costs:'Costi sostenuti', probableSales:'Vendita probabile', netSales:'Vendita netta', profit:'Utile', grossRevenue:'Ricavi lordi venduti', topCategory:'Categoria top margine', sellThrough:'Sell-through'},
      calc:{title:'Analisi prodotto', stockHint:'Per salvare nel DB devi impostare lo stato su In stock. Gli altri stati si aggiornano dal Database.', saveToDb:'Salva nel DB', copySummary:'Copia sintesi', singleCsv:'Scarica CSV prodotto', decision:'Decisione', allIn:'Costo all-in', fair:'Prezzo prudente', listing:'Prezzo annuncio', minOffer:'Offerta minima', breakEven:'Break-even', maxBuy:'Max prezzo acquisto', profit:'Utile netto stimato', roi:'ROI stimato'},
      db:{title:'Stock e vendite', exportFiltered:'Export CSV filtrato', saleMin:'Prezzo vendita min', saleMax:'Prezzo vendita max', profitMin:'Utile min', profitMax:'Utile max', costMin:'Costo acquisto min', costMax:'Costo acquisto max', applyFilters:'Applica filtri', resetFilters:'Reset filtri', bulkStatus:'Imposta stato su prodotti filtrati', updateAll:'Aggiorna tutto', bulkNote:'Aggiorna solo i prodotti visualizzati dai filtri attuali.', date:'Data', product:'Prodotto', mode:'Modalità', category:'Categoria', status:'Stato', cost:'Costo acquisto', sale:'Prezzo vendita', profit:'Utile', decision:'Decisione', actions:'Azioni'},
      dashboard:{title:'Analytics approfondite', subtitle:'Caselle KPI + grafici per ricavi lordi, vendita netta, margini categoria e trend utile.', revenueChart:'Ricavi lordi vs vendita netta', categoryChart:'Margine per categoria', trendChart:'Trend utile mensile', ranking:'Classifica categorie'},
      settings:{profile:'Profilo', saveProfile:'Salva profilo', changeEmail:'Richiedi cambio email', resetPassword:'Invia reset password', logout:'Esci', payments:'Pagamenti e piano', paymentMethods:'Metodi di pagamento', paymentText:'Non ancora attivo. Per produzione useremo Stripe Customer Portal o equivalente, senza salvare carte nel nostro database.', managePayment:'Gestisci pagamento — coming soon'},
      messages:{fillEmailPassword:'Inserisci email e password.', supabaseMissing:'Supabase non configurato: account e database non disponibili.', loginOk:'Accesso eseguito.', signupOk:'Registrazione completata.', signupConfirm:'Registrazione creata. Controlla eventuale email di conferma, poi accedi.', pendingLoaded:'Risultato della prova caricato. Per salvarlo, lo stato deve essere In stock.', saveStockError:'Errore: per aggiungere un prodotto al database devi selezionare Stato = In stock.', saved:'Prodotto aggiunto allo stock.', noProducts:'Nessun prodotto trovato con questi filtri.', filteredCount:(shown,total)=>`${shown} prodotti visualizzati su ${total}`, updatedStatus:(s)=>`Stato aggiornato: ${s}.`, deleted:'Riga eliminata.', confirmDelete:'Eliminare definitivamente questo prodotto dal database?', confirmBulk:(n,s)=>`Aggiornare ${n} prodotti filtrati allo stato "${s}"?`, bulkDone:(n)=>`${n} prodotti aggiornati.`, noFiltered:'Nessun prodotto filtrato da aggiornare.', copied:'Sintesi copiata.', profileSaved:'Profilo aggiornato.', emailChange:'Richiesta cambio email inviata. Controlla la posta.', resetSent:'Email reset password inviata.', logout:'Logout eseguito.', noData:'Nessun dato disponibile', trendNeed:'Servono almeno 2 periodi per vedere il trend', noCategories:'Salva prodotti per vedere le categorie migliori.', calcDefault:'Inserisci i dati per calcolare.', buy:'COMPRA', negotiate:'TRATTA', discard:'SCARTA', reasonBuy:'Utile e ROI sopra target.', reasonNegotiate:'Margine positivo ma serve prezzo migliore.', reasonDiscard:'Margine sotto soglia.'}
    },
    en: {
      common:{lang:'Language', reset:'Reset', refresh:'Refresh'},
      nav:{home:'Home', features:'Features', usecases:'Use cases', pricing:'Pricing', login:'Log in', signup:'Sign up', try:'Try free'},
      modes:{vinted:'Vinted only', ebay:'eBay only', vinted_ebay:'Vinted + eBay'},
      status:{watchlist:'To evaluate', in_stock:'In stock', listed:'Listed', sold:'Sold', archived:'Archived'},
      categories:{action_figures:'Action figures', lego:'LEGO', collectible_cards:'Trading cards', videogames:'Video games', manga_artbooks:'Manga & artbooks', clothes:'Clothes', cosmetics:'Cosmetics', books:'Books', common_items:'Common items', vintage:'Vintage', electronics:'Electronics', other:'Other'},
      fields:{purpose:'Purpose', productName:'Product name', category:'Category', purchasePrice:'Purchase price', purchaseShipping:'Purchase shipping', salePrice:'Estimated sale price', realShipping:'Your shipping cost', packCost:'Packaging cost', email:'Email', password:'Password', username:'Username', analysisMode:'Analysis mode', status:'Status', vintedPct:'Vinted buyer protection %', vintedFixed:'Fixed Vinted protection €', buyerShipping:'Shipping paid by buyer', ebayFeePct:'eBay fee %', regPct:'Regulatory fee %', ebayFixed:'Fixed eBay fee €', targetRoi:'Target ROI', minProfit:'Minimum profit', notes:'Notes', newEmail:'New email', mode:'Mode'},
      landing:{eyebrow:'Calculator + stock tracker', h1:'Before buying or selling, check margin, ROI and stock.', p:'FlipMate helps Vinted, eBay and cross-marketplace sellers calculate real margin and track products, inventory, sales and CSV exports.', trust1:'✓ Guided trial', trust2:'✓ Free registration', trust3:'✓ Cloud DB', trust4:'✓ Vinted / eBay / both', videoLabel:'Demo video', outputTitle:'Output after sign up', output1:'Buy / Negotiate / Skip', output2:'Net profit and ROI', output3:'Stock saving', freeEyebrow:'Free trial', freeTitle:'Enter the data. Sign up free to see the result.', freeText:'The trial collects only essential data. Full result and database saving are available after login.', step1:'Step 1', analysisQuestion:'What analysis do you want?', seeResult:'See free result', haveAccount:'I already have an account', lockTitle:'Protected result', lockText:'Create a free account to see net profit, ROI, decision and save the product to the database.', lock1:'Personal database separated by user', lock2:'CSV export after login', lock3:'Vinted, eBay or Vinted + eBay modes', registerContinue:'Sign up and continue', featuresTitle:'From calculator to stock mini-manager', feat1Title:'Real margin', feat1Text:'Calculate all-in cost, fees, shipping, packaging, profit and ROI.', feat2Title:'Stock tracker', feat2Text:'Track products in stock, listed, sold or archived.', feat3Title:'Three modes', feat3Text:'Vinted only, eBay only or Vinted + eBay with adaptive fields.', feat4Title:'Cloud database', feat4Text:'Each account sees only its own data; admin can review data from Supabase.', feat5Title:'CSV export', feat5Text:'Download your database for Excel, reporting and sales control.', feat6Title:'Premium-ready', feat6Text:'Ready for advanced plans, payments, alerts and richer dashboards.', useTitle:'Choose how you use FlipMate', useVinted:'Inventory and sales tracking for sellers using Vinted only.', useEbay:'Margin calculation including fees, shipping and minimum eBay price.', useBoth:'Model for buying on Vinted and reselling on eBay with target margin.', pricingTitle:'Free to start, premium to scale', free1:'Calculator', free2:'Registration', free3:'Product database', free4:'CSV export', premium1:'Advanced analytics', premium2:'Margin trends', premium3:'Payments', premium4:'Stock alerts'},
      auth:{loginEyebrow:'Login', loginTitle:'Access your FlipMate database', loginText:'Manage stock, sales, dashboards and CSV exports.', noAccount:'No account yet?', forgotPassword:'Forgot password?', signupEyebrow:'Free registration', signupTitle:'Create your stock and sales workspace', signupText:'After signing up, you will see the trial result and save products to the database.', haveAccount:'Already have an account?', passwordNote:'Passwords are managed by Supabase Auth. FlipMate never stores passwords in the product database.'},
      app:{navHome:'Home', navCalculator:'Calculator', navDatabase:'Database', navDashboard:'Dashboard', navSettings:'Settings', areaEyebrow:'App area', savePurpose:'Save purpose'},
      home:{title:'Quick overview', subtitle:'Cards show stock, costs, probable sales, net sales and profit. Full charts are in the Dashboard.', addProduct:'Add product', openDb:'Open database', openDashboard:'Open dashboard'},
      kpi:{stockPieces:'Stock pieces', costs:'Costs incurred', probableSales:'Probable sales', netSales:'Net sales', profit:'Profit', grossRevenue:'Gross sold revenue', topCategory:'Top margin category', sellThrough:'Sell-through'},
      calc:{title:'Product analysis', stockHint:'To save to DB, status must be In stock. Other statuses are updated from Database.', saveToDb:'Save to DB', copySummary:'Copy summary', singleCsv:'Download product CSV', decision:'Decision', allIn:'All-in cost', fair:'Prudent price', listing:'Listing price', minOffer:'Minimum offer', breakEven:'Break-even', maxBuy:'Max purchase price', profit:'Estimated net profit', roi:'Estimated ROI'},
      db:{title:'Stock and sales', exportFiltered:'Export filtered CSV', saleMin:'Sale price min', saleMax:'Sale price max', profitMin:'Profit min', profitMax:'Profit max', costMin:'Purchase cost min', costMax:'Purchase cost max', applyFilters:'Apply filters', resetFilters:'Reset filters', bulkStatus:'Set status on filtered products', updateAll:'Update all', bulkNote:'Updates only products currently shown by filters.', date:'Date', product:'Product', mode:'Mode', category:'Category', status:'Status', cost:'Purchase cost', sale:'Sale price', profit:'Profit', decision:'Decision', actions:'Actions'},
      dashboard:{title:'Deep analytics', subtitle:'KPI cards + charts for gross revenue, net sales, category margins and profit trend.', revenueChart:'Gross revenue vs net sales', categoryChart:'Margin by category', trendChart:'Monthly profit trend', ranking:'Category ranking'},
      settings:{profile:'Profile', saveProfile:'Save profile', changeEmail:'Request email change', resetPassword:'Send password reset', logout:'Log out', payments:'Payments and plan', paymentMethods:'Payment methods', paymentText:'Not active yet. In production we will use Stripe Customer Portal or equivalent, without storing cards in our database.', managePayment:'Manage payment — coming soon'},
      messages:{fillEmailPassword:'Enter email and password.', supabaseMissing:'Supabase not configured: accounts and database unavailable.', loginOk:'Logged in.', signupOk:'Registration completed.', signupConfirm:'Registration created. Check confirmation email if required, then log in.', pendingLoaded:'Trial result loaded. To save it, status must be In stock.', saveStockError:'Error: to add a product to the database, select Status = In stock.', saved:'Product added to stock.', noProducts:'No products found with these filters.', filteredCount:(shown,total)=>`${shown} products shown out of ${total}`, updatedStatus:(s)=>`Status updated: ${s}.`, deleted:'Row deleted.', confirmDelete:'Permanently delete this product from the database?', confirmBulk:(n,s)=>`Update ${n} filtered products to "${s}"?`, bulkDone:(n)=>`${n} products updated.`, noFiltered:'No filtered products to update.', copied:'Summary copied.', profileSaved:'Profile updated.', emailChange:'Email change request sent. Check your inbox.', resetSent:'Password reset email sent.', logout:'Logged out.', noData:'No data available', trendNeed:'At least 2 periods are needed to show a trend', noCategories:'Save products to see best categories.', calcDefault:'Enter data to calculate.', buy:'BUY', negotiate:'NEGOTIATE', discard:'SKIP', reasonBuy:'Profit and ROI above target.', reasonNegotiate:'Positive margin, but a better price is needed.', reasonDiscard:'Margin below target.'}
    }
  };

  const CATEGORY_KEYS = ['action_figures','lego','collectible_cards','videogames','manga_artbooks','clothes','cosmetics','books','common_items','vintage','electronics','other'];
  const LEGACY_CATEGORY = {'Action figure':'action_figures','LEGO':'lego','Carte collezionabili':'collectible_cards','Videogiochi':'videogames','Manga e artbook':'manga_artbooks','Altro':'other'};
  const MODE_KEYS = ['vinted','ebay','vinted_ebay'];
  const STATUS_KEYS = ['watchlist','in_stock','listed','sold','archived'];

  let lang = localStorage.getItem('flipmate_lang') || FALLBACK_LANG;
  if (!I18N[lang]) lang = FALLBACK_LANG;
  const t = (path) => path.split('.').reduce((o,k)=>o?.[k], I18N[lang]) ?? path;
  const fmt = (n) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'it-IT', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(+n) ? +n : 0);
  const pct = (n) => `${(Number.isFinite(+n) ? +n : 0).toFixed(1).replace('.', lang === 'it' ? ',' : '.')}%`;
  const num = (id) => parseFloat($(id)?.value || '0') || 0;
  const val = (id) => $(id)?.value || '';

  function toast(msg) { const el = $('toast'); if (!el) return alert(msg); el.textContent = msg; el.classList.remove('hidden'); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(()=>el.classList.add('hidden'), 4200); }
  function csvSafe(value) { const s = String(value ?? '').replace(/\r?\n/g,' ').trim(); const hardened = /^[=+\-@]/.test(s) ? `'${s}` : s; return `"${hardened.replace(/"/g,'""')}"`; }
  function downloadCsv(filename, rows) { const csv = rows.map(r => r.map(csvSafe).join(';')).join('\n'); const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function categoryKey(value) { return LEGACY_CATEGORY[value] || value || 'other'; }
  function categoryLabel(value) { return I18N[lang].categories[categoryKey(value)] || value || I18N[lang].categories.other; }
  function modeLabel(mode) { return I18N[lang].modes[mode] || mode || I18N[lang].modes.vinted_ebay; }
  function statusLabel(status) { return I18N[lang].status[status] || status || I18N[lang].status.watchlist; }
  function setTextAll(selector, text) { document.querySelectorAll(selector).forEach(el => el.textContent = text); }

  function buildSelectOptions() {
    document.querySelectorAll('[data-category-select]').forEach(select => {
      const current = select.value || 'action_figures';
      select.innerHTML = CATEGORY_KEYS.map(k => `<option value="${k}" ${categoryKey(current)===k?'selected':''}>${I18N[lang].categories[k]}</option>`).join('');
    });
    document.querySelectorAll('[data-category-filter]').forEach(select => {
      const current = select.value || 'all';
      select.innerHTML = `<option value="all">${lang==='it'?'Tutte':'All'}</option>` + CATEGORY_KEYS.map(k => `<option value="${k}" ${categoryKey(current)===k?'selected':''}>${I18N[lang].categories[k]}</option>`).join('');
    });
    document.querySelectorAll('[data-mode-select]').forEach(select => {
      const current = select.value || 'vinted_ebay';
      select.innerHTML = MODE_KEYS.map(k => `<option value="${k}" ${current===k?'selected':''}>${I18N[lang].modes[k]}</option>`).join('');
    });
    document.querySelectorAll('[data-mode-select-filter]').forEach(select => {
      const current = select.value || 'all';
      select.innerHTML = `<option value="all">${lang==='it'?'Tutte':'All'}</option>` + MODE_KEYS.map(k => `<option value="${k}" ${current===k?'selected':''}>${I18N[lang].modes[k]}</option>`).join('');
    });
    document.querySelectorAll('[data-status-select-basic]').forEach(select => {
      const current = select.value || 'watchlist';
      const keys = select.id === 'bulkStatus' ? STATUS_KEYS.filter(k=>k!=='watchlist') : STATUS_KEYS;
      select.innerHTML = keys.map(k => `<option value="${k}" ${current===k?'selected':''}>${I18N[lang].status[k]}</option>`).join('');
    });
    document.querySelectorAll('[data-status-filter]').forEach(select => {
      const current = select.value || 'all';
      select.innerHTML = `<option value="all">${lang==='it'?'Tutti':'All'}</option>` + STATUS_KEYS.filter(k=>k!=='watchlist').map(k => `<option value="${k}" ${current===k?'selected':''}>${I18N[lang].status[k]}</option>`).join('');
    });
  }

  function applyTranslations() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('#languageSelect').forEach(s => { s.value = lang; });
    buildSelectOptions();
    const source = $('demoVideoSource');
    const video = $('demoVideo');
    if (source && video) {
      const next = lang === 'en' ? 'assets/demo-en.mp4' : 'assets/demo-it.mp4';
      if (!source.src.endsWith(next)) { source.src = next; video.load(); video.play?.().catch(()=>{}); }
    }
  }

  function bindLanguage() {
    document.querySelectorAll('#languageSelect').forEach(sel => sel.addEventListener('change', () => { lang = sel.value; localStorage.setItem('flipmate_lang', lang); applyTranslations(); renderCalculation?.(); applyFilters?.(); renderKpis?.(); renderAnalytics?.(); }));
  }

  function calculate(input) {
    const mode = input.mode || 'vinted_ebay';
    const purchasePrice = +input.purchasePrice || 0, purchaseShipping = +input.purchaseShipping || 0, salePrice = +input.salePrice || 0, buyerShipping = +input.buyerShipping || 0, realShipping = +input.realShipping || 0, packCost = +input.packCost || 0;
    const ebayFeePct = +input.ebayFeePct || 0, regPct = +input.regPct || 0, ebayFixed = +input.ebayFixed || 0, vintedPct = +input.vintedPct || 0, vintedFixed = +input.vintedFixed || 0;
    const targetRoi = 25, minProfit = 10;
    const vintedBuyingFee = mode === 'vinted_ebay' ? purchasePrice * vintedPct / 100 + vintedFixed : 0;
    const allIn = purchasePrice + purchaseShipping + vintedBuyingFee + packCost;
    const isEbaySale = mode === 'ebay' || mode === 'vinted_ebay';
    const grossReceived = salePrice + (isEbaySale ? buyerShipping : 0);
    const ebayFees = isEbaySale ? grossReceived * (ebayFeePct + regPct) / 100 + ebayFixed : 0;
    const profit = grossReceived - ebayFees - purchasePrice - purchaseShipping - vintedBuyingFee - realShipping - packCost;
    const roi = allIn > 0 ? (profit / allIn) * 100 : 0;
    const fair = salePrice * 0.9, listing = mode === 'vinted' ? salePrice : salePrice * 1.08, minOffer = mode === 'vinted' ? salePrice * 0.93 : salePrice * 0.95, breakEven = salePrice - profit;
    const maxBuy = Math.max(0, purchasePrice + profit - Math.max(minProfit, allIn * targetRoi / 100));
    let decision = t('messages.discard'), reason = t('messages.reasonDiscard');
    if (profit >= minProfit && roi >= targetRoi) { decision = t('messages.buy'); reason = t('messages.reasonBuy'); }
    else if (profit > 0 && roi > 10) { decision = t('messages.negotiate'); reason = t('messages.reasonNegotiate'); }
    const netSale = grossReceived - ebayFees - realShipping - packCost;
    return { allIn, fair, listing, minOffer, breakEven, maxBuy, profit, roi, decision, reason, mode, salePrice, grossReceived, ebayFees, vintedBuyingFee, netSale };
  }

  function landingInit() {
    const start = () => {
      const leadMode = val('leadMode');
      const payload = { mode: leadMode, productName: val('leadProductName'), category: val('leadCategory'), purchasePrice: num('leadPurchasePrice'), purchaseShipping: num('leadPurchaseShipping'), salePrice: num('leadSalePrice'), realShipping: num('leadRealShipping'), packCost: num('leadPackCost'), buyerShipping: leadMode === 'vinted' ? 0 : 6.5, ebayFeePct: leadMode === 'vinted' ? 0 : 5, regPct: leadMode === 'vinted' ? 0 : 0.43, ebayFixed: leadMode === 'vinted' ? 0 : 0.35, vintedPct: leadMode === 'vinted_ebay' ? 5 : 0, vintedFixed: leadMode === 'vinted_ebay' ? 0.70 : 0 };
      sessionStorage.setItem('flipmate_pending_calc', JSON.stringify(payload));
      location.href = 'signup.html?pending=1';
    };
    $('startFreeTrial')?.addEventListener('click', start);
    $('startFreeTrial2')?.addEventListener('click', start);
  }

  let supabase = null, session = null, profile = null, dbCache = [], filteredDbCache = [];
  function ensureSupabase() { const url = window.FLIPMATE_SUPABASE_URL; const key = window.FLIPMATE_SUPABASE_ANON_KEY; if (!url || !key || !window.supabase) return null; return window.supabase.createClient(url, key); }
  function getPendingCalc() { try { return JSON.parse(sessionStorage.getItem('flipmate_pending_calc') || 'null'); } catch { return null; } }
  function fillFormFromPayload(p) { if (!p) return; const map = {analysisMode:p.mode, productName:p.productName, category:p.category, purchasePrice:p.purchasePrice, purchaseShipping:p.purchaseShipping, salePrice:p.salePrice, realShipping:p.realShipping, packCost:p.packCost, buyerShipping:p.buyerShipping, ebayFeePct:p.ebayFeePct, regPct:p.regPct, ebayFixed:p.ebayFixed, vintedPct:p.vintedPct, vintedFixed:p.vintedFixed}; Object.entries(map).forEach(([id,v])=>{ if ($(id) && v !== undefined && v !== null) $(id).value = v; }); if ($('status')) $('status').value='in_stock'; }

  async function authPageInit(kind) {
    supabase = ensureSupabase();
    if (!supabase) return toast(t('messages.supabaseMissing'));
    const pending = getPendingCalc();
    if (pending && $('signupPurpose')) $('signupPurpose').value = pending.mode || 'vinted_ebay';
    $('loginSubmit')?.addEventListener('click', loginFromPage);
    $('signupSubmit')?.addEventListener('click', signUpFromPage);
    $('loginResetPassword')?.addEventListener('click', resetPasswordFromLogin);
    const { data } = await supabase.auth.getSession();
    if (data.session && kind === 'login') location.href = 'app.html';
  }

  async function loginFromPage() {
    const email = val('loginEmail'), password = val('loginPassword');
    if (!email || !password) return toast(t('messages.fillEmailPassword'));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message);
    toast(t('messages.loginOk'));
    location.href = 'app.html';
  }

  async function signUpFromPage() {
    const email = val('signupEmail'), password = val('signupPassword');
    if (!email || !password) return toast(t('messages.fillEmailPassword'));
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return toast(error.message);
    if (!data.session) return toast(t('messages.signupConfirm'));
    session = data.session;
    await upsertProfile(val('signupUsername'), val('signupPurpose'));
    toast(t('messages.signupOk'));
    location.href = 'app.html';
  }

  async function resetPasswordFromLogin() { location.href = 'reset-request.html'; }

  async function appInit() {
    supabase = ensureSupabase();
    if (!supabase) return toast(t('messages.supabaseMissing'));
    bindAppEvents();
    const { data } = await supabase.auth.getSession();
    session = data.session;
    if (!session) { location.href = 'login.html'; return; }
    supabase.auth.onAuthStateChange(async (_event, newSession) => { session = newSession; if (!session) location.href = 'login.html'; });
    await showApp();
  }

  async function showApp() {
    await loadProfile();
    await applyProfileToUi();
    const pending = getPendingCalc();
    if (pending) { fillFormFromPayload(pending); sessionStorage.removeItem('flipmate_pending_calc'); toast(t('messages.pendingLoaded')); showSection('calculator'); }
    else showSection('home');
    renderCalculation();
    await loadDb();
  }

  async function loadProfile() {
    const user = session?.user; if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (error || !data) {
      const insert = { user_id:user.id, username:user.email?.split('@')[0] || 'utente', purpose:'vinted_ebay', plan:'free' };
      const res = await supabase.from('profiles').insert(insert).select('*').single();
      profile = res.data || insert;
    } else profile = data;
  }

  async function upsertProfile(username, purpose) {
    const user = session?.user; if (!user) return;
    const row = { user_id:user.id, username: username || user.email?.split('@')[0] || 'utente', purpose: purpose || 'vinted_ebay', plan: profile?.plan || 'free' };
    const { data, error } = await supabase.from('profiles').upsert(row).select('*').single();
    if (error) toast(error.message); else profile = data;
  }

  async function applyProfileToUi() {
    const user = session?.user; const name = profile?.username || user?.email?.split('@')[0] || 'Account';
    if ($('accountButton')) $('accountButton').textContent = name;
    if ($('welcomeTitle')) $('welcomeTitle').textContent = lang === 'it' ? `Ciao, ${name}` : `Hi, ${name}`;
    if ($('accountStatus')) $('accountStatus').textContent = lang === 'it' ? `Account: ${user?.email || ''}. Piano: ${profile?.plan || 'free'}.` : `Account: ${user?.email || ''}. Plan: ${profile?.plan || 'free'}.`;
    if ($('profilePurpose')) $('profilePurpose').value = profile?.purpose || 'vinted_ebay';
    if ($('analysisMode')) $('analysisMode').value = profile?.purpose || 'vinted_ebay';
    if ($('profileUsername')) $('profileUsername').value = name;
    if ($('profileEmail')) $('profileEmail').value = user?.email || '';
    if ($('planStatus')) $('planStatus').textContent = lang === 'it' ? `Piano attuale: ${(profile?.plan || 'free').toUpperCase()}` : `Current plan: ${(profile?.plan || 'free').toUpperCase()}`;
    if ($('appSectionMobileSelect')) $('appSectionMobileSelect').value = 'home';
    applyModeFields();
  }

  function currentInput() { return { mode: val('analysisMode'), productName: val('productName'), category: val('category'), status: val('status'), purchasePrice: num('purchasePrice'), purchaseShipping: num('purchaseShipping'), vintedPct: num('vintedPct'), vintedFixed: num('vintedFixed'), salePrice: num('salePrice'), buyerShipping: num('buyerShipping'), realShipping: num('realShipping'), packCost: num('packCost'), ebayFeePct: num('ebayFeePct'), regPct: num('regPct'), ebayFixed: num('ebayFixed'), notes: val('notes') }; }
  function renderCalculation() { if (!$('decision')) return null; const input = currentInput(); const out = calculate(input); $('decision').textContent = out.decision; $('decisionReason').textContent = out.reason; $('outAllIn').textContent=fmt(out.allIn); $('outFair').textContent=fmt(out.fair); $('outListing').textContent=fmt(out.listing); $('outMinOffer').textContent=fmt(out.minOffer); $('outBreakEven').textContent=fmt(out.breakEven); $('outMaxBuy').textContent=fmt(out.maxBuy); $('outProfit').textContent=fmt(out.profit); $('outRoi').textContent=pct(out.roi); return { input, out }; }
  function applyModeFields() { const mode = val('analysisMode') || 'vinted_ebay'; document.querySelectorAll('[data-mode-field="ebaySell"]').forEach(el => el.classList.toggle('hidden', mode === 'vinted')); document.querySelectorAll('[data-mode-field="vintedBuy"]').forEach(el => el.classList.toggle('hidden', mode !== 'vinted_ebay')); if (mode==='vinted') ['buyerShipping','ebayFeePct','regPct','ebayFixed','vintedPct','vintedFixed'].forEach(id=>{ if($(id)) $(id).value=0; }); if (mode==='ebay') ['vintedPct','vintedFixed'].forEach(id=>{ if($(id)) $(id).value=0; }); renderCalculation(); }

  async function saveProduct() {
    if (!session) return location.href='login.html';
    const calc = renderCalculation(); if (!calc) return; const { input, out } = calc;
    if (input.status !== 'in_stock') return toast(t('messages.saveStockError'));
    const row = { product_name: input.productName || 'Prodotto', category: categoryKey(input.category), source_platform: input.mode, analysis_mode: input.mode, status:'in_stock', purchase_price: input.purchasePrice, purchase_shipping: input.purchaseShipping, buyer_shipping: input.buyerShipping, real_shipping: input.realShipping, packaging_cost: input.packCost, sold_avg_price: input.salePrice, all_in_cost: out.allIn, fair_value: out.fair, listing_price: out.listing, min_offer: out.minOffer, break_even: out.breakEven, max_buy_price: out.maxBuy, profit: out.profit, roi: out.roi, decision: out.decision, sale_price:null, sale_date:null, notes: input.notes };
    const { error } = await supabase.from('products').insert(row);
    if (error) return toast(`Errore salvataggio: ${error.message}`);
    toast(t('messages.saved'));
    await loadDb(); showSection('database');
  }

  async function loadDb() { if (!session) return; const { data, error } = await supabase.from('products').select('*').order('created_at',{ascending:false}); if (error) return toast(`Errore caricamento DB: ${error.message}`); dbCache = data || []; populateDashboardFilters(); applyFilters(); renderKpis(); renderAnalytics(); }
  function productSaleValue(row) { return +(row.sale_price ?? row.listing_price ?? row.sold_avg_price ?? 0) || 0; }
  function netSaleValue(row) { return productSaleValue(row) - (+row.real_shipping || 0) - (+row.packaging_cost || 0); }
  function readRange(minId,maxId) { const minRaw=$(minId)?.value, maxRaw=$(maxId)?.value; return { min:minRaw===''||minRaw==null?-Infinity:parseFloat(minRaw), max:maxRaw===''||maxRaw==null?Infinity:parseFloat(maxRaw) }; }

  function rowCreatedDate(row) { return new Date(row.created_at || Date.now()); }
  function rowEventDate(row) { return new Date(row.sale_date || row.created_at || Date.now()); }
  function inYearMonth(date, year, month) { const y = Number(year), m = month === 'all' ? 'all' : Number(month); if (!y || Number.isNaN(y)) return true; if (date.getFullYear() !== y) return false; if (m === 'all' || !m) return true; return date.getMonth() + 1 === m; }
  function aggregateMetrics(rows) {
    const soldRows = rows.filter(x => x.status === 'sold');
    return {
      stockPieces: rows.filter(x => ['in_stock','listed'].includes(x.status)).length,
      costs: rows.reduce((a,b)=>a+(+b.all_in_cost || +b.purchase_price || 0),0),
      probableSales: rows.filter(x => ['in_stock','listed'].includes(x.status)).reduce((a,b)=>a+productSaleValue(b),0),
      netSales: soldRows.reduce((a,b)=>a+netSaleValue(b),0),
      profit: rows.reduce((a,b)=>a+(+b.profit || 0),0),
      grossRevenue: soldRows.reduce((a,b)=>a+productSaleValue(b),0)
    };
  }
  function currentYearRows() { const year = new Date().getFullYear(); return dbCache.filter(row => rowCreatedDate(row).getFullYear() === year); }
  function currentMonthRows() { const now = new Date(); return dbCache.filter(row => rowCreatedDate(row).getFullYear() === now.getFullYear() && rowCreatedDate(row).getMonth() === now.getMonth()); }
  function allYears() { const years = [...new Set(dbCache.map(r => rowCreatedDate(r).getFullYear()))].sort((a,b)=>b-a); return years.length ? years : [new Date().getFullYear()]; }
  function populateDashboardFilters() {
    const yearSel = $('dashboardYear'), compareYear = $('compareYear'), monthSel = $('dashboardMonth'), compareMonth = $('compareMonth');
    if (!yearSel || !compareYear || !monthSel || !compareMonth) return;
    const years = allYears();
    const currentYear = String(new Date().getFullYear());
    const currentMonth = String(new Date().getMonth() + 1);
    const yearOptions = years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (!yearSel.dataset.ready) {
      yearSel.innerHTML = yearOptions;
      compareYear.innerHTML = `<option value="">${lang==='it'?'Nessun confronto':'No comparison'}</option>` + yearOptions;
      yearSel.value = yearSel.querySelector(`option[value="${currentYear}"]`) ? currentYear : String(years[0]);
      compareYear.value = '';
      yearSel.dataset.ready = compareYear.dataset.ready = '1';
    } else {
      const prev1 = yearSel.value, prev2 = compareYear.value;
      yearSel.innerHTML = yearOptions;
      compareYear.innerHTML = `<option value="">${lang==='it'?'Nessun confronto':'No comparison'}</option>` + yearOptions;
      yearSel.value = yearSel.querySelector(`option[value="${prev1}"]`) ? prev1 : String(years[0]);
      compareYear.value = prev2 && compareYear.querySelector(`option[value="${prev2}"]`) ? prev2 : '';
    }
    const labels = lang==='it' ? ['Tutti','Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'] : ['All','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthOptions = ['all',...Array.from({length:12},(_,i)=>String(i+1))].map((m,i)=>`<option value="${m}">${labels[i]}</option>`).join('');
    if (!monthSel.dataset.ready) {
      monthSel.innerHTML = monthOptions; compareMonth.innerHTML = monthOptions; monthSel.value='all'; compareMonth.value='all'; monthSel.dataset.ready = compareMonth.dataset.ready = '1';
    } else { const p1 = monthSel.value, p2 = compareMonth.value; monthSel.innerHTML = monthOptions; compareMonth.innerHTML = monthOptions; monthSel.value = p1 || 'all'; compareMonth.value = p2 || 'all'; }
    if (!$('chartLayoutMode')?.dataset.ready) { $('chartLayoutMode') && ($('chartLayoutMode').dataset.ready='1'); $('chartLayoutMode') && ($('chartLayoutMode').value='paired'); }
    updateChartLayout();
  }
  function updateChartLayout() { const grid = $('analyticsGrid'); if (!grid) return; grid.classList.toggle('single-column', ($('chartLayoutMode')?.value || 'paired') === 'single'); }
  function dashboardRowsFromSelectors(yearId, monthId) {
    const year = $(yearId)?.value || String(new Date().getFullYear());
    const month = $(monthId)?.value || 'all';
    return dbCache.filter(row => inYearMonth(rowCreatedDate(row), year, month));
  }
  function setMaybe(id, value, formatter=fmt) { if ($(id)) $(id).textContent = formatter(value); }

  function applyFilters() {
    if (!$('dbRows')) return;
    const mode = val('filterMode') || 'all', category = val('filterCategory') || 'all', status = val('filterStatus') || 'all';
    const sale = readRange('filterSaleMin','filterSaleMax'), profit = readRange('filterProfitMin','filterProfitMax'), cost = readRange('filterCostMin','filterCostMax');
    filteredDbCache = dbCache.filter(row => { const rowMode = row.analysis_mode || row.source_platform || 'vinted_ebay', rowCat = categoryKey(row.category), rowSale = productSaleValue(row), rowProfit = +row.profit || 0, rowCost = +row.all_in_cost || +row.purchase_price || 0; if(mode!=='all'&&rowMode!==mode)return false; if(category!=='all'&&rowCat!==categoryKey(category))return false; if(status!=='all'&&row.status!==status)return false; if(rowSale<sale.min||rowSale>sale.max)return false; if(rowProfit<profit.min||rowProfit>profit.max)return false; if(rowCost<cost.min||rowCost>cost.max)return false; return true; });
    renderDb();
  }
  function resetFilters() { ['filterMode','filterCategory','filterStatus'].forEach(id=>{ if($(id)) $(id).value='all'; }); ['filterSaleMin','filterSaleMax','filterProfitMin','filterProfitMax','filterCostMin','filterCostMax'].forEach(id=>{ if($(id)) $(id).value=''; }); applyFilters(); }

  function renderDb() {
    const body = $('dbRows'); if (!body) return; body.innerHTML=''; if ($('filterCount')) $('filterCount').textContent = t('messages.filteredCount')(filteredDbCache.length, dbCache.length);
    if (!filteredDbCache.length) { body.innerHTML = `<tr><td colspan="11">${t('messages.noProducts')}</td></tr>`; return; }
    filteredDbCache.forEach(row => {
      const tr = document.createElement('tr'); const statusOptions = STATUS_KEYS.filter(k=>k!=='watchlist').map(k => `<option value="${k}" ${row.status===k?'selected':''}>${statusLabel(k)}</option>`).join('');
      tr.innerHTML = `<td>${new Date(row.created_at).toLocaleDateString(lang==='it'?'it-IT':'en-GB')}</td><td>${escapeHtml(row.product_name)}</td><td>${modeLabel(row.analysis_mode || row.source_platform)}</td><td>${escapeHtml(categoryLabel(row.category))}</td><td><select class="table-select" data-status-select="${row.id}">${statusOptions}</select></td><td>${fmt(row.all_in_cost || row.purchase_price)}</td><td>${fmt(productSaleValue(row))}</td><td>${fmt(row.profit)}</td><td>${pct(row.roi)}</td><td>${escapeHtml(row.decision || '')}</td><td><div class="row-actions"><button class="btn small" data-update-status="${row.id}">${lang==='it'?'Aggiorna':'Update'}</button><button class="btn small danger" data-delete="${row.id}">${lang==='it'?'Elimina':'Delete'}</button></div></td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-update-status]').forEach(btn => btn.addEventListener('click', async()=>{ const id=btn.getAttribute('data-update-status'); const select=body.querySelector(`[data-status-select="${id}"]`); await updateProductStatus(id, select?.value || 'in_stock'); }));
    body.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async()=>{ const id=btn.getAttribute('data-delete'); if(!confirm(t('messages.confirmDelete'))) return; const {error}=await supabase.from('products').delete().eq('id',id); if(error)return toast(error.message); toast(t('messages.deleted')); await loadDb(); }));
  }

  async function updateProductStatus(id, status) { const payload = { status }; if (status === 'sold') { const row = dbCache.find(x=>x.id===id); payload.sale_date = row?.sale_date || new Date().toISOString().slice(0,10); payload.sale_price = row?.sale_price || row?.sold_avg_price || row?.listing_price || null; } const { error } = await supabase.from('products').update(payload).eq('id',id); if(error) return toast(`Errore aggiornamento stato: ${error.message}`); toast(t('messages.updatedStatus')(statusLabel(status))); await loadDb(); }
  async function bulkUpdateStatus() { const status = val('bulkStatus') || 'in_stock'; const ids = filteredDbCache.map(x=>x.id); if(!ids.length) return toast(t('messages.noFiltered')); if(!confirm(t('messages.confirmBulk')(ids.length, statusLabel(status)))) return; const payload = { status }; if(status==='sold') { payload.sale_date = new Date().toISOString().slice(0,10); } const { error } = await supabase.from('products').update(payload).in('id', ids); if(error) return toast(`Errore aggiornamento: ${error.message}`); toast(t('messages.bulkDone')(ids.length)); await loadDb(); }



  function renderKpis() {
    const ytdRows = currentYearRows();
    const metrics = aggregateMetrics(ytdRows);
    const top = topCategoryByMargin(ytdRows);
    setTextAll('[data-kpi="stockPieces"]', metrics.stockPieces);
    setTextAll('[data-kpi="costs"]', fmt(metrics.costs));
    setTextAll('[data-kpi="probableSales"]', fmt(metrics.probableSales));
    setTextAll('[data-kpi="netSales"]', fmt(metrics.netSales));
    setTextAll('[data-kpi="profit"]', fmt(metrics.profit));
    setTextAll('[data-kpi="grossRevenue"]', fmt(metrics.grossRevenue));
    setTextAll('[data-kpi="topCategory"]', top?.category ? categoryLabel(top.category) : '—');
    const soldYtd = ytdRows.filter(x => x.status === 'sold');
    const sellThrough = ytdRows.length ? soldYtd.length / ytdRows.length * 100 : 0;
    setTextAll('[data-kpi="sellThrough"]', pct(sellThrough));
  }
  function topCategoryByMargin(rows=dbCache) {
    const map = new Map();
    rows.forEach(row => {
      const cat = categoryKey(row.category);
      const curr = map.get(cat) || { category: cat, profit: 0, count: 0, revenue: 0 };
      curr.profit += +row.profit || 0;
      curr.revenue += productSaleValue(row);
      curr.count += 1;
      map.set(cat, curr);
    });
    return [...map.values()].sort((a,b)=>b.profit-a.profit)[0] || null;
  }
  function exportCurrentCsv() { const calc=renderCalculation(); if(!calc)return; const {input,out}=calc; downloadCsv('flipmate-prodotto.csv', [['prodotto','modalita','categoria','stato','costo_all_in','prezzo_annuncio','offerta_minima','break_even','utile','roi','decisione'], [input.productName, modeLabel(input.mode), categoryLabel(input.category), statusLabel(input.status), out.allIn, out.listing, out.minOffer, out.breakEven, out.profit, out.roi, out.decision]]); }
  function exportDbCsv() { const source = filteredDbCache.length ? filteredDbCache : dbCache; const rows = [['data','prodotto','modalita','categoria','stato','costo_acquisto','prezzo_vendita','utile','roi','decisione','note']]; source.forEach(r=>rows.push([r.created_at,r.product_name,modeLabel(r.analysis_mode||r.source_platform),categoryLabel(r.category),statusLabel(r.status),r.all_in_cost,productSaleValue(r),r.profit,r.roi,r.decision,r.notes])); downloadCsv('flipmate-database-filtrato.csv', rows); }

  function showSection(name) {
    ['home','calculator','database','dashboard','settings'].forEach(s => $(s+'Section')?.classList.toggle('hidden', s !== name));
    document.querySelectorAll('[data-app-section]').forEach(b => b.classList.toggle('active', b.dataset.appSection===name));
    if ($('appSectionMobileSelect')) $('appSectionMobileSelect').value = name;
    if (name === 'dashboard') renderAnalytics();
    if (name === 'database') applyFilters();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function chartClear(canvas) { const ctx=canvas?.getContext('2d'); if(!canvas||!ctx)return null; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#617086'; ctx.font='13px system-ui,-apple-system,Segoe UI,sans-serif'; return ctx; }
  function drawNoData(canvasId,text=t('messages.noData')) { const canvas=$(canvasId), ctx=chartClear(canvas); if(!ctx)return; ctx.fillText(text,24,44); }
  function drawBarChart(canvasId,data,formatter=fmt) { const canvas=$(canvasId), ctx=chartClear(canvas); if(!ctx)return; if(!data.length||data.every(d=>!d.value))return drawNoData(canvasId); const w=canvas.width,h=canvas.height,pad=46,max=Math.max(...data.map(d=>Math.abs(d.value)),1),barW=Math.max(28,(w-pad*2)/data.length*.58); data.forEach((d,i)=>{ const x=pad+i*((w-pad*2)/data.length)+barW*.25,bh=Math.max(4,Math.abs(d.value)/max*(h-pad*2)),y=h-pad-bh; const grad=ctx.createLinearGradient(0,y,0,h-pad); grad.addColorStop(0,'#0bbf8a'); grad.addColorStop(1,'#247cff'); ctx.fillStyle=grad; ctx.fillRect(x,y,barW,bh); ctx.fillStyle='#132033'; ctx.fillText(formatter(d.value),x,Math.max(18,y-8)); ctx.fillStyle='#617086'; ctx.fillText(String(d.label).slice(0,14),x,h-18); }); }
  function drawLineChart(canvasId,data) { const canvas=$(canvasId),ctx=chartClear(canvas); if(!ctx)return; if(data.length<2)return drawNoData(canvasId,t('messages.trendNeed')); const w=canvas.width,h=canvas.height,pad=46,max=Math.max(...data.map(d=>d.value),1),min=Math.min(...data.map(d=>d.value),0),range=Math.max(max-min,1); const point=(d,i)=>({x:pad+i*((w-pad*2)/(data.length-1)), y:h-pad-((d.value-min)/range)*(h-pad*2)}); ctx.strokeStyle='#0bbf8a'; ctx.lineWidth=3; ctx.beginPath(); data.forEach((d,i)=>{const p=point(d,i); if(i===0)ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);}); ctx.stroke(); data.forEach((d,i)=>{const p=point(d,i); ctx.fillStyle='#247cff'; ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#617086'; ctx.fillText(d.label,p.x-18,h-18); ctx.fillStyle='#132033'; ctx.fillText(fmt(d.value),p.x-22,p.y-12);}); }
  function renderAnalytics() {
    if(!$('revenueChart'))return;
    updateChartLayout();
    const ytd = aggregateMetrics(currentYearRows());
    const mtd = aggregateMetrics(currentMonthRows());
    const selectedRows = dashboardRowsFromSelectors('dashboardYear','dashboardMonth');
    const selected = aggregateMetrics(selectedRows);
    const compareRows = $('compareYear')?.value ? dbCache.filter(row => inYearMonth(rowCreatedDate(row), $('compareYear').value, $('compareMonth')?.value || 'all')) : [];
    const compare = aggregateMetrics(compareRows);
    setMaybe('ytdGrossRevenue', ytd.grossRevenue); setMaybe('ytdNetSales', ytd.netSales); setMaybe('ytdProfit', ytd.profit); setMaybe('ytdCosts', ytd.costs);
    setMaybe('mtdGrossRevenue', mtd.grossRevenue); setMaybe('mtdNetSales', mtd.netSales); setMaybe('mtdProfit', mtd.profit); setMaybe('mtdCosts', mtd.costs);
    setMaybe('selectedGrossRevenue', selected.grossRevenue); setMaybe('selectedNetSales', selected.netSales); setMaybe('selectedProfit', selected.profit); setMaybe('selectedCosts', selected.costs);
    setMaybe('deltaGrossRevenue', selected.grossRevenue - compare.grossRevenue); setMaybe('deltaNetSales', selected.netSales - compare.netSales); setMaybe('deltaProfit', selected.profit - compare.profit); setMaybe('deltaCosts', selected.costs - compare.costs);
    const revBars = [{label: lang==='it'?'Periodo lordo':'Selected gross', value:selected.grossRevenue},{label: lang==='it'?'Periodo netto':'Selected net', value:selected.netSales}];
    if (compareRows.length) { revBars.push({label: lang==='it'?'Confr. lordo':'Compare gross', value:compare.grossRevenue},{label: lang==='it'?'Confr. netto':'Compare net', value:compare.netSales}); }
    drawBarChart('revenueChart', revBars);
    const categories=new Map(); selectedRows.forEach(row=>{const cat=categoryKey(row.category), curr=categories.get(cat)||{label:categoryLabel(cat),value:0,count:0,revenue:0}; curr.value += +row.profit || 0; curr.revenue += productSaleValue(row); curr.count += 1; categories.set(cat,curr);});
    const catData=[...categories.values()].sort((a,b)=>b.value-a.value).slice(0,6);
    drawBarChart('categoryMarginChart',catData);
    renderCategoryRanking(catData);
    const trendYear = $('dashboardYear')?.value || String(new Date().getFullYear());
    const monthly=new Map(); dbCache.filter(r => rowCreatedDate(r).getFullYear() === Number(trendYear)).forEach(row=>{const dt=rowCreatedDate(row), key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`; monthly.set(key,(monthly.get(key)||0)+(+row.profit||0));});
    const trend=[...monthly.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([label,value])=>({label:label.slice(5),value}));
    drawLineChart('profitTrendChart',trend);
  }
  function renderCategoryRanking(data) { const box=$('categoryRanking'); if(!box)return; if(!data.length){box.innerHTML=`<p class="fineprint">${t('messages.noCategories')}</p>`;return;} box.innerHTML=data.map((d,i)=>`<div class="ranking-row"><span>${i+1}</span><strong>${escapeHtml(d.label)}</strong><em>${fmt(d.value)} ${lang==='it'?'margine':'margin'} · ${d.count} ${lang==='it'?'prodotti':'products'}</em></div>`).join(''); }

  async function saveProfileSettings() { const user=session?.user; if(!user)return; await upsertProfile(val('profileUsername'), val('profilePurpose')); await applyProfileToUi(); toast(t('messages.profileSaved')); }
  async function changeEmail() { const email=val('newEmail'); if(!email)return toast('Email'); const {error}=await supabase.auth.updateUser({email}); if(error)return toast(error.message); toast(t('messages.emailChange')); }
  async function resetPassword() { const email=session?.user?.email; if(!email)return toast('Email'); const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo: location.origin + location.pathname.replace('app.html','reset-password.html')}); if(error)return toast(error.message); toast(t('messages.resetSent')); }
  function resetCalculator() { ['productName','purchasePrice','purchaseShipping','salePrice','buyerShipping','realShipping','packCost','notes'].forEach(id=>{ if($(id)) $(id).value = id==='productName' ? '' : ''; }); if($('status')) $('status').value='watchlist'; renderCalculation(); }

  function bindAppEvents() {
    $('logoutBtn')?.addEventListener('click', async()=>{ await supabase.auth.signOut(); toast(t('messages.logout')); location.href='login.html'; });
    $('saveToDb')?.addEventListener('click', saveProduct); $('refreshDb')?.addEventListener('click', loadDb); $('exportDbCsv')?.addEventListener('click', exportDbCsv); $('exportSingleCsv')?.addEventListener('click', exportCurrentCsv); $('bulkUpdateStatus')?.addEventListener('click', bulkUpdateStatus);
    $('copySummary')?.addEventListener('click', async()=>{ const c=renderCalculation(); if(!c)return; await navigator.clipboard.writeText(`${c.input.productName}: ${c.out.decision}, ${t('kpi.profit')} ${fmt(c.out.profit)}, ROI ${pct(c.out.roi)}`); toast(t('messages.copied')); });
    $('analysisMode')?.addEventListener('change', applyModeFields); $('savePurpose')?.addEventListener('click', saveProfileSettings); $('saveProfile')?.addEventListener('click', saveProfileSettings); $('changeEmail')?.addEventListener('click', changeEmail); $('resetPassword')?.addEventListener('click', resetPassword); $('accountButton')?.addEventListener('click', ()=>showSection('settings')); $('resetCalculator')?.addEventListener('click', resetCalculator); $('applyFilters')?.addEventListener('click', applyFilters); $('resetFilters')?.addEventListener('click', resetFilters);
    ['filterMode','filterCategory','filterStatus','filterSaleMin','filterSaleMax','filterProfitMin','filterProfitMax','filterCostMin','filterCostMax'].forEach(id=>{ $(id)?.addEventListener('input',applyFilters); $(id)?.addEventListener('change',applyFilters); });
    document.querySelectorAll('[data-app-section]').forEach(btn=>btn.addEventListener('click',()=>showSection(btn.dataset.appSection)));
    $('appSectionMobileSelect')?.addEventListener('change', e => showSection(e.target.value));
    ['dashboardYear','dashboardMonth','compareYear','compareMonth','chartLayoutMode'].forEach(id=>{ $(id)?.addEventListener('change', renderAnalytics); });
    document.querySelectorAll('#calculatorForm input,#calculatorForm select,#calculatorForm textarea').forEach(el=>{ el.addEventListener('input', renderCalculation); el.addEventListener('change', renderCalculation); });
    $('profilePurpose')?.addEventListener('change',()=>{ if($('analysisMode')){ $('analysisMode').value=val('profilePurpose'); applyModeFields(); }});
  }

  applyTranslations(); bindLanguage();
  if (page === 'landing') landingInit();
  if (page === 'login') authPageInit('login');
  if (page === 'signup') authPageInit('signup');
  if (page === 'app') appInit();
})();
