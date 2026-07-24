# Travel OS Technical Debt

This register is based on static inspection only. Priorities reflect likely user impact and repair leverage, not confirmed production incidents.

## Priority 0 — release confidence blockers

### TD-001: RC6 data-loading map is incomplete

**Evidence:** `setView()` calls `ensureSections(VIEW_SECTIONS[view] || [])`. `VIEW_SECTIONS` lacks `companion`, `timelinePro`, `reservationAssistant`, `liveTransit`, `weatherPlanner`, `packingIntel`, `budgetPro`, `mapExplorer`, and `dailyBriefPro`.

**Impact:** Direct navigation to new RC6 screens can show empty restaurants, maps, rain plans, transit cards, budgets, or reservations. Results depend on which older screens were visited first.

**Recommended correction:** Define explicit section dependencies for every routable view and add a static check that every `setView()` target has a deliberate mapping, including an explicit empty mapping where no remote data is needed.

### TD-002: Release identity and cache keys disagree

**Evidence:**

- `app.js`: RC6.
- `index.html` title: RC6.
- `index.html` manifest/CSS query strings: RC4.
- `index.html` app script query string: `160.0-rc4`.
- `manifest.json`: description and start URL are RC4.
- `sw.js`: RC6 cache and RC6 asset query strings.
- `README.md`: RC4 is the “current source of truth.”

**Impact:** Operators and users cannot reliably identify the deployed release. Different query strings create different cache entries and complicate service-worker updates.

**Recommended correction:** Establish one release constant/process and align page, manifest, service worker, asset URLs, README, changelog, and deployment checks.

### TD-003: Offline API fallback has the wrong response type

**Evidence:** `networkFirst()` falls back to a cached request or `index.html`. It is used for `/api` and `/fx`, while the client always parses those responses as JSON.

**Impact:** An offline uncached API call can receive HTML, causing a JSON parse error. This is hidden in several catch blocks and may look like missing data.

**Recommended correction:** Use endpoint-specific JSON fallbacks or allow the fetch to fail so the application-level local cache handles offline state.

### TD-004: Service-worker install can silently succeed with no complete shell

**Evidence:** the install handler catches and ignores `cache.addAll()` failure, then calls `skipWaiting()`.

**Impact:** A new worker may activate after a partial/failed pre-cache and remove the previous cache during activation.

**Recommended correction:** Fail installation when required shell assets cannot be cached, or distinguish required from optional assets and preserve the last known-good cache.

## Priority 1 — likely functional gaps

### TD-005: Planned-vs-actual spending has no input path

**Evidence:** `state.spend`, `loadSpend()`, `saveSpend()`, `spendTotals()`, and `renderBudgetPro()` exist, but no function creates or modifies a spend row. The dashboard button opens Money Hub, which has no expense form.

**Impact:** The advertised actual-spend dashboard remains at zero unless storage is populated outside the UI.

**Recommended correction:** Either implement a small local add/edit/delete expense flow or relabel the feature as a read-only foundation until it exists.

### TD-006: Home reservations are not requested on Home

**Evidence:** `renderHome()` includes `reservationDashboard()`, but Home has no view dependency mapping and reservations are not prefetched.

**Impact:** The Home dashboard can say reservations are loading or unfilled even when they exist upstream.

**Recommended correction:** Give Home an explicit dependency list or move the summary into the core payload.

### TD-007: Shared cache freshness is too coarse

**Evidence:** core, weather, and every loaded section share one cache object and timestamp. Any `saveCache()` refreshes the timestamp. Empty arrays are truthy and are not re-requested by `loadSection()`.

**Impact:** One recently updated section can make unrelated stale content appear fresh; an empty or temporarily failed dataset can persist until a broader reset or refresh path.

**Recommended correction:** Track fetch time, success, and schema/version per section; distinguish “not loaded” from “loaded empty.”

### TD-008: Reset behavior is ambiguous

**Evidence:** `?reset=1` removes only `travel-os-1-0-rc6-data` plus Cache Storage. It does not remove favorites, preferences, medication checks, cash, statuses, Memory Book, or other local trackers.

**Impact:** A user expecting a full reset retains substantial device-local state.

**Recommended correction:** Name the current action “refresh trip cache” and provide a separately confirmed full local-data reset if needed.

### TD-009: Upstream response contract is not validated

**Evidence:** `/api` labels any upstream text as JSON. The client assumes `{ok:true}`, `rows`, and many exact field names.

**Impact:** An Apps Script login page, HTML error, schema drift, or renamed column becomes a generic parse error or silently empty UI.

**Recommended correction:** Validate content type and minimum response shape at the proxy boundary and return a structured error with endpoint/action context.

### TD-010: FX fallback can look live

**Evidence:** failure returns `{ok:true, rate:145, source:'fallback estimate', updatedAt: now}`.

**Impact:** A fixed estimate can appear freshly updated. This matters for budget decisions even if the UI includes the source text.

**Recommended correction:** Return an explicit `fallback:true` or `stale:true`, preserve the last successful timestamp where possible, and visually distinguish estimated from live rates.

## Priority 1 — security and data robustness

### TD-011: Inline HTML event handlers interpolate remote data

**Evidence:** UI is built with `innerHTML` and inline `onclick`/`onchange`. `favButton()` places `JSON.stringify()` data inside a single-quoted HTML attribute. Other handlers place Sheet-derived IDs inside JavaScript string literals.

**Impact:** Apostrophes and crafted content can break event attributes. If upstream data is compromised or untrusted, this can become script injection.

**Recommended correction:** Render elements with safe data attributes or DOM APIs and attach event listeners separately. Treat Sheet content as untrusted input.

### TD-012: Dynamic URLs are not scheme-validated

**Evidence:** Sheet links are escaped for HTML but used directly in `href`. Some `target="_blank"` links omit `rel="noopener"`.

**Impact:** Non-HTTP schemes or hostile links can be rendered; opener access is possible on affected links in some browsers.

**Recommended correction:** Allowlist `https:` and any explicitly required map schemes; consistently add `rel="noopener noreferrer"`.

### TD-013: Sensitive device-local data has no management controls

**Evidence:** medication checks, family status, favorites, restaurant plans, cash, and Memory Book content are stored indefinitely in `localStorage`.

**Impact:** Anyone with access to the browser profile can read the data. Users cannot selectively export or clear it.

**Recommended correction:** Document the storage model, minimize medical data, and provide clear per-category deletion. Encryption would require a separate product decision and threat model.

## Priority 2 — maintainability

### TD-014: `app.js` is a 100+ KB monolith

**Evidence:** one classic script contains data access, state, persistence, navigation, UI templates, business rules, trackers, and all screens.

**Impact:** Name collisions, dead code, regression risk, and difficult static testing increase as features are appended.

**Recommended correction:** First separate pure data/state helpers from screen rendering; then split screens by domain while retaining a no-build option if desired.

### TD-015: Duplicate function declarations rely on last-one-wins behavior

**Evidence:** `renderTravelers`, `renderMemoryBook`, and `setFoodFilter` each occur twice.

**Impact:** Earlier implementations are dead but look active during review. Editing the wrong copy can have no effect.

**Recommended correction:** Remove superseded implementations and add a duplicate-declaration lint/static check.

### TD-016: CSS is cumulative and override-heavy

**Evidence:** repeated `:root`, `.app`, `.nav`, `.jp`, `.bigButton.secondary`, media queries, and release-era component blocks.

**Impact:** Final styles depend on source order and are difficult to reason about. Small changes can cause remote regressions.

**Recommended correction:** Consolidate tokens and duplicate selectors, group components by current architecture, and preserve print/reduced-motion behavior with explicit regression checks.

### TD-017: View routing is a long conditional chain

**Evidence:** `render()` contains a long series of string comparisons, while view dependencies live in a separate object and navigation targets are embedded throughout templates.

**Impact:** Adding a view requires coordinated edits in several places, which caused the current RC6 dependency omissions.

**Recommended correction:** Use a single route registry containing renderer, required sections, navigation group, and optional label.

### TD-018: Errors are frequently swallowed

**Evidence:** service-worker registration, weather, FX, haptics, cache install, and some data fetch failures use empty catch blocks or only set a broad offline flag.

**Impact:** Real defects are indistinguishable from valid offline conditions and are hard to diagnose.

**Recommended correction:** Keep user messaging calm, but record structured diagnostic state and expose it on the Debug screen.

### TD-019: Mixed remote and local concepts are inconsistently named

**Evidence:** Sheet `budget`/`money`, local `spend`, two reservation-status stores, Sheet `journal`, and local Memory Book coexist without a formal ownership model.

**Impact:** Users and maintainers may not know which device or source is authoritative.

**Recommended correction:** Document ownership and sync behavior for each domain: Sheet read-only, device-local, derived, or external live.

## Priority 2 — product/documentation debt

### TD-020: Documentation has no current source of truth

**Evidence:** RC2, RC4, RC5, and RC6 instructions coexist. README declares RC4 current; the app declares RC6; `docs/CHANGELOG.md` stops at RC2.

**Impact:** Deployment, QA, content entry, and release decisions can follow obsolete instructions.

**Recommended correction:** Designate one current overview and archive or clearly label historical documents. Keep one current changelog and one current QA checklist.

### TD-021: Referenced workbook filename does not exist

**Evidence:** README and content/deployment docs name `workbook/Travel_OS_Master.xlsx`; inventory contains RC5 and RC6 named workbooks instead.

**Impact:** Setup instructions lead to a missing file.

**Recommended correction:** Point all current docs to the RC6 workbook or establish a stable canonical filename.

### TD-022: Trip duration and dates conflict

**Evidence:** the app shell/drawer hard-code “14 days”; RC4 docs start October 27 and call it 14 days; RC5/RC6 docs specify October 26–November 11, 2026.

**Impact:** User-facing duration, trip progress, and planning guidance may disagree.

**Recommended correction:** Derive duration and date labels from the core itinerary and remove hard-coded release-era copy.

### TD-023: Advertised functionality exceeds implementation

**Examples:**

- “I’m Here” does not persist or change context.
- Admin forms are concepts only.
- Expense tracking has no entry UI.
- Journal entry remains Sheet-only.
- Live Transit is a link launchpad.
- Art Direction is prose, not artwork.
- Family Status is manual and same-device.

**Impact:** Release notes and navigation can create false expectations.

**Recommended correction:** Mark foundations plainly in product copy or complete the smallest useful workflow before calling them modules.

### TD-024: Duplicate icon trees add ambiguity

**Evidence:** identical-size icon filenames exist under `/icons` and `/assets/icons`, while inspected source references only `/icons`.

**Impact:** Maintainers may update the unused copy and see no effect.

**Recommended correction:** Keep one canonical icon location after verifying deployment references.

## Priority 3 — quality pipeline

### TD-025: CI checks only a narrow surface

**Evidence:** the workflow checks file existence, syntax of three JavaScript files, and manifest JSON parsing.

**Missing static checks:**

- release/version consistency;
- duplicate function declarations;
- every view's data dependencies;
- unsafe or malformed dynamic link construction;
- service-worker asset existence and query alignment;
- documentation links and referenced workbook paths;
- `_redirects` and Function route assumptions;
- CSS validation;
- schema/field contract checks.

**Recommended correction:** Add small repository-native scripts for the highest-leverage invariants before expanding to browser tests.

## Requires live testing

These are risks, not confirmed defects, until tested:

- Cloudflare routing precedence between Pages Functions and `_redirects`.
- Apps Script availability, permissions, redirects, payload schema, and latency.
- FX upstream availability and Cloudflare egress.
- Service-worker install/update/offline behavior on iPhone Safari.
- PWA installation and standalone launch.
- navigation, gestures, large-text layout, and touch target quality;
- print/PDF formatting;
- external map and transit links;
- real-world handling of apostrophes and special characters from the Sheet;
- offline recovery with partially loaded sections.

## Recommended sequencing

1. Static workbook/API contract audit.
2. Small release/version consistency cleanup plan.
3. Fix the view registry/data dependency problem.
4. Add focused static invariants to CI.
5. Only then perform a minimal live smoke test of `/api`, `/fx`, first load, direct RC6 screen navigation, and offline relaunch.
