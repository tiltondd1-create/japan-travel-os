# Japan Travel OS v10 — Cache-Fixed Cloudflare Package

This version fixes the issue where the app keeps showing “Setup needed” even after `API_URL` is set.

## What changed
- Service worker is network-first for `index.html`, `app.js`, `styles.css`, and `sw.js`.
- App/cache keys are bumped to v10.
- `index.html` loads `app.js?v=10`.
- `?reset=1` clears the local app cache and service-worker caches.
- Error screens show app version and whether the API URL is detected.

## Included API URL
```js
API_URL:'https://script.google.com/macros/s/AKfycbzJW46i_k24_DZ0G7mjrUVYXzuh7UHl5faRMN_0X5UHof_dwQn4r1hO-fjUZa40NCLUXQ/exec'
```

## What to do
1. Replace the files in your GitHub repo with these v10 files.
2. Commit: `Deploy v10 cache fix`.
3. Wait for Cloudflare Pages to redeploy.
4. Open: `https://japan-travel-os.pages.dev/?reset=1`
5. Then open normally: `https://japan-travel-os.pages.dev/`

## If it still fails
Open: `https://japan-travel-os.pages.dev/app.js?v=10`

Confirm:
- `APP_VERSION` says `v10.0.0`
- `API_URL` is filled in
