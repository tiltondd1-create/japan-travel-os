const APP_VERSION = '1.0 RC6 · Travel Companion';

const CONFIG = {
  API_URL: './api',
  CACHE_KEY: 'travel-os-1-0-rc6-data',
  FAVORITES_KEY: 'travel-os-1-0-rc6-favorites',
  FX_KEY: 'travel-os-1-0-rc6-fx',
  CASH_KEY: 'travel-os-1-0-rc6-cash',
  MEDS_KEY: 'travel-os-1-0-rc6-meds',
  STATUS_KEY: 'travel-os-1-0-rc6-family-status',
  PREFS_KEY: 'travel-os-1-0-rc6-prefs',
  QUEST_KEY: 'travel-os-1-0-rc6-photo-quest',
  SPEND_KEY: 'travel-os-1-0-rc6-spend',
  RESTAURANT_STATUS_KEY: 'travel-os-1-0-rc6-restaurant-status',
  MEMORY_KEY: 'travel-os-1-0-rc6-memory-book',
  RESERVATION_KEY: 'travel-os-1-0-rc6-reservation-assistant',
  PACKING_INTEL_KEY: 'travel-os-1-0-rc6-packing-intel',
  STALE_MS: 1000 * 60 * 10
};

const VIEW_SECTIONS = {
  dn: ['reservations','smartAlerts','packing','budget'],
  phrases: ['phraseFavorites','phrases'],
  sos: ['emergency'],
  lost: ['lost'],
  food: ['restaurants','foodChallenge'],
  maps: ['maps'],
  rain: ['rain'],
  academy: ['firstTime'],
  useful: ['konbiniGuide','bathroom','seasonal','etiquetteCards'],
  timeline: ['countdown','resTimeline','reservations'],
  shopping: ['shopping'],
  transit: ['transitCards'],
  search: ['restaurants','maps','phrases','phraseFavorites','emergency','lost','reservations','shopping'],
  favorites: ['restaurants','maps','phrases','phraseFavorites','shopping'],
  packing: ['packing','luggage'],
  budget: ['budget','money'],
  journal: ['journal'],
  suica: ['transitCards','money'],
  explore: ['tokyo','kyoto','hakoneNara','maps','restaurants','seasonal'],
  medical: ['emergency','lost'],
  peaceOfMind: ['gfRestaurants','gfKonbini','gfRyokan','bathroom','emergency','lost','hotels','phrases'],
  bathroom: ['bathroom','maps'],
  konbiniExplorer: ['konbiniGuide','konbini','phrases'],
  seasonalGuide: ['seasonal','rain'],
  souvenirs: ['shopping','budget'],
  currency: ['money','budget'],
  money: ['money','budget'],
  beforeTrip: ['pretrip','packing','reservations','flights','hotels','transitCards'],
  airport: ['flights','hotels','transitCards','phrases','emergency'],
  transitMode: ['transitCards','money','maps','hotels'],
  evening: ['journal','packing','reservations','weather','dailyBrief'],
  admin: ['appConfig','smartAlerts'],
  confidence: ['firstTime','etiquetteCards','transitCards','restaurants','maps'],
  familyStatus: ['hotels','maps'],
  memoryBook: ['journal','restaurants','shopping','budget'],
  photoQuest: [],
  settings: [],
  seasonalEvents: ['seasonal','rain'],
  artDirection: ['tokyo','kyoto','hakoneNara'],
  tokyo: ['tokyo','maps','restaurants','seasonal'],
  hakone: ['hakoneNara','maps','gfRyokan','seasonal'],
  kyoto: ['kyoto','maps','restaurants','seasonal'],
  osaka: ['osaka','maps','restaurants','shopping','transitCards'],
  nara: ['hakoneNara','maps','restaurants','seasonal'],
  travelers: ['hotels','maps'],
  david: ['reservations','packing','budget','maps'],
  noelle: ['reservations','shopping','budget','restaurants'],
  more: [],
  restaurantsPlus: ['restaurants','foodChallenge'],
  reservationsPlus: ['reservations','flights','hotels','transitCards','resTimeline'],
  home: ['reservations'],
  companion: ['restaurants'],
  timelinePro: [],
  reservationAssistant: ['restaurants'],
  liveTransit: ['transitCards'],
  weatherPlanner: ['rain'],
  packingIntel: [],
  budgetPro: ['budget'],
  mapExplorer: ['maps','restaurants'],
  dailyBriefPro: ['restaurants']
};

const CRITICAL_SECTIONS = ['emergency','lost','phraseFavorites','phrases','maps','hotels'];
const PRIMARY_TABS = ['home','today','hilda','travelers','sos','more'];
const TRAVELER_TABS = ['david','noelle','nick','hilda'];
const DESTINATION_TABS = ['tokyo','hakone','kyoto','osaka','nara'];


function loadFx(){
  try { return JSON.parse(localStorage.getItem(CONFIG.FX_KEY)||'null') || {rate:145, updatedAt:null, source:'offline estimate'}; }
  catch(e){ return {rate:145, updatedAt:null, source:'offline estimate'}; }
}
function saveFx(fx){ localStorage.setItem(CONFIG.FX_KEY, JSON.stringify(fx)); }
function loadCash(){ try{return JSON.parse(localStorage.getItem(CONFIG.CASH_KEY)||'{}')}catch(e){return{}} }
function loadMeds(){ try{return JSON.parse(localStorage.getItem(CONFIG.MEDS_KEY)||'{}')}catch(e){return{}} }
function saveMeds(){ localStorage.setItem(CONFIG.MEDS_KEY, JSON.stringify(state.meds||{})); }
function saveCash(){ localStorage.setItem(CONFIG.CASH_KEY, JSON.stringify(state.cash||{})); }


function loadPrefs(){
  try{
    return Object.assign(
      {profile:'',largeText:false,suica:true,onboarded:false},
      JSON.parse(localStorage.getItem(CONFIG.PREFS_KEY)||'{}')
    );
  }catch(e){ return {profile:'',largeText:false,suica:true,onboarded:false}; }
}
function savePrefs(){
  localStorage.setItem(CONFIG.PREFS_KEY, JSON.stringify(state.prefs||{}));
  document.body.classList.toggle('largeTextMode', !!state.prefs?.largeText);
}
function loadQuest(){ try{return JSON.parse(localStorage.getItem(CONFIG.QUEST_KEY)||'{}')}catch(e){return{}} }
function saveQuest(){ localStorage.setItem(CONFIG.QUEST_KEY, JSON.stringify(state.quest||{})); }
function loadSpend(){ try{return JSON.parse(localStorage.getItem(CONFIG.SPEND_KEY)||'[]')}catch(e){return[]} }
function saveSpend(){ localStorage.setItem(CONFIG.SPEND_KEY, JSON.stringify(state.spend||[])); }
function loadRestaurantStatus(){ try{return JSON.parse(localStorage.getItem(CONFIG.RESTAURANT_STATUS_KEY)||'{}')}catch(e){return{}} }
function saveRestaurantStatus(){ localStorage.setItem(CONFIG.RESTAURANT_STATUS_KEY, JSON.stringify(state.restaurantStatus||{})); }
function loadObject(key,fallback={}){ try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch(e){return fallback} }
function saveObject(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
function saveMemory(){ saveObject(CONFIG.MEMORY_KEY,state.memoryBook||{}); }
function saveReservationAssistant(){ saveObject(CONFIG.RESERVATION_KEY,state.reservationAssistant||{}); }
function savePackingIntel(){ saveObject(CONFIG.PACKING_INTEL_KEY,state.packingIntel||{}); }
function restaurantStateKey(r){ return String(r.ID||r.Name||'restaurant'); }
function cycleRestaurantStatusById(id){
  const r=(state.sections.restaurants||[]).find(row=>String(row.ID||row.Name)===String(id));
  if(!r) return;
  const key=restaurantStateKey(r);
  const options=['Not booked','Need to reserve','Requested','Waitlist','Confirmed'];
  const current=state.restaurantStatus[key]||r['Reservation Status']||'Not booked';
  state.restaurantStatus[key]=options[(options.indexOf(current)+1)%options.length];
  saveRestaurantStatus(); haptic('success'); renderFoodHub();
}
function haptic(kind='light'){
  try{
    if(!navigator.vibrate) return;
    navigator.vibrate(kind==='success'?[18,35,18]:kind==='strong'?[28]:[10]);
  }catch(e){}
}

function loadFamilyStatus(){ try{return JSON.parse(localStorage.getItem(CONFIG.STATUS_KEY)||'{}')}catch(e){return{}} }
function saveFamilyStatus(){ localStorage.setItem(CONFIG.STATUS_KEY, JSON.stringify(state.familyStatus||{})); }

let state = {
  view: 'home',
  core: null,
  weather: null,
  sections: {},
  offline: false,
  syncStatus: 'Starting',
  phraseCat: '',
  phraseSearch: '',
  searchQuery: '',
  favorites: loadFavorites(),
  familyStatus: loadFamilyStatus(),
  fx: loadFx(),
  cash: loadCash(),
  meds: loadMeds(),
  moneyInput: 1000,
  moneyMode: 'jpyToUsd',
  drawerOpen: false,
  quickOpen: false,
  lastMainView: 'home',
  prefs: loadPrefs(),
  quest: loadQuest(),
  spend: loadSpend(),
  onboardingOpen: false,
  loadingSections: {},
  lastSyncTime: null,
  foodSearch: '',
  foodCity: 'All',
  foodMeal: 'All',
  foodDiet: 'All',
  foodPriority: 'All',
  foodMichelinOnly: false,
  restaurantStatus: loadRestaurantStatus(),
  memoryBook: loadObject(CONFIG.MEMORY_KEY,{}),
  reservationAssistant: loadObject(CONFIG.RESERVATION_KEY,{}),
  packingIntel: loadObject(CONFIG.PACKING_INTEL_KEY,{}),
  companionSearch: '',
  companionCity: 'All'
};

const app = document.getElementById('app');
const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const attr = v => esc(v).replace(/`/g,'&#96;');

async function api(action, params='') {
  const res = await fetch(`${CONFIG.API_URL}?action=${encodeURIComponent(action)}${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'API returned ok:false');
  return data;
}
function loadFavorites(){ try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)||'[]'); } catch(e){ return []; } }
function saveFavorites(){ localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(state.favorites)); }
function favKey(type, label){ return `${type}:${label}`; }
function isFav(type,label){ return state.favorites.some(f=>f.key===favKey(type,label)); }
function toggleFav(type,label,data={}){ haptic('success'); const key=favKey(type,label); const i=state.favorites.findIndex(f=>f.key===key); if(i>=0) state.favorites.splice(i,1); else state.favorites.push({key,type,label,data,addedAt:Date.now()}); saveFavorites(); render(); }
function favButton(type,label,data={}){ const on=isFav(type,label); return `<button class="favBtn ${on?'on':''}" onclick='toggleFav(${JSON.stringify(type)},${JSON.stringify(label)},${JSON.stringify(data)})'>${on?'★':'☆'}</button>`; }

function saveCache(){ localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({time:Date.now(),state:{core:state.core,weather:state.weather,sections:state.sections}})); }
function loadCache(){ try{ const raw=JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY)||'null'); if(raw?.state?.core){ state.core=raw.state.core; state.weather=raw.state.weather; state.sections=raw.state.sections||{}; state.offline=true; state.syncStatus='Cached'; return raw.time||0; } }catch(e){} return 0; }
async function clearAllCaches(){ localStorage.removeItem(CONFIG.CACHE_KEY); if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); } }

async function init(){
  const params=new URLSearchParams(location.search);
  state.onboardingOpen=!state.prefs.onboarded;
  document.body.classList.toggle('largeTextMode', !!state.prefs.largeText);
  if(params.has('reset')||params.has('clearCache')) await clearAllCaches();
  const cacheTime=loadCache();
  if(state.core) render();
  const stale=!cacheTime || Date.now()-cacheTime>CONFIG.STALE_MS;
  if(!state.core || stale) await syncCore(); else { syncCore(true); refreshWeather(); prefetchCritical(); refreshFx(); }
}
async function syncCore(background=false){
  try{
    state.syncStatus=background?'Updating':'Syncing';
    if(!background && !state.core) app.innerHTML=boot('Syncing Travel OS…');
    state.core=await api('core');
    state.offline=false; state.syncStatus='Synced'; state.lastSyncTime=new Date().toISOString(); saveCache(); render(); refreshWeather(); prefetchCritical();
  }catch(e){
    state.syncStatus='Offline';
    if(state.core){ state.offline=true; render(); }
    else app.innerHTML=`<div class="app"><div class="card red"><h2>Could not load app</h2><p>${esc(e.message)}</p><p class="debug">Version: ${APP_VERSION}\nProxy URL: ${CONFIG.API_URL}\nTry: ?reset=1\nTest: /api?action=core</p></div></div>`;
  }
}
async function refreshWeather(){ try{ state.weather=await api('weather'); saveCache(); render(); }catch(e){} }
async function loadSection(name){ if(state.sections[name]) return state.sections[name]; state.loadingSections[name]=true; try{ const payload=await api('section','&section='+encodeURIComponent(name)); state.sections[name]=payload.rows||[]; delete state.loadingSections[name]; saveCache(); render(); return state.sections[name]; }catch(e){ delete state.loadingSections[name]; state.offline=true; render(); } return []; }
function ensureSections(names){ names.forEach(n=>{ if(!state.sections[n]) loadSection(n); }); }
function prefetchCritical(){ CRITICAL_SECTIONS.forEach(loadSection); }
function setView(view){
  haptic('light');
  state.view=view;
  if(PRIMARY_TABS.includes(view) && view!=='more') state.lastMainView=view;
  state.drawerOpen=false;
  state.quickOpen=false;
  document.body.classList.remove('drawer-open','quick-open');
  ensureSections(VIEW_SECTIONS[view]||[]);
  render();
  scrollTo({top:0,behavior:'smooth'});
}
function today(){ return state.core?.today||{}; }
function dateRows(){ return (state.core?.itinerary||[]).filter(r=>r.Date); }
function setDate(date){ const row=dateRows().find(r=>r.Date===date); if(!row)return; state.core.selectedDate=date; state.core.selectedDateNice=row.Date_nice||date; state.core.today=row; saveCache(); refreshWeather(); render(); }
function shiftDate(delta){ const rows=dateRows(); const i=rows.findIndex(r=>r.Date===state.core.selectedDate); const next=Math.max(0,Math.min(rows.length-1,(i<0?0:i)+delta)); setDate(rows[next].Date); }

function boot(msg){ return `<div class="boot"><div class="boot-card"><div class="boot-logo">🇯🇵</div><h1>Japan 2026</h1><p>${esc(msg)}</p></div></div>`; }
function openDrawer(){
  haptic('light');
  state.drawerOpen=true;
  document.body.classList.add('drawer-open');
  render();
}
function closeDrawer(){
  state.drawerOpen=false;
  document.body.classList.remove('drawer-open');
  render();
}
function toggleQuick(){
  haptic('light');
  state.quickOpen=!state.quickOpen;
  document.body.classList.toggle('quick-open',state.quickOpen);
  render();
}
function drawerItem(icon,label,view,sub=''){
  return `<button class="drawerItem ${state.view===view?'active':''}" onclick="setView('${view}')"><span>${icon}</span><div><strong>${esc(label)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</div><b>›</b></button>`;
}
function drawer(){
  if(!state.drawerOpen) return '';
  return `<div class="drawerLayer" onclick="closeDrawer()">
    <aside class="drawerPanel" onclick="event.stopPropagation()">
      <div class="drawerTop"><div><strong>Travel OS</strong><small>Japan 2026 · 14 days</small></div><button onclick="closeDrawer()" aria-label="Close menu">×</button></div>
      <div class="systemStrip"><span>${state.offline?'Offline copy':'Online'}</span><span>${esc(state.syncStatus)}</span><span>$1 ≈ ¥${Math.round(state.fx?.rate||145)}</span></div>
      <div class="drawerSearch" onclick="setView('search')">🔎 Search everything</div>

      <div class="drawerLabel">PLAN</div>
      ${drawerItem('🏠','Home','home')}
      ${drawerItem('📅','Today','today')}
      ${drawerItem('✈️','Airport Mode','airport')}
      ${drawerItem('🚉','Transit Mode','transitMode')}
      ${drawerItem('🌙','Evening Mode','evening')}

      <div class="drawerLabel">TRAVELERS</div>
      ${drawerItem('👤','David','david','Planning and logistics')}
      ${drawerItem('👤','Noelle','noelle','Shopping, food, and planning')}
      ${drawerItem('👦','Nick','nick','Food, shopping, and first-time tips')}
      ${drawerItem('👩','Hilda','hilda','Simple plan and help')}

      <div class="drawerLabel">EXPLORE</div>
      ${drawerItem('🗼','Tokyo','tokyo')}
      ${drawerItem('♨️','Hakone','hakone')}
      ${drawerItem('⛩️','Kyoto','kyoto')}
      ${drawerItem('🌃','Osaka','osaka','Two-day stay')}
      ${drawerItem('🦌','Nara','nara')}

      <div class="drawerLabel">SUPPORT & TOOLS</div>
      ${drawerItem('🧭','Travel Companion','companion','RC6 command center')}
      ${drawerItem('🕒','Daily Timeline','timelinePro','Time-based day view')}
      ${drawerItem('🎟️','Reservation Assistant','reservationAssistant','Booking countdowns')}
      ${drawerItem('🍜','Food','food')}
      ${drawerItem('🗺️','Map Explorer','mapExplorer','All saved places')}
      ${drawerItem('🌦️','Weather Planner','weatherPlanner','Rain-aware planning')}
      ${drawerItem('🚄','Live Transit','liveTransit','Routes and status links')}
      ${drawerItem('🎒','Packing Intelligence','packingIntel','Context-aware carry list')}
      ${drawerItem('📊','Budget Dashboard','budgetPro','Planned vs actual')}
      ${drawerItem('☀️','Daily Brief','dailyBriefPro','Morning command brief')}
      ${drawerItem('📖','Memory Book','memoryBook','Printable trip recap')}
      ${drawerItem('🛍️','Shopping','shopping')}
      ${drawerItem('🚇','Transit','transit')}
      ${drawerItem('💴','Money Hub','money')}
      ${drawerItem('❤️','Peace of Mind','peaceOfMind')}
      ${drawerItem('📍','Maps','maps')}
      ${drawerItem('🇯🇵','Phrases','phrases')}
      ${drawerItem('🎒','Packing','packing')}
      ${drawerItem('📖','Journal','journal')}
      ${drawerItem('📸','Photo Quest','photoQuest')}
      ${drawerItem('🍁','Seasonal Events','seasonalEvents')}
      ${drawerItem('☔','Rain Mode','rain')}
      ${drawerItem('⚙️','Settings','settings')}
      ${drawerItem('🛠','System','system')}
    </aside>
  </div>`;
}
function quickMenu(){
  if(!state.quickOpen) return '';
  return `<div class="quickSheet" onclick="toggleQuick()">
    <div class="quickSheetPanel" onclick="event.stopPropagation()">
      <div class="quickHandle"></div>
      <h2>Quick Actions</h2>
      <div class="quickGrid">
        ${tile('🚻','Bathroom','Find help fast','bathroom')}
        ${tile('🏨','Hotel','Address and map','maps')}
        ${tile('💴','Convert Yen','Money Hub','money')}
        ${tile('🇯🇵','Show Phrase','Phrasebook','phrases')}
        ${tile('🍜','Food','Restaurants','food')}
        ${tile('📸','Photo Quest','Trip challenge','photoQuest')}
        ${tile('❤️','Peace of Mind','GF + comfort','peaceOfMind')}
        ${tile('🆘','Lost','Separated plan','lost')}
        ${tile('🚨','Emergency','SOS','sos')}
      </div>
    </div>
  </div>`;
}
function shell(content,cls=''){
  return `<div class="app ${cls}">
    <div class="top">
      <button class="menuButton" onclick="openDrawer()" aria-label="Open all menus">☰</button>
      <div class="brand"><div class="brandIcon">🇯🇵</div><div><b>Travel OS</b><small>Japan 2026 · 14 days</small></div></div>
      <div class="status">${state.syncStatus}</div>
    </div>
    ${state.offline?'<div class="offline">Offline copy — showing saved trip data.</div>':''}
    ${installPromptCard()}${content}${versionFooter()}
  </div>${nav()}${fab()}${drawer()}${quickMenu()}${onboarding()}`;
}
function nav(){
  const tabs=[
    ['home','⌂','Home'],
    ['today','▣','Today'],
    ['hilda','H','Hilda'],
    ['travelers','◎','Travelers'],
    ['sos','!','SOS'],
    ['more','☰','More']
  ];
  return `<div class="nav">${tabs.map(([v,i,l])=>`<button class="${state.view===v?'active':''}" onclick="${v==='more'?'openDrawer()':`setView('${v}')`}"><span>${i}</span><small>${l}</small></button>`).join('')}</div>`;
}
function fab(){
  return `<button class="fab" onclick="toggleQuick()" aria-label="Quick actions">${state.quickOpen?'×':'+'}</button>`;
}
function swipeHint(){ return ''; }
function controls(){ return `<div class="controls"><button onclick="shiftDate(-1)">←</button><input type="date" value="${esc(state.core?.selectedDate||'')}" onchange="setDate(this.value)"><button onclick="shiftDate(1)">→</button></div>`; }
function hero(){ return `<div class="card hero"><h1>🇯🇵 JAPAN<br>2026</h1><p>Family Travel OS</p></div>`; }
function metrics(t){ return `<div class="metrics"><div class="metric">⚡ ${esc(t.Energy||'')}</div><div class="metric">👥 ${esc(t.Crowd||'')}</div><div class="metric">👟 ${esc(t.Walking||'')}</div></div>`; }
function weatherCard(){ const w=state.weather; if(!w)return `<div class="card"><div class="muted">Weather loading…</div></div>`; if(!w.available)return `<div class="card"><div class="weather"><div class="weatherIcon">🌤️</div><div><h3>Weather · ${esc(w.city||'')}</h3><div class="muted">${esc(w.message||'Available closer to trip')}</div><small>${esc(w.detail||'')}</small></div></div></div>`; return `<div class="card"><div class="weather"><div class="weatherIcon">${esc(w.icon)}</div><div><h3>Weather · ${esc(w.city)}</h3><div class="temp">${esc(w.highF)}° / ${esc(w.lowF)}°F · ${esc(w.summary)}</div><div class="muted">Rain ${esc(w.precipProbability)}% · Bring ${esc(w.bring)}</div></div></div></div>`; }
function card(title,text,style=''){ return `<div class="card ${style}"><h2>${title}</h2><p>${esc(text||'')}</p></div>`; }
function dayCards(){ const t=today(); return `<div class="card"><h2>Timeline</h2><div class="timeline"><div class="timeBlock"><strong>☀ Morning</strong><p>${esc(t.Morning||'')}</p></div><div class="timeBlock"><strong>🌤 Afternoon</strong><p>${esc(t.Afternoon||'')}</p></div><div class="timeBlock"><strong>🌙 Evening</strong><p>${esc(t.Evening||'')}</p></div></div></div>`; }
function tile(icon,title,sub,view){ return `<button class="tile" onclick="setView('${view}')" aria-label="${esc(title)}"><span class="tileIcon">${icon}</span><span class="tileText"><strong>${esc(title)}</strong><span>${esc(sub)}</span></span><span class="tileArrow">›</span></button>`; }
function list(rows,fn,empty='Loading…'){ return rows?.length?`<div class="list">${rows.map(r=>`<div class="item">${fn(r)}</div>`).join('')}</div>`:`<div class="card"><div class="muted">${esc(empty)}</div></div>`; }
function quickActions(person='all'){ const common=[['📱','Today','Current plan','today'],['🧳','Before Trip','Prep mode','beforeTrip'],['✅','Confidence','Right-place help','confidence'],['👥','Status','Family check-in','familyStatus'],['✈️','Airport','Arrival/departure','airport'],['🚉','Transit Mode','One-handed','transitMode'],['🌙','Evening','Wrap-up','evening'],['👥','Travelers','Family modes','companions'],['📍','Maps','Places','maps'],['🗺','Explore','City hubs','explore'],['🇯🇵','Phrases','Useful Japanese','phrases'],['🆘','Lost','If separated','lost']]; const hilda=[['🚨','SOS','Emergency','sos'],['❤️','Peace of Mind','GF + comfort','peaceOfMind'],['🏥','Medical','Help cards','medical'],['🧰','Useful','Konbini + bathroom','useful'],['🏪','Konbini','Snacks + ATM','konbiniExplorer'],['🍁','October','Seasonal guide','seasonalGuide'],['🚻','Bathroom','Finder','bathroom']]; const nick=[['🍽','Food','Restaurants','food'],['🛍','Shopping','Wishlist','shopping'],['🚉','Transit','Travel cards','transit'],['📱','Suica','Apple Wallet','suica']]; const dn=[['⏳','Timeline','Reservations','timeline'],['☔','Rain','Backups','rain'],['🎒','Packing','Progress','packing'],['💴','Budget','Money','budget'],['💴','Money','Yen + budget','money'],['★','Favorites','Saved places','favorites'],['📷','Journal','Memories','journal'],['📖','Memory Book','Trip keepsake','memoryBook'],['🎨','City Art','Header art','artDirection'],['⚙️','System','App health','system'],['🛠','Debug','Troubleshoot','debug'],['🛍','Souvenirs','Gift tracker','souvenirs'],['🗺','Explore','City hubs','explore'],['🎟','Bookings','All reservations','reservationsPlus']]; let items=common; if(person==='hilda')items=[['📱','Today','Simple plan','today'],['📍','Maps','Hotel + places','maps'],['🇯🇵','Phrases','Show to staff','phrases'],...hilda]; if(person==='nick')items=[...common,...nick]; if(person==='dn')items=[...common,...dn,...nick]; return `<div class="section">Quick actions</div><div class="quickGrid">${items.map(([i,t,s,v])=>tile(i,t,s,v)).join('')}</div>`; }
function suggestions(){ const t=today(); const notes=[]; const walking=String(t.Walking||''); const energy=String(t.Energy||''); if(walking.match(/[7-9]/)||energy.toLowerCase().includes('busy'))notes.push('Heavy walking day — consider a taxi/rest stop for Hilda.'); if(state.weather?.precipProbability>=40)notes.push('Rain possible — use Rain Mode and carry umbrellas.'); if(String(t.City||'').includes('Kyoto'))notes.push('Kyoto temples are better early. Bring cash and comfortable shoes.'); if(String(t.Notes||'').length>0)notes.push(t.Notes); return notes.length?`<div class="card gold"><h2>Smart Suggestions</h2>${notes.map(n=>`<p>• ${esc(n)}</p>`).join('')}</div>`:''; }
function packingProgress(){ const rows=state.sections.packing||[]; if(!rows.length)return `<div class="card"><h2>Packing</h2><p class="muted">Packing data loading or not filled in yet.</p></div>`; const done=rows.filter(r=>String(r.Status||r.Done||'').match(/yes|done|packed|✓|true/i)).length; const pct=Math.round(done/rows.length*100); return `<div class="card"><h2>🎒 Packing Progress</h2><div class="big">${pct}%</div><div class="progress"><div class="bar" style="width:${pct}%"></div></div><p class="mini">${done} of ${rows.length} items marked complete</p></div>`; }
function budgetSummary(){ const rows=state.sections.budget||[]; return `<div class="card"><h2>💴 Budget</h2><p class="muted">${rows.length?`${rows.length} budget rows loaded.`:'Budget data loading or not filled in yet.'}</p></div>`; }


function countdownCard(){
  const rows = state.sections.countdown || [];
  const trip = rows.find(r => String(r.Event||'').toLowerCase().includes('depart')) || rows[0];
  const days = trip ? (trip['Days Remaining'] || trip.Days || '') : '';
  return `<div class="card dark countdown"><h2>Countdown</h2><div class="big">${esc(days || '—')}</div><p>${esc(trip?.Event || 'Until Japan')}</p><div class="progress"><div class="bar" style="width:${days ? Math.max(5, Math.min(100, 100-Number(days))) : 35}%"></div></div></div>`;
}
function reservationDashboard(){
  const rows = state.sections.reservations || [];
  const important = rows.slice(0,6);
  return `<div class="card"><h2>Reservation Dashboard</h2>${important.length?important.map(r=>{
    const status=String(r.Status||'').toLowerCase();
    const icon=status.includes('book')||status.includes('done')||status.includes('yes')||status.includes('confirmed')?'✓':status.includes('need')||status.includes('todo')?'⚠':'•';
    return `<div class="item"><strong>${icon} ${esc(r.Item||'Reservation')}</strong><span class="pill">${esc(r.Status||'')}</span><span class="pill">${esc(r.Urgency||'')}</span></div>`;
  }).join(''):'<p class="muted">Reservation rows loading or not filled in yet.</p>'}</div>`;
}
function dietClass(value){
  const v=String(value||'').toLowerCase();
  if(v.includes('gf-focused')||v.includes('gf options listed')||v.includes('vegan menu')) return 'safe';
  if(v.includes('not gf')||v.includes('usually not gf')||v.includes('standard batter')||v.includes('not reliably')) return 'avoid';
  return 'verify';
}
function restaurantCard(r){
  const status=state.restaurantStatus[restaurantStateKey(r)]||r['Reservation Status']||'Not booked';
  const michelin=String(r.Michelin||'');
  const gf=String(r['GF Confidence']||'Confirm directly');
  const lf=String(r['Lactose-Free Confidence']||'Confirm directly');
  const tags=String(r['Meal Tags']||'').split(',').filter(Boolean);
  return `<article class="restaurantCard">
    <div class="restaurantTop">
      <div>
        <div class="eyebrow">${esc(r.City||'')} · ${esc(r.Area||'')}</div>
        <h3>${esc(r.Name||'Restaurant')}</h3>
      </div>
      ${favButton('restaurant',r.Name,r)}
    </div>
    <div class="restaurantBadges">
      <span class="pill">${esc(r.Cuisine||'Restaurant')}</span>
      ${michelin && michelin!=='—'?`<span class="pill michelin">★ ${esc(michelin)}</span>`:''}
      <span class="pill priority">${esc(r.Priority||'Consider')}</span>
    </div>
    <div class="mealTags">${tags.map(t=>`<span>${esc(t.trim())}</span>`).join('')}</div>
    <div class="dietGrid">
      <div class="diet ${dietClass(gf)}"><b>GF</b><span>${esc(gf)}</span></div>
      <div class="diet ${dietClass(lf)}"><b>LF</b><span>${esc(lf)}</span></div>
    </div>
    <p>${esc(r.Notes||'')}</p>
    <div class="restaurantMeta">
      <span>💴 ${esc(r.Price||'Price TBD')}</span>
      <span>🪑 ${esc(r.Reservation||'Verify')}</span>
      <span>🍽 ${esc(r['Must Order / Experience']||r['Must Order']||'Experience TBD')}</span>
    </div>
    <button class="reservationStatus status-${attr(status.toLowerCase().replace(/[^a-z]+/g,'-'))}" onclick="cycleRestaurantStatusById('${attr(restaurantStateKey(r))}')">${esc(status)} · tap to update</button>
    <div class="restaurantActions">
      ${r['Google Maps Link']?`<a class="action" href="${attr(r['Google Maps Link'])}" target="_blank" rel="noopener">Map</a>`:''}
      ${r['Tabelog Link']?`<a class="action secondaryAction" href="${attr(r['Tabelog Link'])}" target="_blank" rel="noopener">Tabelog</a>`:''}
      ${r['Michelin Source']?`<a class="action secondaryAction" href="${attr(r['Michelin Source'])}" target="_blank" rel="noopener">Michelin</a>`:''}
    </div>
    <small class="researchNote">Last checked ${esc(r['Last Checked']||'—')} · Reconfirm hours, menu, dietary handling, and cross-contact directly.</small>
  </article>`;
}
function companionCard(name, emoji, focus){
  return `<div class="card companion"><h2>${emoji} ${name} Dashboard</h2><p>${esc(focus)}</p></div>`;
}
function rainButton(){ return `<button class="bigButton" onclick="setView('rain')">☔ Rain Mode</button>`; }
function journalPrompt(){
  const prompts=['Favorite meal','Best photo','Funniest moment','Best discovery','One thing to remember'];
  return `<div class="card"><h2>📷 Travel Journal</h2>${prompts.map(p=>`<div class="item"><strong>${p}</strong><small>Add this in the Sheet later.</small></div>`).join('')}</div>`;
}
function expensePrompt(){
  return `<div class="card"><h2>💴 Expense Tracker</h2><p class="muted">Foundation ready. Add rows to the Money/Budget tabs for daily spend tracking.</p></div>`;
}
function mapHero(){
  return `<div class="card dark"><h2>Map Explorer</h2><p>Search restaurants, hotels, attractions, and transit hubs, then open the exact result in your preferred mapping app.</p></div>`;
}

function renderHome(){ const t=today(); app.innerHTML=shell(`${hero()}${tripProgressCard()}${smartModeCard()}${smartCards()}${dailyBrief()}${controls()}${weatherCard()}<div class="card dark"><h2>Today</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${metrics(t)}</div>${travelTimelineCard()}${quickActions('all')}${reservationDashboard()}`); }
function renderToday(){ const t=today(); app.innerHTML=shell(`${controls()}${weatherCard()}<div class="card dark"><h2>Today</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${metrics(t)}</div>${smartCards()}${travelTimelineCard()}${confidenceCard()}${imHereCard()}<div class="card red"><b>Bring:</b><br>${esc(t['Bring / Hilda Reminder']||'Add daily carry notes in the workbook.')}</div>${quickActions('all')}`); }
function renderHilda(){ const t=today(); app.innerHTML=shell(`${controls()}<div class="card lav hildaHero"><h2>Hilda</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div>${weatherCard()}<div class="card"><h2>Today</h2><p>${esc(t.Morning||'Morning plan not added yet.')}</p><p>${esc(t.Afternoon||'Afternoon plan not added yet.')}</p><p>${esc(t.Evening||'Evening plan not added yet.')}</p></div><div class="card"><b>Hotel</b><br>${esc(t.Hotel||'Hotel information not added yet.')}</div>${smartCards()}${quickActions('hilda')}<div class="card dark"><b>Emergency</b><br>Police: 110<br>Ambulance / Fire: 119<br><br>If separated: go to the hotel lobby or ask station staff.</div>`,'hilda'); }
function renderNick(){ const t=today(); app.innerHTML=shell(`${controls()}${weatherCard()}<div class="card blue"><h2>👦 Nick</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div>${dayCards()}<div class="card"><b>Hotel:</b> ${esc(t.Hotel||'')}</div>${quickActions('nick')}`); }
function renderDN(){ app.innerHTML=shell(`${controls()}${weatherCard()}<div class="card"><h2>👨‍👩‍👦 David / Noelle</h2><p>Planning dashboard: bookings, alerts, logistics, and family coordination.</p></div>${quickActions('dn')}${packingProgress()}${budgetSummary()}${expensePrompt()}<div class="section">Reservations</div>${list(state.sections.reservations,r=>`<strong>${esc(r.Item)}</strong><span class="pill">${esc(r.Status)}</span><span class="pill">${esc(r.Urgency)}</span><small>${esc(r.Notes||'')}</small>`)}<div class="section">Smart Alerts</div>${list(state.sections.smartAlerts,r=>`<strong>${esc(r.Trigger)}</strong><p>${esc(r.Message)}</p><span class="pill">${esc(r.Who)}</span>`)}`); }
function renderPhrases(){ const rows=[...(state.sections.phraseFavorites||[]),...(state.sections.phrases||[])]; const cats=[...new Set(rows.map(r=>r.Category).filter(Boolean))]; const filtered=rows.filter(r=>(!state.phraseCat||r.Category===state.phraseCat)&&(!state.phraseSearch||JSON.stringify(r).toLowerCase().includes(state.phraseSearch))); app.innerHTML=shell(`<div class="card"><h2>🇯🇵 Phrases</h2><p class="muted">Search English, Japanese, romaji, phonetics, category, or use case.</p><input class="search" placeholder="Search..." oninput="state.phraseSearch=this.value.toLowerCase();renderPhrases()"><div class="chips"><button class="chip ${!state.phraseCat?'active':''}" onclick="state.phraseCat='';renderPhrases()">All</button>${cats.map(c=>`<button class="chip ${state.phraseCat===c?'active':''}" onclick="state.phraseCat='${attr(c)}';renderPhrases()">${esc(c)}</button>`).join('')}</div></div>${list(filtered,r=>`${favButton('phrase',r.English||r.Japanese,r)}<div class="category">${esc(r.Category||'')}</div><strong>${esc(r.English||'')}</strong><div class="jp">${esc(r.Japanese||'')}</div><small>${esc(r.Romaji||'')}</small><br><small>${esc(r['Easy Phonetics']||'')}</small><p>${esc(r.Use||'')}</p>`)}`); }
function renderSOS(){ app.innerHTML=shell(`<div class="card dark"><h2>🚨 Emergency</h2><p>Use this if anything feels unsafe or confusing.</p></div><div class="card red"><h2>Need help fast?</h2><p><b>Police:</b> 110<br><b>Ambulance / Fire:</b> 119</p></div>${list(state.sections.emergency,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Details||'')}</p><small>${esc(r['Phone / Link']||'')}</small><br><small>${esc(r.Notes||'')}</small>`)}`); }
function renderLost(){ app.innerHTML=shell(`<div class="card dark"><h2>🆘 Lost Mode</h2><p>Stay calm. Go to hotel lobby or ask station staff.</p></div>${list(state.sections.lost,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Info||'')}</p><small>${esc(r.Action||'')}</small><br><small>${esc(r['Japanese / Notes']||'')}</small>`)}`); }
function renderFood(){ renderFoodHub(); }
function renderMaps(){ app.innerHTML=shell(`${mapHero()}<div class="card"><h2>📍 Maps</h2><p>Save important places with ★.</p></div>${list(state.sections.maps,r=>`${favButton('place',r.Place,r)}<strong>${esc(r.Place)}</strong><span class="pill">${esc(r.City)}</span><span class="pill">${esc(r.Type)}</span><p>${esc(r.Notes||'')}</p>${r['Google Maps Link']?`<a class="action" href="${attr(r['Google Maps Link'])}" target="_blank">Open Map</a>`:''}`)}`); }
function renderRain(){ app.innerHTML=shell(`<div class="card blue"><h2>☔ Rain Mode</h2></div>${list(state.sections.rain,r=>`<strong>${esc(r.City)}</strong><p><b>Instead of:</b> ${esc(r['Outdoor Plan'])}</p><p><b>Backup:</b> ${esc(r['Rain Backup'])}</p><small>${esc(r['Hilda Comfort Note']||'')}</small>`)}`); }
function renderAcademy(){ app.innerHTML=shell(`<div class="card"><h2>🎓 First-Time Japan Academy</h2><p>Short, practical lessons for Nick and Hilda.</p></div>${list(state.sections.firstTime,r=>`<strong>${esc(r.Moment)} · ${esc(r.Lesson)}</strong><p>${esc(r['What Nick/Hilda Should Know'])}</p><small>${esc(r.Action)}</small>`)}`); }
function renderUseful(){ app.innerHTML=shell(`<div class="card"><h2>🧰 Useful Guides</h2></div><div class="section">Konbini</div>${list(state.sections.konbiniGuide,r=>`<strong>${esc(r.Recommendation)}</strong><p>${esc(r['Why Useful'])}</p><small>${esc(r['Phrase / Action'])}</small>`)}<div class="section">Bathroom</div>${list(state.sections.bathroom,r=>`<strong>${esc(r.Topic)}</strong><p>${esc(r['What to know'])}</p><small>${esc(r['What to do'])}</small>`)}<div class="section">Seasonal</div>${list(state.sections.seasonal,r=>`<strong>${esc(r.City)}</strong><p>${esc(r['Typical October Feel'])}</p><small>${esc(r['Planning Tip'])}</small>`)}`); }
function renderTimeline(){ app.innerHTML=shell(`<div class="card"><h2>⏳ Countdown + Reservation Timeline</h2></div>${list(state.sections.countdown,r=>`<strong>${esc(r.Event)}</strong><span class="pill">${esc(r['Days Remaining'])}</span><small>${esc(r.Notes||'')}</small>`)}<div class="section">Reservations</div>${list(state.sections.resTimeline,r=>`<strong>${esc(r.Month)} · ${esc(r.Task)}</strong><span class="pill">${esc(r.Status)}</span><small>${esc(r.Notes)}</small>`)}`); }
function renderShopping(){ app.innerHTML=shell(`<div class="card"><h2>🛍 Shopping</h2></div>${list(state.sections.shopping,r=>`${favButton('shopping',r['Store / Item'],r)}<strong>${esc(r['Store / Item'])}</strong><span class="pill">${esc(r.Who)}</span><span class="pill">${esc(r.Priority)}</span><small>${esc(r.Notes||'')}</small>`)}`); }
function renderTransit(){ renderTransitHub(); }
function renderPacking(){ app.innerHTML=shell(`${packingProgress()}${list(state.sections.packing,r=>`<strong>${esc(r.Item||r.Task||'Item')}</strong><span class="pill">${esc(r.Who||'All')}</span><span class="pill">${esc(r.Status||r.Done||'')}</span><small>${esc(r.Notes||'')}</small>`)}`); }
function renderBudget(){ app.innerHTML=shell(`${budgetSummary()}${list(state.sections.money,r=>`<strong>${esc(r.Topic||r.Item||'Money')}</strong><p>${esc(r.Notes||r.Details||'')}</p>`)}`); }
function renderFavorites(){ app.innerHTML=shell(`<div class="card"><h2>★ Favorites</h2><p class="muted">Saved locally on this device.</p></div>${list(state.favorites,f=>`<strong>${esc(f.label)}</strong><span class="pill">${esc(f.type)}</span><p>${esc(f.data?.Notes||f.data?.City||'')}</p>`, 'No favorites yet. Tap ☆ on food, maps, phrases, or shopping.')}`); }
function renderSearch(){ const q=state.searchQuery.toLowerCase(); const groups=[['Restaurants',state.sections.restaurants||[],'Name','restaurant'],['Maps',state.sections.maps||[],'Place','place'],['Phrases',[...(state.sections.phraseFavorites||[]),...(state.sections.phrases||[])],'English','phrase'],['Shopping',state.sections.shopping||[],'Store / Item','shopping'],['Reservations',state.sections.reservations||[],'Item','reservation']]; let results=[]; if(q){ groups.forEach(([name,rows,label,type])=>rows.forEach(r=>{ const score=spotlightBoost(q,r); if(score>0) results.push({name,row:r,label:r[label]||r.Name||r.Place||r.English||'Result',type,score}); })); results.sort((a,b)=>b.score-a.score); } app.innerHTML=shell(`<div class="card"><h2>🔎 Search</h2><input class="search" placeholder="Search restaurants, maps, phrases, reservations..." value="${esc(state.searchQuery)}" oninput="state.searchQuery=this.value;renderSearch()"><p class="muted">${q?`${results.length} result(s)`:'Start typing to search across the trip.'}</p></div>${list(results,r=>`${r.type!=='reservation'?favButton(r.type,r.label,r.row):''}<strong>${esc(r.label)}</strong><span class="pill">${esc(r.name)}</span><p>${esc(r.row.Notes||r.row.Use||r.row.City||'')}</p>`, (Object.keys(state.loadingSections).length?skeletonCards(3):'No results yet.'))}`); }


function renderJournal(){ app.innerHTML=shell(`${journalPrompt()}${list(state.sections.journal,r=>`<strong>${esc(r.Date||r.Day||'Journal')}</strong><p>${esc(r.Notes||r.Memory||'')}</p>`, 'No journal entries yet.')}`); }
function renderReservationsPlus(){ app.innerHTML=shell(`${reservationDashboard()}<div class="section">Flights</div>${list(state.sections.flights,r=>`<strong>${esc(r.Route||r.Flight||'Flight')}</strong><span class="pill">${esc(r.Status||'')}</span><small>${esc(r.Notes||'')}</small>`)}<div class="section">Hotels</div>${list(state.sections.hotels,r=>`<strong>${esc(r.Hotel||r.Name||'Hotel')}</strong><span class="pill">${esc(r.City||'')}</span><small>${esc(r.Notes||'')}</small>`)}`); }


function renderSuica(){
  app.innerHTML = shell(`<div class="card dark"><h2>📱 Apple Wallet Suica Hub</h2><p>Primary transit setup: Suica in Apple Wallet. Physical Suica is only a backup.</p></div>
  <div class="grid">
    ${tile('📱','Apple Wallet','Primary Suica setup','useful')}
    ${tile('💴','Reload','Top up with Apple Pay / cash options','currency')}
    ${tile('🚉','Transit Cards','Airport + city travel','transit')}
    ${tile('🧳','Lockers','Stations + luggage notes','explore')}
  </div>
  <div class="card"><h2>Apple Wallet Suica Quick Notes</h2>
    <p>• Add Suica in Apple Wallet before the trip if possible.</p>
    <p>• Make sure each traveler has their own Suica on their own phone.</p>
    <p>• Tap your iPhone or Apple Watch at train gates — tap in and tap out.</p>
    <p>• Keep a balance cushion for trains, buses, vending machines, lockers, konbini, and quick purchases.</p>
    <p>• Shinkansen, reserved seats, some airport trains, and special tickets may still require separate tickets/reservations.</p>
    <p>• If a gate rejects the card, go to station staff and show your phone.</p>
    <p>• Physical Suica/PASMO can be a backup if someone’s phone dies or Apple Wallet setup fails.</p>
  </div>
  <div class="card gold"><h2>Before Departure</h2>
    <p>✓ Set up Apple Wallet Suica</p>
    <p>✓ Test adding funds</p>
    <p>✓ Turn on Express Transit if available</p>
    <p>✓ Bring a battery bank so transit access does not depend on a dying phone</p>
  </div>
  <div class="section">Related Transit</div>${list(state.sections.transitCards,r=>`<strong>${esc(r.Route)}</strong><span class="pill">${esc(r.Method)}</span><p>${esc(r.Notes||'')}</p><small>Luggage: ${esc(r.Luggage||'')} · Reservation: ${esc(r.Reservation||'')}</small>`)}`);
}
function renderExplore(){
  const cities=[
    ['Tokyo','🗼','Akasaka, Shibuya, Asakusa, Ginza, Kichijoji, Odaiba'],
    ['Kyoto','⛩','Fushimi Inari, Higashiyama, Arashiyama, Nishiki, Gion'],
    ['Hakone','♨','Ryokan, onsen, ropeway, lake, mountain weather'],
    ['Nara','🦌','Nara Park, Todai-ji, deer, simple day trip']
  ];
  app.innerHTML=shell(`<div class="card hero"><h1>Explore</h1><p>City hubs, neighborhoods, food, shopping, tips.</p></div>
  <div class="grid">${cities.map(([c,i,s])=>`<button class="tile" onclick="state.searchQuery='${c}';setView('search')"><span class="tileIcon">${i}</span><span class="tileText"><strong>${c}</strong><span>${s}</span></span><span class="tileArrow">›</span></button>`).join('')}</div>
  ${mapHero()}<div class="section">Seasonal October Notes</div>${list(state.sections.seasonal,r=>`<strong>${esc(r.City)}</strong><p>${esc(r['Typical October Feel']||'')}</p><small>${esc(r['Planning Tip']||'')}</small>`)}`);
}
function renderMedical(){
  app.innerHTML=shell(`<div class="card dark"><h2>❤️ Medical + Help Cards</h2><p>Large cards to show someone if help is needed.</p></div>
  <div class="card red"><h2>Emergency Numbers</h2><p><b>Police:</b> 110<br><b>Ambulance / Fire:</b> 119</p></div>
  <div class="card"><h2>Show This</h2><p class="jp">助けてください</p><p><b>Tasukete kudasai</b><br>Please help me.</p></div>
  <div class="card"><h2>Hotel / Taxi Card</h2><p>Fill hotel name, address, and phone in the Hotels sheet. This page can become the large-font taxi card.</p></div>
  <div class="card"><h2>Medical Notes</h2><p>Add only what you are comfortable storing: medications, allergies, insurance info, clinic notes, and emergency contacts.</p></div>
  <div class="section">Emergency Sheet</div>${list(state.sections.emergency,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Details||'')}</p><small>${esc(r['Phone / Link']||'')}</small>`)}`);
}
function renderBathroom(){
  app.innerHTML=shell(`<div class="card"><h2>🚻 Bathroom Finder</h2><p>Good places to look: train stations, department stores, museums, large parks, shopping centers, and hotel lobbies.</p></div>
  ${list(state.sections.bathroom,r=>`<strong>${esc(r.Topic)}</strong><p>${esc(r['What to know'])}</p><small>${esc(r['What to do'])}</small>`)}
  <div class="card dark"><h2>Comfort Tip</h2><p>Use bathrooms when you see them, especially before long train rides or temple/shrine walks.</p></div>`);
}
function renderKonbiniExplorer(){
  app.innerHTML=shell(`<div class="card hero"><h1>Konbini</h1><p>Breakfast, snacks, ATMs, hot meals, drinks, and low-stress dinners.</p></div>
  ${list(state.sections.konbiniGuide,r=>`<strong>${esc(r.Recommendation)}</strong><p>${esc(r['Why Useful'])}</p><small>${esc(r['Phrase / Action'])}</small>`)}
  <div class="section">Useful phrases</div>${list((state.sections.phrases||[]).filter(r=>String(r.Category||'').toLowerCase().includes('konbini')),r=>`<strong>${esc(r.English)}</strong><div class="jp">${esc(r.Japanese)}</div><small>${esc(r['Easy Phonetics']||r.Romaji||'')}</small>`)}`);
}
function renderSeasonalGuide(){
  app.innerHTML=shell(`<div class="card"><h2>🍁 October Guide</h2><p>Comfortable weather, light layers, early temple starts, and rain backups.</p></div>
  ${list(state.sections.seasonal,r=>`<strong>${esc(r.City)}</strong><p>${esc(r['Typical October Feel'])}</p><span class="pill">${esc(r.Clothing||'Layers')}</span><span class="pill">${esc(r.Crowds||'')}</span><small>${esc(r['Planning Tip']||'')}</small>`)}
  <div class="section">Rain Backups</div>${list(state.sections.rain,r=>`<strong>${esc(r.City)}</strong><p><b>Backup:</b> ${esc(r['Rain Backup'])}</p><small>${esc(r['Hilda Comfort Note']||'')}</small>`)}`);
}
function renderSouvenirs(){
  app.innerHTML=shell(`<div class="card"><h2>🛍 Souvenir Tracker</h2><p>Track who each gift is for, whether it is bought, packed, and approximate cost.</p></div>
  ${list(state.sections.shopping,r=>`${favButton('shopping',r['Store / Item'],r)}<strong>${esc(r['Store / Item'])}</strong><span class="pill">${esc(r.Who||'')}</span><span class="pill">${esc(r.Priority||'')}</span><small>${esc(r.Notes||'')}</small>`)}
  <div class="card gold"><h2>Packing Reminder</h2><p>Leave suitcase space for snacks, stationery, clothing, and gifts.</p></div>`);
}
function renderCurrency(){
  app.innerHTML=shell(`<div class="card"><h2>💱 Yen Calculator</h2><p class="muted">Offline quick reference. Adjust the rough rate later if needed.</p><input class="search" type="number" placeholder="Enter yen, e.g. 1000" oninput="document.getElementById('usdOut').textContent=this.value?('$'+(Number(this.value)/145).toFixed(2)):''"><div class="big" id="usdOut"></div><small>Using rough ¥145 = $1 estimate. Update in code or Sheet later.</small></div>
  ${budgetSummary()}${list(state.sections.money,r=>`<strong>${esc(r.Topic||r.Item||'Money')}</strong><p>${esc(r.Notes||r.Details||'')}</p>`)}`);
}
function renderTravelers(){
  app.innerHTML=shell(`<div class="card hero"><h1>Travelers</h1><p>Different dashboards for different needs.</p></div>
  ${companionCard('Hilda','👩','Comfort, hotel, simple schedule, bathroom, weather, and emergency cards.')}
  ${companionCard('Nick','👦','Food, shopping, transit, exploration, and first-time Japan tips.')}
  ${companionCard('David / Noelle','👨‍👩‍👦','Reservations, budget, logistics, maps, packing, and family coordination.')}
  <div class="grid">${tile('👩','Hilda','Open dashboard','hilda')}${tile('👦','Nick','Open dashboard','nick')}${tile('👨‍👩‍👦','Planning','Open dashboard','dn')}</div>`);
}


function daysUntilTrip(){
  const rows = state.sections.countdown || [];
  const row = rows.find(r => String(r.Event||'').toLowerCase().includes('depart')) || rows[0];
  const n = Number(row?.['Days Remaining'] || row?.Days || '');
  return Number.isFinite(n) ? n : null;
}
function contextMode(){
  const t = today();
  const city = String(t.City||'');
  const notes = String(t.Notes||'') + ' ' + String(t.Morning||'') + ' ' + String(t.Afternoon||'') + ' ' + String(t.Evening||'');
  if (/flight|airport|narita|haneda|lax|bos/i.test(city + notes)) return 'airport';
  if (/shinkansen|train|transfer|station|transit|hakone/i.test(notes)) return 'transitMode';
  const d = daysUntilTrip();
  if (d !== null && d > 0) return 'beforeTrip';
  return 'today';
}
function contextCard(){
  const mode = contextMode();
  const labels = {
    beforeTrip:['🧳','Before Trip','Prep dashboard: passports, Apple Wallet Suica, packing, bookings.'],
    airport:['✈️','Airport Mode','Flight, customs, first train, hotel address, and arrival checklist.'],
    transitMode:['🚉','Transit Mode','Apple Wallet Suica, transfers, luggage, exits, and station notes.'],
    today:['📱','Today Mode','Your daily briefing and next steps.']
  };
  const [icon,title,desc]=labels[mode]||labels.today;
  return `<button class="contextCard" onclick="setView('${mode}')"><span>${icon}</span><div><strong>${title}</strong><small>${desc}</small></div><b>Open ›</b></button>`;
}
function adminCard(){
  return `<div class="card"><h2>Admin Editing Idea</h2><p>Long-term: replace raw spreadsheet editing with simple forms for itinerary, reservations, restaurants, maps, packing, and journal entries. For now, the Sheet remains the admin panel.</p></div>`;
}
function offlineEssentials(){
  return `<div class="card"><h2>Offline Essentials</h2><div class="miniGrid"><span>📅 Itinerary</span><span>🏨 Hotels</span><span>🚨 SOS</span><span>🇯🇵 Phrases</span><span>💳 Suica</span><span>🎟 Reservations</span><span>📍 Map links</span><span>🆘 Lost Mode</span></div></div>`;
}
function imHereCard(){
  const t=today();
  return `<div class="card gold"><h2>✅ I’m Here</h2><p>Tap this when you arrive somewhere. Future version can surface nearby food, bathrooms, etiquette, and next stop.</p><button class="bigButton secondary" onclick="alert('Marked: ${esc(t.City||'current stop')}')">I’m here at ${esc(t.City||'this stop')}</button></div>`;
}
function renderBeforeTrip(){
  app.innerHTML=shell(`<div class="card hero"><h1>Before<br>Trip</h1><p>Preparation dashboard</p></div>${countdownCard()}${packingProgress()}${reservationDashboard()}<div class="grid">${tile('📱','Apple Wallet Suica','Setup + test reload','suica')}${tile('✈️','Flights','JAL + airports','reservationsPlus')}${tile('🏨','Hotels','Addresses + phone','maps')}${tile('🎒','Packing','Progress','packing')}${tile('🎟','Bookings','Reservation dashboard','timeline')}${tile('❤️','Medical','Help cards','medical')}</div>${offlineEssentials()}`);
}
function renderAirportMode(){
  app.innerHTML=shell(`<div class="card dark"><h2>✈️ Airport Mode</h2><p>For LAX/BOS departure and Japan arrival.</p></div><div class="grid">${tile('✈️','Flights','Flight details','reservationsPlus')}${tile('🏨','Hotel','Address + map','maps')}${tile('💳','Suica','Apple Wallet','suica')}${tile('🇯🇵','Phrases','Arrival phrases','phrases')}${tile('🚨','SOS','Emergency','sos')}${tile('🍜','First Meal','Food ideas','food')}</div><div class="card"><h2>Arrival Checklist</h2><p>✓ Passport</p><p>✓ Immigration/customs</p><p>✓ Luggage</p><p>✓ ATM/cash if needed</p><p>✓ Apple Wallet Suica ready</p><p>✓ Route to hotel</p></div>${list(state.sections.flights,r=>`<strong>${esc(r.Route||r.Flight||'Flight')}</strong><span class="pill">${esc(r.Status||'')}</span><small>${esc(r.Notes||'')}</small>`)}`);
}
function renderTransitMode(){
  app.innerHTML=shell(`<div class="card dark"><h2>🚉 Transit Mode</h2><p>One-handed travel view for stations, Suica, transfers, exits, and luggage.</p></div>${renderTransitCardsInline()}${tile('📱','Apple Wallet Suica','Transit card guide','suica')}${tile('📍','Maps','Open directions','maps')}${tile('🧳','Luggage','Forwarding/lockers','packing')}`);
}
function renderTransitCardsInline(){
  return `<div class="section">Transit Cards</div>${list(state.sections.transitCards,r=>`<strong>${esc(r.Route)}</strong><span class="pill">${esc(r.Method)}</span><p>${esc(r.Notes||'')}</p><small>Luggage: ${esc(r.Luggage||'')} · Reservation: ${esc(r.Reservation||'')}</small>`)}`;
}
function renderEvening(){
  app.innerHTML=shell(`<div class="card hero"><h1>Evening</h1><p>Wrap today, prep tomorrow.</p></div>${weatherCard()}<div class="grid">${tile('📷','Journal','Add memory','journal')}${tile('🎒','Packing','Tomorrow check','packing')}${tile('🎟','Bookings','Tomorrow reservations','timeline')}${tile('💴','Expenses','Money notes','budget')}</div><div class="card"><h2>Tonight Checklist</h2><p>✓ Charge phones and battery banks</p><p>✓ Check tomorrow weather</p><p>✓ Check first transit route</p><p>✓ Pack umbrella/layers if needed</p><p>✓ Add favorite photo or meal</p></div>${journalPrompt()}`);
}
function renderAdmin(){
  app.innerHTML=shell(`<div class="card"><h2>Admin Layer</h2><p>Future home for simple edit forms that write to Google Sheets.</p></div>${adminCard()}<div class="grid">${tile('📅','Itinerary Form','Future admin','today')}${tile('🎟','Reservation Form','Future admin','timeline')}${tile('🍽','Restaurant Form','Future admin','food')}${tile('📍','Map Form','Future admin','maps')}</div>`);
}


function greeting(){
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function dailyBrief(){
  const t=today();
  const items=[];
  if(state.weather?.available) items.push(`${state.weather.icon} ${state.weather.highF}° / ${state.weather.lowF}°F · ${state.weather.summary}`);
  if(t.Walking) items.push(`👟 Walking: ${t.Walking}`);
  if(t['Bring / Hilda Reminder']) items.push(`🎒 Bring: ${t['Bring / Hilda Reminder']}`);
  if(state.weather?.precipProbability>=40) items.push('☔ Rain possible — check Rain Mode');
  if(String(t.Energy||'').toLowerCase().includes('busy')) items.push('🧘 Busy day — plan a rest stop');
  return `<div class="card daily"><h2>${greeting()}, David</h2><p class="muted">Daily Brief</p>${items.map(i=>`<div class="briefItem">${esc(i)}</div>`).join('') || '<p>Brief will get smarter as the sheet fills in.</p>'}</div>`;
}
function confidenceCard(){
  const t=today();
  const lines=[];
  const dayText = JSON.stringify(t).toLowerCase();
  if(/train|station|shinkansen|transit|narita|haneda/.test(dayText)) lines.push('You are in transit mode. Keep Apple Wallet Suica ready and follow station signage.');
  if(/temple|shrine|inari|senso|kinkaku|kiyomizu/.test(dayText)) lines.push('Shrine/temple tip: keep voices low, follow photo signs, and stay to the side when stopping.');
  if(/restaurant|dinner|lunch|ramen|sushi|cafe/.test(dayText)) lines.push('Restaurant tip: pointing at menus is fine. Have phrases ready if needed.');
  if(!lines.length) lines.push('Everything looks normal. Check Today, Maps, and Phrases if anything feels uncertain.');
  return `<div class="card sage"><h2>Confidence Mode</h2>${lines.map(l=>`<p>✓ ${esc(l)}</p>`).join('')}</div>`;
}
function renderConfidence(){
  app.innerHTML=shell(`<div class="card hero"><h1>Confidence</h1><p>Reassurance for first-time Japan moments.</p></div>${confidenceCard()}<div class="grid">${tile('🚉','Train Help','Suica + transfers','transitMode')}${tile('🍽','Restaurant Help','Food + phrases','food')}${tile('⛩','Etiquette','Shrines + temples','academy')}${tile('🆘','Lost','Separated plan','lost')}</div>`);
}
function setPersonStatus(name,value){
  state.familyStatus[name]=value;
  saveFamilyStatus();
  renderFamilyStatus();
}
function statusSelector(name){
  const options=['Hotel','Station','Shopping','Restaurant','Exploring','With group','Resting'];
  const current=state.familyStatus[name]||'Not set';
  return `<div class="item"><strong>${name}</strong><span class="pill">${esc(current)}</span><div class="chips">${options.map(o=>`<button class="chip ${current===o?'active':''}" onclick="setPersonStatus('${name}','${o}')">${o}</button>`).join('')}</div></div>`;
}
function renderFamilyStatus(){
  app.innerHTML=shell(`<div class="card"><h2>👥 Family Status</h2><p class="muted">Manual status updates. Not live location.</p></div>${['David','Noelle','Nick','Hilda'].map(statusSelector).join('')}<div class="card dark"><h2>Meetup Reminder</h2><p>Use hotel lobby, closest station gate, or a pre-agreed landmark if separated.</p></div>`);
}
function renderMemoryBook(){
  app.innerHTML=shell(`<div class="card hero"><h1>Memory<br>Book</h1><p>Trip journal foundation</p></div><div class="card"><h2>After the Trip</h2><p>This will become a designed PDF/export with favorite meals, photos, purchases, stats, and highlights.</p></div>${journalPrompt()}<div class="grid">${tile('📷','Journal','Daily memories','journal')}${tile('🍽','Food','Favorite meals','food')}${tile('🛍','Souvenirs','Gift tracker','souvenirs')}${tile('★','Favorites','Saved places','favorites')}</div>`);
}
function renderArtDirection(){
  app.innerHTML=shell(`<div class="card hero"><h1>City Art</h1><p>Concept artist header system</p></div>
  <div class="card"><h2>Art Direction</h2><p>Create subtle panoramic headers for Tokyo, Kyoto, Hakone, and Nara. Keep them low-contrast and atmospheric so they support the UI instead of overpowering it.</p></div>
  <div class="list">
    <div class="item"><strong>Tokyo</strong><p>Skyline, Akasaka night lights, Shibuya crossing energy.</p></div>
    <div class="item"><strong>Kyoto</strong><p>Temple silhouettes, Fushimi Inari gates, warm evening stone paths.</p></div>
    <div class="item"><strong>Hakone</strong><p>Mountains, mist, ryokan, lake, ropeway atmosphere.</p></div>
    <div class="item"><strong>Nara</strong><p>Deer park, Todai-ji scale, soft morning light.</p></div>
  </div>`);
}
function spotlightBoost(query,row){
  const q=query.toLowerCase();
  const text=JSON.stringify(row).toLowerCase();
  let score=text.includes(q)?10:0;
  const synonyms={
    ramen:['noodle','tonkotsu','food','restaurant'],
    bathroom:['toilet','restroom','wc'],
    narita:['airport','flight','train'],
    suica:['wallet','transit','ic card','train'],
    hotel:['lost','taxi','address'],
    rain:['indoor','backup','umbrella']
  };
  Object.entries(synonyms).forEach(([k,vals])=>{
    if(q.includes(k) && vals.some(v=>text.includes(v))) score+=5;
  });
  return score;
}


function installPromptCard(){
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (standalone) return '';
  return `<div class="card install"><h2>Install on iPhone</h2><p>Open in Safari → Share → Add to Home Screen.</p></div>`;
}
function versionFooter(){
  return `<div class="mini" style="text-align:center;margin:20px 0;color:rgba(255,255,255,.45)">Travel OS ${APP_VERSION}</div>`;
}
function performanceCard(){
  return `<div class="card"><h2>Performance + Offline</h2><p class="muted">Core trip data loads first. Other sections lazy-load when opened and stay cached locally.</p><div class="miniGrid"><span>Itinerary: startup</span><span>Emergency: prefetch</span><span>Phrases: prefetch</span><span>Food: lazy</span><span>Maps: prefetch</span><span>Journal: local-first</span></div></div>`;
}
function renderSystem(){
  app.innerHTML=shell(`<div class="card hero"><h1>System</h1><p>App health, version, offline strategy.</p></div>${performanceCard()}<div class="card"><h2>Debug</h2><p class="debug">Version: ${APP_VERSION}\nAPI: ${CONFIG.API_URL}\nCore loaded: ${state.core?'yes':'no'}\nWeather loaded: ${state.weather?'yes':'no'}\nCached sections: ${Object.keys(state.sections).join(', ')}</p></div>`);
}


async function refreshFx(){
  try{
    const res = await fetch('./fx', {cache:'no-store'});
    if(!res.ok) throw new Error('fx unavailable');
    const fx = await res.json();
    if(fx && fx.rate){
      state.fx = {rate:Number(fx.rate), updatedAt:fx.updatedAt||new Date().toISOString(), source:fx.source||'live'};
      saveFx(state.fx);
      render();
    }
  }catch(e){}
}
function yen(n){ return '¥' + Math.round(Number(n)||0).toLocaleString(); }
function usd(n){ return '$' + (Number(n)||0).toFixed(2); }
function jpyToUsd(jpy){ return (Number(jpy)||0) / (Number(state.fx?.rate)||145); }
function usdToJpy(dol){ return (Number(dol)||0) * (Number(state.fx?.rate)||145); }
function fxStamp(){
  const updated = state.fx?.updatedAt ? new Date(state.fx.updatedAt).toLocaleString() : 'offline estimate';
  return `Rate: $1 ≈ ${yen(state.fx?.rate||145)} · ${esc(state.fx?.source||'cached')} · ${esc(updated)}`;
}
function moneyQuickButtons(){
  const usdVals=[5,10,20,50,100,200];
  const jpyVals=[500,1000,2000,5000,10000,20000];
  return `<div class="card"><h2>Quick Amounts</h2><p class="muted">Common amounts while traveling.</p><div class="miniGrid">${usdVals.map(v=>`<button class="moneyBtn" onclick="state.moneyMode='usdToJpy';state.moneyInput=${v};renderMoney()">$${v}<small>${yen(usdToJpy(v))}</small></button>`).join('')}</div><div class="miniGrid">${jpyVals.map(v=>`<button class="moneyBtn" onclick="state.moneyMode='jpyToUsd';state.moneyInput=${v};renderMoney()">${yen(v)}<small>${usd(jpyToUsd(v))}</small></button>`).join('')}</div></div>`;
}
function priceSense(jpyAmount, kind='general'){
  const j = Number(jpyAmount)||0;
  if(kind==='ramen'){
    if(j<=1200) return '✓ Normal / good value for ramen';
    if(j<=1800) return 'Slightly higher, but still normal';
    return 'Expensive for casual ramen';
  }
  if(kind==='coffee'){
    if(j<=500) return '✓ Normal coffee price';
    if(j<=800) return 'Slightly expensive';
    return 'Expensive coffee';
  }
  if(kind==='dinner'){
    if(j<=2500) return 'Casual dinner';
    if(j<=6000) return 'Nice dinner';
    return 'Special/high-end dinner';
  }
  if(j<=500) return 'Small purchase';
  if(j<=1500) return 'Normal snack/casual meal range';
  if(j<=5000) return 'Moderate purchase';
  if(j<=15000) return 'Larger purchase';
  return 'Big purchase — worth double-checking';
}
function expensiveGuide(){
  const samples=[
    ['🍜 Ramen',1200,'ramen'],
    ['☕ Coffee',700,'coffee'],
    ['🍱 Lunch',1500,'general'],
    ['🍣 Nice Dinner',6000,'dinner'],
    ['🎁 Souvenir',3000,'general'],
    ['🚕 Taxi short ride',1800,'general']
  ];
  return `<div class="card"><h2>Is This Expensive?</h2>${samples.map(([label,j,kind])=>`<div class="item"><strong>${label}</strong><span class="pill">${yen(j)}</span><span class="pill">${usd(jpyToUsd(j))}</span><p>${priceSense(j,kind)}</p></div>`).join('')}</div>`;
}
function cashTotal(){
  const vals={10000:0,5000:0,1000:0,500:0,100:0,50:0,10:0,5:0,1:0};
  return Object.keys(vals).reduce((sum,k)=>sum+(Number(state.cash[k]||0)*Number(k)),0);
}
function cashHelper(){
  const denoms=[10000,5000,1000,500,100,50,10,5,1];
  return `<div class="card"><h2>Cash Helper</h2><div class="big">${yen(cashTotal())}</div><p class="muted">Manual cash-in-wallet estimate.</p><div class="cashGrid">${denoms.map(d=>`<label><span>${yen(d)}</span><input type="number" min="0" value="${esc(state.cash[d]||0)}" onchange="state.cash['${d}']=Number(this.value||0);saveCash();renderMoney()"></label>`).join('')}</div></div>`;
}
function budgetTracker(){
  const rows=state.sections.budget||[];
  const money=state.sections.money||[];
  return `<div class="card"><h2>Budget Tracker</h2><p class="muted">${rows.length?`${rows.length} budget rows loaded from the Sheet.`:'Add daily spend rows to the Budget sheet later.'}</p>${list(rows.slice(0,8),r=>`<strong>${esc(r.Category||r.Item||r.Date||'Budget item')}</strong><span class="pill">${esc(r.Yen||r.Amount||'')}</span><small>${esc(r.Notes||'')}</small>`, 'No budget rows yet.')}</div><div class="card"><h2>Money Notes</h2>${list(money.slice(0,6),r=>`<strong>${esc(r.Topic||r.Item||'Money')}</strong><p>${esc(r.Notes||r.Details||'')}</p>`, 'No money notes yet.')}</div>`;
}
function renderMoney(){
  const input=Number(state.moneyInput)||0;
  const result=state.moneyMode==='jpyToUsd' ? usd(jpyToUsd(input)) : yen(usdToJpy(input));
  const inputLabel=state.moneyMode==='jpyToUsd' ? 'Yen amount' : 'USD amount';
  const modeButton=state.moneyMode==='jpyToUsd' ? 'Switch to USD → JPY' : 'Switch to JPY → USD';
  app.innerHTML=shell(`<div class="card hero"><h1>Money</h1><p>Yen converter, cash, budget.</p></div>
  <div class="card"><h2>Live/Cached Yen Converter</h2><p class="muted">${fxStamp()}</p><input class="search" type="number" value="${esc(input)}" placeholder="${inputLabel}" oninput="state.moneyInput=Number(this.value||0);renderMoney()"><div class="big">${result}</div><button class="bigButton secondary" onclick="state.moneyMode=state.moneyMode==='jpyToUsd'?'usdToJpy':'jpyToUsd';renderMoney()">${modeButton}</button><button class="action" onclick="refreshFx()">Refresh Rate</button></div>
  ${moneyQuickButtons()}${expensiveGuide()}${cashHelper()}${budgetTracker()}`);
}


function renderDebug(){
  app.innerHTML=shell(`<div class="card hero"><h1>Debug</h1><p>Use only if something feels wrong.</p></div>
  <div class="card"><h2>App Status</h2><p class="debug">Release: ${APP_VERSION}\nAPI: ${CONFIG.API_URL}\nCore loaded: ${state.core?'yes':'no'}\nWeather loaded: ${state.weather?'yes':'no'}\nFX rate: ${state.fx?.rate || 'not loaded'}\nCached sections: ${Object.keys(state.sections||{}).join(', ') || 'none'}\nOffline flag: ${state.offline?'yes':'no'}</p></div>
  <div class="grid">${tile('🔄','Reset Cache','Open with ?reset=1','home')}${tile('💴','Money','Test converter','money')}${tile('🚨','SOS','Emergency page','sos')}${tile('📱','Suica','Apple Wallet guide','suica')}</div>`);
}


function gfBadge(level){
  const text=String(level||'Ask first').toLowerCase();
  if(text.includes('green')||text.includes('likely')||text.includes('high')) return '<span class="gfBadge gfGreen">GF · Likely</span>';
  if(text.includes('red')||text.includes('avoid')||text.includes('low')) return '<span class="gfBadge gfRed">GF · Avoid</span>';
  return '<span class="gfBadge gfYellow">GF · Ask</span>';
}
function allergyCard(){
  return `<div class="card allergyCard">
    <h2>🌾 Gluten-Free Allergy Card</h2>
    <div class="jp allergyJapanese">私は小麦を食べることができません。<br>醤油にも小麦が入っています。<br>小麦が入っていない料理はありますか？</div>
    <p><b>Romaji:</b><br>Watashi wa komugi o taberu koto ga dekimasen.<br>Shōyu ni mo komugi ga haitteimasu.<br>Komugi ga haitte inai ryōri wa arimasu ka?</p>
    <p class="muted">I cannot eat wheat. Soy sauce can also contain wheat. Do you have a dish without wheat?</p>
    <button class="bigButton secondary" onclick="document.body.classList.toggle('largeCard')">Large-text mode</button>
  </div>`;
}
function ingredientSheet(){
  const items=[
    ['小麦','Komugi','Wheat'],
    ['醤油','Shōyu','Soy sauce — commonly contains wheat'],
    ['パン粉','Panko','Breadcrumbs'],
    ['天ぷら','Tempura','Batter usually contains wheat'],
    ['うどん','Udon','Wheat noodles'],
    ['味噌','Miso','Check ingredients / preparation'],
    ['そば','Soba','Often mixed with wheat; ask first'],
    ['麦','Mugi','Barley / grain indicator']
  ];
  return `<div class="card"><h2>Ingredient Cheat Sheet</h2>${items.map(([jp,rom,en])=>`<div class="ingredientRow"><span class="jp">${jp}</span><div><strong>${rom}</strong><small>${en}</small></div></div>`).join('')}</div>`;
}
function comfortMode(){
  return `<div class="card sage"><h2>😌 Crohn’s Comfort Mode</h2><p class="muted">Fast access for a rough day.</p>
  <div class="quickGrid">
    ${tile('🚻','Bathroom','Finder + tips','bathroom')}
    ${tile('🏨','Hotel','Return / taxi card','maps')}
    ${tile('🏪','Konbini','Simple food + drinks','konbiniExplorer')}
    ${tile('🚕','Taxi','Open hotel map','maps')}
    ${tile('🏥','Medical','Help cards','medical')}
    ${tile('🇯🇵','Phrases','Show staff','phrases')}
  </div></div>`;
}
function medicationChecklist(){
  const items=['Medication packed','Morning dose','Evening dose','Insurance info saved','Emergency contact saved','Electrolytes packed'];
  return `<div class="card"><h2>💊 Medication Checklist</h2><p class="muted">Stored only on this device. Add medication names only if you choose.</p>
  ${items.map((item,i)=>`<label class="checkRow"><input type="checkbox" ${state.meds[i]?'checked':''} onchange="state.meds['${i}']=this.checked;saveMeds()"><span>${item}</span></label>`).join('')}</div>`;
}
function renderPeaceOfMind(){
  const restaurants=state.sections.gfRestaurants||[];
  const konbini=state.sections.gfKonbini||[];
  const ryokan=state.sections.gfRyokan||[];
  app.innerHTML=shell(`<div class="card hero"><h1>Peace of<br>Mind</h1><p>Gluten-free, comfort, bathrooms, and help.</p></div>
  ${allergyCard()}${comfortMode()}${medicationChecklist()}
  <div class="section">Gluten-Free Food</div>
  ${list(restaurants,r=>`${gfBadge(r.Confidence||r['GF Confidence'])}<strong>${esc(r.Name||r.Restaurant||'Restaurant')}</strong><span class="pill">${esc(r.City||'')}</span><p>${esc(r.Notes||r['What to Order']||'Contact the restaurant in advance.')}</p>${r['Google Maps Link']?`<a class="action" href="${attr(r['Google Maps Link'])}" target="_blank">Open Map</a>`:''}`, 'Add vetted gluten-free restaurants in the GF Restaurants sheet.')}
  <div class="section">Konbini Guide</div>
  ${list(konbini,r=>`${gfBadge(r.Confidence||r['GF Confidence'])}<strong>${esc(r.Item||r.Product||'Item')}</strong><span class="pill">${esc(r.Store||'')}</span><p>${esc(r.Notes||r.Warning||'Always re-check the current label.')}</p>`, 'Add vetted convenience-store items in the GF Konbini sheet.')}
  <div class="section">Hakone Ryokan</div>
  ${list(ryokan,r=>`${gfBadge(r.Confidence||r['GF Confidence'])}<strong>${esc(r.Ryokan||r.Name||'Ryokan')}</strong><p>${esc(r.Notes||'Contact before booking and confirm what can be accommodated.')}</p><span class="pill">${esc(r['Private Onsen']||'')}</span>${r.Link?`<a class="action" href="${attr(r.Link)}" target="_blank">Open Website</a>`:''}`, 'Add confirmed ryokan responses in the GF Ryokan sheet.')}
  ${ingredientSheet()}
  <div class="card red"><h2>Important</h2><p>“Gluten-free” accommodations can vary. Reconfirm directly with each restaurant or ryokan, especially if cross-contact matters. Product ingredients can change.</p></div>`);
}



function packingFor(name){
  const rows=(state.sections.packing||[]).filter(r=>{
    const who=String(r.Who||r.Traveler||'').toLowerCase();
    return !who || who.includes(name.toLowerCase()) || who.includes('all') || who.includes('everyone');
  });
  return `<div class="card"><h2>${esc(name)} Packing</h2>${list(rows.slice(0,8),r=>`<strong>${esc(r.Item||'Item')}</strong><span class="pill">${esc(r.Status||'')}</span><small>${esc(r.Notes||'')}</small>`, 'Add traveler names in the Packing sheet.')}</div>`;
}
function favoritesFor(name){
  const rows=state.favorites.slice(0,6);
  return `<div class="card"><h2>${esc(name)} Favorites</h2>${rows.length?rows.map(f=>`<div class="item"><strong>${esc(f.label)}</strong><span class="pill">${esc(f.type)}</span></div>`).join(''):'<p class="muted">Save places and restaurants with the star button.</p>'}</div>`;
}

function travelerTabs(active){
  const rows=[['david','David'],['noelle','Noelle'],['nick','Nick'],['hilda','Hilda']];
  return `<div class="profileTabs">${rows.map(([v,l])=>`<button class="${active===v?'active':''}" onclick="setView('${v}')">${l}</button>`).join('')}</div>`;
}
function destinationTabs(active){
  const rows=[['tokyo','Tokyo'],['hakone','Hakone'],['kyoto','Kyoto'],['osaka','Osaka'],['nara','Nara']];
  return `<div class="profileTabs destinationTabs">${rows.map(([v,l])=>`<button class="${active===v?'active':''}" onclick="setView('${v}')">${l}</button>`).join('')}</div>`;
}
function renderTravelers(){
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Travelers</h1><p>Individual dashboards for the group.</p></div>
  ${travelerTabs('')}
  <div class="grid">
    ${tile('D','David','Planning and logistics','david')}
    ${tile('N','Noelle','Food, shopping, planning','noelle')}
    ${tile('N','Nick','First-time Japan view','nick')}
    ${tile('H','Hilda','Simple plan and help','hilda')}
  </div>
  <div class="card"><h2>Family Status</h2><p class="muted">Manual check-ins without live location sharing.</p><button class="action" onclick="setView('familyStatus')">Open Status</button></div>`);
}
function renderDavid(){
  app.innerHTML=shell(`${travelerTabs('david')}<div class="card dark"><h2>David</h2><p>Planning, reservations, maps, budget, and trip coordination.</p></div>
  <div class="quickGrid">${tile('🎟','Reservations','Booking status','timeline')}${tile('📍','Maps','Places and routes','maps')}${tile('💴','Money','Yen and budget','money')}${tile('🎒','Packing','Progress','packing')}${tile('❤️','Peace of Mind','GF + comfort','peaceOfMind')}${tile('⚙️','System','App status','system')}</div>
  ${reservationDashboard()}${budgetSummary()}`);
}
function renderNoelle(){
  app.innerHTML=shell(`${travelerTabs('noelle')}<div class="card sage"><h2>Noelle</h2><p>Food, shopping, reservations, budget, and shared trip planning.</p></div>
  <div class="quickGrid">${tile('🍜','Food','Restaurants','food')}
        ${tile('📸','Photo Quest','Trip challenge','photoQuest')}${tile('🛍','Shopping','Stores and gifts','shopping')}${tile('🎟','Reservations','Booking status','timeline')}${tile('💴','Money','Budget and converter','money')}${tile('📍','Maps','Saved places','maps')}${tile('📖','Journal','Trip memories','journal')}</div>
  ${reservationDashboard()}${budgetSummary()}`);
}
function cityData(city){
  const maps=(state.sections.maps||[]).filter(r=>String(r.City||'').toLowerCase().includes(city.toLowerCase()));
  const food=(state.sections.restaurants||[]).filter(r=>String(r.City||'').toLowerCase().includes(city.toLowerCase()));
  const shopping=(state.sections.shopping||[]).filter(r=>String(r.City||r.Notes||'').toLowerCase().includes(city.toLowerCase()));
  return {maps,food,shopping};
}
function cityWhy(city){
  const copy={
    Tokyo:'Japan’s enormous modern capital: neighborhoods, food, shopping, museums, and easy first-trip orientation.',
    Hakone:'A slower mountain-and-onsen break between Tokyo and Kansai, with lake and Fuji-view opportunities.',
    Kyoto:'Temples, shrines, traditional streets, gardens, and early-morning sightseeing.',
    Osaka:'Two days focused on food, lively streets, shopping, and a different nighttime energy from Kyoto.',
    Nara:'A relaxed day trip for Nara Park, deer, Todai-ji, and a quieter historic atmosphere.'
  };
  return copy[city]||'Destination guide.';
}
function renderDestination(city,view){
  const d=cityData(city);
  const special=city==='Osaka'
    ? `<div class="card gold"><h2>Osaka · 2 Days</h2><p><b>Day 1:</b> Kuromon Market, Shinsaibashi, Dotonbori, Hozenji Yokocho.</p><p><b>Day 2:</b> Osaka Castle or museum, Umeda, shopping, and an evening food crawl.</p></div>`
    : '';
  app.innerHTML=shell(`${destinationTabs(view)}<div class="card hero compactHero cityHero ${view}Hero"><h1>${esc(city)}</h1><p>${esc(cityWhy(city))}</p></div>
  ${special}${smartCards()}
  <div class="quickGrid">${tile('🍜','Food','City restaurants','food')}${tile('📍','Maps','Places and directions','maps')}${tile('🚇','Transit','Routes and Suica','transit')}${tile('☔','Rain Plan','Indoor backups','rain')}${tile('🚻','Bathrooms','Comfort guide','bathroom')}${tile('★','Favorites','Saved places','favorites')}</div>
  <div class="section">Places</div>${list(d.maps,r=>`${favButton('place',r.Place,r)}<strong>${esc(r.Place)}</strong><span class="pill">${esc(r.Type||'Place')}</span><p>${esc(r.Notes||'')}</p>${r['Google Maps Link']?`<a class="action" target="_blank" href="${attr(r['Google Maps Link'])}">Open Map</a>`:''}`,`Add ${city} places to the Maps sheet.`)}
  <div class="section">Food</div>${list(d.food,r=>restaurantCard(r),`Add ${city} restaurants to the Restaurants sheet.`)}
  ${d.shopping.length?`<div class="section">Shopping</div>${list(d.shopping,r=>`<strong>${esc(r['Store / Item']||'Shopping')}</strong><p>${esc(r.Notes||'')}</p>`)}`:''}`);
}
function setFoodFilter(type,value){
  haptic('light');
  if(type==='city') state.foodCity=value;
  if(type==='meal') state.foodMeal=value;
  if(type==='diet') state.foodDiet=value;
  if(type==='priority') state.foodPriority=value;
  renderFoodHub();
}
function foodFilteredRows(){
  const rows=state.sections.restaurants||[];
  const q=state.foodSearch.trim().toLowerCase();
  return rows.filter(r=>{
    const text=JSON.stringify(r).toLowerCase();
    if(q && !text.includes(q)) return false;
    if(state.foodCity!=='All' && String(r.City||'')!==state.foodCity) return false;
    if(state.foodMeal!=='All'){
      const key=state.foodMeal==='Cafe'?'Cafe/Dessert':state.foodMeal;
      if(String(r[key]||'').toLowerCase()!=='yes' && !String(r['Meal Tags']||'').includes(state.foodMeal)) return false;
    }
    if(state.foodPriority!=='All' && String(r.Priority||'')!==state.foodPriority) return false;
    if(state.foodMichelinOnly && (!r.Michelin || r.Michelin==='—')) return false;
    if(state.foodDiet==='GF focused'){
      const v=String(r['GF Confidence']||'').toLowerCase();
      if(!(v.includes('gf-focused')||v.includes('gf options listed'))) return false;
    }
    if(state.foodDiet==='Avoid not-GF'){
      const v=String(r['GF Confidence']||'').toLowerCase();
      if(v.includes('not gf')||v.includes('standard batter')||v.includes('usually not gf')) return false;
    }
    if(state.foodDiet==='Favorites' && !isFav('restaurant',r.Name)) return false;
    return true;
  });
}
function foodFilterChips(values,current,type){
  return `<div class="filterRow">${values.map(v=>`<button class="filterChip ${current===v?'active':''}" onclick="setFoodFilter('${type}','${attr(v)}')">${esc(v)}</button>`).join('')}</div>`;
}
function renderFoodHub(){
  const rows=foodFilteredRows();
  const total=(state.sections.restaurants||[]).length;
  const cityCounts=['Tokyo','Kyoto','Osaka','Hakone'].map(c=>`${c} ${(state.sections.restaurants||[]).filter(r=>r.City===c).length}`).join(' · ');
  app.innerHTML=shell(`<div class="card hero compactHero foodHero"><div class="eyebrow">TRAVEL OS RC5</div><h1>Food Explorer</h1><p>${total||'—'} curated candidates built around Tabelog, Michelin, breakfast/lunch coverage, and your gluten-free + lactose-free needs.</p></div>
  <div class="card foodControls">
    <label class="searchLabel">Search restaurants, areas, cuisines, or notes</label>
    <input class="search" value="${attr(state.foodSearch)}" placeholder="Try: sushi, Akasaka, breakfast, Michelin…" oninput="state.foodSearch=this.value;renderFoodHub()">
    <div class="filterTitle">City</div>${foodFilterChips(['All','Tokyo','Kyoto','Osaka','Hakone'],state.foodCity,'city')}
    <div class="filterTitle">Meal</div>${foodFilterChips(['All','Breakfast','Lunch','Dinner','Cafe'],state.foodMeal,'meal')}
    <div class="filterTitle">Dietary research</div>${foodFilterChips(['All','GF focused','Avoid not-GF','Favorites'],state.foodDiet,'diet')}
    <div class="filterTitle">Priority</div>${foodFilterChips(['All','Top pick','Bucket list','Consider','Group option','Backup'],state.foodPriority,'priority')}
    <label class="toggleRow"><input type="checkbox" ${state.foodMichelinOnly?'checked':''} onchange="state.foodMichelinOnly=this.checked;renderFoodHub()"><span>Michelin-tagged only</span></label>
    <div class="foodSummary"><b>${rows.length}</b> shown · ${esc(cityCounts)}</div>
  </div>
  <div class="card red dietaryBanner"><h2>Dietary verification</h2><p>“GF-focused” is a research signal—not a safety guarantee. Reconfirm gluten, soy sauce, shared fryers, cross-contact, butter, cream, milk, and cheese directly before booking.</p></div>
  <div class="restaurantGrid">${rows.length?rows.map(restaurantCard).join(''):'<div class="card"><p>No restaurants match these filters.</p></div>'}</div>`);
}
function renderTransitHub(){
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Transit</h1><p>Apple Wallet Suica, trains, airport, taxis, and luggage.</p></div>
  <div class="subMenuGrid">${tile('📱','Apple Wallet Suica','Primary transit card','suica')}${tile('🚄','Shinkansen','Reservations and luggage','transitMode')}${tile('🚇','Subway','City travel','transitMode')}${tile('🚌','Buses','Tap with Suica','transitMode')}${tile('🚕','Taxis','Hotel and comfort travel','maps')}${tile('✈️','Airport','Arrival/departure','airport')}${tile('🧳','Luggage','Forwarding and lockers','packing')}${tile('🇯🇵','Transit Phrases','Ask staff','phrases')}</div>${renderTransitCardsInline()}`);
}
function renderMore(){
  openDrawer();
}


function chooseProfile(profile){
  state.prefs.profile=profile;
  savePrefs();
  haptic('success');
  render();
}
function toggleLargeTextPref(){
  state.prefs.largeText=!state.prefs.largeText;
  savePrefs();
  haptic('success');
  render();
}
function completeOnboarding(){
  state.prefs.onboarded=true;
  if(!state.prefs.profile) state.prefs.profile='david';
  state.onboardingOpen=false;
  savePrefs();
  haptic('success');
  setView(state.prefs.profile==='hilda'?'hilda':'home');
}
function onboarding(){
  if(!state.onboardingOpen) return '';
  const profiles=[['david','David'],['noelle','Noelle'],['nick','Nick'],['hilda','Hilda']];
  return `<div class="onboardingLayer">
    <div class="onboardingCard">
      <div class="boot-logo">🇯🇵</div>
      <h1>Welcome to Travel OS</h1>
      <p>Choose who is using this iPhone. You can change this later.</p>
      <div class="profileChoice">${profiles.map(([v,l])=>`<button class="${state.prefs.profile===v?'active':''}" onclick="chooseProfile('${v}')">${l}</button>`).join('')}</div>
      <label class="checkRow"><input type="checkbox" ${state.prefs.largeText?'checked':''} onchange="toggleLargeTextPref()"><span>Use larger text</span></label>
      <div class="card sage onboardingNote"><b>Apple Wallet Suica</b><br>Enabled as the default transit plan.</div>
      <button class="bigButton secondary" onclick="completeOnboarding()">Start Travel OS</button>
    </div>
  </div>`;
}
function tripStatus(){
  const rows=dateRows();
  if(!rows.length) return {mode:'planning',label:'Planning',detail:'Add itinerary dates in the workbook.',day:0,total:0};
  const start=new Date(rows[0].Date+'T00:00:00');
  const end=new Date(rows[rows.length-1].Date+'T23:59:59');
  const now=new Date();
  const daysUntil=Math.ceil((start-now)/(1000*60*60*24));
  if(now<start) return {mode:'planning',label:`${Math.max(0,daysUntil)} days until Japan`,detail:`${rows.length} full days in Japan`,day:0,total:rows.length};
  if(now>end) return {mode:'after',label:'Trip complete',detail:'Open Memory Book and Journal.',day:rows.length,total:rows.length};
  const day=Math.min(rows.length,Math.max(1,Math.floor((now-start)/(1000*60*60*24))+1));
  return {mode:'during',label:`Day ${day} of ${rows.length}`,detail:rows[day-1]?.City||'',day,total:rows.length};
}
function tripProgressCard(){
  const s=tripStatus();
  const pct=s.total ? (s.mode==='planning'?5:Math.round((s.day/s.total)*100)) : 0;
  return `<div class="card tripProgress"><div><small>TRIP STATUS</small><h2>${esc(s.label)}</h2><p>${esc(s.detail)}</p></div><div class="progress"><div class="bar" style="width:${pct}%"></div></div></div>`;
}
function smartModeName(){
  const status=tripStatus();
  if(status.mode==='planning') return ['Before Trip','Bookings, packing, Suica, and readiness.','beforeTrip'];
  const t=today(), text=JSON.stringify(t).toLowerCase();
  if(/airport|flight|narita|haneda|lax|bos/.test(text)) return ['Flight Mode','Flights, passport, hotel, and arrival steps.','airport'];
  if(/train|shinkansen|transfer|station|hakone/.test(text)) return ['Transit Mode','Routes, luggage, exits, and Apple Wallet Suica.','transitMode'];
  const hour=new Date().getHours();
  if(hour<11) return ['Morning Mode','Weather, breakfast, first transit, and what to bring.','today'];
  if(hour<17) return ['Explore Mode','Nearby food, attractions, bathrooms, and maps.','explore'];
  return ['Evening Mode','Dinner, tomorrow, charging, journal, and packing.','evening'];
}
function smartModeCard(){
  const [name,description,view]=smartModeName();
  return `<button class="contextCard smartModeCard" onclick="setView('${view}')"><span>✦</span><div><small>SMART MODE</small><strong>${esc(name)}</strong><small>${esc(description)}</small></div><b>Open ›</b></button>`;
}
function travelTimelineCard(){
  const t=today();
  const rows=[
    ['Morning',t.Morning||'Add morning plan'],
    ['Afternoon',t.Afternoon||'Add afternoon plan'],
    ['Evening',t.Evening||'Add evening plan']
  ];
  return `<div class="card"><h2>Travel Timeline</h2><div class="timeline">${rows.map(([time,text])=>`<div class="timeBlock"><small>${time}</small><strong>${esc(text)}</strong></div>`).join('')}</div></div>`;
}
function smartCards(){
  const t=today(), cards=[];
  const text=JSON.stringify(t).toLowerCase();
  if(state.weather?.precipProbability>=40) cards.push(['☔','Rain likely','Keep the compact umbrella handy and review Rain Mode.','rain']);
  if(String(t.Energy||'').toLowerCase().includes('busy')) cards.push(['◷','Busy day','Schedule a seated rest or taxi option.','peaceOfMind']);
  if(/hakone|kyoto|osaka|nara/.test(text)) cards.push(['🧳','Travel-day check','Confirm luggage plan and tomorrow’s hotel.','transitMode']);
  if(t.Hotel) cards.push(['🏨','Current hotel',String(t.Hotel),'maps']);
  if(!cards.length) cards.push(['✓','Plan looks manageable','Open Today for the full timeline.','today']);
  return `<div class="smartCards">${cards.slice(0,3).map(([icon,title,body,view])=>`<button class="smartMini" onclick="setView('${view}')"><span>${icon}</span><div><strong>${esc(title)}</strong><small>${esc(body)}</small></div></button>`).join('')}</div>`;
}
function skeletonCards(count=3){
  return `<div class="skeletonStack">${Array.from({length:count}).map(()=>`<div class="skeletonCard"><div></div><span></span><span></span></div>`).join('')}</div>`;
}
function questItems(){
  return [
    'Tokyo skyline','Torii gate','Vending machine','Capsule toy',
    'Shinkansen','Mt. Fuji view','Nara deer','Konbini meal',
    'Osaka night sign','Favorite group photo','Best meal','Unexpected discovery'
  ];
}
function toggleQuest(i){
  state.quest[i]=!state.quest[i];
  saveQuest();
  haptic('success');
  renderPhotoQuest();
}
function renderPhotoQuest(){
  const items=questItems(), done=items.filter((_,i)=>state.quest[i]).length;
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Photo Quest</h1><p>A light, optional trip challenge.</p></div>
    <div class="card"><h2>${done} of ${items.length}</h2><div class="progress"><div class="bar" style="width:${Math.round(done/items.length*100)}%"></div></div></div>
    ${items.map((item,i)=>`<label class="checkRow questRow"><input type="checkbox" ${state.quest[i]?'checked':''} onchange="toggleQuest(${i})"><span>${esc(item)}</span></label>`).join('')}`);
}
function renderSettings(){
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Settings</h1><p>Personalize this iPhone.</p></div>
    <div class="card"><h2>Traveler</h2><div class="profileChoice">${[['david','David'],['noelle','Noelle'],['nick','Nick'],['hilda','Hilda']].map(([v,l])=>`<button class="${state.prefs.profile===v?'active':''}" onclick="chooseProfile('${v}')">${l}</button>`).join('')}</div></div>
    <div class="card"><h2>Accessibility</h2><label class="checkRow"><input type="checkbox" ${state.prefs.largeText?'checked':''} onchange="toggleLargeTextPref()"><span>Larger text</span></label></div>
    <div class="card"><h2>Transit</h2><p>Apple Wallet Suica is the primary transit-card plan.</p><button class="action" onclick="setView('suica')">Open Suica Guide</button></div>
    <div class="card"><h2>Maintenance</h2><p class="muted">Release ${APP_VERSION}</p><a class="action" href="?reset=1">Reset app cache</a><button class="action" onclick="setView('debug')">Open Debug</button></div>`);
}
function renderSeasonalEvents(){
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Seasonal</h1><p>Late October and early November planning.</p></div>
    <div class="card gold"><h2>Before relying on an event</h2><p>Confirm exact 2026 dates and ticket rules shortly before the trip. Event schedules change.</p></div>
    ${list(state.sections.seasonal||[],r=>`<strong>${esc(r.Event||r.City||'Seasonal note')}</strong><span class="pill">${esc(r.Date||r.Timing||'')}</span><p>${esc(r['Planning Tip']||r.Notes||r['Typical October Feel']||'')}</p>`, 'Add seasonal notes and events in the Seasonal sheet.')}`);
}

function companionModules(){
  return [
    ['🕒','Daily Timeline','Time-based plan','timelinePro'],
    ['🎟️','Reservations','Booking assistant','reservationAssistant'],
    ['🌦️','Weather','Rain-aware plan','weatherPlanner'],
    ['🚄','Live Transit','Routes + status','liveTransit'],
    ['🎒','Packing','Context carry list','packingIntel'],
    ['📊','Budget','Planned vs actual','budgetPro'],
    ['🗺️','Map Explorer','Food + places','mapExplorer'],
    ['☀️','Daily Brief','What matters now','dailyBriefPro'],
    ['📖','Memory Book','Save the trip','memoryBook']
  ];
}
function renderCompanion(){
  const t=today(), confirmed=Object.values(state.restaurantStatus||{}).filter(v=>v==='Confirmed').length;
  app.innerHTML=shell(`<div class="card hero companionHero"><div class="eyebrow">RC6 COMMAND CENTER</div><h1>Travel Companion</h1><p>One place for today, bookings, transit, weather, packing, money, maps, and memories.</p></div>
    <div class="companionKpis">
      <div><small>CURRENT CITY</small><strong>${esc(t.City||'Planning')}</strong></div>
      <div><small>CONFIRMED DINING</small><strong>${confirmed}</strong></div>
      <div><small>WEATHER</small><strong>${state.weather?.available?`${esc(state.weather.highF)}°F`:'Later'}</strong></div>
    </div>
    ${smartDailyBriefCard()}
    <div class="moduleGrid">${companionModules().map(([i,t,s,v])=>tile(i,t,s,v)).join('')}</div>`);
}
function timelineBlocks(){
  const t=today();
  return [
    ['08:00','Breakfast + prep','Choose a saved breakfast near the hotel; carry dietary card.'],
    ['09:30','Morning',t.Morning||'Morning plan'],
    ['12:00','Lunch','Open Food Explorer and filter by current city + Lunch.'],
    ['14:00','Afternoon',t.Afternoon||'Afternoon plan'],
    ['18:00','Dinner',t.Evening||'Dinner / evening plan'],
    ['20:30','Nightly reset','Charge devices, check weather and transit, pack tomorrow’s carry items.']
  ];
}
function renderTimelinePro(){
  const t=today();
  app.innerHTML=shell(`${controls()}<div class="card hero compactHero"><div class="eyebrow">${esc(t.City||'')}</div><h1>Daily Timeline</h1><p>${esc(t.Date_nice||state.core.selectedDateNice||'')}</p></div>
    <div class="proTimeline">${timelineBlocks().map(([time,title,detail],i)=>`<div class="proTimelineRow"><div class="timeRail"><span>${time}</span><i></i></div><div class="timelineEvent"><small>${i===0?'START EASY':i===5?'RESET':'PLAN'}</small><h3>${esc(title)}</h3><p>${esc(detail)}</p>${i===2?'<button class="miniAction" onclick="setView(\'food\')">Find lunch</button>':''}${i===4?'<button class="miniAction" onclick="setView(\'reservationAssistant\')">Check reservation</button>':''}</div></div>`).join('')}</div>
    <div class="card"><h2>Buffer rule</h2><p>Use 30 minutes between major activities and 45–60 minutes before reserved dining. Add more time for large stations, luggage, or Hilda comfort stops.</p></div>`);
}
function reservationCandidates(){
  return (state.sections.restaurants||[]).filter(r=>['Bucket list','Top pick'].includes(r.Priority)||String(r.Michelin||'')!=='—').slice(0,60);
}
function reservationStatusFor(r){ return state.reservationAssistant[restaurantStateKey(r)]||state.restaurantStatus[restaurantStateKey(r)]||r['Reservation Status']||'Not booked'; }
function cycleAssistantStatus(id){
  const opts=['Not booked','Research opening','Need to reserve','Requested','Waitlist','Confirmed'];
  const cur=state.reservationAssistant[id]||'Not booked';
  state.reservationAssistant[id]=opts[(opts.indexOf(cur)+1)%opts.length];
  saveReservationAssistant(); haptic('success'); renderReservationAssistant();
}
function renderReservationAssistant(){
  const rows=reservationCandidates();
  app.innerHTML=shell(`<div class="card hero compactHero reservationHero"><h1>Reservation Assistant</h1><p>Prioritize special meals, research opening rules, send dietary requests, and track confirmations.</p></div>
    <div class="card gold"><h2>Booking rule</h2><p>Reservation windows vary by restaurant and booking service. Treat every opening date as “research required” until the restaurant or official booking page confirms it.</p></div>
    <div class="assistantList">${rows.map(r=>{const id=restaurantStateKey(r),s=reservationStatusFor(r);return `<article class="assistantCard"><div><small>${esc(r.City)} · ${esc(r.Area)}</small><h3>${esc(r.Name)}</h3><p>${esc(r.Michelin||'')} · ${esc(r['Meal Tags']||'')}</p></div><div class="assistantMeta"><span>${esc(r.Reservation||'Verify')}</span><span>${esc(r.Price||'')}</span></div><div class="dietRequest"><b>Dietary request</b><span>${esc(r['Dietary Note']||'Confirm GF + lactose-free directly.')}</span></div><button class="reservationStatus" onclick="cycleAssistantStatus('${attr(id)}')">${esc(s)} · tap to update</button><div class="restaurantActions">${r['Tabelog Link']?`<a class="action secondaryAction" target="_blank" rel="noopener" href="${attr(r['Tabelog Link'])}">Research on Tabelog</a>`:''}${r['Google Maps Link']?`<a class="action" target="_blank" rel="noopener" href="${attr(r['Google Maps Link'])}">Map</a>`:''}</div></article>`}).join('')}</div>`);
}
function currentTransitLeg(){
  const t=today(), text=JSON.stringify(t).toLowerCase();
  if(/narita|arrival/.test(text)) return ['Narita → Akasaka','Narita Express + metro/taxi','All bags'];
  if(/hakone/.test(text)&&/tokyo|forward/.test(text)) return ['Tokyo → Hakone','Romancecar or JR + local','Overnight bags only'];
  if(/hakone/.test(text)&&/kyoto|shinkansen/.test(text)) return ['Hakone → Kyoto','Local + Tokaido Shinkansen','Large bags forwarded'];
  if(/osaka/.test(text)&&/travel|kyoto/.test(text)) return ['Kyoto → Osaka','JR / Shinkansen','All bags or forward'];
  if(/shinkansen to tokyo|back to tokyo/.test(text)) return ['Osaka → Tokyo','Tokaido Shinkansen','Reserve seats'];
  if(/fly home|checkout/.test(text)) return ['Akasaka → Narita','NEX / Skyliner / taxi','All bags'];
  return ['Local city travel','Suica + Google Maps transit','Check final train'];
}
function renderLiveTransit(){
  const [route,method,luggage]=currentTransitLeg();
  const maps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(route+' Japan transit')}`;
  app.innerHTML=shell(`<div class="card hero transitHero"><div class="eyebrow">NEXT LEG</div><h1>${esc(route)}</h1><p>${esc(method)}</p></div>
    <div class="card"><div class="transitFacts"><div><small>LUGGAGE</small><strong>${esc(luggage)}</strong></div><div><small>SUICA</small><strong>Ready</strong></div><div><small>BUFFER</small><strong>30–60 min</strong></div></div></div>
    <div class="card"><h2>Live tools</h2><div class="stackActions"><a class="action" target="_blank" rel="noopener" href="${maps}">Open live route in Google Maps</a><a class="action secondaryAction" target="_blank" rel="noopener" href="https://traininfo.jreast.co.jp/train_info/e/">JR East train status</a><a class="action secondaryAction" target="_blank" rel="noopener" href="https://global.jr-central.co.jp/en/">JR Central / Tokaido Shinkansen</a></div><p class="muted">Platforms, delays, exits, and train composition can change. Confirm in the live service shortly before departure.</p></div>
    ${renderTransitCardsInline()}`);
}
function weatherAdvice(){
  const rain=Number(state.weather?.precipProbability||0);
  if(rain>=60) return ['Rain plan recommended','Use Rain Mode, prioritize indoor stops, and keep outdoor sights flexible.','rain'];
  if(rain>=35) return ['Carry umbrella','Keep the day, but move cafés and indoor stops near outdoor activities.','rain'];
  return ['Outdoor plan looks reasonable','Still check the hourly forecast before leaving.','today'];
}
function renderWeatherPlanner(){
  const [title,detail,view]=weatherAdvice(), t=today();
  app.innerHTML=shell(`<div class="card hero weatherPlannerHero"><h1>Weather Planner</h1><p>${esc(t.City||'Japan')} · ${esc(t.Date_nice||state.core.selectedDateNice||'')}</p></div>${weatherCard()}
    <button class="contextCard" onclick="setView('${view}')"><span>${Number(state.weather?.precipProbability||0)>=35?'☔':'☀️'}</span><div><strong>${esc(title)}</strong><small>${esc(detail)}</small></div><b>Open ›</b></button>
    <div class="card"><h2>Weather-aware rule set</h2><p>Rain ≥60%: switch major outdoor blocks. Rain 35–59%: keep the day but cluster indoor backups nearby. Hot or tiring day: add a seated break and taxi option.</p></div>${list(state.sections.rain||[],r=>`<strong>${esc(r.City)}</strong><p><b>Outdoor:</b> ${esc(r['Outdoor Plan'])}</p><p><b>Backup:</b> ${esc(r['Rain Backup'])}</p>`)}`);
}
function packingItemsForToday(){
  const city=String(today().City||'');
  const base=['Phone + power bank','Suica','Dietary card','Tissues + small trash bag'];
  if(/Hakone/i.test(city)) base.push('Overnight bag','Medication + comfort kit','Slip-on socks');
  if(/Kyoto/i.test(city)) base.push('Comfortable walking shoes','Temple cash');
  if(/Osaka/i.test(city)) base.push('Saved GF backups','Cash for small vendors');
  if(/Tokyo/i.test(city)) base.push('Timed-entry QR codes','Compact umbrella / light layer');
  if(/USA|Flight/i.test(city)) base.push('Passports','Flight confirmations','All luggage');
  return base;
}
function togglePackingIntel(item){ state.packingIntel[item]=!state.packingIntel[item]; savePackingIntel(); haptic('light'); renderPackingIntel(); }
function renderPackingIntel(){
  const items=packingItemsForToday(),done=items.filter(i=>state.packingIntel[i]).length;
  app.innerHTML=shell(`<div class="card hero compactHero"><h1>Packing Intelligence</h1><p>${esc(today().City||'Today')} · ${done}/${items.length} ready</p></div><div class="card"><div class="progress"><div class="bar" style="width:${Math.round(done/items.length*100)}%"></div></div></div>${items.map(i=>`<label class="checkRow"><input type="checkbox" ${state.packingIntel[i]?'checked':''} onchange='togglePackingIntel(${JSON.stringify(i)})'><span>${esc(i)}</span></label>`).join('')}<div class="card"><button class="action" onclick="setView('packing')">Open full packing list</button></div>`);
}
function spendTotals(){
  const rows=state.spend||[]; const total=rows.reduce((s,r)=>s+Number(r.amount||r.value||0),0);
  const by={}; rows.forEach(r=>{const c=r.category||'Other';by[c]=(by[c]||0)+Number(r.amount||r.value||0)});
  return {total,by};
}
function renderBudgetPro(){
  const s=spendTotals(), rate=Number(state.fx?.rate||145), usd=s.total/rate;
  const groups=Object.entries(s.by).sort((a,b)=>b[1]-a[1]);
  app.innerHTML=shell(`<div class="card hero budgetHero"><div class="eyebrow">TRIP SPEND</div><h1>¥${Math.round(s.total).toLocaleString()}</h1><p>≈ $${usd.toFixed(0)} at ¥${Math.round(rate)}/$1</p></div>${budgetSummary()}<div class="card"><h2>Category snapshot</h2>${groups.length?groups.map(([k,v])=>`<div class="budgetBar"><div><b>${esc(k)}</b><span>¥${Math.round(v).toLocaleString()}</span></div><i><em style="width:${s.total?Math.max(5,Math.round(v/s.total*100)):0}%"></em></i></div>`).join(''):'<p class="muted">No local expenses recorded yet. Use Money Hub to add spending.</p>'}</div><button class="bigButton" onclick="setView('money')">Add / review expenses</button>`);
}
function mapRows(){
  const maps=(state.sections.maps||[]).map(r=>({name:r.Place,city:r.City,type:r.Type||'Place',notes:r.Notes,url:r['Google Maps Link']}));
  const restaurants=(state.sections.restaurants||[]).map(r=>({name:r.Name,city:r.City,type:'Restaurant',notes:`${r.Cuisine||''} · ${r.Area||''}`,url:r['Google Maps Link']}));
  return [...maps,...restaurants];
}
function renderMapExplorer(){
  const q=state.companionSearch.toLowerCase(), city=state.companionCity;
  const rows=mapRows().filter(r=>(city==='All'||r.city===city)&&(!q||JSON.stringify(r).toLowerCase().includes(q))).slice(0,100);
  app.innerHTML=shell(`${mapHero()}<div class="card"><input class="search" placeholder="Search place, restaurant, area…" value="${attr(state.companionSearch)}" oninput="state.companionSearch=this.value;renderMapExplorer()">${foodFilterChips(['All','Tokyo','Hakone','Kyoto','Osaka'],state.companionCity,'companionCity')}</div><div class="mapResultGrid">${rows.map(r=>`<article class="mapResult"><small>${esc(r.city)} · ${esc(r.type)}</small><h3>${esc(r.name)}</h3><p>${esc(r.notes||'')}</p>${r.url?`<a class="action" target="_blank" rel="noopener" href="${attr(r.url)}">Open map</a>`:''}</article>`).join('')}</div>`);
}
function setFoodFilter(type,value){
  haptic('light');
  if(type==='city') state.foodCity=value;
  if(type==='meal') state.foodMeal=value;
  if(type==='diet') state.foodDiet=value;
  if(type==='priority') state.foodPriority=value;
  if(type==='companionCity') state.companionCity=value;
  if(type==='companionCity') renderMapExplorer(); else renderFoodHub();
}
function smartDailyBriefCard(){
  const t=today(), [route]=currentTransitLeg(), [weatherTitle]=weatherAdvice();
  const confirmed=reservationCandidates().filter(r=>reservationStatusFor(r)==='Confirmed').slice(0,2);
  return `<div class="card dailyBriefPro"><small>SMART DAILY BRIEF</small><h2>${esc(t.City||'Planning day')}</h2><p><b>First:</b> ${esc(t.Morning||'Review the plan.')}</p><p><b>Weather:</b> ${esc(weatherTitle)}</p><p><b>Transit:</b> ${esc(route)}</p><p><b>Dining:</b> ${confirmed.length?confirmed.map(r=>esc(r.Name)).join(', '):'No confirmed restaurant tracked for this day.'}</p><button class="action" onclick="setView('dailyBriefPro')">Open full brief</button></div>`;
}
function renderDailyBriefPro(){
  const t=today(), [route,method,luggage]=currentTransitLeg(), [wt,wd]=weatherAdvice(), pack=packingItemsForToday();
  app.innerHTML=shell(`<div class="card hero dailyBriefHero"><div class="eyebrow">GOOD MORNING</div><h1>${esc(t.City||'Japan')}</h1><p>${esc(t.Date_nice||state.core.selectedDateNice||'')}</p></div>${weatherCard()}<div class="briefGrid"><div class="card"><small>FIRST PLAN</small><h2>${esc(t.Morning||'Review today')}</h2><p>${esc(t.Afternoon||'')}</p></div><div class="card"><small>TRANSIT</small><h2>${esc(route)}</h2><p>${esc(method)} · ${esc(luggage)}</p></div><div class="card"><small>WEATHER DECISION</small><h2>${esc(wt)}</h2><p>${esc(wd)}</p></div><div class="card"><small>CARRY</small><h2>${pack.length} items</h2><p>${pack.slice(0,4).map(esc).join(' · ')}</p></div></div><div class="quickGrid">${tile('🕒','Timeline','Run the day','timelinePro')}${tile('🍜','Food','Choose meals','food')}${tile('🚄','Transit','Check live route','liveTransit')}${tile('🎒','Packing','Final check','packingIntel')}</div>`);
}
function memoryDateKey(){ return String(state.core?.selectedDate||today().Date||new Date().toISOString().slice(0,10)); }
function memoryEntry(){ const k=memoryDateKey(); return state.memoryBook[k]||{meal:'',moment:'',purchase:'',rating:'',notes:''}; }
function updateMemory(field,value){ const k=memoryDateKey();state.memoryBook[k]=Object.assign({},memoryEntry(),{[field]:value});saveMemory(); }
function printMemoryBook(){ window.print(); }
function renderMemoryBook(){
  const e=memoryEntry(), entries=Object.entries(state.memoryBook||{}).sort();
  app.innerHTML=shell(`<div class="card hero memoryHero"><h1>Memory Book</h1><p>Capture the trip one day at a time, then print or save as PDF.</p></div>${controls()}<div class="card memoryEditor"><label>Favorite meal<input value="${attr(e.meal)}" oninput="updateMemory('meal',this.value)"></label><label>Best moment<input value="${attr(e.moment)}" oninput="updateMemory('moment',this.value)"></label><label>Favorite purchase<input value="${attr(e.purchase)}" oninput="updateMemory('purchase',this.value)"></label><label>Day rating<input type="number" min="1" max="10" value="${attr(e.rating)}" oninput="updateMemory('rating',this.value)"></label><label>Notes<textarea oninput="updateMemory('notes',this.value)">${esc(e.notes)}</textarea></label></div><button class="bigButton" onclick="printMemoryBook()">Print / Save PDF</button><div class="memoryBookPages">${entries.map(([date,m])=>`<article class="memoryPage"><small>${esc(date)}</small><h2>${esc(m.moment||'Trip memory')}</h2><p><b>Favorite meal:</b> ${esc(m.meal||'—')}</p><p><b>Purchase:</b> ${esc(m.purchase||'—')}</p><p><b>Rating:</b> ${esc(m.rating||'—')}/10</p><p>${esc(m.notes||'')}</p></article>`).join('')}</div>`);
}

function render(){ if(!state.core){ app.innerHTML=boot('Loading…'); return; } const v=state.view; if(v==='companion')return renderCompanion(); if(v==='timelinePro')return renderTimelinePro(); if(v==='reservationAssistant')return renderReservationAssistant(); if(v==='liveTransit')return renderLiveTransit(); if(v==='weatherPlanner')return renderWeatherPlanner(); if(v==='packingIntel')return renderPackingIntel(); if(v==='budgetPro')return renderBudgetPro(); if(v==='mapExplorer')return renderMapExplorer(); if(v==='dailyBriefPro')return renderDailyBriefPro(); if(v==='home')renderHome(); else if(v==='travelers')renderTravelers(); else if(v==='david')renderDavid(); else if(v==='noelle')renderNoelle(); else if(v==='tokyo')renderDestination('Tokyo','tokyo'); else if(v==='hakone')renderDestination('Hakone','hakone'); else if(v==='kyoto')renderDestination('Kyoto','kyoto'); else if(v==='osaka')renderDestination('Osaka','osaka'); else if(v==='nara')renderDestination('Nara','nara'); else if(v==='more')renderMore(); else if(v==='today')renderToday(); else if(v==='hilda')renderHilda(); else if(v==='nick')renderNick(); else if(v==='dn')renderDN(); else if(v==='phrases')renderPhrases(); else if(v==='sos')renderSOS(); else if(v==='lost')renderLost(); else if(v==='food')renderFood(); else if(v==='maps')renderMaps(); else if(v==='rain')renderRain(); else if(v==='academy')renderAcademy(); else if(v==='useful')renderUseful(); else if(v==='timeline')renderTimeline(); else if(v==='shopping')renderShopping(); else if(v==='transit')renderTransit(); else if(v==='packing')renderPacking(); else if(v==='budget')renderBudget(); else if(v==='favorites')renderFavorites(); else if(v==='journal')renderJournal(); else if(v==='reservationsPlus')renderReservationsPlus(); else if(v==='search')renderSearch(); else if(v==='suica')renderSuica(); else if(v==='explore')renderExplore(); else if(v==='medical')renderMedical(); else if(v==='peaceOfMind')renderPeaceOfMind(); else if(v==='bathroom')renderBathroom(); else if(v==='konbiniExplorer')renderKonbiniExplorer(); else if(v==='seasonalGuide')renderSeasonalGuide(); else if(v==='souvenirs')renderSouvenirs(); else if(v==='currency')renderCurrency(); else if(v==='money')renderMoney(); else if(v==='companions')renderTravelers(); else if(v==='beforeTrip')renderBeforeTrip(); else if(v==='airport')renderAirportMode(); else if(v==='transitMode')renderTransitMode(); else if(v==='evening')renderEvening(); else if(v==='admin')renderAdmin(); else if(v==='confidence')renderConfidence(); else if(v==='familyStatus')renderFamilyStatus(); else if(v==='memoryBook')renderMemoryBook(); else if(v==='artDirection')renderArtDirection(); else if(v==='photoQuest')renderPhotoQuest(); else if(v==='settings')renderSettings(); else if(v==='seasonalEvents')renderSeasonalEvents(); else if(v==='system')renderSystem(); else if(v==='debug')renderDebug(); else renderHome(); }
if('serviceWorker' in navigator){ window.addEventListener('load',async()=>{ try{ const reg=await navigator.serviceWorker.register('./sw.js?v=1.0-rc6'); await reg.update(); }catch(e){} }); }

let touchStartX=0,touchStartY=0,touchStartEdge=false;
function swipeGroup(view){
  if(TRAVELER_TABS.includes(view)) return TRAVELER_TABS;
  if(DESTINATION_TABS.includes(view)) return DESTINATION_TABS;
  if(PRIMARY_TABS.includes(view) && view!=='more') return PRIMARY_TABS.filter(v=>v!=='more');
  return [];
}
document.addEventListener('touchstart',e=>{
  const t=e.changedTouches?.[0]; if(!t)return;
  touchStartX=t.screenX; touchStartY=t.screenY; touchStartEdge=t.clientX<28;
},{passive:true});
document.addEventListener('touchend',e=>{
  const t=e.changedTouches?.[0]; if(!t)return;
  const dx=t.screenX-touchStartX,dy=Math.abs(t.screenY-touchStartY);
  if(touchStartEdge && dx>70 && dy<90){openDrawer();return;}
  if(dy>80||Math.abs(dx)<70||state.drawerOpen||state.quickOpen)return;
  const group=swipeGroup(state.view),i=group.indexOf(state.view);
  if(i<0)return;
  if(dx<0&&i<group.length-1)setView(group[i+1]);
  if(dx>0&&i>0)setView(group[i-1]);
},{passive:true});
init();
