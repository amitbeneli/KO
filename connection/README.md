# Make Sense / Connection / Euforia: booking landing page

A static page for international artist PR and booking. There is no build step. It is served by Vercel from this folder.

- Copy: `index.html`.
- Lineup, artist list, booking email and Instagram links: the `CONTENT` block at the top of `main.js`.
- Images: `media/`. The current ones come from the PDF portfolio (960px), so replace them with full-resolution files under the same names.
- Hero video: uncomment the `<video>` tag in the hero and add `media/hero.mp4`.

## Vercel
New Project → import `amitbeneli/KO` → **Root Directory: `connection`** → Framework preset: Other → Deploy.
This folder is not included in the GitHub Pages deploy of the K.O site.

Run locally: `python3 -m http.server --directory connection`

## Motion
- `motion.js` + `motion.css`: intro, smooth scroll (Lenis), scroll animations (GSAP ScrollTrigger), custom cursor.
- Libraries are hosted in `vendor/` (GSAP 3.12.5, Lenis 1.1.13), so nothing loads from an outside CDN.
- With reduced motion turned on, or if the scripts fail to load, the page shows as a normal static page.
- Headings with `data-split` animate word by word. Figures with `data-clip` open on scroll. Images with `data-parallax="N"` drift by N%.
