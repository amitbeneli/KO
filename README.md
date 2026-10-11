# K.O — artist site

Static, no build step. Open `index.html` through any static server (`python3 -m http.server`) or deploy the folder to Netlify / Vercel as-is.

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
