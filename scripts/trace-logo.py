# Rebuilds assets/media/logo-ko.svg from a screenshot of the old site (needs: pip install potracer numpy pillow).
# Usage: python3 scripts/trace-logo.py <screenshot.png> assets/media/logo-ko.svg -
import sys, numpy as np, potrace
from PIL import Image, ImageFilter
src, out, preview = sys.argv[1:4]
im = Image.open(src).convert('RGB').crop((870, 200, 1500, 540))
a = np.asarray(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
bg = np.array([34, 34, 34])
dist = np.abs(a - bg).max(-1)
fg = dist > 30
pink = fg & (r > 150) & (b > 100) & (g < 130)
dark = fg & (a.max(-1) < 80)
face = fg & ~pink & ~dark
stripe = face & ((g - b) > 55)
K = 6  # upscale before tracing for smooth curves
def trace(mask, blur=1.4, turd=40):
    m = Image.fromarray((mask * 255).astype('uint8')).resize((mask.shape[1] * K, mask.shape[0] * K), Image.BICUBIC)
    m = m.filter(ImageFilter.GaussianBlur(blur * K / 2))
    bm = potrace.Bitmap(np.asarray(m) <= 127)
    plist = bm.trace(turdsize=turd * K, alphamax=1.1, opticurve=True, opttolerance=0.3)
    d = []
    for c in plist:
        s = c.start_point; d.append(f'M{s.x/K:.1f} {s.y/K:.1f}')
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{seg.c.x/K:.1f} {seg.c.y/K:.1f}L{seg.end_point.x/K:.1f} {seg.end_point.y/K:.1f}')
            else: d.append(f'C{seg.c1.x/K:.1f} {seg.c1.y/K:.1f} {seg.c2.x/K:.1f} {seg.c2.y/K:.1f} {seg.end_point.x/K:.1f} {seg.end_point.y/K:.1f}')
        d.append('Z')
    return ''.join(d)
sil = trace(fg, 1.4, 30)
shadow = trace(pink | dark & ~face, 1.4, 40)
facep = trace(face, 1.4, 30)
stripes = trace(stripe, 2.8, 70)
# crop viewBox to silhouette bounds
ys, xs = np.where(fg); x0, y0, x1, y1 = xs.min() - 2, ys.min() - 2, xs.max() + 3, ys.max() + 3
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" role="img" aria-label="K.O">
<path fill="#0b0103" d="{sil}"/>
<path fill="#7d0a1c" d="{shadow}"/>
<path fill="#efe8e0" d="{facep}"/>
<path fill="#c8102e" fill-rule="evenodd" d="{stripes}"/>
</svg>
'''
open(out, 'w').write(svg)
print('svg bytes', len(svg))
