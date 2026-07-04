# Travel OS v11.1 — Cloudflare Proxy Fix

This version avoids the fragile browser → Google Apps Script JSONP path.

## What changed
- Frontend now calls `./api` on your own Cloudflare Pages domain.
- A Cloudflare Pages Function at `functions/api.js` proxies requests to Apps Script.
- The app uses normal `fetch()` again, but only to your same-origin Cloudflare app.
- This avoids Google redirect / cross-origin script issues.

## Included Apps Script URL
```js
https://script.google.com/macros/s/AKfycbzJW46i_k24_DZ0G7mjrUVYXzuh7UHl5faRMN_0X5UHof_dwQn4r1hO-fjUZa40NCLUXQ/exec
```

## Deploy steps
1. Upload/replace all files in GitHub, including the new `functions/` folder.
2. Commit: `Deploy Travel OS v11.1 proxy fix`.
3. Wait for Cloudflare Pages to redeploy.
4. Open: `https://japan-travel-os.pages.dev/api?action=core`
   - It should show JSON starting with `{"ok":true`.
5. Open: `https://japan-travel-os.pages.dev/?reset=1`

## Keep
- `functions/api.js`
- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`
- `_headers`
- `_redirects`
- `.nojekyll`
- `icons/`
