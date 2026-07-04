/**
 * Japan Travel OS v9 — Google Sheets Backend API
 *
 * Install in the Google Sheet:
 * Extensions → Apps Script → paste this as Code.gs → Deploy as Web App.
 *
 * This backend supports JSONP so the static PWA can be hosted on GitHub Pages,
 * Cloudflare Pages, Netlify, Vercel, etc.
 *
 * Usage:
 *   /exec?action=core&callback=TravelOSCallback
 *   /exec?action=section&section=phrases&callback=TravelOSCallback
 */

const SHEET_NAMES = {
  CONTROL: '⚙️ Control',
  MASTER: '📅 Master Itinerary',
  RESERVATIONS: '🎟 Reservations',
  FLIGHTS: '✈️ Flights',
  HOTELS: '🏨 Hotels',
  TRANSIT: '🚆 Transit',
  PACKING: '🧳 Packing',
  LUGGAGE: '🧳 Luggage',
  BUDGET: '💴 Budget',
  MONEY: '💳 Money',
  FOOD: '🍜 Food Guide',
  KONBINI: '🏪 Konbini',
  ETIQUETTE: '🙏 Etiquette',
  PRETRIP: '✅ Pre-Trip',
  TOKYO: '🗾 Tokyo Guide',
  KYOTO: '⛩ Kyoto Guide',
  HAKONE_NARA: '♨ Hakone + Nara',
  PHRASES: '🇯🇵 Phrases',
  EMERGENCY: '🚨 Emergency',
  MEETUPS: '🗺 Meetups',
  MAPS: '📍 Maps',
  RESTAURANTS: '🍽 Restaurants',
  RAIN: '☔ Rain Mode',
  WALKING: '🚶 Walking',
  TRANSIT_CARDS: '🚉 Transit Cards',
  JOURNAL: '📷 Journal',
  ETIQUETTE_CARDS: '🎌 Etiquette Cards',
  FOOD_CHALLENGE: '🍱 Food Challenge',
  GOSHUIN: '🏯 Goshuin',
  SHOPPING: '🛍 Shopping',
  LOST: '🆘 Lost Mode',
  COUNTDOWN: '⏳ Countdown',
  PHRASE_FAVORITES: '⭐ Phrase Favorites',
  KONBINI_GUIDE: '🍱 Konbini Guide',
  BATHROOM: '🚽 Bathroom',
  SEASONAL: '🌸 Seasonal',
  RES_TIMELINE: '📅 Res Timeline',
  DAILY_BRIEF: '🤖 Daily Brief',
  RELAX: '👩 Relax Mode',
  APP_CONFIG: '🧩 App Config',
  FIRST_TIME: '🎓 First-Time Japan',
  SMART_ALERTS: '🔔 Smart Alerts',
  PRIVACY: '🔐 Privacy'
};

const CONTROL_TODAY_CELL = 'C12';
const MASTER_HEADER_ROW = 4;
const MASTER_START_ROW = 5;
const CACHE_SECONDS = 90;

const CITY_COORDS = {
  'Tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  'Kyoto': { lat: 35.0116, lon: 135.7681, name: 'Kyoto' },
  'Nara': { lat: 34.6851, lon: 135.8048, name: 'Nara' },
  'Hakone': { lat: 35.2324, lon: 139.1069, name: 'Hakone' },
  'Tokyo / USA': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  'USA / Flight': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' }
};

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = params.callback || '';
  const action = params.action || 'core';

  try {
    let payload;
    if (action === 'core') payload = getCoreData_();
    else if (action === 'section') payload = getSectionData_(params.section || '');
    else if (action === 'bundle') payload = getBundleData_();
    else if (action === 'weather') payload = getWeatherData_();
    else payload = { ok: false, error: 'Unknown action: ' + action };

    return output_(payload, callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  }
}

function output_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet: ' + name);
  return sh;
}

function dateKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return value ? String(value) : '';
}

function niceDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'EEE, MMM d');
  return value ? String(value) : '';
}

function readTable_(sheetName, headerRow, startRow) {
  const sh = sheet_(sheetName);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < startRow) return [];

  const headers = sh.getRange(headerRow, 1, 1, lastCol).getValues()[0].map(String);
  const rows = sh.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();

  return rows.filter(r => r.some(v => v !== '' && v !== null)).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (!h) return;
      const v = row[i];
      obj[h] = v instanceof Date ? dateKey_(v) : v;
      obj[h + '_nice'] = v instanceof Date ? niceDate_(v) : v;
    });
    return obj;
  });
}

function cacheGet_(key) {
  const raw = CacheService.getScriptCache().get(key);
  return raw ? JSON.parse(raw) : null;
}

function cachePut_(key, value, seconds) {
  CacheService.getScriptCache().put(key, JSON.stringify(value), seconds || CACHE_SECONDS);
}

function getCoreData_() {
  const cached = cacheGet_('coreDataV9');
  if (cached) return cached;

  const selectedDateRaw = sheet_(SHEET_NAMES.CONTROL).getRange(CONTROL_TODAY_CELL).getValue();
  const selectedDate = dateKey_(selectedDateRaw);
  const selectedDateNice = niceDate_(selectedDateRaw);
  const itinerary = readTable_(SHEET_NAMES.MASTER, MASTER_HEADER_ROW, MASTER_START_ROW);
  const today = itinerary.find(d => d.Date === selectedDate) || itinerary[0] || {};
  const appConfig = readTable_(SHEET_NAMES.APP_CONFIG, 4, 5);

  const data = {
    ok: true,
    generatedAt: new Date().toISOString(),
    selectedDate,
    selectedDateNice,
    today,
    itinerary,
    appConfig
  };
  cachePut_('coreDataV9', data);
  return data;
}

function sectionMap_() {
  return {
    reservations: [SHEET_NAMES.RESERVATIONS, 4, 5],
    flights: [SHEET_NAMES.FLIGHTS, 4, 5],
    hotels: [SHEET_NAMES.HOTELS, 4, 5],
    transit: [SHEET_NAMES.TRANSIT, 4, 5],
    packing: [SHEET_NAMES.PACKING, 4, 5],
    luggage: [SHEET_NAMES.LUGGAGE, 4, 5],
    budget: [SHEET_NAMES.BUDGET, 4, 5],
    money: [SHEET_NAMES.MONEY, 4, 5],
    food: [SHEET_NAMES.FOOD, 4, 5],
    konbini: [SHEET_NAMES.KONBINI, 4, 5],
    etiquette: [SHEET_NAMES.ETIQUETTE, 4, 5],
    pretrip: [SHEET_NAMES.PRETRIP, 4, 5],
    tokyo: [SHEET_NAMES.TOKYO, 4, 5],
    kyoto: [SHEET_NAMES.KYOTO, 4, 5],
    hakoneNara: [SHEET_NAMES.HAKONE_NARA, 4, 5],
    phrases: [SHEET_NAMES.PHRASES, 4, 5],
    emergency: [SHEET_NAMES.EMERGENCY, 4, 5],
    meetups: [SHEET_NAMES.MEETUPS, 4, 5],
    maps: [SHEET_NAMES.MAPS, 4, 5],
    restaurants: [SHEET_NAMES.RESTAURANTS, 4, 5],
    rain: [SHEET_NAMES.RAIN, 4, 5],
    walking: [SHEET_NAMES.WALKING, 4, 5],
    transitCards: [SHEET_NAMES.TRANSIT_CARDS, 4, 5],
    journal: [SHEET_NAMES.JOURNAL, 4, 5],
    etiquetteCards: [SHEET_NAMES.ETIQUETTE_CARDS, 4, 5],
    foodChallenge: [SHEET_NAMES.FOOD_CHALLENGE, 4, 5],
    goshuin: [SHEET_NAMES.GOSHUIN, 4, 5],
    shopping: [SHEET_NAMES.SHOPPING, 4, 5],
    lost: [SHEET_NAMES.LOST, 4, 5],
    countdown: [SHEET_NAMES.COUNTDOWN, 4, 5],
    phraseFavorites: [SHEET_NAMES.PHRASE_FAVORITES, 4, 5],
    konbiniGuide: [SHEET_NAMES.KONBINI_GUIDE, 4, 5],
    bathroom: [SHEET_NAMES.BATHROOM, 4, 5],
    seasonal: [SHEET_NAMES.SEASONAL, 4, 5],
    resTimeline: [SHEET_NAMES.RES_TIMELINE, 4, 5],
    dailyBrief: [SHEET_NAMES.DAILY_BRIEF, 4, 5],
    relax: [SHEET_NAMES.RELAX, 4, 5],
    firstTime: [SHEET_NAMES.FIRST_TIME, 4, 5],
    smartAlerts: [SHEET_NAMES.SMART_ALERTS, 4, 5],
    privacy: [SHEET_NAMES.PRIVACY, 4, 5]
  };
}

function getSectionData_(section) {
  const map = sectionMap_();
  if (!map[section]) return { ok: false, error: 'Unknown section: ' + section, rows: [] };

  const cacheKey = 'sectionV9_' + section;
  const cached = cacheGet_(cacheKey);
  if (cached) return cached;

  const [sheetName, headerRow, startRow] = map[section];
  const payload = { ok: true, section, rows: readTable_(sheetName, headerRow, startRow) };
  cachePut_(cacheKey, payload);
  return payload;
}

function getBundleData_() {
  const core = getCoreData_();
  const sections = {};
  ['reservations','hotels','flights','transitCards','phrases','phraseFavorites','emergency','lost','firstTime','smartAlerts','rain','maps','restaurants','money','konbiniGuide','bathroom','seasonal'].forEach(k => {
    sections[k] = getSectionData_(k).rows || [];
  });
  return { ok: true, core, sections, weather: getWeatherData_() };
}

function getWeatherData_() {
  const core = getCoreData_();
  const today = core.today || {};
  const city = String(today.City || 'Tokyo').replace(' / USA','').trim();
  const coords = CITY_COORDS[city] || CITY_COORDS['Tokyo'];

  const selectedDate = new Date(core.selectedDate + 'T00:00:00');
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((selectedDate.getTime() - todayMidnight.getTime()) / 86400000);

  if (diffDays < 0 || diffDays > 16) {
    return {
      ok: true,
      available: false,
      city: coords.name,
      date: core.selectedDate,
      message: 'Exact forecast available closer to trip',
      detail: 'Weather API is connected. Exact forecasts usually work within about 16 days.'
    };
  }

  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + encodeURIComponent(coords.lat) +
    '&longitude=' + encodeURIComponent(coords.lon) +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=Asia%2FTokyo&forecast_days=16';

  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    return { ok: false, available: false, city: coords.name, message: 'Weather unavailable', detail: 'Open-Meteo request failed.' };
  }

  const json = JSON.parse(response.getContentText());
  const times = (json.daily && json.daily.time) || [];
  const i = times.indexOf(core.selectedDate);
  if (i === -1) {
    return { ok: true, available: false, city: coords.name, message: 'Forecast not available yet', detail: 'Selected date is outside current forecast response.' };
  }

  const code = json.daily.weather_code[i];
  return {
    ok: true,
    available: true,
    city: coords.name,
    date: core.selectedDate,
    summary: weatherCodeSummary_(code),
    icon: weatherCodeIcon_(code),
    highF: Math.round(json.daily.temperature_2m_max[i]),
    lowF: Math.round(json.daily.temperature_2m_min[i]),
    precipProbability: json.daily.precipitation_probability_max[i],
    precipIn: json.daily.precipitation_sum[i],
    bring: weatherBring_(code, json.daily.precipitation_probability_max[i], json.daily.temperature_2m_min[i])
  };
}

function weatherCodeSummary_(code) {
  if ([0].includes(code)) return 'Clear';
  if ([1,2,3].includes(code)) return 'Partly cloudy';
  if ([45,48].includes(code)) return 'Fog';
  if ([51,53,55,56,57].includes(code)) return 'Drizzle';
  if ([61,63,65,66,67,80,81,82].includes(code)) return 'Rain';
  if ([71,73,75,77,85,86].includes(code)) return 'Snow';
  if ([95,96,99].includes(code)) return 'Thunderstorm';
  return 'Forecast';
}

function weatherCodeIcon_(code) {
  if ([0].includes(code)) return '☀️';
  if ([1,2,3].includes(code)) return '⛅';
  if ([45,48].includes(code)) return '🌫️';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return '🌧️';
  if ([71,73,75,77,85,86].includes(code)) return '❄️';
  if ([95,96,99].includes(code)) return '⛈️';
  return '🌤️';
}

function weatherBring_(code, precipProbability, lowF) {
  const items = [];
  if (precipProbability >= 40 || [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) items.push('umbrella');
  if (lowF <= 60) items.push('light jacket');
  items.push('comfortable shoes');
  return items.join(' + ');
}
