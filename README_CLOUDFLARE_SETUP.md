# Japan Travel OS — Cloudflare Pages Ready

## Upload to GitHub

Upload these files to the root of your GitHub repo:

- index.html
- app.js
- styles.css
- manifest.json
- sw.js
- _headers
- _redirects
- .nojekyll
- icons/

Do not upload this README unless you want it in the repo.

## Cloudflare Pages Settings

Framework preset: None  
Build command: leave blank  
Build output directory: /

## Connect the app to Google Sheets

Before or after uploading, open app.js and set:

API_URL:'YOUR_APPS_SCRIPT_EXEC_URL'

Example:

API_URL:'https://script.google.com/macros/s/XXXXX/exec'

## Cloudflare Access

After Pages deploys, go to Cloudflare Zero Trust → Access → Applications → Add application → Self-hosted.

Protect your Pages domain and allow only the family email addresses.
