# K.O — artist site

Static, no build step. Open `index.html` through any static server (`python3 -m http.server`) or deploy the folder to Netlify / Vercel as-is.

- **All content** lives in `assets/js/content.js`. Adding a release means adding one object to `releases` (`featured: true` puts it in OUT NOW; `cover: null` shows a branded placeholder).
- Lines marked `TODO` in `content.js` still need real links or artwork (per-track links, Facebook URL, YouTube set links, covers for Dont Push It / Dance Floor / Just Grooving).
- Videos in `assets/media/video` ship as MP4 (Safari/iOS) + WebM. They autoplay **muted**; the lightbox has a "Sound on" button.
- The logo (`assets/media/logo-ko.png`) was cut out of a screenshot of the old site. Swap in the original transparent file when available.
- Platform icons: Simple Icons (CC0), bundled in `assets/js/icons.js`.
