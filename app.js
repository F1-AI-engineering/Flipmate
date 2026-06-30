const STORAGE = {
  user: 'flipmate_user_v3',
  params: 'flipmate_params_v3',
  products: 'flipmate_products_v3'
};

const DEFAULT_PARAMS = {
  ebayFeePct: 5.0,
  ebayRegulatoryPct: 0.43,
  ebayFixedFee: 0.35,
  vintedProtectionPct: 5.0,
  vintedProtectionFixed: 0.70,
  defaultVintedShipping: 4.00,
  defaultBuyerShipping: 6.50,
  defaultRealShipping: 5.20,
  defaultPackCost: 0.50,
  promoPct: 0,
  markupPct: 8,
  minProfit: 10,
  minRoiPct: 25,
  safetyDiscountPct: 10,
  minOfferDiscountPct: 8,
  liquidationDays: 45
};

const PARAM_FIELDS = [
  ['ebayFeePct', 'Commissione eBay %', 'free', 'Commissione variabile sul totale incassato'],
  ['ebayRegulatoryPct', 'Tariffa regolatoria %', 'free', 'Fee aggiuntiva sul totale incassato'],
  ['ebayFixedFee', 'Fee fissa eBay €', 'free', 'Costo fisso per ordine'],
  ['vintedProtectionPct', 'Protezione acquisti Vinted %', 'free', 'Costo variabile lato acquisto'],
  ['vintedProtectionFixed', 'Protezione Vinted fissa €', 'free', 'Costo fisso lato acquisto'],
  ['defaultVintedShipping', 'Spedizione Vinted default €', 'free', 'Costo spedizione quando compri'],
  ['defaultBuyerShipping', 'Spedizione buyer default €', 'free', 'Quanto addebiti al compratore'],
  ['defaultRealShipping', 'Spedizione reale default €', 'free', 'Quanto paghi davvero per spedire'],
  ['defaultPackCost', 'Imballo default €', 'free', 'Costo scatola/nastro/protezioni'],
  ['promoPct', 'Promo eBay %', 'premium', 'Campagne promosse / extra fee'],
  ['markupPct', 'Markup annuncio %', 'premium', 'Sovrapprezzo rispetto al fair value'],
  ['minProfit', 'Utile minimo €', 'premium', 'Utile netto minimo per comprare'],
  ['minRoiPct', 'ROI minimo %', 'premium', 'Rendimento minimo sul capitale'],
  ['safetyDiscountPct', 'Sconto prudenziale venduti %', 'premium', 'Taglio sul prezzo medio venduto'],
  ['minOfferDiscountPct', 'Sconto max offerta %', 'premium', 'Quanto puoi scendere dal fair value'],
  ['liquidationDays', 'Giorni liquidazione stock', 'premium', 'Dopo quanti giorni controllare/scontare']
];

const CATEGORIES = [
  { name:'Action figure anime', risk:'Medio', target:'25-40%', premium:'Regola premium: compra solo con box e almeno -35% sui venduti.', tips:['Banpresto, Ichibansho, Figuarts','Personaggi forti: Goku, Vegeta, Luffy, Zoro','Evita box distrutti o fake']},
  { name:'LEGO retired', risk:'Basso/Medio', target:'20-35%', premium:'Regola premium: priorità set piccoli sigillati o completi.', tips:['Star Wars, Harry Potter, Speed Champions','Codice set visibile','Confronta venduti e BrickLink']},
  { name:'Carte collezionabili', risk:'Medio/Alto', target:'30-60%', premium:'Regola premium: compra lotti solo con foto fronte/retro.', tips:['Pokémon, One Piece, Yu-Gi-Oh','Attenzione fake e condizioni','Meglio sealed o promo']},
  { name:'Videogiochi retro', risk:'Medio', target:'25-50%', premium:'Regola premium: priorità Nintendo e titoli cult completi.', tips:['DS, 3DS, Game Boy, PS1/PS2','Custodia + manuale aumentano prezzo','Test funzionamento obbligatorio']},
  { name:'Manga / Artbook', risk:'Medio', target:'25-45%', premium:'Regola premium: compra lotti e smembra solo se le serie sono liquide.', tips:['Variant, box, prime edizioni','Controlla ristampe disponibili','Occhio a danni e ingiallimento']},
  { name:'Funko / Collectibles', risk:'Medio/Alto', target:'30-50%', premium:'Regola premium: solo vaulted o IP forti, evitare comuni.', tips:['Controlla pop price guide/venduti','Scatola fondamentale','Mercato saturo']}
];

let state = { user:null, params:{...DEFAULT_PARAMS}, products:[] };
let lastCalc = null;
let lastPublicCalc = null;
let pendingAfterAuth = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const num = (v) => Number(String(v ?? 0).replace(',', '.')) || 0;
const money = (v) => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(num(v));
const pct = (v) => `${num(v).toFixed(1).replace('.', ',')}%`;
const today = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);

function load(){
  try { state.user = JSON.parse(localStorage.getItem(STORAGE.user)); } catch { state.user = null; }
  try { state.params = {...DEFAULT_PARAMS, ...JSON.parse(localStorage.getItem(STORAGE.params))}; } catch { state.params = {...DEFAULT_PARAMS}; }
  try { state.products = JSON.parse(localStorage.getItem(STORAGE.products)) || []; } catch { state.products = []; }
}
function save(){
  localStorage.setItem(STORAGE.params, JSON.stringify(state.params));
  localStorage.setItem(STORAGE.products, JSON.stringify(state.products));
  if(state.user) localStorage.setItem(STORAGE.user, JSON.stringify(state.user));
}
function isLogged(){ return Boolean(state.user); }
function isPremium(){ return state.user?.plan === 'premium'; }
function toast(msg){
  const t=$('#toast');
  if(!t) return alert(msg);
  t.textContent=msg;
  t.classList.remove('hidden');
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.classList.add('hidden'),2800);
}
function round(v){ return Math.round(num(v)*100)/100; }

function showApp(tab='dashboard'){
  $('#landing')?.classList.add('hidden');
  $('#app')?.classList.remove('hidden');
  renderAll();
  activateTab(tab);
}
function showLanding(scrollToCalc=false){
  $('#landing')?.classList.remove('hidden');
  $('#app')?.classList.add('hidden');
  renderPublicCalculator();
  if(scrollToCalc) setTimeout(()=>scrollToId('free-calculator'),50);
}
function scrollToId(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
function openAuth(mode='signup', message=''){
  if(isLogged()){ showApp('dashboard'); return; }
  $('#authEyebrow').textContent = mode === 'login' ? 'Accesso demo' : 'Registrazione gratuita';
  $('#authTitle').textContent = mode === 'login' ? 'Accedi al tuo workspace FlipMate' : 'Crea il tuo workspace FlipMate';
  $('#authText').textContent = message || 'Serve per salvare prodotti nel DB, vedere dashboard ed esportare CSV. In questa MVP i dati restano nel browser.';
  $('#authModal')?.classList.remove('hidden');
}
function closeAuth(){ $('#authModal')?.classList.add('hidden'); }
function requireAuth(reason='questa funzione'){
  if(isLogged()) return true;
  openAuth('signup', `Registrati gratis per usare ${reason}. Il calcolatore resta provabile senza account.`);
  return false;
}

function initLanding(){
  $$('[data-scroll-target]').forEach(btn => btn.addEventListener('click', () => scrollToId(btn.dataset.scrollTarget)));
  $$('[data-auth-open]').forEach(btn => btn.addEventListener('click', () => openAuth(btn.dataset.authOpen || 'signup')));
  $$('[data-auth-required]').forEach(btn => btn.addEventListener('click', () => requireAuth(btn.dataset.authRequired || 'questa funzione')));

  const video = $('#demoVideo');
  if(video){
    video.muted = true;
    video.playsInline = true;
    const tryPlay = () => video.play().catch(() => {});
    if(document.readyState === 'complete') tryPlay();
    else window.addEventListener('load', tryPlay, {once:true});
  }
}

function initAuth(){
  $('#closeAuth')?.addEventListener('click', closeAuth);
  $('#authModal')?.addEventListener('click', (e)=>{ if(e.target.id === 'authModal') closeAuth(); });
  $('#authForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    state.user = {
      name: $('#authName').value.trim(),
      email: $('#authEmail').value.trim(),
      plan: 'free',
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE.user, JSON.stringify(state.user));
    closeAuth();
    showApp('dashboard');
    const action = pendingAfterAuth;
    pendingAfterAuth = null;
    if(typeof action === 'function') action();
    toast('Registrazione demo completata. Ora puoi usare DB, dashboard ed export.');
  });
  $('#logoutBtn')?.addEventListener('click', ()=>{
    state.user=null;
    localStorage.removeItem(STORAGE.user);
    showLanding(false);
    toast('Logout effettuato. Il DB resta salvato nel browser.');
  });
  $('#backLandingBtn')?.addEventListener('click',()=>showLanding(false));
  $('#upgradeDemoBtn')?.addEventListener('click', ()=>{
    if(!requireAuth('Premium demo')) return;
    state.user.plan = isPremium() ? 'free' : 'premium';
    save();
    renderAll();
    toast(isPremium() ? 'Premium demo attivo.' : 'Tornato al piano Free.');
  });
}

function initNavigation(){
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    if(!requireAuth(btn.textContent.trim())) return;
    activateTab(btn.dataset.tab);
  }));
  $$('[data-tab-jump]').forEach(btn => btn.addEventListener('click', () => {
    if(!requireAuth(btn.textContent.trim())) return;
    activateTab(btn.dataset.tabJump);
  }));
}
function activateTab(tab){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.tab').forEach(s=>s.classList.toggle('active', s.id===tab));
}

function publicParams(){
  return {
    ebayFeePct: inputVal('pEbayFeePct', DEFAULT_PARAMS.ebayFeePct),
    ebayRegulatoryPct: inputVal('pRegPct', DEFAULT_PARAMS.ebayRegulatoryPct),
    ebayFixedFee: inputVal('pEbayFixed', DEFAULT_PARAMS.ebayFixedFee),
    vintedProtectionPct: inputVal('pVintedPct', DEFAULT_PARAMS.vintedProtectionPct),
    vintedProtectionFixed: inputVal('pVintedFixed', DEFAULT_PARAMS.vintedProtectionFixed),
    defaultVintedShipping: inputVal('pVintedShipping', DEFAULT_PARAMS.defaultVintedShipping),
    defaultBuyerShipping: inputVal('pBuyerShipping', DEFAULT_PARAMS.defaultBuyerShipping),
    defaultRealShipping: inputVal('pRealShipping', DEFAULT_PARAMS.defaultRealShipping),
    defaultPackCost: inputVal('pPackCost', DEFAULT_PARAMS.defaultPackCost),
    promoPct: 0,
    markupPct: DEFAULT_PARAMS.markupPct,
    minProfit: DEFAULT_PARAMS.minProfit,
    minRoiPct: DEFAULT_PARAMS.minRoiPct,
    safetyDiscountPct: DEFAULT_PARAMS.safetyDiscountPct,
    minOfferDiscountPct: DEFAULT_PARAMS.minOfferDiscountPct,
    liquidationDays: DEFAULT_PARAMS.liquidationDays
  };
}
function computeMargin(input, params){
  const p = {...DEFAULT_PARAMS, ...params};
  const soldAvg = num(input.soldAvg);
  const vintedPrice = num(input.vintedPrice);
  const vintedShipping = num(input.vintedShipping);
  const buyerShipping = num(input.buyerShipping);
  const realShipping = num(input.realShipping);
  const packCost = num(input.packCost);
  const promoPct = num(input.promoPct);
  const markupPct = num(input.markupPct);

  const vintedProtection = vintedPrice * p.vintedProtectionPct / 100 + p.vintedProtectionFixed;
  const allIn = vintedPrice + vintedShipping + vintedProtection;
  const fair = soldAvg * (1 - p.safetyDiscountPct / 100);
  const listing = fair * (1 + markupPct / 100);
  const minOffer = fair * (1 - p.minOfferDiscountPct / 100);
  const feeRate = (p.ebayFeePct + p.ebayRegulatoryPct + promoPct) / 100;
  const ebayFees = (fair + buyerShipping) * feeRate + p.ebayFixedFee;
  const profit = fair + buyerShipping - ebayFees - allIn - realShipping - packCost;
  const roi = allIn > 0 ? profit / allIn * 100 : 0;
  const breakEven = ((allIn + realShipping + packCost + p.ebayFixedFee) / Math.max(0.01, 1 - feeRate)) - buyerShipping;
  const feeOnFair = (fair + buyerShipping) * feeRate + p.ebayFixedFee;
  const netAfterSaleBeforeBuy = fair + buyerShipping - feeOnFair - realShipping - packCost;
  const maxAllInByProfit = netAfterSaleBeforeBuy - p.minProfit;
  const maxAllInByRoi = netAfterSaleBeforeBuy / (1 + p.minRoiPct/100);
  const maxAllIn = Math.min(maxAllInByProfit, maxAllInByRoi);
  const maxBuy = Math.max(0, (maxAllIn - p.vintedProtectionFixed - vintedShipping) / (1 + p.vintedProtectionPct/100));

  let decision = 'SCARTA';
  let cls = 'reject';
  let reason = `Utile ${money(profit)} e ROI ${pct(roi)} sotto target.`;
  if(profit >= p.minProfit && roi >= p.minRoiPct){
    decision='COMPRA'; cls='buy'; reason=`Supera utile minimo ${money(p.minProfit)} e ROI target ${pct(p.minRoiPct)}.`;
  } else if(profit >= p.minProfit*0.7 || roi >= p.minRoiPct*0.7){
    decision='TRATTA'; cls='negotiate'; reason=`Ci sei quasi: prova a scendere sotto ${money(maxBuy)} su Vinted.`;
  }
  return {soldAvg,vintedPrice,vintedShipping,buyerShipping,realShipping,packCost,promoPct,markupPct,allIn,fair,listing,minOffer,breakEven,maxBuy,profit,roi,decision,cls,reason};
}
function setCalcOutput(prefix, calc){
  const ids = {
    AllIn: calc.allIn,
    Fair: calc.fair,
    Listing: calc.listing,
    MinOffer: calc.minOffer,
    BreakEven: calc.breakEven,
    MaxBuy: calc.maxBuy,
    Profit: calc.profit,
    Roi: calc.roi
  };
  Object.entries(ids).forEach(([key,value])=>{
    const id = prefix ? `${prefix}Out${key}` : `out${key}`;
    const el = $(`#${id}`);
    if(!el) return;
    el.textContent = key === 'Roi' ? pct(value) : money(value);
  });
}
function renderPublicCalculator(){
  if(!$('#pSoldAvg')) return;
  const params = publicParams();
  const calc = computeMargin({
    soldAvg: inputVal('pSoldAvg'),
    vintedPrice: inputVal('pVintedPrice'),
    vintedShipping: inputVal('pVintedShipping'),
    buyerShipping: inputVal('pBuyerShipping'),
    realShipping: inputVal('pRealShipping'),
    packCost: inputVal('pPackCost'),
    promoPct: 0,
    markupPct: DEFAULT_PARAMS.markupPct
  }, params);
  lastPublicCalc = calc;
  setCalcOutput('p', calc);
  $('#publicDecision').textContent = calc.decision;
  $('#publicDecisionReason').textContent = calc.reason;
  $('#publicVerdictBox').className = `verdict ${calc.cls}`;
}
function savePublicCalcToDb(){
  const c = lastPublicCalc || renderPublicCalculator();
  state.products.push({
    id:uid(),
    name:'Calcolo prova',
    category:'Altro',
    status:'Stock',
    purchaseCost:round(c.allIn),
    listingPrice:round(c.listing),
    salePrice:0,
    realShipping:round(c.realShipping),
    packCost:round(c.packCost),
    profit:round(c.profit),
    roi:round(c.roi),
    buyDate:today(),
    sellDate:'',
    notes:`Creato da prova free. Decisione: ${c.decision}`
  });
  save();
  showApp('database');
  toast('Calcolo salvato nel database.');
}

function initPublicCalculator(){
  ['pSoldAvg','pVintedPrice','pVintedShipping','pBuyerShipping','pRealShipping','pPackCost','pEbayFeePct','pRegPct','pEbayFixed','pVintedPct','pVintedFixed'].forEach(id=>{
    $('#'+id)?.addEventListener('input', renderPublicCalculator);
  });
  $('#publicReset')?.addEventListener('click',()=>{
    $('#pSoldAvg').value=40;
    $('#pVintedPrice').value=20;
    $('#pVintedShipping').value=4;
    $('#pBuyerShipping').value=6.5;
    $('#pRealShipping').value=5.2;
    $('#pPackCost').value=.5;
    $('#pEbayFeePct').value=5;
    $('#pRegPct').value=.43;
    $('#pEbayFixed').value=.35;
    $('#pVintedPct').value=5;
    $('#pVintedFixed').value=.70;
    renderPublicCalculator();
  });
  $('#publicCopy')?.addEventListener('click', async()=>{
    const c = lastPublicCalc || renderPublicCalculator();
    const text = `FlipMate Free: ${c.decision}\nCosto all-in: ${money(c.allIn)}\nPrezzo annuncio: ${money(c.listing)}\nOfferta minima: ${money(c.minOffer)}\nUtile netto: ${money(c.profit)}\nROI: ${pct(c.roi)}`;
    try{ await navigator.clipboard.writeText(text); toast('Sintesi copiata.'); }catch{ toast(text); }
  });

  $('#publicSaveDb')?.addEventListener('click', ()=>{
    if(!isLogged()){
      pendingAfterAuth = savePublicCalcToDb;
      openAuth('signup', 'Registrati gratis per salvare questo calcolo nel database.');
      return;
    }
    savePublicCalcToDb();
  });
  $('#publicExportCsv')?.addEventListener('click', ()=>{
    if(!isLogged()){
      pendingAfterAuth = () => download('flipmate_database.csv', toCsv(state.products), 'text/csv;charset=utf-8');
      openAuth('signup', 'Registrati gratis per scaricare il CSV del database.');
      return;
    }
    download('flipmate_database.csv', toCsv(state.products), 'text/csv;charset=utf-8');
  });

}

function renderAll(){
  renderHeader();
  renderCategoriesSelect();
  renderParams();
  renderCategories();
  renderDb();
  renderDashboard();
  setPremiumLocks();
  calculate();
  renderPublicCalculator();
}
function renderHeader(){
  if(!state.user) return;
  $('#planBadge').textContent = isPremium() ? 'Premium demo' : 'Free';
  $('#userSummary').innerHTML = `<strong>${escapeHtml(state.user.name || 'Utente')}</strong><br><span class="muted">${escapeHtml(state.user.email || '')}</span>`;
  $('#upgradeDemoBtn').textContent = isPremium() ? 'Disattiva Premium demo' : 'Attiva Premium demo';
}
function renderCategoriesSelect(){
  const sel = $('#calcCategory');
  if(!sel) return;
  const previous = sel.value;
  sel.innerHTML = CATEGORIES.map(c=>`<option>${c.name}</option>`).join('') + '<option>Altro</option>';
  if(previous) sel.value = previous;
}
function renderParams(){
  const form = $('#paramsForm');
  if(!form) return;
  form.innerHTML = PARAM_FIELDS.map(([key,label,tier,help]) => {
    const locked = tier === 'premium' && !isPremium();
    return `<label class="${locked?'premium-locked':''}">${label} ${tier==='premium'?'<span class="pill premium-pill">Premium</span>':''}
      <input type="number" step="0.01" data-param="${key}" value="${state.params[key]}" ${locked?'disabled':''} />
      <span class="field-help">${help}${locked?' — sbloccabile Premium':''}</span>
    </label>`;
  }).join('');
  $$('[data-param]').forEach(inp => inp.addEventListener('input', () => {
    state.params[inp.dataset.param] = num(inp.value);
    save();
    applyDefaultInputs();
    calculate();
    renderDashboard();
  }));
}
function setPremiumLocks(){
  const premiumCalc = ['promoPct','markupPct'];
  premiumCalc.forEach(id=>{
    const el = $('#'+id);
    if(!el) return;
    if(isPremium()) el.disabled = false;
    else {
      el.disabled = true;
      el.value = state.params[id] ?? DEFAULT_PARAMS[id];
    }
  });
}
function renderCategories(){
  const box = $('#categoryCards');
  if(!box) return;
  box.innerHTML = CATEGORIES.map(c=>`<article class="category-card"><span class="eyebrow">Target ${c.target}</span><h3>${c.name}</h3><p>Rischio: <strong>${c.risk}</strong></p><ul>${c.tips.map(t=>`<li>${t}</li>`).join('')}</ul><p class="${isPremium()?'':'muted'}">${isPremium()?c.premium:'Strategia avanzata bloccata Premium.'}</p></article>`).join('');
}

function inputVal(id, fallback=0){
  const el=$('#'+id);
  return num(el?.value || fallback);
}
function calculate(){
  if(!$('#soldAvg')) return null;
  const calc = computeMargin({
    soldAvg: inputVal('soldAvg'),
    vintedPrice: inputVal('vintedPrice'),
    vintedShipping: inputVal('vintedShipping', state.params.defaultVintedShipping),
    buyerShipping: inputVal('buyerShipping', state.params.defaultBuyerShipping),
    realShipping: inputVal('realShipping', state.params.defaultRealShipping),
    packCost: inputVal('packCost', state.params.defaultPackCost),
    promoPct: isPremium() ? inputVal('promoPct', state.params.promoPct) : state.params.promoPct,
    markupPct: isPremium() ? inputVal('markupPct', state.params.markupPct) : state.params.markupPct
  }, state.params);
  calc.category = $('#calcCategory')?.value || 'Altro';
  calc.name = $('#calcName')?.value || '';
  lastCalc = calc;
  setCalcOutput('', calc);
  $('#decision').textContent=calc.decision;
  $('#decisionReason').textContent=calc.reason;
  $('#verdictBox').className=`verdict ${calc.cls}`;
  return calc;
}
function initCalc(){
  ['calcName','calcCategory','soldAvg','vintedPrice','vintedShipping','buyerShipping','realShipping','packCost','promoPct','markupPct'].forEach(id=>$('#'+id)?.addEventListener('input', calculate));
  $('#resetCalc')?.addEventListener('click', ()=>{
    $('#calcName').value='';
    $('#soldAvg').value=40;
    $('#vintedPrice').value=20;
    applyDefaultInputs();
    calculate();
  });
  $('#saveFromCalc')?.addEventListener('click', ()=>{
    if(!requireAuth('salvare prodotti nel database')) return;
    const c=calculate();
    if(!c) return;
    state.products.push({
      id:uid(),
      name:c.name || 'Prodotto senza nome',
      category:c.category,
      status:'Stock',
      purchaseCost:round(c.allIn),
      listingPrice:round(c.listing),
      salePrice:0,
      realShipping:round(c.realShipping),
      packCost:round(c.packCost),
      profit:round(c.profit),
      roi:round(c.roi),
      buyDate:today(),
      sellDate:'',
      notes:`Decisione: ${c.decision}`
    });
    save();
    renderAll();
    activateTab('database');
    toast('Prodotto salvato nel database.');
  });
  $('#copyCalc')?.addEventListener('click', async()=>{
    const c=calculate();
    const text=`FlipMate: ${c.decision}\nCosto all-in: ${money(c.allIn)}\nPrezzo annuncio: ${money(c.listing)}\nOfferta minima: ${money(c.minOffer)}\nUtile netto: ${money(c.profit)}\nROI: ${pct(c.roi)}`;
    try{ await navigator.clipboard.writeText(text); toast('Sintesi copiata.'); }catch{ toast(text); }
  });
}
function applyDefaultInputs(){
  const pairs = {
    vintedShipping: state.params.defaultVintedShipping,
    buyerShipping: state.params.defaultBuyerShipping,
    realShipping: state.params.defaultRealShipping,
    packCost: state.params.defaultPackCost,
    promoPct: state.params.promoPct,
    markupPct: state.params.markupPct
  };
  Object.entries(pairs).forEach(([id,value])=>{ const el=$('#'+id); if(el && !el.value) el.value=value; });
  ['vintedShipping','buyerShipping','realShipping','packCost','promoPct','markupPct'].forEach(id=>{
    const el = $('#'+id);
    if(el && (id === 'promoPct' || id === 'markupPct')) el.value = state.params[id];
  });
}

function calcProduct(row){
  const p=state.params;
  const sale=num(row.salePrice);
  const listing=num(row.listingPrice);
  const buyerShipping=p.defaultBuyerShipping;
  const selling = sale>0 ? sale : listing;
  const feeRate=(p.ebayFeePct+p.ebayRegulatoryPct)/100;
  const fee=(selling+buyerShipping)*feeRate+p.ebayFixedFee;
  const profit=selling+buyerShipping-fee-num(row.purchaseCost)-num(row.realShipping)-num(row.packCost);
  const roi=num(row.purchaseCost)>0 ? profit/num(row.purchaseCost)*100 : 0;
  return {profit,roi};
}
function renderDb(){
  const body=$('#dbBody');
  if(!body) return;
  if(!state.products.length){
    body.innerHTML='<tr><td colspan="12" class="muted">Nessun prodotto. Salva un calcolo o carica la demo.</td></tr>';
    return;
  }
  body.innerHTML=state.products.map((r)=>{
    const c=calcProduct(r);
    r.profit=round(c.profit);
    r.roi=round(c.roi);
    return `<tr data-id="${r.id}">
      <td><input data-field="name" value="${escapeAttr(r.name)}"></td>
      <td><select data-field="category">${[...CATEGORIES.map(c=>c.name),'Altro'].map(x=>`<option ${x===r.category?'selected':''}>${x}</option>`).join('')}</select></td>
      <td><select data-field="status"><option ${r.status==='Stock'?'selected':''}>Stock</option><option ${r.status==='Venduto'?'selected':''}>Venduto</option><option ${r.status==='Liquidare'?'selected':''}>Liquidare</option></select></td>
      <td><input type="number" step="0.01" data-field="purchaseCost" value="${r.purchaseCost}"></td>
      <td><input type="number" step="0.01" data-field="listingPrice" value="${r.listingPrice}"></td>
      <td><input type="number" step="0.01" data-field="salePrice" value="${r.salePrice}"></td>
      <td class="mini-profit ${c.profit>=0?'positive':'negative'}">${money(c.profit)}</td>
      <td>${pct(c.roi)}</td>
      <td><input type="date" data-field="buyDate" value="${r.buyDate||''}"></td>
      <td><input type="date" data-field="sellDate" value="${r.sellDate||''}"></td>
      <td><input data-field="notes" value="${escapeAttr(r.notes||'')}"></td>
      <td><button class="btn small danger" data-delete="${r.id}">×</button></td>
    </tr>`;
  }).join('');
  $$('[data-field]').forEach(inp=>inp.addEventListener('input', (e)=>{
    const tr=e.target.closest('tr');
    const item=state.products.find(x=>x.id===tr.dataset.id);
    if(!item) return;
    const f=e.target.dataset.field;
    item[f]=e.target.type==='number'?num(e.target.value):e.target.value;
    if(f==='salePrice' && num(item.salePrice)>0) item.status='Venduto';
    save();
    renderDashboard();
  }));
  $$('[data-delete]').forEach(btn=>btn.addEventListener('click',()=>{
    state.products=state.products.filter(x=>x.id!==btn.dataset.delete);
    save();
    renderAll();
  }));
}
function initDb(){
  $('#addManual')?.addEventListener('click',()=>{
    if(!requireAuth('aggiungere righe al database')) return;
    state.products.push({id:uid(),name:'Nuovo prodotto',category:'Altro',status:'Stock',purchaseCost:0,listingPrice:0,salePrice:0,realShipping:state.params.defaultRealShipping,packCost:state.params.defaultPackCost,profit:0,roi:0,buyDate:today(),sellDate:'',notes:''});
    save();
    renderDb();
    renderDashboard();
  });
  $('#clearDb')?.addEventListener('click',()=>{
    if(!requireAuth('svuotare il database')) return;
    if(confirm('Svuotare tutto il database locale?')){ state.products=[]; save(); renderAll(); }
  });
  $('#seedDemo')?.addEventListener('click',()=>{
    if(!requireAuth('caricare la demo nel database')) return;
    state.products = [
      {id:uid(),name:'Banpresto Goku Match Makers',category:'Action figure anime',status:'Stock',purchaseCost:25.7,listingPrice:42.9,salePrice:0,realShipping:5.2,packCost:.5,buyDate:today(),sellDate:'',notes:'Demo: box presente'},
      {id:uid(),name:'LEGO Speed Champions retired',category:'LEGO retired',status:'Venduto',purchaseCost:31.2,listingPrice:54.9,salePrice:52,realShipping:5.2,packCost:.7,buyDate:'2026-06-15',sellDate:'2026-06-22',notes:'Demo venduto'},
      {id:uid(),name:'Nintendo 3DS Pokémon lotto',category:'Videogiochi retro',status:'Liquidare',purchaseCost:62,listingPrice:92,salePrice:0,realShipping:5.2,packCost:.8,buyDate:'2026-05-10',sellDate:'',notes:'Demo: controllare prezzo'}
    ];
    save();
    renderAll();
    toast('Demo caricata.');
  });
}
function daysSince(d){
  if(!d) return 0;
  return Math.max(0, Math.floor((new Date() - new Date(d))/(1000*60*60*24)));
}
function renderDashboard(){
  const sold=state.products.filter(x=>x.status==='Venduto' || num(x.salePrice)>0);
  const active=state.products.filter(x=>x.status!=='Venduto' && !num(x.salePrice));
  let revenue=0, profit=0, roiSum=0, roiCount=0, stock=0;
  state.products.forEach(r=>{
    const c=calcProduct(r);
    if(r.status==='Venduto'||num(r.salePrice)>0){
      revenue += num(r.salePrice) || num(r.listingPrice);
      profit += c.profit;
      roiSum += c.roi;
      roiCount++;
    } else stock += num(r.purchaseCost);
  });
  $('#kpiRevenue').textContent=money(revenue);
  $('#kpiProfit').textContent=money(profit);
  $('#kpiRoi').textContent=pct(roiCount?roiSum/roiCount:0);
  $('#kpiStock').textContent=money(stock);
  $('#performanceList').innerHTML = [
    ['Prodotti totali', state.products.length],
    ['Venduti', sold.length],
    ['In stock', active.length],
    ['Capitale bloccato', money(stock)],
    ['Piano attuale', isPremium()?'Premium demo':'Free']
  ].map(([a,b])=>`<div class="metric-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
  const alerts=active.map(r=>({...r, days:daysSince(r.buyDate), calc:calcProduct(r)})).filter(r=>r.days>=state.params.liquidationDays || r.status==='Liquidare').sort((a,b)=>b.days-a.days);
  $('#alertsBody').innerHTML = alerts.length ? alerts.map(r=>`<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.category)}</td><td>${escapeHtml(r.status)}</td><td>${r.days}</td><td>${money(r.calc.profit)}</td><td>${r.days>=state.params.liquidationDays?'Sconta / ricontrolla venduti':'Monitora'}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">Nessun alert.</td></tr>';
}

function initParams(){
  $('#resetParams')?.addEventListener('click',()=>{
    if(!requireAuth('modificare i parametri')) return;
    state.params={...DEFAULT_PARAMS};
    save();
    applyDefaultInputs();
    renderAll();
    toast('Parametri ripristinati.');
  });
}
function initExport(){
  $('#exportCsv')?.addEventListener('click',()=>{
    if(!requireAuth('scaricare il CSV')) return;
    download('flipmate_database.csv', toCsv(state.products), 'text/csv;charset=utf-8');
  });
  $('#exportJson')?.addEventListener('click',()=>{
    if(!requireAuth('scaricare il backup JSON')) return;
    download('flipmate_backup.json', JSON.stringify({user:state.user,params:state.params,products:state.products},null,2), 'application/json');
  });
  $('#importJson')?.addEventListener('change', async(e)=>{
    if(!requireAuth('importare backup')) return;
    const file=e.target.files[0];
    if(!file) return;
    try{
      const data=JSON.parse(await file.text());
      state.params={...DEFAULT_PARAMS,...(data.params||{})};
      state.products=data.products||[];
      save();
      applyDefaultInputs();
      renderAll();
      toast('Backup importato.');
    }catch{
      toast('File JSON non valido.');
    }
  });
}
function toCsv(rows){
  const headers=['name','category','status','purchaseCost','listingPrice','salePrice','profit','roi','buyDate','sellDate','notes'];
  const lines=[headers.join(';')];
  rows.forEach(r=>{
    const c=calcProduct(r);
    const obj={...r,profit:round(c.profit),roi:round(c.roi)};
    lines.push(headers.map(h=>`"${String(obj[h]??'').replaceAll('"','""')}"`).join(';'));
  });
  return lines.join('\n');
}
function download(filename, content, type){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
}
function escapeHtml(s){ return String(s??'').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/`/g,'&#96;'); }

function boot(){
  load();
  initLanding();
  initPublicCalculator();
  initAuth();
  initNavigation();
  initCalc();
  initDb();
  initParams();
  initExport();
  renderPublicCalculator();
  renderCategoriesSelect();
  applyDefaultInputs();
  if(isLogged()) showApp('dashboard');
  else showLanding(false);
}
boot();
