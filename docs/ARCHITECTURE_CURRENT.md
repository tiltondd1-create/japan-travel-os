# Travel OS Current Architecture

This document describes the architecture visible in the repository as of RC6. It is descriptive, not a claim that deployed or browser behavior has been verified.

## System shape

```text
Browser / installed PWA
  ├── index.html
  ├── styles.css
  ├── app.js
  ├── manifest.json
  ├── sw.js
  ├── localStorage
  └── Cache Storage
        │
        ├── GET /api?action=core
        ├── GET /api?action=weather
        ├── GET /api?action=section&section=<name>
        └── GET /fx
              │
Cloudflare Pages
  ├── static files
  ├── _headers / _redirects
  └── Pages Functions
        ├── functions/api.js ──> Google Apps Script ──> Google Sheet
        └── functions/fx.js  ──> open.er-api.com
```

The repository contains no framework, bundler, package manifest, or client-side module system. The browser executes `app.js` as a classic script.

## File responsibilities

| File or folder | Current responsibility |
|---|---|
| `index.html` | Minimal boot screen and links to the manifest, icon, stylesheet, and app script. |
| `app.js` | Entire client application: state, data access, caching, routing, screen rendering, event handlers, local trackers, and external links. |
| `styles.css` | Entire visual system and responsive/print styling. It is cumulative and contains repeated overrides from multiple release stages. |
| `sw.js` | Shell pre-cache, old-cache deletion, network-first navigation/API strategy, and stale-while-revalidate static strategy. |
| `manifest.json` | PWA metadata and icons; still labeled RC4. |
| `_headers` | Cloudflare security and cache headers. |
| `_redirects` | Catch-all SPA fallback to `index.html`. |
| `functions/api.js` | Same-origin Cloudflare proxy to Google Apps Script. |
| `functions/fx.js` | Same-origin USD/JPY rate endpoint with a fixed fallback estimate. |
| `.github/workflows/quality-check.yml` | Required-file, JavaScript syntax, and manifest JSON checks. |
| `icons/` | Icons referenced by the HTML, manifest, and service worker. |
| `assets/icons/` | Duplicate icon location not referenced by inspected source. |
| `docs/` | Mixed RC2–RC6 product, QA, deployment, navigation, and content documentation. |
| `workbook/` | RC5/RC6 workbook and restaurant CSV artifacts; contents not inspected in this audit. |

## Client startup and data flow

1. `index.html` displays a boot card and loads `app.js`.
2. `init()` reads preferences and query parameters.
3. `?reset=1` or `?clearCache=1` removes the app data cache key and all Cache Storage entries.
4. The app attempts to restore cached core, weather, and section data from `localStorage`.
5. If core data is absent or the shared cache timestamp is older than ten minutes, the app awaits `/api?action=core`.
6. Otherwise it renders cached data immediately and refreshes core, weather, critical sections, and FX in the background.
7. `setView()` updates the current view, requests sections declared for that view, renders synchronously, and scrolls to the top.
8. Each requested section is fetched independently with `action=section`.
9. Successful responses are merged into `state.sections` and saved back into the shared local cache.

Errors are mostly converted to an offline flag or silently ignored. A first-load core failure displays a diagnostic card. Weather and FX failures do not display an error.

## State model

The global `state` object contains:

- navigation: current view, last main view, drawer and quick-menu flags;
- remote data: core, weather, and named Sheet sections;
- sync state: offline flag, status text, loading-section map, and last sync time;
- search/filter state for phrases, global search, food, and companion maps;
- local content: favorites, family status, FX, cash, medication checks, preferences, photo quest, spend, restaurant status, Memory Book, reservation assistant, and packing intelligence;
- Money Hub input and conversion direction;
- onboarding state.

There is no centralized event store or component framework. Render functions replace `#app.innerHTML` with template strings. Interaction uses inline HTML event attributes calling global functions.

## Local storage keys

| Key | Purpose | Written by visible UI? |
|---|---|---|
| `travel-os-1-0-rc6-data` | Cached core, weather, loaded sections, and one shared timestamp. | Yes, after successful data changes. |
| `travel-os-1-0-rc6-favorites` | Saved restaurants, places, phrases, and shopping items. | Yes. |
| `travel-os-1-0-rc6-fx` | Last successful/fallback FX state used by the client. | Yes. |
| `travel-os-1-0-rc6-cash` | Manual counts of yen denominations. | Yes. |
| `travel-os-1-0-rc6-meds` | Medication checklist booleans. | Yes. |
| `travel-os-1-0-rc6-family-status` | Manual family status selections. | Yes. |
| `travel-os-1-0-rc6-prefs` | Traveler profile, large text, Suica default, onboarding. | Yes. |
| `travel-os-1-0-rc6-photo-quest` | Photo Quest completion flags. | Yes. |
| `travel-os-1-0-rc6-spend` | Intended local expense rows. | Loaded and aggregated, but no visible writer was found. |
| `travel-os-1-0-rc6-restaurant-status` | Food Explorer reservation states. | Yes. |
| `travel-os-1-0-rc6-memory-book` | Per-date meal, moment, purchase, rating, and notes. | Yes. |
| `travel-os-1-0-rc6-reservation-assistant` | Assistant-specific booking states. | Yes. |
| `travel-os-1-0-rc6-packing-intel` | Context packing checklist flags keyed by item text. | Yes. |

All local data is device/browser-profile specific. There is no client-side write path back to Google Sheets.

## API calls

| Caller | Request | Intended response |
|---|---|---|
| `syncCore()` | `GET ./api?action=core` | `{ok:true, ...core fields...}`, including itinerary, current/selected date, and today. |
| `refreshWeather()` | `GET ./api?action=weather` | `{ok:true, available, city, temperatures, precipitation, summary, bring, ...}`. |
| `loadSection(name)` | `GET ./api?action=section&section=<name>` | `{ok:true, rows:[...]}`. |
| `refreshFx()` | `GET ./fx` | `{ok:true, rate, source, updatedAt, ...}`. |
| `functions/api.js` | Google Apps Script deployment | Arbitrary upstream text treated as JSON by the browser. |
| `functions/fx.js` | `https://open.er-api.com/v6/latest/USD` | Rate payload containing `rates.JPY`. |

All client fetches request `no-store`. The service worker still observes same-origin GET requests and may cache successful `/api` and `/fx` responses.

## Named remote sections

The application can request these Sheet-backed section names:

```text
appConfig, bathroom, budget, countdown, dailyBrief, emergency,
etiquetteCards, firstTime, flights, foodChallenge, gfKonbini,
gfRestaurants, gfRyokan, hakoneNara, hotels, journal, konbini,
konbiniGuide, kyoto, lost, luggage, maps, money, osaka, packing,
phraseFavorites, phrases, pretrip, rain, resTimeline, reservations,
restaurants, seasonal, shopping, smartAlerts, tokyo, transitCards,
weather
```

The exact Apps Script action handling, workbook tab mapping, and column schema **requires workbook/backend inspection**.

## Screen architecture

### Persistent shell

- sticky top bar with menu, brand, and sync status;
- offline indicator;
- install-on-iPhone prompt when not standalone;
- six-item bottom navigation;
- floating quick-action button;
- left drawer;
- first-run onboarding overlay;
- version footer.

### Primary navigation

- Home
- Today
- Hilda
- Travelers
- SOS
- More, which opens the drawer

### Traveler screens

- Travelers index
- David
- Noelle
- Nick
- Hilda
- David / Noelle combined planning dashboard remains routable as `dn`
- Family Status

### Destination screens

- Tokyo
- Hakone
- Kyoto
- Osaka
- Nara

### Planning and daily modes

- Before Trip
- Airport Mode
- Transit Mode
- Evening
- Confidence
- Daily Timeline
- Smart Daily Brief
- Weather Planner
- Rain Mode

### Content and utility screens

- Food Explorer
- Reservation Assistant
- Reservations / flights / hotels
- Maps
- Map Explorer
- Transit
- Live Transit launchpad
- Phrases
- Packing
- Packing Intelligence
- Budget
- Budget Dashboard
- Money Hub
- Yen Calculator
- Shopping
- Souvenirs
- Favorites
- Journal
- Memory Book
- Photo Quest
- Seasonal Guide / Seasonal Events
- First-Time Japan Academy
- Useful Guides
- Konbini Explorer
- Bathroom
- Peace of Mind
- Medical
- Lost Mode
- Emergency
- Apple Wallet Suica
- Explore

### System/concept screens

- Travel Companion command center
- Settings
- System
- Debug
- Admin concept
- City Art direction

## View-to-section loading

`VIEW_SECTIONS` is the only explicit mapping used by `setView()` to load remote sections. The current mapping covers many legacy views but omits all new RC6 `*Pro` and companion views. A screen can therefore depend on incidental prior navigation or startup prefetch.

Critical startup prefetch is limited to:

```text
emergency, lost, phraseFavorites, phrases, maps, hotels
```

It does not include reservations, transit cards, restaurants, rain, budget, or packing.

## Routing

There is no URL router and no per-screen URL. Navigation changes `state.view` only, so refresh returns to startup/Home. The only recognized query parameters are:

- `reset`
- `clearCache`

The manifest adds `app=1&release=1.0-rc4`, but these parameters are not used by the app.

The catch-all `_redirects` file serves `index.html` for unknown paths. Interaction with Cloudflare Function routing **requires deployment verification**.

## Offline architecture

Two independent mechanisms are used:

1. **Service worker / Cache Storage**
   - pre-caches the static shell;
   - updates static resources with stale-while-revalidate;
   - uses network-first for navigation and APIs;
   - deletes all other Cache Storage cache names on activation.

2. **Application `localStorage` cache**
   - stores core, weather, and all sections loaded so far;
   - restores them before the network call;
   - marks the app offline after a failed refresh;
   - uses one ten-minute timestamp for the entire bundle.

Device-local trackers are also available offline because they live in separate `localStorage` entries.

Offline reliability, update behavior, and iPhone storage persistence **requires live testing**.

## Styling architecture

`styles.css` defines design tokens, cards, grids, tiles, navigation, forms, food/restaurant components, drawers, bottom sheets, onboarding, responsive breakpoints, reduced-motion behavior, and print rules. It includes multiple repeated definitions of `:root`, `.app`, `.nav`, `.bigButton.secondary`, `.jp`, and other selectors. Later rules override earlier ones.

There is no separate design-token build or component isolation. Class names are shared globally across every screen.

## Deployment assumptions

- Static hosting: Cloudflare Pages.
- Dynamic endpoints: file-routed Cloudflare Pages Functions.
- Source data: a Google Sheet exposed through a deployed Apps Script web app.
- Deployment trigger: GitHub integration.
- PWA target: primarily iPhone Safari / Add to Home Screen.
- External services: Google Maps, JR East, JR Central, and ExchangeRate-API.

Every item above **requires live testing or deployment inspection** to confirm the current production state.
