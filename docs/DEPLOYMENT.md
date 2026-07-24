# Deployment

## GitHub

Upload this package to your GitHub repository. Keep these at the root:

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`
- `_headers`
- `_redirects`
- `.nojekyll`
- `functions/api.js`
- `functions/fx.js`
- `icons/`

## Cloudflare

Cloudflare Pages should auto-deploy after GitHub commit.

Test:

```text
https://japan-travel-os.pages.dev/api?action=core
https://japan-travel-os.pages.dev/fx
https://japan-travel-os.pages.dev/?reset=1
```

## Google Sheets

Upload/import `workbook/Travel_OS_Master.xlsx` into Google Sheets.

Keep existing tab names unless we intentionally update the Apps Script backend.

## Apps Script

The existing Apps Script deployment should remain the backend.

The browser talks to Cloudflare `/api`, and Cloudflare talks to Apps Script.
