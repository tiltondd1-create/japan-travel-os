const APP_VERSION='v9.1.0';
const CONFIG={
  // Paste your Apps Script Web App URL here after deployment.
  API_URL:'',
  CACHE_KEY:'japan-travel-os-v91-cache',
  STALE_MS:1000*60*10
};

let state={
  view:'home',
  core:null,
  sections:{},
  weather:null,
  offline:false,
  loading:false,
  phraseCat:'',
  phraseSearch:'',
  lastSync:null
};

const app=document.getElementById('app');
const SECTION_BUNDLES={
  dn:['reservations','smartAlerts'],
  phrases:['phraseFavorites','phrases'],
  sos:['emergency'],
  lost:['lost'],
  food:['restaurants','foodChallenge'],
  maps:['maps'],
  rain:['rain'],
  academy:['firstTime'],
  useful:['konbiniGuide','bathroom','seasonal'],
  timeline:['countdown','resTimeline'],
  shopping:['shopping']
};

function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
function attr(v){return esc(v).replace(/`/g,'&#96;');}
function splash(msg){return `<div class="splash"><div class="splash-mark">🇯🇵</div><h1>Japan 2026</h1><p>${esc(msg)}</p></div>`;}
function skeleton(label='Loading...'){return `<div class="card"><div class="muted">${esc(label)}</div></div>`;}

function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb='cb_'+Math.random().toString(36).slice(2);
    const s=document.createElement('script');
    const timeout=setTimeout(()=>{cleanup();reject(new Error('Network timeout'));},15000);
    function cleanup(){clearTimeout(timeout);delete window[cb];s.remove();}
    window[cb]=d=>{cleanup();resolve(d)};
    s.onerror=()=>{cleanup();reject(new Error('Network/API load failed'))};
    s.src=url+(url.includes('?')?'&':'?')+'callback='+cb+'&_='+Date.now();
    document.body.appendChild(s);
  });
}

function api(action, extra=''){
  if(!CONFIG.API_URL) return Promise.reject(new Error('Missing API URL in app.js'));
  return jsonp(`${CONFIG.API_URL}?action=${encodeURIComponent(action)}${extra}`);
}

function loadCache(){
  try{
    const cached=JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY)||'null');
    if(cached?.state?.core){
      Object.assign(state,cached.state,{offline:true});
      return cached.time||0;
    }
  }catch(e){}
  return 0;
}
function saveCache(){
  const slim={core:state.core,sections:state.sections,weather:state.weather,lastSync:Date.now()};
  localStorage.setItem(CONFIG.CACHE_KEY,JSON.stringify({time:Date.now(),state:slim}));
}

async function init(){
  const cacheTime=loadCache();
  if(state.core) render();

  if(!CONFIG.API_URL){
    if(!state.core) app.innerHTML=`<div class="app"><div class="card red"><h2>Setup needed</h2><p>Open app.js and paste your Apps Script web app URL into CONFIG.API_URL.</p></div></div>`;
    return;
  }

  // Cache-first: render instantly from localStorage, then refresh in background.
  const shouldRefresh=!cacheTime || Date.now()-cacheTime>CONFIG.STALE_MS;
  if(!state.core || shouldRefresh) {
    try{
      state.loading=true;
      if(!state.core) app.innerHTML=splash('Syncing Travel OS...');
      const core=await api('core');
      if(!core.ok) throw new Error(core.error||'Core API error');
      state.core=core;
      state.offline=false;
      state.loading=false;
      saveCache();
      render();
      refreshWeather();
      prefetchCritical();
    }catch(e){
      state.loading=false;
      if(state.core){state.offline=true;render();}
      else app.innerHTML=`<div class="app"><div class="card red"><h2>Could not load app</h2><p>${esc(e.message)}</p></div></div>`;
    }
  } else {
    refreshWeather();
    prefetchCritical();
  }
}

async function refreshWeather(){
  if(!CONFIG.API_URL) return;
  try{
    const w=await api('weather');
    state.weather=w;
    state.offline=false;
    saveCache();
    render();
  }catch(e){}
}

async function loadSection(name){
  if(state.sections[name]) return state.sections[name];
  try{
    const payload=await api('section','&section='+encodeURIComponent(name));
    if(payload.ok){
      state.sections[name]=payload.rows||[];
      state.offline=false;
      saveCache();
      render();
      return state.sections[name];
    }
  }catch(e){
    state.offline=true;
    render();
  }
  return [];
}

function ensureSections(names){
  names.forEach(n=>{ if(!state.sections[n]) loadSection(n); });
}
function prefetchCritical(){
  ['emergency','lost','phraseFavorites','phrases','hotels','maps'].forEach(n=>loadSection(n));
}

function setView(v){
  state.view=v;
  ensureSections(SECTION_BUNDLES[v]||[]);
  render();
  scrollTo({top:0,behavior:'smooth'});
}

function today(){return state.core?.today||{};}
function dates(){return (state.core?.itinerary||[]).map(x=>x.Date).filter(Boolean);}
function setLocalDate(d){
  const row=(state.core.itinerary||[]).find(x=>x.Date===d);
  if(row){
    state.core.selectedDate=d;
    state.core.selectedDateNice=row.Date_nice||d;
    state.core.today=row;
    saveCache();
    refreshWeather();
    render();
  }
}
function shiftLocal(n){
  const ds=dates();
  const i=ds.indexOf(state.core.selectedDate);
  const ni=Math.max(0,Math.min(ds.length-1,(i<0?0:i)+n));
  setLocalDate(ds[ni]);
}

function shell(content,cls=''){
  return `<div class="app ${cls}">
    ${state.offline?'<div class="offline">Offline/cache mode — showing saved data.</div>':''}
    ${content}
  </div>${nav()}`;
}
function nav(){
  const tabs=[['home','🏠','Home'],['today','📱','Today'],['hilda','👩','Hilda'],['nick','👦','Nick'],['dn','👨‍👩‍👦','D+N'],['sos','🚨','SOS']];
  return `<div class="nav">${tabs.map(([v,i,l])=>`<button class="${state.view===v?'active':''}" onclick="setView('${v}')">${i}<br>${l}</button>`).join('')}</div>`;
}
function hero(){return `<div class="hero"><h1>🇯🇵 JAPAN<br>2026</h1><p>David • Noelle • Nick • Hilda</p></div>`;}
function controls(){return `<div class="topbar"><button onclick="shiftLocal(-1)">←</button><input type="date" value="${esc(state.core?.selectedDate||'')}" onchange="setLocalDate(this.value)"><button onclick="shiftLocal(1)">→</button></div>`;}
function weather(){
  const w=state.weather;
  if(!w)return skeleton('Weather loading...');
  if(!w.available)return `<div class="card"><div class="weather"><div class="weatherIcon">🌤️</div><div><h3>Weather · ${esc(w.city||'')}</h3><div class="muted">${esc(w.message||'Available closer to trip')}</div><small>${esc(w.detail||'')}</small></div></div></div>`;
  return `<div class="card"><div class="weather"><div class="weatherIcon">${esc(w.icon)}</div><div><h3>Weather · ${esc(w.city)}</h3><div class="temp">${esc(w.highF)}° / ${esc(w.lowF)}°F · ${esc(w.summary)}</div><div class="muted">Rain ${esc(w.precipProbability)}% · Bring ${esc(w.bring)}</div></div></div></div>`;
}
function card(title,text,style=''){return `<div class="card ${style}"><h2>${title}</h2><p>${esc(text||'')}</p></div>`;}
function dayCards(){const t=today();return `${card('☀ Morning',t.Morning,'sage')}${card('🌤 Afternoon',t.Afternoon,'blue')}${card('🌙 Evening',t.Evening,'lav')}`;}
function tile(icon,title,sub,view){return `<button class="tile" onclick="setView('${view}')"><strong>${icon} ${esc(title)}</strong><span>${esc(sub)}</span></button>`;}
function list(rows,fn,empty='No items yet.'){return rows?.length?`<div class="list">${rows.map(r=>`<div class="item">${fn(r)}</div>`).join('')}</div>`:skeleton(empty);}
function meta(t){return `<div class="meta"><div>⚡ ${esc(t.Energy||'')}</div><div>👥 ${esc(t.Crowd||'')}</div><div>👟 ${esc(t.Walking||'')}</div></div>`;}

function renderHome(){
  const t=today();
  app.innerHTML=shell(`${hero()}${controls()}${weather()}<div class="card dark"><h2>Today</h2><div class="bigdate">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${meta(t)}</div><div class="section">Quick access</div><div class="grid">${tile('👩','Hilda','Relax mode','hilda')}${tile('👦','Nick','Simple plan','nick')}${tile('👨‍👩‍👦','D+N','Planning','dn')}${tile('🆘','Lost','If separated','lost')}${tile('🇯🇵','Phrases','Searchable','phrases')}${tile('🍽','Food','Restaurants','food')}${tile('☔','Rain','Backups','rain')}${tile('📍','Maps','Places','maps')}${tile('🎓','First Time','Japan basics','academy')}${tile('🧰','Useful','Konbini + bathroom','useful')}${tile('⏳','Timeline','Countdowns','timeline')}${tile('🚨','SOS','Emergency','sos')}</div>`);
}
function renderToday(){
  const t=today();
  app.innerHTML=shell(`${controls()}${weather()}<div class="card dark"><h2>📱 Today</h2><div class="bigdate">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${meta(t)}</div>${dayCards()}<div class="card red"><b>Bring:</b><br>${esc(t['Bring / Hilda Reminder']||'')}</div>`);
}
function renderHilda(){
  const t=today();
  app.innerHTML=shell(`${controls()}${weather()}<div class="card lav"><h2>👩 Hilda</h2><div class="bigdate">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div><div class="card"><b>Hotel</b><br>${esc(t.Hotel||'')}</div>${dayCards()}<div class="card red"><b>Bring</b><br>${esc(t['Bring / Hilda Reminder']||'')}</div><div class="card dark"><b>Emergency</b><br>Police: 110<br>Ambulance / Fire: 119<br><br>If separated: go to hotel lobby or ask station staff.</div>`,'hilda');
}
function renderNick(){
  const t=today();
  app.innerHTML=shell(`${controls()}${weather()}<div class="card blue"><h2>👦 Nick</h2><div class="bigdate">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div>${dayCards()}<div class="card"><b>Hotel:</b> ${esc(t.Hotel||'')}</div><div class="grid">${tile('🍽','Food','Restaurants','food')}${tile('🛍','Shopping','Wishlist','shopping')}${tile('🇯🇵','Phrases','Useful Japanese','phrases')}${tile('🆘','Lost','If separated','lost')}</div>`);
}
function renderDN(){
  app.innerHTML=shell(`${controls()}${weather()}<div class="card"><h2>👨‍👩‍👦 David + Noelle</h2><p>Planning dashboard: bookings, alerts, and logistics.</p></div><div class="section">Reservations</div>${list(state.sections.reservations,r=>`<strong>${esc(r.Item)}</strong><span class="pill">${esc(r.Status)}</span><span class="pill">${esc(r.Urgency)}</span><small>${esc(r.Notes||'')}</small>`,'Reservations loading...')}<div class="section">Smart Alerts</div>${list(state.sections.smartAlerts,r=>`<strong>${esc(r.Trigger)}</strong><p>${esc(r.Message)}</p><span class="pill">${esc(r.Who)}</span>`,'Alerts loading...')}`);
}
function renderPhrases(){
  const rows=[...(state.sections.phraseFavorites||[]),...(state.sections.phrases||[])];
  const cats=[...new Set(rows.map(r=>r.Category).filter(Boolean))];
  const filtered=rows.filter(r=>(!state.phraseCat||r.Category===state.phraseCat)&&(!state.phraseSearch||JSON.stringify(r).toLowerCase().includes(state.phraseSearch)));
  app.innerHTML=shell(`<div class="card"><h2>🇯🇵 Phrases</h2><p class="muted">Search English, Japanese, romaji, phonetics, category, or use case.</p><input class="search" placeholder="Search..." oninput="state.phraseSearch=this.value.toLowerCase();renderPhrases()"><div class="chips"><button class="chip ${!state.phraseCat?'active':''}" onclick="state.phraseCat='';renderPhrases()">All</button>${cats.map(c=>`<button class="chip ${state.phraseCat===c?'active':''}" onclick="state.phraseCat='${attr(c)}';renderPhrases()">${esc(c)}</button>`).join('')}</div></div>${list(filtered,r=>`<div class="category">${esc(r.Category||'')}</div><strong>${esc(r.English||'')}</strong><div class="jp">${esc(r.Japanese||'')}</div><small>${esc(r.Romaji||'')}</small><br><small>${esc(r['Easy Phonetics']||'')}</small><p>${esc(r.Use||'')}</p>`,'Phrases loading...')}`);
}
function renderSOS(){app.innerHTML=shell(`<div class="card dark"><h2>🚨 Emergency</h2><p>Use this if anything feels unsafe or confusing.</p></div>${list(state.sections.emergency,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Details||'')}</p><small>${esc(r['Phone / Link']||'')}</small><br><small>${esc(r.Notes||'')}</small>`,'Emergency info loading...')}`);}
function renderLost(){app.innerHTML=shell(`<div class="card dark"><h2>🆘 Lost Mode</h2><p>Stay calm. Go to the hotel lobby or station staff if separated.</p></div>${list(state.sections.lost,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Info||'')}</p><small>${esc(r.Action||'')}</small><br><small>${esc(r['Japanese / Notes']||'')}</small>`,'Lost mode loading...')}`);}
function renderFood(){app.innerHTML=shell(`<div class="card"><h2>🍽 Food</h2></div><div class="section">Restaurants</div>${list(state.sections.restaurants,r=>`<strong>${esc(r.Name)}</strong><span class="pill">${esc(r.City)}</span><span class="pill">${esc(r.Cuisine)}</span><p>${esc(r.Notes||'')}</p><small>Must order: ${esc(r['Must Order']||'')}</small>`,'Restaurants loading...')}<div class="section">Food Challenge</div>${list(state.sections.foodChallenge,r=>`<strong>${esc(r.Food)}</strong><span class="pill">${esc(r['Tried?']||'☐')}</span><small>${esc(r.Notes||'')}</small>`,'Food challenge loading...')}`);}
function renderMaps(){app.innerHTML=shell(`<div class="card"><h2>📍 Maps</h2><p>Fill map links in the Sheet as plans get confirmed.</p></div>${list(state.sections.maps,r=>`<strong>${esc(r.Place)}</strong><span class="pill">${esc(r.City)}</span><span class="pill">${esc(r.Type)}</span><p>${esc(r.Notes||'')}</p>${r['Google Maps Link']?`<a class="action" href="${attr(r['Google Maps Link'])}" target="_blank">Open Map</a>`:''}`,'Maps loading...')}`);}
function renderRain(){app.innerHTML=shell(`<div class="card blue"><h2>☔ Rain Mode</h2></div>${list(state.sections.rain,r=>`<strong>${esc(r.City)}</strong><p><b>Instead of:</b> ${esc(r['Outdoor Plan'])}</p><p><b>Backup:</b> ${esc(r['Rain Backup'])}</p><small>${esc(r['Hilda Comfort Note']||'')}</small>`,'Rain mode loading...')}`);}
function renderAcademy(){app.innerHTML=shell(`<div class="card"><h2>🎓 First-Time Japan Academy</h2><p>Short, practical lessons for Nick and Hilda.</p></div>${list(state.sections.firstTime,r=>`<strong>${esc(r.Moment)} · ${esc(r.Lesson)}</strong><p>${esc(r['What Nick/Hilda Should Know'])}</p><small>${esc(r.Action)}</small>`,'Academy loading...')}`);}
function renderUseful(){app.innerHTML=shell(`<div class="card"><h2>🧰 Useful Guides</h2></div><div class="section">Konbini</div>${list(state.sections.konbiniGuide,r=>`<strong>${esc(r.Recommendation)}</strong><p>${esc(r['Why Useful'])}</p><small>${esc(r['Phrase / Action'])}</small>`,'Konbini loading...')}<div class="section">Bathroom</div>${list(state.sections.bathroom,r=>`<strong>${esc(r.Topic)}</strong><p>${esc(r['What to know'])}</p><small>${esc(r['What to do'])}</small>`,'Bathroom guide loading...')}<div class="section">Seasonal</div>${list(state.sections.seasonal,r=>`<strong>${esc(r.City)}</strong><p>${esc(r['Typical October Feel'])}</p><small>${esc(r['Planning Tip'])}</small>`,'Seasonal info loading...')}`);}
function renderTimeline(){app.innerHTML=shell(`<div class="card"><h2>⏳ Countdown + Reservation Timeline</h2></div>${list(state.sections.countdown,r=>`<strong>${esc(r.Event)}</strong><span class="pill">${esc(r['Days Remaining'])}</span><small>${esc(r.Notes||'')}</small>`,'Countdown loading...')}<div class="section">Reservations</div>${list(state.sections.resTimeline,r=>`<strong>${esc(r.Month)} · ${esc(r.Task)}</strong><span class="pill">${esc(r.Status)}</span><small>${esc(r.Notes)}</small>`,'Timeline loading...')}`);}
function renderShopping(){app.innerHTML=shell(`<div class="card"><h2>🛍 Shopping</h2></div>${list(state.sections.shopping,r=>`<strong>${esc(r['Store / Item'])}</strong><span class="pill">${esc(r.Who)}</span><span class="pill">${esc(r.Priority)}</span><small>${esc(r.Notes||'')}</small>`,'Shopping loading...')}`);}
function render(){if(!state.core){app.innerHTML=splash('Loading...');return}const v=state.view;if(v==='home')renderHome();else if(v==='today')renderToday();else if(v==='hilda')renderHilda();else if(v==='nick')renderNick();else if(v==='dn')renderDN();else if(v==='phrases')renderPhrases();else if(v==='sos')renderSOS();else if(v==='lost')renderLost();else if(v==='food')renderFood();else if(v==='maps')renderMaps();else if(v==='rain')renderRain();else if(v==='academy')renderAcademy();else if(v==='useful')renderUseful();else if(v==='timeline')renderTimeline();else if(v==='shopping')renderShopping();else renderHome();}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
init();
