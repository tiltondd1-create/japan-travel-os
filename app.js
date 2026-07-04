const APP_VERSION = 'v11.0.0';

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzJW46i_k24_DZ0G7mjrUVYXzuh7UHl5faRMN_0X5UHof_dwQn4r1hO-fjUZa40NCLUXQ/exec',
  CACHE_KEY: 'travel-os-v11-data',
  STALE_MS: 1000 * 60 * 10
};

const VIEW_SECTIONS = {
  dn: ['reservations','smartAlerts'],
  phrases: ['phraseFavorites','phrases'],
  sos: ['emergency'],
  lost: ['lost'],
  food: ['restaurants','foodChallenge'],
  maps: ['maps'],
  rain: ['rain'],
  academy: ['firstTime'],
  useful: ['konbiniGuide','bathroom','seasonal','etiquetteCards'],
  timeline: ['countdown','resTimeline'],
  shopping: ['shopping'],
  transit: ['transitCards']
};

const CRITICAL_SECTIONS = ['emergency','lost','phraseFavorites','phrases','maps','hotels'];

let state = {
  view: 'home',
  core: null,
  weather: null,
  sections: {},
  offline: false,
  syncStatus: 'Starting',
  phraseCat: '',
  phraseSearch: ''
};

const app = document.getElementById('app');

const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const attr = v => esc(v).replace(/`/g,'&#96;');

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = 'travelOS_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timeout = setTimeout(() => cleanup(new Error('Network timeout')), 15000);
    function cleanup(err) {
      clearTimeout(timeout);
      delete window[cb];
      script.remove();
      if (err) reject(err);
    }
    window[cb] = data => { cleanup(); resolve(data); };
    script.onerror = () => cleanup(new Error('Could not reach Google Sheets API'));
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb + '&_=' + Date.now();
    document.body.appendChild(script);
  });
}

function api(action, params='') {
  if (!CONFIG.API_URL || !CONFIG.API_URL.trim()) return Promise.reject(new Error('Missing API URL'));
  return jsonp(`${CONFIG.API_URL}?action=${encodeURIComponent(action)}${params}`);
}

function saveCache() {
  const payload = { time: Date.now(), state: { core: state.core, weather: state.weather, sections: state.sections } };
  localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(payload));
}

function loadCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || 'null');
    if (raw?.state?.core) {
      state.core = raw.state.core;
      state.weather = raw.state.weather;
      state.sections = raw.state.sections || {};
      state.offline = true;
      state.syncStatus = 'Cached';
      return raw.time || 0;
    }
  } catch(e) {}
  return 0;
}

async function clearAllCaches() {
  localStorage.removeItem(CONFIG.CACHE_KEY);
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
}

async function init() {
  const params = new URLSearchParams(location.search);
  if (params.has('reset') || params.has('clearCache')) await clearAllCaches();

  const cacheTime = loadCache();
  if (state.core) render();

  if (!CONFIG.API_URL || !CONFIG.API_URL.trim()) {
    app.innerHTML = `<div class="app"><div class="card red"><h2>Setup needed</h2><p>Open app.js and paste your Apps Script web app URL into CONFIG.API_URL.</p><p class="debug">Version: ${APP_VERSION}\nAPI URL set: no</p></div></div>`;
    return;
  }

  const stale = !cacheTime || Date.now() - cacheTime > CONFIG.STALE_MS;
  if (!state.core || stale) await syncCore();
  else {
    syncCore(true);
    refreshWeather();
    prefetchCritical();
  }
}

async function syncCore(background=false) {
  try {
    state.syncStatus = background ? 'Updating' : 'Syncing';
    if (!background && !state.core) app.innerHTML = boot('Syncing Travel OS…');
    const core = await api('core');
    if (!core.ok) throw new Error(core.error || 'Google Sheets API error');
    state.core = core;
    state.offline = false;
    state.syncStatus = 'Synced';
    saveCache();
    render();
    refreshWeather();
    prefetchCritical();
  } catch(e) {
    state.syncStatus = 'Offline';
    if (state.core) { state.offline = true; render(); }
    else app.innerHTML = `<div class="app"><div class="card red"><h2>Could not load app</h2><p>${esc(e.message)}</p><p class="debug">Version: ${APP_VERSION}\nAPI URL set: ${CONFIG.API_URL ? 'yes' : 'no'}\nTry: ?reset=1</p></div></div>`;
  }
}

async function refreshWeather() {
  try {
    const w = await api('weather');
    state.weather = w;
    saveCache();
    render();
  } catch(e) {}
}

async function loadSection(name) {
  if (state.sections[name]) return state.sections[name];
  try {
    const payload = await api('section', '&section=' + encodeURIComponent(name));
    if (payload.ok) {
      state.sections[name] = payload.rows || [];
      saveCache();
      render();
      return state.sections[name];
    }
  } catch(e) { state.offline = true; }
  return [];
}

function ensureSections(names) { names.forEach(n => { if (!state.sections[n]) loadSection(n); }); }
function prefetchCritical() { CRITICAL_SECTIONS.forEach(loadSection); }

function setView(view) {
  state.view = view;
  ensureSections(VIEW_SECTIONS[view] || []);
  render();
  scrollTo({top:0, behavior:'smooth'});
}

function today() { return state.core?.today || {}; }
function dateRows() { return (state.core?.itinerary || []).filter(r => r.Date); }
function setDate(date) {
  const row = dateRows().find(r => r.Date === date);
  if (!row) return;
  state.core.selectedDate = date;
  state.core.selectedDateNice = row.Date_nice || date;
  state.core.today = row;
  saveCache();
  refreshWeather();
  render();
}
function shiftDate(delta) {
  const rows = dateRows();
  const i = rows.findIndex(r => r.Date === state.core.selectedDate);
  const next = Math.max(0, Math.min(rows.length - 1, (i < 0 ? 0 : i) + delta));
  setDate(rows[next].Date);
}

function boot(msg) {
  return `<div class="boot"><div class="boot-card"><div class="boot-logo">🇯🇵</div><h1>Japan 2026</h1><p>${esc(msg)}</p></div></div>`;
}

function shell(content, cls='') {
  return `<div class="app ${cls}">
    <div class="top">
      <div class="brand"><div class="brandIcon">🇯🇵</div><div><b>Japan 2026</b><small>David • Noelle • Nick • Hilda</small></div></div>
      <div class="status">${state.syncStatus}</div>
    </div>
    ${state.offline ? '<div class="offline">Offline/cache mode — showing saved trip data.</div>' : ''}
    ${content}
  </div>${nav()}`;
}

function nav() {
  const tabs = [['home','🏠','Home'],['today','📱','Today'],['hilda','👩','Hilda'],['nick','👦','Nick'],['dn','👨‍👩‍👦','D+N'],['sos','🚨','SOS']];
  return `<div class="nav">${tabs.map(([v,i,l]) => `<button class="${state.view===v?'active':''}" onclick="setView('${v}')">${i}<br>${l}</button>`).join('')}</div>`;
}

function controls() {
  return `<div class="controls"><button onclick="shiftDate(-1)">←</button><input type="date" value="${esc(state.core?.selectedDate || '')}" onchange="setDate(this.value)"><button onclick="shiftDate(1)">→</button></div>`;
}
function hero() { return `<div class="card hero"><h1>🇯🇵 JAPAN<br>2026</h1><p>Family Travel OS</p></div>`; }
function metrics(t) { return `<div class="metrics"><div class="metric">⚡ ${esc(t.Energy||'')}</div><div class="metric">👥 ${esc(t.Crowd||'')}</div><div class="metric">👟 ${esc(t.Walking||'')}</div></div>`; }
function weatherCard() {
  const w = state.weather;
  if (!w) return `<div class="card"><div class="muted">Weather loading…</div></div>`;
  if (!w.available) return `<div class="card"><div class="weather"><div class="weatherIcon">🌤️</div><div><h3>Weather · ${esc(w.city||'')}</h3><div class="muted">${esc(w.message||'Available closer to trip')}</div><small>${esc(w.detail||'')}</small></div></div></div>`;
  return `<div class="card"><div class="weather"><div class="weatherIcon">${esc(w.icon)}</div><div><h3>Weather · ${esc(w.city)}</h3><div class="temp">${esc(w.highF)}° / ${esc(w.lowF)}°F · ${esc(w.summary)}</div><div class="muted">Rain ${esc(w.precipProbability)}% · Bring ${esc(w.bring)}</div></div></div></div>`;
}
function card(title, text, style='') { return `<div class="card ${style}"><h2>${title}</h2><p>${esc(text||'')}</p></div>`; }
function dayCards() { const t=today(); return `${card('☀ Morning',t.Morning,'sage')}${card('🌤 Afternoon',t.Afternoon,'blue')}${card('🌙 Evening',t.Evening,'lav')}`; }
function tile(icon,title,sub,view) { return `<button class="tile" onclick="setView('${view}')"><strong>${icon} ${esc(title)}</strong><span>${esc(sub)}</span></button>`; }
function list(rows, fn, empty='Loading…') { return rows?.length ? `<div class="list">${rows.map(r=>`<div class="item">${fn(r)}</div>`).join('')}</div>` : `<div class="card"><div class="muted">${esc(empty)}</div></div>`; }

function renderHome() {
  const t=today();
  app.innerHTML = shell(`${hero()}${controls()}${weatherCard()}
    <div class="card dark"><h2>Today</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${metrics(t)}</div>
    <div class="section">Quick access</div><div class="grid">
    ${tile('👩','Hilda','Relax mode','hilda')}${tile('👦','Nick','Simple plan','nick')}${tile('👨‍👩‍👦','D+N','Planning','dn')}${tile('🆘','Lost','If separated','lost')}${tile('🇯🇵','Phrases','Searchable','phrases')}${tile('🍽','Food','Restaurants','food')}${tile('🚉','Transit','Travel cards','transit')}${tile('☔','Rain','Backups','rain')}${tile('📍','Maps','Places','maps')}${tile('🎓','First Time','Japan basics','academy')}${tile('🧰','Useful','Konbini + bathroom','useful')}${tile('⏳','Timeline','Countdowns','timeline')}</div>`);
}

function renderToday() {
  const t=today();
  app.innerHTML = shell(`${controls()}${weatherCard()}<div class="card dark"><h2>📱 Today</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div>${metrics(t)}</div>${dayCards()}<div class="card red"><b>Bring:</b><br>${esc(t['Bring / Hilda Reminder']||'')}</div>`);
}
function renderHilda() {
  const t=today();
  app.innerHTML = shell(`${controls()}${weatherCard()}<div class="card lav"><h2>👩 Hilda</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div><div class="card"><b>Hotel</b><br>${esc(t.Hotel||'')}</div>${dayCards()}<div class="card red"><b>Bring</b><br>${esc(t['Bring / Hilda Reminder']||'')}</div><div class="card dark"><b>Emergency</b><br>Police: 110<br>Ambulance / Fire: 119<br><br>If separated: go to hotel lobby or ask station staff.</div>`, 'hilda');
}
function renderNick() {
  const t=today();
  app.innerHTML = shell(`${controls()}${weatherCard()}<div class="card blue"><h2>👦 Nick</h2><div class="big">${esc(t.Date_nice||state.core.selectedDateNice)}</div><div class="city">${esc(t.City||'')}</div></div>${dayCards()}<div class="card"><b>Hotel:</b> ${esc(t.Hotel||'')}</div><div class="grid">${tile('🍽','Food','Restaurants','food')}${tile('🛍','Shopping','Wishlist','shopping')}${tile('🇯🇵','Phrases','Useful Japanese','phrases')}${tile('🆘','Lost','If separated','lost')}</div>`);
}
function renderDN() {
  app.innerHTML = shell(`${controls()}${weatherCard()}<div class="card"><h2>👨‍👩‍👦 David + Noelle</h2><p>Planning dashboard: bookings, alerts, and logistics.</p></div><div class="section">Reservations</div>${list(state.sections.reservations,r=>`<strong>${esc(r.Item)}</strong><span class="pill">${esc(r.Status)}</span><span class="pill">${esc(r.Urgency)}</span><small>${esc(r.Notes||'')}</small>`)}<div class="section">Smart Alerts</div>${list(state.sections.smartAlerts,r=>`<strong>${esc(r.Trigger)}</strong><p>${esc(r.Message)}</p><span class="pill">${esc(r.Who)}</span>`)}`);
}
function renderPhrases() {
  const rows=[...(state.sections.phraseFavorites||[]),...(state.sections.phrases||[])];
  const cats=[...new Set(rows.map(r=>r.Category).filter(Boolean))];
  const filtered=rows.filter(r=>(!state.phraseCat||r.Category===state.phraseCat)&&(!state.phraseSearch||JSON.stringify(r).toLowerCase().includes(state.phraseSearch)));
  app.innerHTML = shell(`<div class="card"><h2>🇯🇵 Phrases</h2><p class="muted">Search English, Japanese, romaji, phonetics, category, or use case.</p><input class="search" placeholder="Search..." oninput="state.phraseSearch=this.value.toLowerCase();renderPhrases()"><div class="chips"><button class="chip ${!state.phraseCat?'active':''}" onclick="state.phraseCat='';renderPhrases()">All</button>${cats.map(c=>`<button class="chip ${state.phraseCat===c?'active':''}" onclick="state.phraseCat='${attr(c)}';renderPhrases()">${esc(c)}</button>`).join('')}</div></div>${list(filtered,r=>`<div class="category">${esc(r.Category||'')}</div><strong>${esc(r.English||'')}</strong><div class="jp">${esc(r.Japanese||'')}</div><small>${esc(r.Romaji||'')}</small><br><small>${esc(r['Easy Phonetics']||'')}</small><p>${esc(r.Use||'')}</p>`)}`);
}
function renderSOS() { app.innerHTML=shell(`<div class="card dark"><h2>🚨 Emergency</h2><p>Use this if anything feels unsafe or confusing.</p></div>${list(state.sections.emergency,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Details||'')}</p><small>${esc(r['Phone / Link']||'')}</small><br><small>${esc(r.Notes||'')}</small>`)}`); }
function renderLost() { app.innerHTML=shell(`<div class="card dark"><h2>🆘 Lost Mode</h2><p>Stay calm. Go to the hotel lobby or station staff if separated.</p></div>${list(state.sections.lost,r=>`<strong>${esc(r.Item)}</strong><p>${esc(r.Info||'')}</p><small>${esc(r.Action||'')}</small><br><small>${esc(r['Japanese / Notes']||'')}</small>`)}`); }
function renderFood() { app.innerHTML=shell(`<div class="card"><h2>🍽 Food</h2></div><div class="section">Restaurants</div>${list(state.sections.restaurants,r=>`<strong>${esc(r.Name)}</strong><span class="pill">${esc(r.City)}</span><span class="pill">${esc(r.Cuisine)}</span><p>${esc(r.Notes||'')}</p><small>Must order: ${esc(r['Must Order']||'')}</small>`)}<div class="section">Food Challenge</div>${list(state.sections.foodChallenge,r=>`<strong>${esc(r.Food)}</strong><span class="pill">${esc(r['Tried?']||'☐')}</span><small>${esc(r.Notes||'')}</small>`)}`); }
function renderMaps() { app.innerHTML=shell(`<div class="card"><h2>📍 Maps</h2><p>Fill map links in the Sheet as plans get confirmed.</p></div>${list(state.sections.maps,r=>`<strong>${esc(r.Place)}</strong><span class="pill">${esc(r.City)}</span><span class="pill">${esc(r.Type)}</span><p>${esc(r.Notes||'')}</p>${r['Google Maps Link']?`<a class="action" href="${attr(r['Google Maps Link'])}" target="_blank">Open Map</a>`:''}`)}`); }
function renderRain() { app.innerHTML=shell(`<div class="card blue"><h2>☔ Rain Mode</h2></div>${list(state.sections.rain,r=>`<strong>${esc(r.City)}</strong><p><b>Instead of:</b> ${esc(r['Outdoor Plan'])}</p><p><b>Backup:</b> ${esc(r['Rain Backup'])}</p><small>${esc(r['Hilda Comfort Note']||'')}</small>`)}`); }
function renderAcademy() { app.innerHTML=shell(`<div class="card"><h2>🎓 First-Time Japan Academy</h2><p>Short, practical lessons for Nick and Hilda.</p></div>${list(state.sections.firstTime,r=>`<strong>${esc(r.Moment)} · ${esc(r.Lesson)}</strong><p>${esc(r['What Nick/Hilda Should Know'])}</p><small>${esc(r.Action)}</small>`)}`); }
function renderUseful() { app.innerHTML=shell(`<div class="card"><h2>🧰 Useful Guides</h2></div><div class="section">Konbini</div>${list(state.sections.konbiniGuide,r=>`<strong>${esc(r.Recommendation)}</strong><p>${esc(r['Why Useful'])}</p><small>${esc(r['Phrase / Action'])}</small>`)}<div class="section">Bathroom</div>${list(state.sections.bathroom,r=>`<strong>${esc(r.Topic)}</strong><p>${esc(r['What to know'])}</p><small>${esc(r['What to do'])}</small>`)}<div class="section">Seasonal</div>${list(state.sections.seasonal,r=>`<strong>${esc(r.City)}</strong><p>${esc(r['Typical October Feel'])}</p><small>${esc(r['Planning Tip'])}</small>`)}`); }
function renderTimeline() { app.innerHTML=shell(`<div class="card"><h2>⏳ Countdown + Reservation Timeline</h2></div>${list(state.sections.countdown,r=>`<strong>${esc(r.Event)}</strong><span class="pill">${esc(r['Days Remaining'])}</span><small>${esc(r.Notes||'')}</small>`)}<div class="section">Reservations</div>${list(state.sections.resTimeline,r=>`<strong>${esc(r.Month)} · ${esc(r.Task)}</strong><span class="pill">${esc(r.Status)}</span><small>${esc(r.Notes)}</small>`)}`); }
function renderShopping() { app.innerHTML=shell(`<div class="card"><h2>🛍 Shopping</h2></div>${list(state.sections.shopping,r=>`<strong>${esc(r['Store / Item'])}</strong><span class="pill">${esc(r.Who)}</span><span class="pill">${esc(r.Priority)}</span><small>${esc(r.Notes||'')}</small>`)}`); }
function renderTransit() { app.innerHTML=shell(`<div class="card"><h2>🚉 Transit</h2></div>${list(state.sections.transitCards,r=>`<strong>${esc(r.Route)}</strong><span class="pill">${esc(r.Method)}</span><p>${esc(r.Notes||'')}</p><small>Luggage: ${esc(r.Luggage||'')} · Reservation: ${esc(r.Reservation||'')}</small>`)}`); }

function render() {
  if (!state.core) { app.innerHTML = boot('Loading…'); return; }
  const v = state.view;
  if (v==='home') renderHome();
  else if (v==='today') renderToday();
  else if (v==='hilda') renderHilda();
  else if (v==='nick') renderNick();
  else if (v==='dn') renderDN();
  else if (v==='phrases') renderPhrases();
  else if (v==='sos') renderSOS();
  else if (v==='lost') renderLost();
  else if (v==='food') renderFood();
  else if (v==='maps') renderMaps();
  else if (v==='rain') renderRain();
  else if (v==='academy') renderAcademy();
  else if (v==='useful') renderUseful();
  else if (v==='timeline') renderTimeline();
  else if (v==='shopping') renderShopping();
  else if (v==='transit') renderTransit();
  else renderHome();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js?v=11');
      await reg.update();
    } catch(e) {}
  });
}

init();
