# Travel OS 1.0 RC4

Unified release-candidate build for the Japan 2026 Travel OS.

This is the current source of truth. Ignore older v11/v12/v13/v14/v15/v16 packages.

## What this includes

- Installable iPhone PWA
- Cloudflare Pages app
- Cloudflare Pages Functions:
  - `/api` for Google Sheets data
  - `/fx` for USD/JPY exchange rate
- Google Sheets master workbook
- Apple Wallet Suica hub
- Money Hub / yen converter
- Daily Brief
- Confidence Mode
- Hilda, Nick, and D+N dashboards
- Search
- Food, maps, phrases, packing, budget, journal
- Lost Mode and SOS
- Offline-essential caching

## Deploy to GitHub

Upload the root files/folders from this package to your GitHub repo:

- `.github/`
- `assets/`
- `docs/`
- `functions/`
- `icons/`
- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`
- `_headers`
- `_redirects`
- `.nojekyll`

Commit:

```text
Travel OS 1.0 RC4 packaged build
```

Wait for Cloudflare Pages to deploy.

Then open:

```text
https://japan-travel-os.pages.dev/?reset=1
```

## Start filling the Google Sheet

Use:

```text
workbook/Travel_OS_Master.xlsx
```

Upload/import that into Google Sheets, then fill the content areas listed in `docs/CONTENT_ENTRY_GUIDE.md`.

## RC2.2 Addition

- Peace of Mind: gluten-free guidance, allergy card, comfort shortcuts, medication checklist, and ryokan tracking.

## RC3

- Navigation overhaul with bottom bar, left drawer, submenus, swipe groups, Travelers, destination dashboards, Osaka support, and floating quick actions.

## RC4

See `docs/RC4_FEATURES.md` for the smart-mode, timeline, onboarding, offline, and testing additions.
