(() => {
  const D = window.KO, ICONS = window.KO_ICONS, AUTO = window.KO_AUTO || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[id] || ''}"/></svg>`;
  const ext = 'target="_blank" rel="noopener"';
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>';
  // MP4 for Safari/iOS, WebM fallback for browsers without H.264
  const sources = src => `<source src="${src}" type="video/mp4"><source src="${src.replace(/\.mp4$/, '.webm')}" type="video/webm">`;
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const norm = t => String(t).toLowerCase().replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]/g, '');

  /* ---------- platforms ---------- */
  const platformLinks = list => list.map(p => p.url
    ? `<a href="${p.url}" ${ext} aria-label="${p.name}" title="${p.name}">${icon(p.id)}</a>`
    : `<a aria-disabled="true" aria-label="${p.name} (coming soon)">${icon(p.id)}</a>`).join('');
  $('#heroPlatforms').innerHTML = platformLinks(D.platforms);
  $('#footPlatforms').innerHTML = platformLinks(D.platforms);

  // where each streaming platform searches, for releases without an exact link yet
  const STREAMING = [
    ['spotify', 'Spotify', q => `https://open.spotify.com/search/${q}`],
    ['applemusic', 'Apple Music', q => `https://music.apple.com/il/search?term=${q}`],
    ['beatport', 'Beatport', q => `https://www.beatport.com/search?q=${q}`],
    ['soundcloud', 'SoundCloud', q => `https://soundcloud.com/search?q=${q}`],
    ['deezer', 'Deezer', q => `https://www.deezer.com/search/${q}`],
    ['youtube', 'YouTube', q => `https://www.youtube.com/results?search_query=${q}`]
  ];

  /* ---------- merge the daily sync (exact links + hi-res covers) ---------- */
  const tidy = a => (a ? a.replace(/\bK\.?O\b(\s*\(IL\))?/g, 'K.O') : 'K.O');
  // "Parcels - Overnight (Broken Hill & K.O Remix)" belongs to the release "Overnight"
  const findRelease = t => {
    const n = norm(t.replace(/\(.*?\)/g, ' ')), full = norm(t);
    return D.releases.find(r => norm(r.title) === full) ||
      D.releases.find(r => norm(r.title).length >= 4 && (n.includes(norm(r.title)) || norm(r.title).includes(n)));
  };
  const attach = (r, platform, url, cover) => {
    r.links = r.links || {};
    if (!r.links[platform]) r.links[platform] = url;
    if (cover && (!r.cover || r.cover.startsWith('assets/'))) r.cover = cover;
  };
  (AUTO.releases || []).forEach(a => {
    const known = D.releases.find(r => norm(r.title) === norm(a.title));
    if (known) {
      known.links = { ...(a.links || {}), ...(known.links || {}) }; // hand-entered links win
      if (a.cover && (!known.cover || known.cover.startsWith('assets/'))) known.cover = a.cover;
      known.date = known.date || a.date;
    } else {
      D.releases.push({ title: a.title, artists: tidy(a.artists), date: a.date, year: +String(a.date).slice(0, 4) || null,
        cover: a.cover, links: a.links || {}, latest: true, featured: (Date.now() - Date.parse(a.date)) / 864e5 <= 45 });
    }
  });
  // links pasted into content.js `inbox`, resolved by the sync
  const inboxMixes = [];
  (AUTO.inbox || []).forEach(x => {
    const r = findRelease(x.title);
    if (r) attach(r, x.platform, x.url, x.cover);
    else if (x.platform === 'spotify') D.releases.push({ title: x.title, artists: 'K.O', cover: x.cover, links: { spotify: x.url }, latest: true });
    else inboxMixes.push({ title: x.title, by: 'SoundCloud', image: x.cover || 'assets/media/logo-ko.svg', url: x.url });
  });
  // SoundCloud uploads that are releases (e.g. the Overnight remix) link from that release
  (AUTO.soundcloud || []).forEach(t => { const r = findRelease(t.title); if (r) attach(r, 'soundcloud', t.url); });
  // newest first; a full date beats a bare year from the same year
  const when = r => r.date || (r.year ? String(r.year) : '');
  D.releases = D.releases.map((r, i) => [r, i]).sort((a, b) => when(b[0]).localeCompare(when(a[0])) || a[1] - b[1]).map(x => x[0]);

  const linksFor = r => {
    const q = encodeURIComponent(r.search || `K.O ${r.title}`);
    return STREAMING.map(([id, name, search]) => {
      const exact = r.links && r.links[id];
      return { id, name, url: exact || search(q), exact: !!exact };
    });
  };
  const mainLink = r => { const l = linksFor(r); return (l.find(x => x.exact && x.id === 'spotify') || l.find(x => x.exact) || l[0]).url; };
  const releaseIcons = r => linksFor(r).map(l =>
    `<a href="${l.url}" ${ext} aria-label="${esc(r.title)} on ${l.name}" title="${l.name}${l.exact ? '' : ' (search)'}">${icon(l.id)}</a>`).join('');

  /* ---------- releases ---------- */
  const cover = r => r.cover
    ? `<img src="${r.cover}" alt="${esc(r.title)} cover" width="640" height="640" loading="lazy">`
    : `<div class="cover-ph"><small>${esc(r.artists)}</small><b>${esc(r.title)}</b></div>`;

  const featured = D.releases.filter(r => r.featured).slice(0, 4);
  $('#featured').innerHTML = featured.map(r => `
    <article class="feat reveal">
      <a class="cover" href="${mainLink(r)}" ${ext} aria-label="Listen to ${esc(r.title)}">${cover(r)}</a>
      <div class="feat-body">
        <h3>${esc(r.title)}</h3>
        <span class="meta">${[r.subtitle || r.artists, r.label, r.year].filter(Boolean).map(esc).join('<i>/</i>')}</span>
        <div class="row">
          <a class="btn" href="${mainLink(r)}" ${ext}>${PLAY} Listen</a>
          <nav class="platforms" aria-label="Stream ${esc(r.title)}">${releaseIcons(r)}</nav>
        </div>
      </div>
    </article>`).join('');

  // under the cube: the newest release, one tap from playing
  if (featured[0]) {
    const np = $('#nowPlaying'), r = featured[0];
    np.href = mainLink(r);
    np.innerHTML = `<span class="now-tag">New</span><span class="now-title">${esc(r.title)}</span><span class="now-go">${PLAY} Listen</span>`;
  } else $('#nowPlaying').remove();

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
    const ends = () => {
      nav.firstChild.disabled = track.scrollLeft < 8;
      nav.lastChild.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    track.addEventListener('scroll', ends, { passive: true }); ends();
  }

  $('#releaseGrid').innerHTML = D.releases.filter(r => r.latest || !r.featured).slice(0, 8).map((r, i) => `
    <article class="rel reveal" style="transition-delay:${i * 70}ms">
      <a class="cover" href="${mainLink(r)}" ${ext} aria-label="Listen to ${esc(r.title)}">${cover(r)}<span class="play">${PLAY}</span></a>
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.subtitle || r.artists)}</p>
      <nav class="platforms rel-links" aria-label="Stream ${esc(r.title)}">${releaseIcons(r)}</nav>
    </article>`).join('');

  // a cover that fails to load (e.g. a CDN hiccup) falls back to the branded placeholder
  document.querySelectorAll('.cover img').forEach(img => img.addEventListener('error', () => {
    const t = img.alt.replace(/ cover$/, '');
    img.outerHTML = `<div class="cover-ph"><small>K.O</small><b>${esc(t)}</b></div>`;
  }, { once: true }));

  /* ---------- mixes: SoundCloud uploads that are not releases ---------- */
  const scNew = [];
  (AUTO.soundcloud || []).forEach(t => {
    if (findRelease(t.title)) return; // already linked from its release
    const mix = D.mixes.find(m => norm(t.title).includes(norm(m.title)));
    if (mix) { if (!mix.synced) { mix.url = t.url; mix.synced = true; } } // newest episode
    else if (scNew.length < 6) scNew.push({ title: t.title, by: 'SoundCloud / ' + t.date.slice(0, 4), image: t.cover || 'assets/media/logo-ko.svg', url: t.url });
  });
  D.mixes = scNew.concat(inboxMixes.filter(m => !scNew.some(n => n.url === m.url)), D.mixes);
  $('#mixList').innerHTML = D.mixes.map(m => `
    <a class="mix reveal" href="${m.url}" ${ext}>
      <img src="${m.image}" alt="" width="120" height="120" loading="lazy">
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
    if (f.video) inner = `<video poster="${f.poster}" muted loop playsinline preload="none">${sources(f.video)}</video>`;
    else if (f.logo) inner = `<img src="assets/media/logo-ko.svg" alt="" width="529" height="272">`;
    else inner = `<img src="${f.image}" alt="" width="640" height="640">`;
    const data = f.video ? `data-video="${f.full || f.video}" data-poster="${f.poster}"` : f.image ? `data-image="${f.image.replace('sq-', '')}"` : '';
    return `<div class="face${f.logo ? ' face-logo' : ''}" style="--rot:${ROT[i]};transition-delay:${i * 90}ms" ${data}>${inner}</div>`;
  }).join('');
  const CORNER = 'rotateX(-35.264deg) rotateZ(45deg)'; // stand the cube on a corner: its body diagonal becomes vertical
  const faces = [...cube.children].map((f, i) => ({
    v: f.querySelector('video'),
    n: new DOMMatrix(CORNER + ' ' + ROT[i]).transformPoint(new DOMPoint(0, 0, 1, 0)) // face normal before the spin
  }));
  // turn each face's picture (in 90deg steps, so it still fills the face) to read upright on the tilted cube
  [...cube.children].forEach((f, i) => {
    const m = new DOMMatrix('rotateX(-35.264deg) rotateZ(45deg) ' + ROT[i]);
    const ux = m.transformPoint(new DOMPoint(1, 0, 0, 0)).y, uy = m.transformPoint(new DOMPoint(0, 1, 0, 0)).y;
    let best = 0, bestY = Infinity;
    for (const deg of [0, 90, 180, 270]) {
      const r = deg * Math.PI / 180, upY = Math.sin(r) * ux - Math.cos(r) * uy; // screen y of the picture's top
      if (upY < bestY - 1e-6) { bestY = upY; best = deg; }
    }
    const media = f.querySelector('video, img');
    if (media && best) media.style.transform = `rotate(${best}deg)`;
  });
  faces.forEach(f => f.v && (f.v.muted = true));
  // play only faces turned toward the viewer (at most three on a corner-standing cube)
  const syncFaces = () => {
    const sy = Math.sin(ry * Math.PI / 180), cy = Math.cos(ry * Math.PI / 180);
    const sx = Math.sin(rx * Math.PI / 180), cx = Math.cos(rx * Math.PI / 180);
    faces.forEach(f => {
    if (!f.v) return;
    const z = f.n.y * sx + (-f.n.x * sy + f.n.z * cy) * cx; // z of rotateX(rx) rotateY(ry) applied to the normal
    const facing = z > 0.05;
    if (facing && f.v.paused) f.v.play().catch(() => {});
    else if (!facing && !f.v.paused) f.v.pause();
    });
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rx = -6, ry = 30, vx = 0, vy = reduce ? 0 : 9; // intro whip, eases down to cruise speed
  const cruise = reduce ? 0 : .22;
  let dragging = false, moved = 0, lx = 0, ly = 0, last = performance.now();

  setTimeout(() => cube.classList.remove('exploded'), 250);

  const tc = $('#timecode'), t0 = performance.now(); let lastF = -1;
  const tick = now => {
    const dt = Math.min(48, now - last) / 16.67; last = now;
    if (!dragging) {
      vy += (cruise - vy) * .02 * dt;
      vx += ((-6 + Math.sin(now / 2600) * 6 - rx) * .002 - vx * .06) * dt;
      ry += vy * dt; rx += vx * dt;
    }
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) ${CORNER}`;
    // camera timecode, 25 fps
    const f = Math.floor((now - t0) / 40), p2 = n => String(n).padStart(2, '0');
    if (f !== lastF) { lastF = f; tc.textContent = `${p2(Math.floor(f / 90000) % 24)}:${p2(Math.floor(f / 1500) % 60)}:${p2(Math.floor(f / 25) % 60)}:${p2(f % 25)}`; }
    syncFaces();
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
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  let lastFocus = null;
  const close = () => {
    lb.hidden = true; frame.innerHTML = ''; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  sound.addEventListener('click', () => {
    const v = frame.querySelector('video');
    v.muted = !v.muted; v.play();
    sound.textContent = v.muted ? 'Sound on' : 'Mute';
  });
  $('#lbClose').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the viewer
      const items = [...lb.querySelectorAll('button:not([hidden]), video')];
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });
  // keyboard: Enter on the cube opens the first live clip
  stage.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFrom(cube.querySelector('.face[data-video]')); }
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
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
