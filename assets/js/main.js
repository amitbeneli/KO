(() => {
  const D = window.KO, ICONS = window.KO_ICONS;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[id] || ''}"/></svg>`;
  const ext = 'target="_blank" rel="noopener"';
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>';
  // MP4 for Safari/iOS, WebM fallback for browsers without H.264
  const sources = src => `<source src="${src}" type="video/mp4"><source src="${src.replace(/\.mp4$/, '.webm')}" type="video/webm">`;
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17L17 7M9 7h8v8"/></svg>';

  /* ---------- platforms ---------- */
  const platformLinks = list => list.map(p => p.url
    ? `<a href="${p.url}" ${ext} aria-label="${p.name}" title="${p.name}">${icon(p.id)}</a>`
    : `<a aria-disabled="true" aria-label="${p.name} (coming soon)">${icon(p.id)}</a>`).join('');

  $('#heroPlatforms').innerHTML = platformLinks(D.platforms);
  $('#footPlatforms').innerHTML = platformLinks(D.platforms);

  const streaming = D.platforms.filter(p => ['spotify', 'applemusic', 'beatport', 'soundcloud', 'deezer'].includes(p.id));

  /* ---------- releases ---------- */
  const cover = r => r.cover
    ? `<img src="${r.cover}" alt="${esc(r.title)} cover" loading="lazy">`
    : `<div class="cover-ph"><small>${esc(r.artists)}</small><b>${esc(r.title)}</b></div>`;

  const featured = D.releases.filter(r => r.featured);
  $('#featured').innerHTML = featured.map(r => `
    <article class="feat reveal">
      <a class="cover" href="${r.url}" ${ext}>${cover(r)}</a>
      <div class="feat-body">
        <h3>${esc(r.title)}</h3>
        <span class="meta">${[r.subtitle || r.artists, r.label, r.year].filter(Boolean).map(esc).join('<i>/</i>')}</span>
        <div class="row">
          <a class="btn btn-solid" href="${r.url}" ${ext}>${PLAY} Listen</a>
          <nav class="platforms" aria-label="Stream ${esc(r.title)}">${platformLinks(streaming)}</nav>
        </div>
      </div>
    </article>`).join('');

  if (featured.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = '<button aria-label="Previous">←</button><button aria-label="Next">→</button>';
    $('#featured').after(nav);
    const track = $('#featured');
    nav.addEventListener('click', e => {
      const dir = e.target.closest('button') === nav.firstChild ? -1 : 1;
      track.scrollBy({ left: dir * track.firstElementChild.offsetWidth, behavior: 'smooth' });
    });
  }

  $('#releaseGrid').innerHTML = D.releases.filter(r => r.latest || !r.featured).map((r, i) => `
    <a class="rel reveal" href="${r.url}" ${ext} style="transition-delay:${i * 70}ms">
      <div class="cover">${cover(r)}<span class="play">${PLAY}</span></div>
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.subtitle || r.artists)}</p>
    </a>`).join('');

  /* ---------- live ---------- */
  $('#liveGrid').innerHTML = D.live.map((c, i) => {
    const media = c.video
      ? `<video muted loop playsinline preload="none" poster="${c.poster}" data-lazy>${sources(c.video)}</video>`
      : `<img src="${c.image}" alt="" loading="lazy">`;
    const attrs = c.video ? `type="button" data-video="${c.video}" data-poster="${c.poster}"` : `href="${c.url}" ${ext}`;
    const tag = c.video ? 'button' : 'a';
    return `<${tag} class="clip reveal${c.wide ? ' wide' : ''}" ${attrs} style="transition-delay:${i * 90}ms">
      ${media}
      <span class="clip-badge ${c.video ? 'rec' : ''}">${c.video ? 'Live clip' : 'Full set'}</span>
      <div class="clip-info"><h3>${esc(c.title)}</h3><p>${esc(c.place)}</p></div>
    </${tag}>`;
  }).join('');

  $('#mixList').innerHTML = D.mixes.map(m => `
    <a class="mix reveal" href="${m.url}" ${ext}>
      <img src="${m.image}" alt="" loading="lazy">
      <div><h3>${esc(m.title)}</h3><p>${esc(m.by)}</p></div>
      <span class="arrow">${ARROW}</span>
    </a>`).join('');

  /* ---------- booking / footer ---------- */
  $('#bookingMail').href = 'mailto:' + D.email;
  $('#bookingMail').textContent = D.email;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- 3D cube, balanced on one corner so it reads as a pyramid ---------- */
  const ROT = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'];
  const cube = $('#cube'), stage = $('#cubeStage');
  cube.classList.add('exploded');
  cube.innerHTML = D.cube.map((f, i) => {
    let inner;
    if (f.video) inner = `<video poster="${f.poster}" muted autoplay loop playsinline preload="auto">${sources(f.video)}</video><span class="tag">Live</span>`;
    else if (f.logo) inner = `<img src="assets/media/logo-ko.png" alt="">`;
    else inner = `<img src="${f.image}" alt="">`;
    const data = f.video ? `data-video="${f.video}" data-poster="${f.poster}"` : f.image ? `data-image="${f.image.replace('sq-', '')}"` : '';
    return `<div class="face${f.logo ? ' face-logo' : ''}" style="--rot:${ROT[i]};transition-delay:${i * 90}ms" ${data}>${inner}</div>`;
  }).join('');
  const faces = [...cube.children].map((f, i) => ({ v: f.querySelector('video'), rot: ROT[i] }));
  faces.forEach(f => f.v && (f.v.muted = true));
  // stand the cube on a corner: its body diagonal becomes the vertical axis
  const CORNER = 'rotateX(-35.264deg) rotateZ(45deg)';
  // play only faces turned toward the viewer (at most three on a corner-standing cube)
  const syncFaces = transform => faces.forEach(f => {
    if (!f.v) return;
    const n = new DOMMatrix(transform + ' ' + f.rot).transformPoint(new DOMPoint(0, 0, 1, 0));
    const facing = n.z > 0.05;
    if (facing && f.v.paused) f.v.play().catch(() => {});
    else if (!facing && !f.v.paused) f.v.pause();
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rx = -6, ry = 30, vx = 0, vy = reduce ? 0 : 9; // intro whip, eases down to cruise speed
  const cruise = reduce ? 0 : .22;
  let dragging = false, moved = 0, lx = 0, ly = 0, last = performance.now();

  setTimeout(() => cube.classList.remove('exploded'), 250);

  const tick = now => {
    const dt = Math.min(48, now - last) / 16.67; last = now;
    if (!dragging) {
      vy += (cruise - vy) * .02 * dt;
      vx += ((-6 + Math.sin(now / 2600) * 6 - rx) * .002 - vx * .06) * dt;
      ry += vy * dt; rx += vx * dt;
    }
    const t = `rotateX(${rx}deg) rotateY(${ry}deg) ${CORNER}`;
    cube.style.transform = t;
    syncFaces(t);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; vx = vy = 0;
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    moved += Math.abs(dx) + Math.abs(dy);
    ry += dx * .45; rx = Math.max(-25, Math.min(25, rx - dy * .3));
    vy = dx * .45; vx = -dy * .2;
    lx = e.clientX; ly = e.clientY;
  });
  addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    if (moved < 8) {
      const face = e.target.closest && e.target.closest('.face');
      if (face) openFrom(face);
    }
  });

  /* ---------- lightbox: always starts muted ---------- */
  const lb = $('#lightbox'), frame = $('#lbFrame'), sound = $('#lbSound');
  function openFrom(el) {
    const { video, poster, image } = el.dataset;
    if (!video && !image) return;
    frame.innerHTML = video
      ? `<video poster="${poster}" muted autoplay loop playsinline controls>${sources(video)}</video>`
      : `<img src="${image}" alt="">`;
    sound.hidden = !video;
    sound.textContent = 'Sound on';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  const close = () => { lb.hidden = true; frame.innerHTML = ''; document.body.style.overflow = ''; };
  sound.addEventListener('click', () => {
    const v = frame.querySelector('video');
    v.muted = !v.muted; v.play();
    sound.textContent = v.muted ? 'Sound on' : 'Mute';
  });
  $('#lbClose').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
  $('#liveGrid').addEventListener('click', e => {
    const b = e.target.closest('button.clip');
    if (b) openFrom(b);
  });

  /* ---------- reveal on scroll + lazy, muted clip playback ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const el = en.target;
    if (el.matches('.reveal') && en.isIntersecting) el.classList.add('in');
    const v = el.querySelector && el.querySelector('video[data-lazy]');
    if (v) {
      if (en.isIntersecting) {
        v.muted = true; v.play().catch(() => {});
      } else v.pause();
    }
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- active chip ---------- */
  const chips = [...document.querySelectorAll('#chips a')];
  const secIo = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    chips.forEach(c => {
      const on = c.getAttribute('href') === '#' + en.target.id;
      c.classList.toggle('active', on);
      if (on) c.parentNode.scrollTo({ left: c.offsetLeft - (c.parentNode.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section').forEach(s => secIo.observe(s));
})();
