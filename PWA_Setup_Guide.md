# Japan Travel OS v9 — Robust PWA Setup

This is the "real app" version.

## What this package includes

- Static PWA frontend:
  - `index.html`
  - `styles.css`
  - `app.js`
  - `manifest.json`
  - `sw.js`
  - app icons
- Google Sheets backend:
  - `AppsScript_Backend_Code.gs`
- Install guide:
  - this file

## Recommended architecture

Google Sheets = planning database  
PWA = polished iPhone app interface

David/Noelle edit the Sheet.  
Nick/Hilda use the installed app.

## Step 1 — Upload workbook

Use:

`Japan_2026_Travel_OS_v9_PWA_Robust.xlsx`

Upload to Google Drive and open as Google Sheets.

## Step 2 — Install backend API

1. Open the Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace all code with `AppsScript_Backend_Code.gs`.
4. Click Save.
5. Deploy → New deployment.
6. Select type: **Web app**.
7. Execute as: **Me**.
8. Access: choose the setting that works for your family.
9. Deploy.
10. Copy the web app URL ending in `/exec`.

## Step 3 — Connect the PWA to Sheets

Open `app.js` and paste the Apps Script URL here:

```js
API_URL: 'https://script.google.com/macros/s/...../exec'
```

## Step 4 — Host the PWA

Use one of these:

- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel

Upload the frontend files:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `sw.js`
- `icons/`

## Step 5 — Install on iPhone

1. Open the hosted PWA URL in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Name it `Japan 2026`.
5. Tap Add.

## Offline behavior

The PWA caches the app shell and stores the latest successful trip sync in localStorage. That means the main itinerary, emergency info, phrases, and reference cards remain available when reception is poor.

## Privacy note

Do not put highly sensitive information into the Sheet. Keep the family app link private.


## v9.1 Performance Update

This package is optimized for speed:
- Cache-first startup: shows saved itinerary immediately.
- Background refresh: syncs from Google Sheets after first render.
- Lazy-loading: secondary sections load only when tapped.
- Critical prefetch: emergency, lost mode, maps, and phrases prefetch in the background.
- Fewer full payloads: the app no longer requires the large `bundle` response at startup.
- Better perceived performance: skeleton cards show while sections load.
- Short API timeout: avoids hanging on weak mobile data.

Recommended install:
Use `Japan_Travel_OS_v9_1_Performance_PWA_Package.zip` instead of the older v9 PWA package.
