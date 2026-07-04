# Travel OS v11 — Production Refresh

## Improvements
- More polished mobile UI and app shell.
- Cache-fixed service worker.
- Network-first loading for HTML/JS/CSS updates.
- `?reset=1` cache reset support.
- Lazy-loaded feature sections.
- Better sync/offline status.
- Transit view added.
- Debug-friendly setup/error screens.

## Included API URL
```js
API_URL: 'https://script.google.com/macros/s/AKfycbzJW46i_k24_DZ0G7mjrUVYXzuh7UHl5faRMN_0X5UHof_dwQn4r1hO-fjUZa40NCLUXQ/exec'
```

## Deploy
1. Replace the existing GitHub repo files with this package.
2. Commit: `Deploy Travel OS v11`.
3. Wait for Cloudflare Pages to redeploy.
4. Open: `https://japan-travel-os.pages.dev/?reset=1`
5. Then open normally.

## If something looks stale
Open:
`https://japan-travel-os.pages.dev/app.js?v=11`

You should see:
`APP_VERSION = 'v11.0.0'`
