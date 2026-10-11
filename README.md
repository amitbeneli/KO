# K.O — artist site

Static, no build step. **Live at https://ko.sako-mgmt.com/** (GitHub Pages; also reachable at amitbeneli.github.io/KO) (published by `.github/workflows/deploy.yml` on every push and after each release sync).

Run locally: `python3 -m http.server` in this folder.

- **All content** lives in `assets/js/content.js`. Adding a release means adding one object to `releases` (`featured: true` puts it in OUT NOW; `cover: null` shows a branded placeholder).
- Lines marked `TODO` in `content.js` still need real links or artwork (per-track links, YouTube set links, covers for Dont Push It / Dance Floor / Just Grooving).
- Videos in `assets/media/video` ship as MP4 (Safari/iOS) + WebM. They autoplay **muted**; the lightbox has a "Sound on" button.
- The logo (`assets/media/logo-ko.png`) was cut out of a screenshot of the old site. Swap in the original transparent file when available.
- Platform icons: Simple Icons (CC0), bundled in `assets/js/icons.js`.

## Daily release sync

`.github/workflows/sync-releases.yml` runs every morning (and on demand from **Actions → Sync releases → Run workflow**). It runs `scripts/sync-releases.mjs`, which:

- reads K.O's releases from **Spotify** and his tracks from **SoundCloud** (public RSS feed),
- writes them to `assets/js/auto-releases.js` and commits only when something changed.

The site merges that file with `content.js`:
- A Spotify release missing from `content.js` is added to Latest Releases. If it came out in the last 45 days, it also goes to OUT NOW.
- A release already in `content.js` gets its real Spotify cover and track link if it still has a placeholder.
- SoundCloud tracks that are not releases (podcasts, live sets) appear in Videos & Mixes.

**One-time setup for Spotify:** create an app at https://developer.spotify.com/dashboard. Then add its Client ID and Client Secret as repository secrets named `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` (Settings → Secrets and variables → Actions). Without them the SoundCloud sync still runs and Spotify is skipped.

Test offline: `node scripts/sync-releases.mjs --fixtures <dir>` with `spotify.json` and `soundcloud.rss` in `<dir>`.

## Custom domain

The site is served at `ko.sako-mgmt.com`:
- DNS (at the sako-mgmt.com registrar): a `CNAME` record `ko` → `amitbeneli.github.io`.
- GitHub: Settings → Pages → Custom domain = `ko.sako-mgmt.com`, then tick **Enforce HTTPS** once the certificate is issued.
- The domain also appears in `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt`, `sitemap.xml` and `CNAME`.
