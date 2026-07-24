# Travel OS RC6 Static Repository Audit

Audit date: 2026-07-23  
Scope: static repository inspection only  
Runtime testing: not performed

## Constraints followed

- The application was not run.
- No HTTP server or browser automation was used.
- No dependencies were installed.
- The Excel workbook and workbook data were not inspected.
- Application code and existing documentation were not modified.
- Findings that depend on deployment, a browser, network access, Apps Script, or workbook contents are marked **requires live testing**.

## Repository state

The required Git checks were attempted first.

- `git status`: **could not be verified**. The shell has no Git executable available and this workspace snapshot contains no `.git` directory.
- Current branch: **could not be verified** for the same reasons.
- Static filesystem state before this audit: the three documents created by this audit were absent.

This means the audit can state what it created, but it cannot independently prove the wider working-tree status or branch name.

## Repository inventory

```text
/
├── .github/
│   └── workflows/
│       └── quality-check.yml
├── assets/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── docs/
│   ├── CHANGELOG.md
│   ├── CONTENT_ENTRY_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── DESIGN_SYSTEM.md
│   ├── NAVIGATION.md
│   ├── PEACE_OF_MIND.md
│   ├── QA_CHECKLIST.md
│   ├── RC2_1_UPDATE_NOTES.md
│   ├── RC4_FEATURES.md
│   ├── RC5_FOOD_EXPLORER.md
│   ├── RC6_TRAVEL_COMPANION.md
│   ├── RELEASE_NOTES.md
│   ├── ROADMAP.md
│   ├── TESTING.md
│   └── github_issues_rc2.csv
├── functions/
│   ├── api.js
│   └── fx.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── workbook/
│   ├── Travel_OS_1_0_RC5_Food_Explorer_Master_Workbook.xlsx
│   ├── Travel_OS_1_0_RC6_Travel_Companion_Master_Workbook.xlsx
│   ├── Travel_OS_RC5_Restaurant_Database.csv
│   └── Travel_OS_RC6_Restaurant_Database.csv
├── .nojekyll
├── CHANGELOG.md
├── RC5_SETUP.txt
├── RC6_SETUP.txt
├── README.md
├── _headers
├── _redirects
├── app.js
├── index.html
├── manifest.json
├── styles.css
└── sw.js
```

The workbook files were inventoried by filename only, as requested.

## Executive summary

The repository is a dependency-free, single-page, installable PWA intended for Cloudflare Pages. `index.html` loads one large `app.js` file and one cumulative `styles.css` file. The browser reads trip data through a same-origin `/api` Cloudflare Function, which proxies a hard-coded Google Apps Script deployment. `/fx` obtains USD/JPY data from `open.er-api.com`. Most shared and trip data is read-only from the app's point of view; device-specific preferences and trackers are persisted in `localStorage`.

The static structure supports a large set of screens, responsive navigation, offline caching, install metadata, Sheet-backed content, and device-local trackers. However, the release is not internally aligned: the page title and JavaScript say RC6, while the manifest, asset query strings, README, and much of the documentation still say RC4 or RC2. Several RC6 screens are not listed in the view-to-data loading map and can therefore render empty until some other screen happens to load the required sections.

## What appears to work from code inspection

- A valid minimal app shell exists in `index.html`, with viewport, PWA, icon, stylesheet, and script references.
- `app.js` has a centralized state object, HTML escaping helpers, view routing, bottom navigation, drawer navigation, quick actions, swipe groups, onboarding, large-text preference, and responsive screen renderers.
- Core trip data is fetched first from `/api?action=core`.
- Weather is fetched from `/api?action=weather`.
- Sheet sections are lazy-loaded through `/api?action=section&section=...`.
- A local cached copy of core, weather, and loaded sections is restored on startup when available.
- Favorites, family status, preferences, medication checklist, photo quest, cash counts, restaurant statuses, reservation-assistant statuses, packing intelligence, expenses, FX data, and Memory Book entries have device-local persistence structures.
- Food Explorer contains search and city, meal, dietary, priority, Michelin, and favorites filters.
- The app includes Home, Today, traveler dashboards, destination dashboards, emergency/lost tools, food, maps, phrases, transit, money, packing, reservations, weather/rain, search, system/debug, and RC6 companion screens.
- External live-transit links point to Google Maps, JR East, and JR Central rather than pretending platform or delay data is embedded.
- The Memory Book editor persists entries locally and calls the browser print dialog for Print / Save as PDF.
- Cloudflare response headers set baseline framing, MIME sniffing, referrer, permissions, and cache controls.
- The GitHub workflow checks required files, JavaScript syntax for the main script and Functions, and manifest JSON parsing on pushes and pull requests.

All browser, network, deployment, Apps Script, PWA installation, cache, print, and data-shape behavior **requires live testing**.

## Likely broken, misleading, or incomplete behavior

### High-confidence static defects

1. **RC6 screens do not load their own required data.** `setView()` loads only sections declared in `VIEW_SECTIONS`. The map has no entries for `companion`, `timelinePro`, `reservationAssistant`, `liveTransit`, `weatherPlanner`, `packingIntel`, `budgetPro`, `mapExplorer`, or `dailyBriefPro`. These screens read restaurants, maps, rain, transit, budget, and related sections, so direct navigation can show empty results until another view loads those sections.

2. **Home can present reservations as empty before they have been requested.** Home renders `reservationDashboard()`, but `home` is not in `VIEW_SECTIONS`, and reservations are not among the critical startup prefetches.

3. **The Budget Dashboard claims local expense entry exists, but no entry UI exists.** `state.spend`, `saveSpend()`, and aggregation logic are present. No code adds, edits, or deletes spend records. The dashboard button opens Money Hub, whose UI contains converter, cash, and Sheet budget display only.

4. **“I’m Here” is a placeholder.** It displays an alert but stores no arrival state and explicitly describes nearby behavior as a future version.

5. **Admin editing is a placeholder.** The Admin screen says edit forms are future work and routes its apparent form tiles back to read-only screens.

6. **Journal entry is not implemented in the app.** The Journal reads Sheet rows; the journal prompt tells users to add entries to the Sheet later. The separate Memory Book does allow local text entry.

7. **Offline API fallback can return HTML where JSON is expected.** The service worker's `networkFirst()` falls back to the matching request or `index.html` for both navigation and `/api`/`/fx`. If an uncached API request fails, the app can receive the HTML shell and then fail JSON parsing.

8. **Service-worker installation failures are swallowed.** `cache.addAll()` errors are caught and ignored, after which the worker still calls `skipWaiting()`. An activated worker can therefore have an incomplete shell cache without surfacing the failure.

9. **Cache versions conflict.** `index.html` requests manifest and CSS with `1.0-rc4` query strings and JavaScript with `160.0-rc4`; `sw.js` pre-caches `1.0-rc6` variants; the manifest start URL also says RC4. These become distinct cache keys and make update behavior harder to reason about.

10. **Duplicate top-level function declarations exist.** `renderTravelers`, `renderMemoryBook`, and `setFoodFilter` are each declared twice. JavaScript hoisting means the later declaration wins. The later versions appear intended and `setFoodFilter` is a superset, but the earlier implementations are dead code and create regression risk.

11. **Dynamic link and inline-handler data is insufficiently constrained.** Sheet-provided URLs are HTML-escaped but not restricted to safe schemes. Several links use `target="_blank"` without `rel="noopener"`. `favButton()` inserts `JSON.stringify()` output into a single-quoted inline `onclick` attribute, which can be broken by apostrophes in Sheet data. This is a robustness and injection risk if upstream content is not fully trusted.

12. **Reset is narrower than its wording suggests.** `?reset=1` removes the app data cache and Cache Storage, but it deliberately or accidentally leaves all other RC6 `localStorage` trackers and preferences intact.

### Requires live testing

- Whether current Apps Script responses match every field name assumed by the renderers.
- Whether Cloudflare Pages Functions take precedence over the catch-all `_redirects` rule for `/api` and `/fx`.
- Whether the hard-coded Apps Script deployment is active and publicly reachable.
- Whether `/fx` can reach its upstream service from Cloudflare and whether fallback responses are obvious to users.
- Whether first install, service-worker updates, offline relaunch, and cache invalidation work on target iPhones.
- Whether inline events and dynamically generated links behave correctly for the real Sheet data.
- Whether all screens remain usable at small viewport sizes and in large-text mode.
- Whether Print / Save as PDF produces an acceptable Memory Book layout.
- Whether the actual workbook tab names and payload schema match `VIEW_SECTIONS` and renderer field names.

## Placeholders and foundations

- “I’m Here” only raises a browser alert.
- Expense Tracker text says its foundation is ready, but there is no local expense-entry workflow.
- Admin editing forms are explicitly future work.
- Journal prompts direct entry to the Sheet rather than accepting local app input.
- Art Direction is a concept screen; no city header artwork is present.
- Currency has a separate rough-rate screen hard-coded to ¥145/$1 in addition to the live/cached Money Hub.
- Family status is a manual same-device tracker, not live sharing.
- Live Transit is a launchpad to third-party services, not an embedded live-data integration.
- Weather availability and forecast behavior depend on the upstream Apps Script.
- Multiple empty states direct the owner to add content to workbook/Sheet tabs.

## What `/functions` contains

### `functions/api.js`

A Cloudflare Pages Function for GET `/api`. It:

1. Reads the incoming request URL.
2. Builds a request to one hard-coded Google Apps Script deployment.
3. copies all incoming query parameters, including `action` and `section`;
4. fetches the Apps Script URL and follows redirects;
5. returns the upstream body and status as `application/json`, with `no-store` and permissive CORS;
6. returns `{ok:false,error:...}` with status 500 on an exception.

It does not validate allowed actions or sections, validate the upstream body as JSON, impose a timeout, or preserve the upstream content type.

### `functions/fx.js`

A Cloudflare Pages Function for GET `/fx`. It:

1. Requests the USD base-rate feed from `open.er-api.com`.
2. extracts `rates.JPY`;
3. returns the rate with a 30-minute public cache header when successful;
4. returns a fallback rate of 145 after upstream failure, missing JPY data, or an exception.

The fallback reports `ok:true` and uses the current timestamp even though the rate is only an estimate. That can make an estimated rate look freshly sourced. Success includes permissive CORS, while fallback branches do not explicitly include it.

## Service-worker behavior

- Cache name: `travel-os-rc6-travel-companion-shell`.
- Install: attempts to pre-cache the shell, script, stylesheet, manifest, and two icons; ignores any failure; activates immediately.
- Activate: deletes every other Cache Storage cache and claims clients.
- Same-origin GET `/api` and `/fx`: network first, then cached request, then `index.html`.
- Navigations: network first, then cached navigation request, then `index.html`.
- Other same-origin GET requests: stale while revalidate.
- Cross-origin requests and non-GET requests are not intercepted.

The worker caches only responses it sees and only core shell files are pre-cached. App trip data is primarily made offline-capable through `localStorage`, not through pre-cached API payloads.

## Documentation and release conflicts

- `README.md` calls RC4 the current source of truth, while `app.js`, the page title, root changelog, workbook filenames, and RC6 document describe RC6.
- `manifest.json` describes RC4 and launches with `release=1.0-rc4`.
- `index.html` uses RC4 query strings despite its RC6 title.
- `sw.js` uses RC6 cache and query strings.
- Root `CHANGELOG.md` contains RC2, RC5, and RC6, while `docs/CHANGELOG.md` stops at RC2.
- `docs/RELEASE_NOTES.md`, `docs/TESTING.md`, `docs/QA_CHECKLIST.md`, and `docs/ROADMAP.md` are primarily RC2-era documents.
- `docs/ROADMAP.md` lists Memory Book / PDF export as post-trip future work, while RC6 includes a local Memory Book and print flow.
- `docs/RC4_FEATURES.md` says the 14-day route begins October 27, 2026. RC5 and RC6 say October 26–November 11, 2026. The app shell and drawer still hard-code “14 days.”
- README and several docs reference `workbook/Travel_OS_Master.xlsx`, which does not exist in the repository inventory. The present files are explicitly named RC5 and RC6 workbooks.
- README instructs opening `?reset=1`, but the implementation resets only cached trip data and Cache Storage, not all device-local state.
- The RC6 changelog calls the budget feature “planned-vs-actual,” while the app has no visible way to add actual expenses.
- The RC6 “Smart Daily Brief” is indeed deterministic and local, but it can only be as complete as the sections already loaded.
- Two copies of the icons exist under `/icons` and `/assets/icons`; only `/icons` is referenced by the page, manifest, and service worker.

## Existing-file modification statement

No existing repository file was intentionally modified. This task created only:

1. `docs/RC6_STATIC_AUDIT.md`
2. `docs/ARCHITECTURE_CURRENT.md`
3. `docs/TECHNICAL_DEBT.md`

Because Git metadata and a Git executable are unavailable, this statement is based on the operations performed during this audit rather than a final `git status` comparison.

## Recommended next small audit task

Perform a **static data-contract audit** limited to `app.js`, the Apps Script response contract, and the RC6 workbook tab/column names. Its output should be one matrix mapping each `action`, `section`, and renderer field to its actual backend/workbook source. That is the smallest next task most likely to distinguish genuine empty-data defects from naming mismatches. It requires workbook inspection but still does not require running the app.
